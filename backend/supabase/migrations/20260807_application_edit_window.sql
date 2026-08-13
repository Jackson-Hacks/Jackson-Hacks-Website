-- Adds an admin-controlled application editing window to an existing Jackson
-- Hacks Supabase project. Apply this migration in staging first.

BEGIN;

CREATE TABLE IF NOT EXISTS public.application_cycles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  opens_at TIMESTAMPTZ NOT NULL,
  edits_close_at TIMESTAMPTZ NOT NULL,
  closed_at TIMESTAMPTZ,
  closed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (edits_close_at > opens_at)
);

INSERT INTO public.application_cycles (event_key, name, opens_at, edits_close_at)
VALUES (
  'jackson-hacks-2026',
  'Jackson Hacks 2026',
  '2026-01-01T00:00:00-05:00',
  '2026-11-21T08:00:00-05:00'
)
ON CONFLICT (event_key) DO NOTHING;

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS cycle_id UUID REFERENCES public.application_cycles(id),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS revision_number INTEGER;

-- Remove the legacy constraint before converting `pending` rows to the new
-- `submitted` status. The replacement constraint is installed after backfill.
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_status_check;

UPDATE public.applications
SET
  cycle_id = COALESCE(
    cycle_id,
    (SELECT id FROM public.application_cycles WHERE event_key = 'jackson-hacks-2026')
  ),
  updated_at = COALESCE(updated_at, created_at, NOW()),
  submitted_at = COALESCE(submitted_at, created_at, NOW()),
  revision_number = COALESCE(revision_number, 1),
  status = CASE WHEN status = 'pending' THEN 'submitted' ELSE status END;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.applications
    GROUP BY cycle_id, user_id
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate applications exist for the same user and cycle. Reconcile them before applying this migration.';
  END IF;
END;
$$;

ALTER TABLE public.applications
  ALTER COLUMN cycle_id SET NOT NULL,
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET NOT NULL,
  ALTER COLUMN submitted_at SET DEFAULT NOW(),
  ALTER COLUMN submitted_at SET NOT NULL,
  ALTER COLUMN revision_number SET DEFAULT 1,
  ALTER COLUMN revision_number SET NOT NULL;

ALTER TABLE public.applications ADD CONSTRAINT applications_status_check
  CHECK (status IN ('submitted', 'under_review', 'accepted', 'rejected', 'waitlisted', 'withdrawn'));

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'applications_field_validation_check') THEN
    ALTER TABLE public.applications ADD CONSTRAINT applications_field_validation_check CHECK (
      (age IS NULL OR age BETWEEN 5 AND 120)
      AND char_length(btrim(full_name)) BETWEEN 1 AND 120
      AND char_length(btrim(email)) BETWEEN 3 AND 320
      AND email LIKE '%@%'
      AND (phone IS NULL OR char_length(phone) <= 40)
      AND char_length(btrim(school)) BETWEEN 1 AND 160
      AND char_length(btrim(grade)) BETWEEN 1 AND 32
      AND char_length(btrim(why_attend)) BETWEEN 10 AND 2000
      AND (dietary_restrictions IS NULL OR char_length(dietary_restrictions) <= 500)
      AND (project_idea IS NULL OR char_length(project_idea) <= 2000)
      AND (heard_from IS NULL OR char_length(heard_from) <= 120)
      AND (emergency_contact_name IS NULL OR char_length(emergency_contact_name) <= 120)
      AND (emergency_contact_phone IS NULL OR char_length(emergency_contact_phone) <= 40)
      AND ((emergency_contact_name IS NULL) = (emergency_contact_phone IS NULL))
    ) NOT VALID;
  END IF;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS applications_one_per_user_per_cycle
  ON public.applications (cycle_id, user_id);
CREATE INDEX IF NOT EXISTS applications_user_id_idx
  ON public.applications (user_id);
CREATE INDEX IF NOT EXISTS application_cycles_closed_by_idx
  ON public.application_cycles (closed_by);

CREATE TABLE IF NOT EXISTS public.application_status_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.application_export_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exported_by UUID NOT NULL REFERENCES auth.users(id),
  cycle_id UUID NOT NULL REFERENCES public.application_cycles(id),
  row_count INTEGER NOT NULL CHECK (row_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS application_status_events_application_id_idx
  ON public.application_status_events (application_id);
CREATE INDEX IF NOT EXISTS application_status_events_changed_by_idx
  ON public.application_status_events (changed_by);
CREATE INDEX IF NOT EXISTS application_export_events_exported_by_idx
  ON public.application_export_events (exported_by);
CREATE INDEX IF NOT EXISTS application_export_events_cycle_id_idx
  ON public.application_export_events (cycle_id);

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY INVOKER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
  );
$$;

-- The function bodies below intentionally mirror schema.sql so that fresh and
-- migrated projects enforce the same field allowlist and cutoff behavior.
CREATE OR REPLACE FUNCTION public.save_application(
  p_application JSONB,
  p_application_id UUID DEFAULT NULL,
  p_event_key TEXT DEFAULT 'jackson-hacks-2026'
)
RETURNS public.applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cycle public.application_cycles%ROWTYPE;
  v_saved public.applications%ROWTYPE;
  v_age INTEGER;
  v_agree BOOLEAN;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'authentication_required';
  END IF;

  SELECT * INTO v_cycle FROM public.application_cycles WHERE event_key = p_event_key;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'application_cycle_not_found';
  END IF;
  IF NOW() < v_cycle.opens_at THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'applications_not_open';
  END IF;
  IF v_cycle.closed_at IS NOT NULL OR NOW() >= v_cycle.edits_close_at THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'applications_closed';
  END IF;

  v_age := NULLIF(p_application->>'age', '')::INTEGER;
  v_agree := COALESCE((p_application->>'agree_to_terms')::BOOLEAN, FALSE);
  IF NULLIF(btrim(p_application->>'full_name'), '') IS NULL
    OR NULLIF(btrim(p_application->>'email'), '') IS NULL
    OR NULLIF(btrim(p_application->>'school'), '') IS NULL
    OR NULLIF(btrim(p_application->>'grade'), '') IS NULL
    OR NULLIF(btrim(p_application->>'experience_level'), '') IS NULL
    OR NULLIF(btrim(p_application->>'why_attend'), '') IS NULL
    OR v_age IS NULL OR v_age NOT BETWEEN 5 AND 120
    OR char_length(btrim(p_application->>'full_name')) > 120
    OR char_length(btrim(p_application->>'email')) > 320
    OR position('@' IN p_application->>'email') = 0
    OR char_length(btrim(p_application->>'school')) > 160
    OR char_length(btrim(p_application->>'grade')) > 32
    OR char_length(btrim(p_application->>'why_attend')) NOT BETWEEN 10 AND 2000
    OR char_length(COALESCE(p_application->>'phone', '')) > 40
    OR char_length(COALESCE(p_application->>'dietary_restrictions', '')) > 500
    OR char_length(COALESCE(p_application->>'project_idea', '')) > 2000
    OR char_length(COALESCE(p_application->>'emergency_contact_name', '')) > 120
    OR char_length(COALESCE(p_application->>'emergency_contact_phone', '')) > 40
    OR (NULLIF(btrim(p_application->>'emergency_contact_name'), '') IS NULL)
       IS DISTINCT FROM
       (NULLIF(btrim(p_application->>'emergency_contact_phone'), '') IS NULL)
    OR NOT v_agree THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'application_invalid';
  END IF;

  IF p_application_id IS NULL THEN
    INSERT INTO public.applications (
      cycle_id, user_id, status, full_name, email, phone, age, school, grade,
      experience_level, dietary_restrictions, tshirt_size, why_attend,
      project_idea, heard_from, emergency_contact_name,
      emergency_contact_phone, agree_to_terms
    ) VALUES (
      v_cycle.id, auth.uid(), 'submitted', btrim(p_application->>'full_name'),
      btrim(p_application->>'email'), NULLIF(btrim(p_application->>'phone'), ''),
      v_age, btrim(p_application->>'school'), btrim(p_application->>'grade'),
      p_application->>'experience_level',
      NULLIF(btrim(p_application->>'dietary_restrictions'), ''),
      NULLIF(p_application->>'tshirt_size', ''), btrim(p_application->>'why_attend'),
      NULLIF(btrim(p_application->>'project_idea'), ''),
      NULLIF(p_application->>'heard_from', ''),
      NULLIF(btrim(p_application->>'emergency_contact_name'), ''),
      NULLIF(btrim(p_application->>'emergency_contact_phone'), ''), v_agree
    )
    ON CONFLICT (cycle_id, user_id) DO UPDATE SET
      full_name = EXCLUDED.full_name, email = EXCLUDED.email, phone = EXCLUDED.phone,
      age = EXCLUDED.age, school = EXCLUDED.school, grade = EXCLUDED.grade,
      experience_level = EXCLUDED.experience_level,
      dietary_restrictions = EXCLUDED.dietary_restrictions,
      tshirt_size = EXCLUDED.tshirt_size, why_attend = EXCLUDED.why_attend,
      project_idea = EXCLUDED.project_idea, heard_from = EXCLUDED.heard_from,
      emergency_contact_name = EXCLUDED.emergency_contact_name,
      emergency_contact_phone = EXCLUDED.emergency_contact_phone,
      agree_to_terms = EXCLUDED.agree_to_terms,
      revision_number = public.applications.revision_number + 1,
      updated_at = NOW()
    RETURNING * INTO v_saved;
  ELSE
    UPDATE public.applications SET
      full_name = btrim(p_application->>'full_name'),
      email = btrim(p_application->>'email'),
      phone = NULLIF(btrim(p_application->>'phone'), ''),
      age = v_age,
      school = btrim(p_application->>'school'),
      grade = btrim(p_application->>'grade'),
      experience_level = p_application->>'experience_level',
      dietary_restrictions = NULLIF(btrim(p_application->>'dietary_restrictions'), ''),
      tshirt_size = NULLIF(p_application->>'tshirt_size', ''),
      why_attend = btrim(p_application->>'why_attend'),
      project_idea = NULLIF(btrim(p_application->>'project_idea'), ''),
      heard_from = NULLIF(p_application->>'heard_from', ''),
      emergency_contact_name = NULLIF(btrim(p_application->>'emergency_contact_name'), ''),
      emergency_contact_phone = NULLIF(btrim(p_application->>'emergency_contact_phone'), ''),
      agree_to_terms = v_agree,
      revision_number = revision_number + 1,
      updated_at = NOW()
    WHERE id = p_application_id AND user_id = auth.uid() AND cycle_id = v_cycle.id
    RETURNING * INTO v_saved;
    IF NOT FOUND THEN
      RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'application_not_found_or_not_owned';
    END IF;
  END IF;
  RETURN v_saved;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_application_window_closed(
  p_closed BOOLEAN,
  p_event_key TEXT DEFAULT 'jackson-hacks-2026'
)
RETURNS public.application_cycles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_cycle public.application_cycles%ROWTYPE;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'admin_required';
  END IF;
  UPDATE public.application_cycles SET
    closed_at = CASE WHEN p_closed THEN NOW() ELSE NULL END,
    closed_by = CASE WHEN p_closed THEN auth.uid() ELSE NULL END,
    updated_at = NOW()
  WHERE event_key = p_event_key RETURNING * INTO v_cycle;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'application_cycle_not_found';
  END IF;
  RETURN v_cycle;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_application_status(
  p_application_id UUID,
  p_status TEXT,
  p_note TEXT DEFAULT NULL
)
RETURNS public.applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_application public.applications%ROWTYPE;
  v_previous_status TEXT;
  v_cycle public.application_cycles%ROWTYPE;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'admin_required';
  END IF;
  IF p_status NOT IN ('submitted', 'under_review', 'accepted', 'rejected', 'waitlisted', 'withdrawn') THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'invalid_application_status';
  END IF;
  SELECT * INTO v_application FROM public.applications WHERE id = p_application_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'application_not_found';
  END IF;
  v_previous_status := v_application.status;
  SELECT * INTO v_cycle FROM public.application_cycles WHERE id = v_application.cycle_id;
  IF v_cycle.closed_at IS NULL AND NOW() < v_cycle.edits_close_at THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'applications_still_open';
  END IF;
  UPDATE public.applications SET status = p_status, updated_at = NOW()
  WHERE id = p_application_id RETURNING * INTO v_application;
  IF v_previous_status IS DISTINCT FROM p_status THEN
    INSERT INTO public.application_status_events (
      application_id, previous_status, new_status, changed_by, note
    ) VALUES (
      p_application_id, v_previous_status, p_status, auth.uid(), NULLIF(btrim(p_note), '')
    );
  END IF;
  RETURN v_application;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_application_export(
  p_row_count INTEGER,
  p_event_key TEXT DEFAULT 'jackson-hacks-2026'
)
RETURNS public.application_export_events
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cycle_id UUID;
  v_event public.application_export_events%ROWTYPE;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'admin_required';
  END IF;
  IF p_row_count < 0 THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'invalid_export_row_count';
  END IF;
  SELECT id INTO v_cycle_id FROM public.application_cycles WHERE event_key = p_event_key;
  IF v_cycle_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'application_cycle_not_found';
  END IF;
  INSERT INTO public.application_export_events (exported_by, cycle_id, row_count)
  VALUES (auth.uid(), v_cycle_id, p_row_count)
  RETURNING * INTO v_event;
  RETURN v_event;
END;
$$;

DROP POLICY IF EXISTS "Authenticated users can submit own application" ON public.applications;
DROP POLICY IF EXISTS "Users can update own application" ON public.applications;
DROP POLICY IF EXISTS "Users can view own application" ON public.applications;
DROP POLICY IF EXISTS "Anyone can view application cycle" ON public.application_cycles;
DROP POLICY IF EXISTS "Admins can view status history" ON public.application_status_events;
DROP POLICY IF EXISTS "Admins can view export history" ON public.application_export_events;

ALTER TABLE public.application_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_status_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_export_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view application cycle" ON public.application_cycles
  FOR SELECT USING (TRUE);
CREATE POLICY "Users can view own application" ON public.applications
  FOR SELECT USING ((SELECT auth.uid()) = user_id OR public.is_admin());
CREATE POLICY "Admins can view status history" ON public.application_status_events
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can view export history" ON public.application_export_events
  FOR SELECT USING (public.is_admin());

REVOKE INSERT, UPDATE, DELETE ON public.application_cycles FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.applications FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.admin_users FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.application_status_events FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.application_export_events FROM anon, authenticated;
GRANT SELECT ON public.application_cycles TO anon, authenticated;
GRANT SELECT ON public.applications TO authenticated;
GRANT SELECT ON public.admin_users TO authenticated;
GRANT SELECT ON public.application_status_events TO authenticated;
GRANT SELECT ON public.application_export_events TO authenticated;

REVOKE ALL ON FUNCTION public.save_application(JSONB, UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_application_window_closed(BOOLEAN, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_application_status(UUID, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.log_application_export(INTEGER, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.save_application(JSONB, UUID, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.set_application_window_closed(BOOLEAN, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.set_application_status(UUID, TEXT, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.log_application_export(INTEGER, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_application(JSONB, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_application_window_closed(BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_application_status(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_application_export(INTEGER, TEXT) TO authenticated;

COMMIT;
