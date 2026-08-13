\set ON_ERROR_STOP on

BEGIN;

DO $test$
DECLARE
  v_user_id UUID := '10000000-0000-0000-0000-000000000001';
  v_admin_id UUID := '10000000-0000-0000-0000-000000000002';
  v_application public.applications%ROWTYPE;
  v_cycle public.application_cycles%ROWTYPE;
  v_export public.application_export_events%ROWTYPE;
  v_status_event_count INTEGER;
BEGIN
  INSERT INTO auth.users (id) VALUES (v_user_id), (v_admin_id);
  INSERT INTO public.admin_users (user_id) VALUES (v_admin_id);

  PERFORM set_config('request.jwt.claim.sub', v_user_id::TEXT, false);

  v_application := public.save_application(jsonb_build_object(
    'full_name', 'Test Applicant',
    'email', 'applicant@example.com',
    'age', 17,
    'school', 'A. Y. Jackson SS',
    'grade', '12',
    'experience_level', 'intermediate',
    'why_attend', 'To build and learn.',
    'agree_to_terms', true
  ));

  ASSERT v_application.user_id = v_user_id, 'submission owner was not recorded';
  ASSERT v_application.revision_number = 1, 'initial revision must be one';
  ASSERT v_application.status = 'submitted', 'initial status must be submitted';

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
END
$test$;

ROLLBACK;
