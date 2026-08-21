-- Adds private, resumable applicant drafts without exposing them to reviewers.
CREATE TABLE IF NOT EXISTS public.application_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cycle_id UUID NOT NULL REFERENCES public.application_cycles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  draft_data JSONB NOT NULL DEFAULT '{}'::JSONB,
  current_step SMALLINT NOT NULL DEFAULT 1 CHECK (current_step BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT application_drafts_one_per_user_per_cycle UNIQUE (cycle_id, user_id),
  CONSTRAINT application_drafts_object_only CHECK (jsonb_typeof(draft_data) = 'object'),
  CONSTRAINT application_drafts_size_limit CHECK (octet_length(draft_data::TEXT) <= 32768)
);

CREATE INDEX IF NOT EXISTS application_drafts_user_id_idx
  ON public.application_drafts (user_id);

ALTER TABLE public.application_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own application draft" ON public.application_drafts;
CREATE POLICY "Users can view own application draft" ON public.application_drafts
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

REVOKE ALL ON TABLE public.application_drafts FROM anon, authenticated;
GRANT SELECT ON TABLE public.application_drafts TO authenticated;

CREATE OR REPLACE FUNCTION public.save_application_draft(
  p_draft JSONB,
  p_current_step INTEGER DEFAULT 1,
  p_event_key TEXT DEFAULT 'jackson-hacks-2026'
)
RETURNS public.application_drafts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cycle public.application_cycles%ROWTYPE;
  v_saved public.application_drafts%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'authentication_required';
  END IF;

  IF p_draft IS NULL OR jsonb_typeof(p_draft) <> 'object' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_draft';
  END IF;

  IF octet_length(p_draft::TEXT) > 32768 THEN
    RAISE EXCEPTION USING ERRCODE = '22001', MESSAGE = 'draft_too_large';
  END IF;

  IF p_current_step IS NULL OR p_current_step NOT BETWEEN 1 AND 5 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid_draft_step';
  END IF;

  SELECT * INTO v_cycle
  FROM public.application_cycles
  WHERE event_key = p_event_key;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'application_cycle_not_found';
  END IF;

  IF NOW() < v_cycle.opens_at THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'applications_not_open';
  END IF;

  IF v_cycle.closed_at IS NOT NULL OR NOW() >= v_cycle.edits_close_at THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'applications_closed';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.applications
    WHERE cycle_id = v_cycle.id
      AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '23505', MESSAGE = 'application_already_submitted';
  END IF;

  INSERT INTO public.application_drafts (
    cycle_id,
    user_id,
    draft_data,
    current_step
  ) VALUES (
    v_cycle.id,
    auth.uid(),
    p_draft,
    p_current_step
  )
  ON CONFLICT (cycle_id, user_id) DO UPDATE
  SET draft_data = EXCLUDED.draft_data,
      current_step = EXCLUDED.current_step,
      updated_at = NOW()
  RETURNING * INTO v_saved;

  RETURN v_saved;
END;
$$;

CREATE OR REPLACE FUNCTION public.clear_application_draft_after_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.application_drafts
  WHERE cycle_id = NEW.cycle_id
    AND user_id = NEW.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS clear_application_draft_after_submission ON public.applications;
CREATE TRIGGER clear_application_draft_after_submission
AFTER INSERT OR UPDATE ON public.applications
FOR EACH ROW
EXECUTE FUNCTION public.clear_application_draft_after_submission();

REVOKE ALL ON FUNCTION public.save_application_draft(JSONB, INTEGER, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.save_application_draft(JSONB, INTEGER, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.save_application_draft(JSONB, INTEGER, TEXT) TO authenticated;

REVOKE ALL ON FUNCTION public.clear_application_draft_after_submission() FROM PUBLIC, anon, authenticated;
