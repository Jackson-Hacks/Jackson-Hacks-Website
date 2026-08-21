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
  gender_identity TEXT CHECK (
    gender_identity IS NULL OR gender_identity IN (
      'woman', 'man', 'non_binary', 'self_describe', 'prefer_not_to_say'
    )
  ),
  gender_self_description TEXT CHECK (
    gender_self_description IS NULL OR char_length(gender_self_description) <= 120
  ),
  pronouns TEXT CHECK (pronouns IS NULL OR char_length(pronouns) <= 80),
  race_ethnicity TEXT[] NOT NULL DEFAULT '{}',
  first_generation TEXT CHECK (
    first_generation IS NULL OR first_generation IN (
      'yes', 'no', 'unsure', 'prefer_not_to_say'
    )
  ),
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
  CHECK (
    race_ethnicity <@ ARRAY[
      'black', 'east_asian', 'south_asian', 'southeast_asian',
      'middle_eastern_north_african', 'indigenous', 'latin_american',
      'white', 'another_identity', 'prefer_not_to_say'
    ]::TEXT[]
  ),
  CHECK (NOT ('prefer_not_to_say' = ANY(race_ethnicity) AND cardinality(race_ethnicity) > 1)),
  CHECK (
    gender_identity IS DISTINCT FROM 'self_describe'
    OR NULLIF(btrim(gender_self_description), '') IS NOT NULL
  ),
  CONSTRAINT applications_one_per_user_per_cycle UNIQUE (cycle_id, user_id)
);

CREATE TABLE application_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cycle_id UUID NOT NULL REFERENCES application_cycles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  draft_data JSONB NOT NULL DEFAULT '{}'::JSONB,
  current_step SMALLINT NOT NULL DEFAULT 1 CHECK (current_step BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT application_drafts_one_per_user_per_cycle UNIQUE (cycle_id, user_id),
  CONSTRAINT application_drafts_object_only CHECK (jsonb_typeof(draft_data) = 'object'),
  CONSTRAINT application_drafts_size_limit CHECK (octet_length(draft_data::TEXT) <= 32768)
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

CREATE TABLE application_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  motivation_score NUMERIC(2,1) NOT NULL CHECK (motivation_score BETWEEN 0 AND 5),
  learning_score NUMERIC(2,1) NOT NULL CHECK (learning_score BETWEEN 0 AND 5),
  creativity_score NUMERIC(2,1) NOT NULL CHECK (creativity_score BETWEEN 0 AND 5),
  collaboration_score NUMERIC(2,1) NOT NULL CHECK (collaboration_score BETWEEN 0 AND 5),
  response_score NUMERIC(2,1) NOT NULL CHECK (response_score BETWEEN 0 AND 5),
  total_score NUMERIC(3,1) GENERATED ALWAYS AS (
    motivation_score + learning_score + creativity_score +
    collaboration_score + response_score
  ) STORED,
  internal_notes TEXT CHECK (internal_notes IS NULL OR char_length(internal_notes) <= 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT application_reviews_one_per_reviewer UNIQUE (application_id, reviewer_id)
);

CREATE INDEX applications_user_id_idx ON applications (user_id);
CREATE INDEX application_drafts_user_id_idx ON application_drafts (user_id);
CREATE INDEX application_cycles_closed_by_idx ON application_cycles (closed_by);
CREATE INDEX application_status_events_application_id_idx
  ON application_status_events (application_id);
CREATE INDEX application_status_events_changed_by_idx
  ON application_status_events (changed_by);
CREATE INDEX application_export_events_exported_by_idx
  ON application_export_events (exported_by);
CREATE INDEX application_export_events_cycle_id_idx
  ON application_export_events (cycle_id);
CREATE INDEX application_reviews_reviewer_id_idx
  ON application_reviews (reviewer_id);
CREATE INDEX application_reviews_application_id_idx
  ON application_reviews (application_id);

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
  v_race_ethnicity TEXT[];
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
  IF p_application ? 'race_ethnicity'
    AND jsonb_typeof(p_application->'race_ethnicity') <> 'array' THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'application_invalid';
  END IF;
  SELECT COALESCE(array_agg(value), ARRAY[]::TEXT[])
  INTO v_race_ethnicity
  FROM jsonb_array_elements_text(
    COALESCE(p_application->'race_ethnicity', '[]'::JSONB)
  ) AS race(value);

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
    OR char_length(COALESCE(p_application->>'gender_self_description', '')) > 120
    OR char_length(COALESCE(p_application->>'pronouns', '')) > 80
    OR NULLIF(p_application->>'gender_identity', '') IS NOT NULL
       AND p_application->>'gender_identity' NOT IN (
         'woman', 'man', 'non_binary', 'self_describe', 'prefer_not_to_say'
       )
    OR p_application->>'gender_identity' = 'self_describe'
       AND NULLIF(btrim(p_application->>'gender_self_description'), '') IS NULL
    OR NULLIF(p_application->>'first_generation', '') IS NOT NULL
       AND p_application->>'first_generation' NOT IN (
         'yes', 'no', 'unsure', 'prefer_not_to_say'
       )
    OR NOT (v_race_ethnicity <@ ARRAY[
      'black', 'east_asian', 'south_asian', 'southeast_asian',
      'middle_eastern_north_african', 'indigenous', 'latin_american',
      'white', 'another_identity', 'prefer_not_to_say'
    ]::TEXT[])
    OR ('prefer_not_to_say' = ANY(v_race_ethnicity) AND cardinality(v_race_ethnicity) > 1)
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
      cycle_id, user_id, status, full_name, email, phone, age,
      gender_identity, gender_self_description, pronouns, race_ethnicity,
      first_generation, school, grade,
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
      NULLIF(p_application->>'gender_identity', ''),
      NULLIF(btrim(p_application->>'gender_self_description'), ''),
      NULLIF(btrim(p_application->>'pronouns'), ''),
      v_race_ethnicity,
      NULLIF(p_application->>'first_generation', ''),
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
      gender_identity = EXCLUDED.gender_identity,
      gender_self_description = EXCLUDED.gender_self_description,
      pronouns = EXCLUDED.pronouns,
      race_ethnicity = EXCLUDED.race_ethnicity,
      first_generation = EXCLUDED.first_generation,
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
      gender_identity = NULLIF(p_application->>'gender_identity', ''),
      gender_self_description = NULLIF(btrim(p_application->>'gender_self_description'), ''),
      pronouns = NULLIF(btrim(p_application->>'pronouns'), ''),
      race_ethnicity = v_race_ethnicity,
      first_generation = NULLIF(p_application->>'first_generation', ''),
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

  -- If submissions are reopened after review, editing invalidates prior scores.
  DELETE FROM public.application_reviews
  WHERE application_id = v_saved.id;

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

CREATE OR REPLACE FUNCTION public.save_application_review(
  p_application_id UUID,
  p_scores JSONB,
  p_internal_notes TEXT DEFAULT NULL
)
RETURNS public.application_reviews
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_application public.applications%ROWTYPE;
  v_cycle public.application_cycles%ROWTYPE;
  v_review public.application_reviews%ROWTYPE;
  v_motivation NUMERIC(2,1);
  v_learning NUMERIC(2,1);
  v_creativity NUMERIC(2,1);
  v_collaboration NUMERIC(2,1);
  v_response NUMERIC(2,1);
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_admin() THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'admin_required';
  END IF;

  IF COALESCE(p_scores->>'motivation', '') !~ '^([0-4](\.[0-9])?|5(\.0)?)$'
    OR COALESCE(p_scores->>'learning', '') !~ '^([0-4](\.[0-9])?|5(\.0)?)$'
    OR COALESCE(p_scores->>'creativity', '') !~ '^([0-4](\.[0-9])?|5(\.0)?)$'
    OR COALESCE(p_scores->>'collaboration', '') !~ '^([0-4](\.[0-9])?|5(\.0)?)$'
    OR COALESCE(p_scores->>'response', '') !~ '^([0-4](\.[0-9])?|5(\.0)?)$'
    OR char_length(COALESCE(p_internal_notes, '')) > 2000 THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'invalid_review';
  END IF;

  v_motivation := (p_scores->>'motivation')::NUMERIC(2,1);
  v_learning := (p_scores->>'learning')::NUMERIC(2,1);
  v_creativity := (p_scores->>'creativity')::NUMERIC(2,1);
  v_collaboration := (p_scores->>'collaboration')::NUMERIC(2,1);
  v_response := (p_scores->>'response')::NUMERIC(2,1);

  SELECT * INTO v_application
  FROM public.applications
  WHERE id = p_application_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'application_not_found';
  END IF;
  IF v_application.user_id = auth.uid() THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'cannot_review_own_application';
  END IF;

  SELECT * INTO v_cycle
  FROM public.application_cycles
  WHERE id = v_application.cycle_id;

  IF v_cycle.closed_at IS NULL AND NOW() < v_cycle.edits_close_at THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'applications_still_open';
  END IF;

  INSERT INTO public.application_reviews (
    application_id, reviewer_id, motivation_score, learning_score,
    creativity_score, collaboration_score, response_score, internal_notes
  ) VALUES (
    p_application_id, auth.uid(), v_motivation, v_learning,
    v_creativity, v_collaboration, v_response,
    NULLIF(btrim(p_internal_notes), '')
  )
  ON CONFLICT (application_id, reviewer_id) DO UPDATE SET
    motivation_score = EXCLUDED.motivation_score,
    learning_score = EXCLUDED.learning_score,
    creativity_score = EXCLUDED.creativity_score,
    collaboration_score = EXCLUDED.collaboration_score,
    response_score = EXCLUDED.response_score,
    internal_notes = EXCLUDED.internal_notes,
    updated_at = NOW()
  RETURNING * INTO v_review;

  RETURN v_review;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_random_unreviewed_application(
  p_cycle_id UUID
)
RETURNS SETOF public.applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cycle public.application_cycles%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_admin() THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'admin_required';
  END IF;

  SELECT * INTO v_cycle
  FROM public.application_cycles
  WHERE id = p_cycle_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'application_cycle_not_found';
  END IF;
  IF v_cycle.closed_at IS NULL AND NOW() < v_cycle.edits_close_at THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'applications_still_open';
  END IF;

  RETURN QUERY
  SELECT application.*
  FROM public.applications AS application
  WHERE application.cycle_id = p_cycle_id
    AND application.user_id <> auth.uid()
    AND application.status <> 'withdrawn'
    AND NOT EXISTS (
      SELECT 1
      FROM public.application_reviews AS review
      WHERE review.application_id = application.id
        AND review.reviewer_id = auth.uid()
    )
  ORDER BY random()
  LIMIT 1;
END;
$$;

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

CREATE TRIGGER clear_application_draft_after_submission
AFTER INSERT OR UPDATE ON public.applications
FOR EACH ROW
EXECUTE FUNCTION public.clear_application_draft_after_submission();

ALTER TABLE application_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_status_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_export_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view application cycle" ON application_cycles
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can view own application" ON applications
  FOR SELECT USING ((SELECT auth.uid()) = user_id OR public.is_admin());

CREATE POLICY "Users can view own application draft" ON application_drafts
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Admins can view own admin row" ON admin_users
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Admins can view status history" ON application_status_events
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can view export history" ON application_export_events
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can view application reviews" ON application_reviews
  FOR SELECT USING (public.is_admin());

REVOKE INSERT, UPDATE, DELETE ON application_cycles FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON applications FROM anon, authenticated;
REVOKE ALL ON application_drafts FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON admin_users FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON application_status_events FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON application_export_events FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON application_reviews FROM anon, authenticated;
GRANT SELECT ON application_cycles TO anon, authenticated;
GRANT SELECT ON applications TO authenticated;
GRANT SELECT ON application_drafts TO authenticated;
GRANT SELECT ON admin_users TO authenticated;
GRANT SELECT ON application_status_events TO authenticated;
GRANT SELECT ON application_export_events TO authenticated;
GRANT SELECT ON application_reviews TO authenticated;

REVOKE ALL ON FUNCTION public.save_application(JSONB, UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.save_application_draft(JSONB, INTEGER, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.clear_application_draft_after_submission() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_application_window_closed(BOOLEAN, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_application_status(UUID, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.log_application_export(INTEGER, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.save_application_review(UUID, JSONB, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_random_unreviewed_application(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.save_application(JSONB, UUID, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.save_application_draft(JSONB, INTEGER, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.set_application_window_closed(BOOLEAN, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.set_application_status(UUID, TEXT, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.log_application_export(INTEGER, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.save_application_review(UUID, JSONB, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_random_unreviewed_application(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_application(JSONB, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_application_draft(JSONB, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_application_window_closed(BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_application_status(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_application_export(INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_application_review(UUID, JSONB, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_random_unreviewed_application(UUID) TO authenticated;
