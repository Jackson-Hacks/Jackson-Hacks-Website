-- Move the public application launch gate from a Vercel build variable to the
-- database. The existing admin window control now performs the first launch,
-- closes applications, and reopens them without a frontend redeployment.
BEGIN;

ALTER TABLE public.application_cycles
  ADD COLUMN IF NOT EXISTS launched_at TIMESTAMPTZ;

-- Keep never-launched cycles fail-closed during a rolling deployment. The
-- admin control clears closed_at and records launched_at atomically.
UPDATE public.application_cycles
SET closed_at = COALESCE(closed_at, NOW()),
    updated_at = NOW()
WHERE event_key = 'jackson-hacks-2026'
  AND launched_at IS NULL;

CREATE OR REPLACE FUNCTION public.set_application_window_closed(
  p_closed BOOLEAN,
  p_event_key TEXT DEFAULT 'jackson-hacks-2026'
)
RETURNS public.application_cycles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cycle public.application_cycles%ROWTYPE;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'admin_required';
  END IF;

  IF p_closed IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22004', MESSAGE = 'application_window_state_required';
  END IF;

  UPDATE public.application_cycles SET
    launched_at = CASE
      WHEN p_closed THEN launched_at
      ELSE COALESCE(launched_at, NOW())
    END,
    closed_at = CASE WHEN p_closed THEN NOW() ELSE NULL END,
    closed_by = CASE WHEN p_closed THEN auth.uid() ELSE NULL END,
    updated_at = NOW()
  WHERE event_key = p_event_key
  RETURNING * INTO v_cycle;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'application_cycle_not_found';
  END IF;

  RETURN v_cycle;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_application_cycle_writable()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_cycle public.application_cycles%ROWTYPE;
BEGIN
  -- Database maintenance and authorized administrative updates do not represent
  -- applicant writes. Applicant-facing RPCs separately require auth.uid().
  IF auth.uid() IS NULL OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  SELECT * INTO v_cycle
  FROM public.application_cycles
  WHERE id = NEW.cycle_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'application_cycle_not_found';
  END IF;

  IF v_cycle.launched_at IS NULL OR NOW() < v_cycle.opens_at THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'applications_not_open';
  END IF;

  IF v_cycle.closed_at IS NOT NULL OR NOW() >= v_cycle.edits_close_at THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'applications_closed';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_application_cycle_writable ON public.applications;
CREATE TRIGGER enforce_application_cycle_writable
BEFORE INSERT OR UPDATE ON public.applications
FOR EACH ROW
EXECUTE FUNCTION public.enforce_application_cycle_writable();

DROP TRIGGER IF EXISTS enforce_application_draft_cycle_writable ON public.application_drafts;
CREATE TRIGGER enforce_application_draft_cycle_writable
BEFORE INSERT OR UPDATE ON public.application_drafts
FOR EACH ROW
EXECUTE FUNCTION public.enforce_application_cycle_writable();

REVOKE ALL ON FUNCTION public.enforce_application_cycle_writable() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_application_window_closed(BOOLEAN, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_application_window_closed(BOOLEAN, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.set_application_window_closed(BOOLEAN, TEXT) TO authenticated;

COMMIT;
