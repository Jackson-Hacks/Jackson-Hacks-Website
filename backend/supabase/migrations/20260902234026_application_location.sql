-- Add city-level location without deleting or changing existing submissions.
-- Filename matches the production migration version assigned by Supabase.
-- Apply before deploying the frontend. Older clients may omit the location group;
-- their writes preserve previously saved location answers. No RLS/grant expansion.
BEGIN;

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS province_state TEXT;

ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_location_check;
ALTER TABLE public.applications ADD CONSTRAINT applications_location_check CHECK (
  (country IS NULL AND city IS NULL AND province_state IS NULL)
  OR (
    country IS NOT NULL AND city IS NOT NULL
    AND char_length(btrim(country)) BETWEEN 1 AND 100
    AND char_length(btrim(city)) BETWEEN 1 AND 120
    AND (province_state IS NULL OR char_length(btrim(province_state)) BETWEEN 1 AND 120)
  )
);

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
  v_has_location BOOLEAN := p_application ?| ARRAY['country', 'city', 'province_state'];
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
  -- Pre-location clients may omit the entire group during a rolling deployment.
  -- Once any location key is sent, require country/city and validate all three.
  IF v_has_location AND (
    jsonb_typeof(p_application->'country') IS DISTINCT FROM 'string'
    OR jsonb_typeof(p_application->'city') IS DISTINCT FROM 'string'
    OR COALESCE(jsonb_typeof(p_application->'province_state'), 'null') NOT IN ('string', 'null')
    OR char_length(btrim(p_application->>'country')) NOT BETWEEN 1 AND 100
    OR char_length(btrim(p_application->>'city')) NOT BETWEEN 1 AND 120
    OR char_length(btrim(COALESCE(p_application->>'province_state', ''))) > 120
  ) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'application_invalid';
  END IF;
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
      country, city, province_state,
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
      NULLIF(btrim(p_application->>'country'), ''),
      NULLIF(btrim(p_application->>'city'), ''),
      NULLIF(btrim(p_application->>'province_state'), ''),
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
      country = CASE WHEN v_has_location THEN EXCLUDED.country ELSE public.applications.country END,
      city = CASE WHEN v_has_location THEN EXCLUDED.city ELSE public.applications.city END,
      province_state = CASE WHEN v_has_location THEN EXCLUDED.province_state ELSE public.applications.province_state END,
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
      country = CASE WHEN v_has_location THEN NULLIF(btrim(p_application->>'country'), '') ELSE country END,
      city = CASE WHEN v_has_location THEN NULLIF(btrim(p_application->>'city'), '') ELSE city END,
      province_state = CASE WHEN v_has_location THEN NULLIF(btrim(p_application->>'province_state'), '') ELSE province_state END,
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

  -- If submissions are reopened after review, editing invalidates prior scores.
  DELETE FROM public.application_reviews
  WHERE application_id = v_saved.id;

  RETURN v_saved;
END;
$$;

REVOKE ALL ON FUNCTION public.save_application(JSONB, UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_application(JSONB, UUID, TEXT) TO authenticated;

NOTIFY pgrst, 'reload schema';
COMMIT;
