-- Supabase Database Schema for Jackson Hacks
-- Source-of-truth schema for a fresh project. Existing projects should apply
-- backend/supabase/migrations/20260807_application_edit_window.sql instead.

CREATE TABLE application_cycles (
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

INSERT INTO application_cycles (event_key, name, opens_at, edits_close_at)
VALUES (
  'jackson-hacks-2026',
  'Jackson Hacks 2026',
  '2026-01-01T00:00:00-05:00',
  '2026-11-21T08:00:00-05:00'
);

CREATE TABLE applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cycle_id UUID NOT NULL REFERENCES application_cycles(id),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revision_number INTEGER NOT NULL DEFAULT 1 CHECK (revision_number > 0),
  status TEXT NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'under_review', 'accepted', 'rejected', 'waitlisted', 'withdrawn')),
  full_name TEXT NOT NULL CHECK (char_length(btrim(full_name)) BETWEEN 1 AND 120),
  email TEXT NOT NULL CHECK (char_length(btrim(email)) BETWEEN 3 AND 320 AND email LIKE '%@%'),
  phone TEXT CHECK (phone IS NULL OR char_length(phone) <= 40),
  age INTEGER NOT NULL CHECK (age BETWEEN 5 AND 120),
  school TEXT NOT NULL CHECK (char_length(btrim(school)) BETWEEN 1 AND 160),
  grade TEXT NOT NULL CHECK (char_length(btrim(grade)) BETWEEN 1 AND 32),
  experience_level TEXT NOT NULL CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  dietary_restrictions TEXT CHECK (dietary_restrictions IS NULL OR char_length(dietary_restrictions) <= 500),
  tshirt_size TEXT CHECK (tshirt_size IN ('XS', 'S', 'M', 'L', 'XL', 'XXL')),
  why_attend TEXT NOT NULL CHECK (char_length(btrim(why_attend)) BETWEEN 10 AND 2000),
  project_idea TEXT CHECK (project_idea IS NULL OR char_length(project_idea) <= 2000),
  heard_from TEXT CHECK (heard_from IS NULL OR char_length(heard_from) <= 120),
  emergency_contact_name TEXT CHECK (emergency_contact_name IS NULL OR char_length(emergency_contact_name) <= 120),
  emergency_contact_phone TEXT CHECK (emergency_contact_phone IS NULL OR char_length(emergency_contact_phone) <= 40),
  agree_to_terms BOOLEAN NOT NULL DEFAULT FALSE,
  CHECK ((emergency_contact_name IS NULL) = (emergency_contact_phone IS NULL)),
  CONSTRAINT applications_one_per_user_per_cycle UNIQUE (cycle_id, user_id)
);

CREATE TABLE admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE application_status_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE application_export_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exported_by UUID NOT NULL REFERENCES auth.users(id),
  cycle_id UUID NOT NULL REFERENCES application_cycles(id),
  row_count INTEGER NOT NULL CHECK (row_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX applications_user_id_idx ON applications (user_id);
CREATE INDEX application_cycles_closed_by_idx ON application_cycles (closed_by);
CREATE INDEX application_status_events_application_id_idx
  ON application_status_events (application_id);
CREATE INDEX application_status_events_changed_by_idx
  ON application_status_events (changed_by);
CREATE INDEX application_export_events_exported_by_idx
  ON application_export_events (exported_by);
CREATE INDEX application_export_events_cycle_id_idx
  ON application_export_events (cycle_id);

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY INVOKER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = auth.uid()
  );
$$;

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
    )
    VALUES (
      v_cycle.id,
      auth.uid(),
      'submitted',
      btrim(p_application->>'full_name'),
      btrim(p_application->>'email'),
      NULLIF(btrim(p_application->>'phone'), ''),
      v_age,
      btrim(p_application->>'school'),
      btrim(p_application->>'grade'),
      p_application->>'experience_level',
      NULLIF(btrim(p_application->>'dietary_restrictions'), ''),
      NULLIF(p_application->>'tshirt_size', ''),
      btrim(p_application->>'why_attend'),
      NULLIF(btrim(p_application->>'project_idea'), ''),
      NULLIF(p_application->>'heard_from', ''),
      NULLIF(btrim(p_application->>'emergency_contact_name'), ''),
      NULLIF(btrim(p_application->>'emergency_contact_phone'), ''),
      v_agree
    )
    ON CONFLICT (cycle_id, user_id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      age = EXCLUDED.age,
      school = EXCLUDED.school,
      grade = EXCLUDED.grade,
      experience_level = EXCLUDED.experience_level,
      dietary_restrictions = EXCLUDED.dietary_restrictions,
      tshirt_size = EXCLUDED.tshirt_size,
      why_attend = EXCLUDED.why_attend,
      project_idea = EXCLUDED.project_idea,
      heard_from = EXCLUDED.heard_from,
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
    WHERE id = p_application_id
      AND user_id = auth.uid()
      AND cycle_id = v_cycle.id
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
DECLARE
  v_cycle public.application_cycles%ROWTYPE;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'admin_required';
  END IF;

  UPDATE public.application_cycles SET
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

  SELECT * INTO v_application
  FROM public.applications
  WHERE id = p_application_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'application_not_found';
  END IF;

  v_previous_status := v_application.status;

  SELECT * INTO v_cycle
  FROM public.application_cycles
  WHERE id = v_application.cycle_id;

  IF v_cycle.closed_at IS NULL AND NOW() < v_cycle.edits_close_at THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'applications_still_open';
  END IF;

  UPDATE public.applications SET
    status = p_status,
    updated_at = NOW()
  WHERE id = p_application_id
  RETURNING * INTO v_application;

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

ALTER TABLE application_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_status_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_export_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view application cycle" ON application_cycles
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can view own application" ON applications
  FOR SELECT USING ((SELECT auth.uid()) = user_id OR public.is_admin());

CREATE POLICY "Admins can view own admin row" ON admin_users
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Admins can view status history" ON application_status_events
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can view export history" ON application_export_events
  FOR SELECT USING (public.is_admin());

REVOKE INSERT, UPDATE, DELETE ON application_cycles FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON applications FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON admin_users FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON application_status_events FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON application_export_events FROM anon, authenticated;
GRANT SELECT ON application_cycles TO anon, authenticated;
GRANT SELECT ON applications TO authenticated;
GRANT SELECT ON admin_users TO authenticated;
GRANT SELECT ON application_status_events TO authenticated;
GRANT SELECT ON application_export_events TO authenticated;

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
