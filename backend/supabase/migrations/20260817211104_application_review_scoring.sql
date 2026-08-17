-- Adds optional demographic survey fields and a blind, rubric-based admin
-- review workflow. Existing application answers remain intact.

BEGIN;

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS gender_identity TEXT,
  ADD COLUMN IF NOT EXISTS gender_self_description TEXT,
  ADD COLUMN IF NOT EXISTS pronouns TEXT,
  ADD COLUMN IF NOT EXISTS race_ethnicity TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS first_generation TEXT;

ALTER TABLE public.applications
  DROP CONSTRAINT IF EXISTS applications_demographics_check;
ALTER TABLE public.applications
  ADD CONSTRAINT applications_demographics_check CHECK (
    (gender_identity IS NULL OR gender_identity IN (
      'woman', 'man', 'non_binary', 'self_describe', 'prefer_not_to_say'
    ))
    AND (gender_self_description IS NULL OR char_length(gender_self_description) <= 120)
    AND (pronouns IS NULL OR char_length(pronouns) <= 80)
    AND (first_generation IS NULL OR first_generation IN (
      'yes', 'no', 'unsure', 'prefer_not_to_say'
    ))
    AND race_ethnicity <@ ARRAY[
      'black', 'east_asian', 'south_asian', 'southeast_asian',
      'middle_eastern_north_african', 'indigenous', 'latin_american',
      'white', 'another_identity', 'prefer_not_to_say'
    ]::TEXT[]
    AND NOT ('prefer_not_to_say' = ANY(race_ethnicity) AND cardinality(race_ethnicity) > 1)
    AND (
      gender_identity IS DISTINCT FROM 'self_describe'
      OR NULLIF(btrim(gender_self_description), '') IS NOT NULL
    )
  );

CREATE TABLE IF NOT EXISTS public.application_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  motivation_score SMALLINT NOT NULL CHECK (motivation_score BETWEEN 0 AND 10),
  learning_score SMALLINT NOT NULL CHECK (learning_score BETWEEN 0 AND 10),
  creativity_score SMALLINT NOT NULL CHECK (creativity_score BETWEEN 0 AND 10),
  collaboration_score SMALLINT NOT NULL CHECK (collaboration_score BETWEEN 0 AND 10),
  response_score SMALLINT NOT NULL CHECK (response_score BETWEEN 0 AND 10),
  total_score SMALLINT GENERATED ALWAYS AS (
    motivation_score + learning_score + creativity_score +
    collaboration_score + response_score
  ) STORED,
  internal_notes TEXT CHECK (internal_notes IS NULL OR char_length(internal_notes) <= 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT application_reviews_one_per_reviewer UNIQUE (application_id, reviewer_id)
);

CREATE INDEX IF NOT EXISTS application_reviews_reviewer_id_idx
  ON public.application_reviews (reviewer_id);
CREATE INDEX IF NOT EXISTS application_reviews_application_id_idx
  ON public.application_reviews (application_id);

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
    OR char_length(COALESCE(p_application->>'gender_self_description', '')) > 120
    OR char_length(COALESCE(p_application->>'pronouns', '')) > 80
    OR (NULLIF(p_application->>'gender_identity', '') IS NOT NULL
      AND p_application->>'gender_identity' NOT IN (
        'woman', 'man', 'non_binary', 'self_describe', 'prefer_not_to_say'
      ))
    OR (p_application->>'gender_identity' = 'self_describe'
      AND NULLIF(btrim(p_application->>'gender_self_description'), '') IS NULL)
    OR (NULLIF(p_application->>'first_generation', '') IS NOT NULL
      AND p_application->>'first_generation' NOT IN (
        'yes', 'no', 'unsure', 'prefer_not_to_say'
      ))
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
      first_generation, school, grade, experience_level,
      dietary_restrictions, tshirt_size, why_attend, project_idea,
      heard_from, emergency_contact_name, emergency_contact_phone,
      agree_to_terms
    ) VALUES (
      v_cycle.id, auth.uid(), 'submitted',
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
      NULL,
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
      project_idea = NULL,
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
      project_idea = NULL,
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

  DELETE FROM public.application_reviews
  WHERE application_id = v_saved.id;

  RETURN v_saved;
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
  v_motivation SMALLINT;
  v_learning SMALLINT;
  v_creativity SMALLINT;
  v_collaboration SMALLINT;
  v_response SMALLINT;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_admin() THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'admin_required';
  END IF;
  IF COALESCE(p_scores->>'motivation', '') !~ '^([0-9]|10)$'
    OR COALESCE(p_scores->>'learning', '') !~ '^([0-9]|10)$'
    OR COALESCE(p_scores->>'creativity', '') !~ '^([0-9]|10)$'
    OR COALESCE(p_scores->>'collaboration', '') !~ '^([0-9]|10)$'
    OR COALESCE(p_scores->>'response', '') !~ '^([0-9]|10)$'
    OR char_length(COALESCE(p_internal_notes, '')) > 2000 THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'invalid_review';
  END IF;

  v_motivation := (p_scores->>'motivation')::SMALLINT;
  v_learning := (p_scores->>'learning')::SMALLINT;
  v_creativity := (p_scores->>'creativity')::SMALLINT;
  v_collaboration := (p_scores->>'collaboration')::SMALLINT;
  v_response := (p_scores->>'response')::SMALLINT;

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

ALTER TABLE public.application_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view application reviews" ON public.application_reviews;
CREATE POLICY "Admins can view application reviews" ON public.application_reviews
  FOR SELECT TO authenticated USING (public.is_admin());

REVOKE INSERT, UPDATE, DELETE ON public.application_reviews FROM anon, authenticated;
GRANT SELECT ON public.application_reviews TO authenticated;

REVOKE ALL ON FUNCTION public.save_application_review(UUID, JSONB, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_random_unreviewed_application(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.save_application_review(UUID, JSONB, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_random_unreviewed_application(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.save_application_review(UUID, JSONB, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_random_unreviewed_application(UUID) TO authenticated;

-- Reapply the existing save function grants after CREATE OR REPLACE.
REVOKE ALL ON FUNCTION public.save_application(JSONB, UUID, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.save_application(JSONB, UUID, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.save_application(JSONB, UUID, TEXT) TO authenticated;

COMMIT;
