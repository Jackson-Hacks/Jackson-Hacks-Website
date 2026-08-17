\set ON_ERROR_STOP on

BEGIN;

DO $test$
DECLARE
  v_user_id UUID := '10000000-0000-0000-0000-000000000001';
  v_admin_id UUID := '10000000-0000-0000-0000-000000000002';
  v_second_user_id UUID := '10000000-0000-0000-0000-000000000003';
  v_application public.applications%ROWTYPE;
  v_second_application public.applications%ROWTYPE;
  v_random_application public.applications%ROWTYPE;
  v_cycle public.application_cycles%ROWTYPE;
  v_export public.application_export_events%ROWTYPE;
  v_review public.application_reviews%ROWTYPE;
  v_status_event_count INTEGER;
  v_review_count INTEGER;
BEGIN
  INSERT INTO auth.users (id) VALUES (v_user_id), (v_admin_id), (v_second_user_id);
  INSERT INTO public.admin_users (user_id) VALUES (v_admin_id);

  PERFORM set_config('request.jwt.claim.sub', v_user_id::TEXT, false);

  v_application := public.save_application(jsonb_build_object(
    'full_name', 'Test Applicant',
    'email', 'applicant@example.com',
    'age', 17,
    'gender_identity', 'non_binary',
    'pronouns', 'they/them',
    'race_ethnicity', jsonb_build_array('east_asian', 'white'),
    'first_generation', 'yes',
    'school', 'A. Y. Jackson SS',
    'grade', '12',
    'experience_level', 'intermediate',
    'why_attend', 'To build and learn.',
    'agree_to_terms', true
  ));

  ASSERT v_application.user_id = v_user_id, 'submission owner was not recorded';
  ASSERT v_application.revision_number = 1, 'initial revision must be one';
  ASSERT v_application.status = 'submitted', 'initial status must be submitted';
  ASSERT v_application.race_ethnicity = ARRAY['east_asian', 'white'], 'demographic survey was not saved';

  v_application := public.save_application(
    jsonb_build_object(
      'full_name', 'Updated Applicant',
      'email', 'applicant@example.com',
      'age', 17,
      'school', 'A. Y. Jackson SS',
      'grade', '12',
      'experience_level', 'intermediate',
      'why_attend', 'To build, learn, and meet people.',
      'agree_to_terms', true
    ),
    v_application.id
  );

  ASSERT v_application.full_name = 'Updated Applicant', 'editable fields were not updated';
  ASSERT v_application.revision_number = 2, 'editing must increment the revision';

  BEGIN
    PERFORM public.save_application_review(
      v_application.id,
      '{"motivation":8,"learning":8,"creativity":8,"collaboration":8,"response":8}'::JSONB
    );
    RAISE EXCEPTION 'non-admin unexpectedly saved a review';
  EXCEPTION WHEN OTHERS THEN
    ASSERT SQLERRM = 'admin_required', 'non-admin review failure did not use admin_required';
  END;

  PERFORM set_config('request.jwt.claim.sub', v_second_user_id::TEXT, false);
  v_second_application := public.save_application(jsonb_build_object(
    'full_name', 'Second Applicant',
    'email', 'second@example.com',
    'age', 16,
    'school', 'Another School',
    'grade', '11',
    'experience_level', 'beginner',
    'why_attend', 'I want to learn with a new team.',
    'agree_to_terms', true
  ));

  BEGIN
    PERFORM public.set_application_window_closed(true);
    RAISE EXCEPTION 'non-admin unexpectedly changed the application window';
  EXCEPTION WHEN OTHERS THEN
    ASSERT SQLERRM = 'admin_required', 'non-admin failure did not use admin_required';
  END;

  PERFORM set_config('request.jwt.claim.sub', v_admin_id::TEXT, false);
  v_cycle := public.set_application_window_closed(true);
  ASSERT v_cycle.closed_at IS NOT NULL, 'admin close did not set closed_at';

  PERFORM set_config('request.jwt.claim.sub', v_user_id::TEXT, false);
  BEGIN
    PERFORM public.save_application(
      jsonb_build_object(
        'full_name', 'Late Edit',
        'email', 'applicant@example.com',
        'age', 17,
        'school', 'A. Y. Jackson SS',
        'grade', '12',
        'experience_level', 'intermediate',
        'why_attend', 'This must not save.',
        'agree_to_terms', true
      ),
      v_application.id
    );
    RAISE EXCEPTION 'late edit unexpectedly succeeded';
  EXCEPTION WHEN OTHERS THEN
    ASSERT SQLERRM = 'applications_closed', 'late edit failure did not use applications_closed';
  END;

  PERFORM set_config('request.jwt.claim.sub', v_admin_id::TEXT, false);
  v_export := public.log_application_export(1);
  ASSERT v_export.exported_by = v_admin_id, 'exporting admin was not recorded';
  ASSERT v_export.row_count = 1, 'export row count was not recorded';

  SELECT * INTO v_random_application
  FROM public.get_random_unreviewed_application(v_cycle.id);
  ASSERT v_random_application.id IS NOT NULL
    AND v_random_application.cycle_id = v_cycle.id
    AND v_random_application.user_id <> v_admin_id,
    'random review mode did not return an unrated application';
  SELECT count(*) INTO v_review_count
  FROM public.application_reviews
  WHERE application_id = v_random_application.id
    AND reviewer_id = v_admin_id;
  ASSERT v_review_count = 0,
    'random review mode returned an application already rated by this reviewer';

  v_review := public.save_application_review(
    v_application.id,
    '{"motivation":9,"learning":8,"creativity":7,"collaboration":9,"response":8}'::JSONB,
    'Strong learning mindset.'
  );
  ASSERT v_review.total_score = 41, 'review total was not calculated out of 50';
  ASSERT v_review.reviewer_id = v_admin_id, 'reviewer identity was not recorded';

  SELECT * INTO v_random_application
  FROM public.get_random_unreviewed_application(v_cycle.id);
  ASSERT v_random_application.id IS NOT NULL,
    'random review mode did not return the remaining unrated application';
  SELECT count(*) INTO v_review_count
  FROM public.application_reviews
  WHERE application_id = v_random_application.id
    AND reviewer_id = v_admin_id;
  ASSERT v_review_count = 0,
    'random review mode returned an application already rated by this reviewer';

  v_application := public.set_application_status(v_application.id, 'under_review', 'Review started');
  ASSERT v_application.status = 'under_review', 'admin status transition was not applied';

  SELECT count(*) INTO v_status_event_count
  FROM public.application_status_events
  WHERE application_id = v_application.id
    AND previous_status = 'submitted'
    AND new_status = 'under_review'
    AND changed_by = v_admin_id;
  ASSERT v_status_event_count = 1, 'status transition audit event was not recorded';

  v_cycle := public.set_application_window_closed(false);
  ASSERT v_cycle.closed_at IS NULL, 'admin reopen did not clear closed_at';

  PERFORM set_config('request.jwt.claim.sub', v_user_id::TEXT, false);
  v_application := public.save_application(
    jsonb_build_object(
      'full_name', 'Reopened Applicant',
      'email', 'applicant@example.com',
      'age', 17,
      'school', 'A. Y. Jackson SS',
      'grade', '12',
      'experience_level', 'intermediate',
      'why_attend', 'Editing works again after reopening.',
      'agree_to_terms', true
    ),
    v_application.id
  );

  ASSERT v_application.full_name = 'Reopened Applicant', 'reopened edit was not saved';
  ASSERT v_application.revision_number = 3, 'reopened edit must increment the revision';
  ASSERT v_application.status = 'under_review', 'applicant edit must not change review status';

  SELECT count(*) INTO v_review_count
  FROM public.application_reviews
  WHERE application_id = v_application.id;
  ASSERT v_review_count = 0, 'editing after reopening must invalidate stale reviews';
END
$test$;

ROLLBACK;
