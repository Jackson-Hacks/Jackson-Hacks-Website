\set ON_ERROR_STOP on

BEGIN;

-- Match Supabase's auth helper access in the lightweight local test bootstrap.
GRANT USAGE ON SCHEMA auth TO authenticated;

DO $test$
DECLARE
  v_owner UUID := '30000000-0000-0000-0000-000000000001';
  v_other UUID := '30000000-0000-0000-0000-000000000002';
  v_application public.applications%ROWTYPE;
  v_updated public.applications%ROWTYPE;
  v_legacy public.applications%ROWTYPE;
  v_draft public.application_drafts%ROWTYPE;
  v_bad JSONB;
  v_payload JSONB := '{"full_name":"Location Test","email":"location@example.com","age":17,"school":"Test School","grade":"12","experience_level":"beginner","why_attend":"I want to learn and build.","agree_to_terms":true}'::JSONB;
BEGIN
  INSERT INTO auth.users(id) VALUES (v_owner), (v_other);
  INSERT INTO public.application_cycles(event_key, name, opens_at, edits_close_at)
  VALUES ('location-test', 'Location test', NOW() - INTERVAL '1 day', NOW() + INTERVAL '1 day');
  PERFORM set_config('request.jwt.claim.sub', v_owner::TEXT, true);

  v_draft := public.save_application_draft('{"country":"Canada","city":"Montréal","province_state":"Québec"}'::JSONB, 1, 'location-test');
  ASSERT v_draft.draft_data->>'city' = 'Montréal', 'draft location was not preserved';
  v_application := public.save_application(v_payload || '{"country":" Canada ","city":" Toronto ","province_state":" Ontario ","gender_identity":"non_binary","race_ethnicity":["east_asian","white"]}'::JSONB, NULL, 'location-test');
  ASSERT v_application.country = 'Canada' AND v_application.city = 'Toronto' AND v_application.province_state = 'Ontario', 'insert must save trimmed location';
  ASSERT v_application.age = 17 AND v_application.gender_identity = 'non_binary' AND v_application.race_ethnicity = ARRAY['east_asian','white'], 'existing demographics must still save';
  ASSERT NOT EXISTS (SELECT 1 FROM public.application_drafts WHERE user_id = v_owner AND cycle_id = v_application.cycle_id), 'submission must clear draft';

  v_updated := public.save_application(v_payload || '{"country":"Canada","city":"Montréal","province_state":"Québec"}'::JSONB, NULL, 'location-test');
  ASSERT v_updated.id = v_application.id AND v_updated.city = 'Montréal', 'upsert must update location';
  v_updated := public.save_application(v_payload || '{"country":"日本","city":"東京","province_state":" "}'::JSONB, v_application.id, 'location-test');
  ASSERT v_updated.country = '日本' AND v_updated.city = '東京' AND v_updated.province_state IS NULL, 'edit must support international names and clearing optional province';

  -- Old browser tabs must not erase answers collected by the newer form.
  v_updated := public.save_application(v_payload, v_application.id, 'location-test');
  ASSERT v_updated.city = '東京', 'legacy edit erased saved location';
  v_updated := public.save_application(v_payload, NULL, 'location-test');
  ASSERT v_updated.city = '東京', 'legacy upsert erased saved location';

  FOREACH v_bad IN ARRAY ARRAY[
    '{"country":"","city":"Toronto"}'::JSONB,
    '{"country":"Canada","city":" "}'::JSONB,
    '{"country":null,"city":"Toronto"}'::JSONB,
    '{"country":"Canada"}'::JSONB,
    '{"city":"Toronto"}'::JSONB,
    '{"country":42,"city":"Toronto"}'::JSONB,
    '{"country":"Canada","city":[]}'::JSONB,
    '{"country":"Canada","city":"Toronto","province_state":{}}'::JSONB,
    jsonb_build_object('country', repeat('x',101), 'city','Toronto'),
    jsonb_build_object('country','Canada', 'city', repeat('x',121)),
    jsonb_build_object('country','Canada', 'city','Toronto', 'province_state', repeat('x',121))
  ] LOOP
    BEGIN
      PERFORM public.save_application(v_payload || v_bad, v_application.id, 'location-test');
      RAISE EXCEPTION 'invalid location unexpectedly saved';
    EXCEPTION WHEN OTHERS THEN
      ASSERT SQLERRM = 'application_invalid', 'invalid location must be rejected';
    END;
  END LOOP;

  PERFORM set_config('request.jwt.claim.sub', v_other::TEXT, true);
  v_legacy := public.save_application(v_payload, NULL, 'location-test');
  ASSERT v_legacy.country IS NULL AND v_legacy.city IS NULL, 'old clients must remain compatible';
  BEGIN
    PERFORM public.save_application(v_payload || '{"country":"Canada","city":"Ottawa"}'::JSONB, v_application.id, 'location-test');
    RAISE EXCEPTION 'another applicant edited location';
  EXCEPTION WHEN insufficient_privilege THEN
    ASSERT SQLERRM = 'application_not_found_or_not_owned', 'ownership check changed';
  END;

  UPDATE public.application_cycles SET closed_at = NOW() WHERE event_key = 'location-test';
  BEGIN
    PERFORM public.save_application(v_payload || '{"country":"Canada","city":"Ottawa"}'::JSONB, v_legacy.id, 'location-test');
    RAISE EXCEPTION 'closed application edited';
  EXCEPTION WHEN OTHERS THEN
    ASSERT SQLERRM = 'applications_closed', 'cutoff must still be enforced';
  END;
  ASSERT NOT has_function_privilege('anon','public.save_application(jsonb,uuid,text)','EXECUTE'), 'anonymous submission must remain blocked';
END
$test$;

SET LOCAL ROLE authenticated;
DO $test$
BEGIN
  ASSERT NOT EXISTS (SELECT 1 FROM public.applications WHERE user_id = '30000000-0000-0000-0000-000000000001'), 'another applicant location leaked through RLS';
  ASSERT EXISTS (SELECT 1 FROM public.applications WHERE user_id = auth.uid()), 'owner must be able to read own application';
END
$test$;
RESET ROLE;

ROLLBACK;
