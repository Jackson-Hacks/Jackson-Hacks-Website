\set ON_ERROR_STOP on
BEGIN;
-- Match Supabase's auth helper permissions in the isolated test bootstrap.
GRANT USAGE ON SCHEMA auth TO authenticated;
INSERT INTO auth.users (id) VALUES ('90000000-0000-0000-0000-000000000001');
INSERT INTO public.admin_users (user_id) VALUES ('90000000-0000-0000-0000-000000000001');
SET LOCAL ROLE anon;
DO $$
BEGIN
  IF public.join_email_updates(' Test@Example.COM ', TRUE, '2026-10-03')->>'accepted' <> 'true' THEN
    RAISE EXCEPTION 'Expected anonymous signup acknowledgment';
  END IF;
  PERFORM public.join_email_updates('test@example.com', TRUE, '2026-10-03');
  PERFORM public.join_email_updates('bot@example.com', TRUE, '2026-10-03', 'jackson-hacks-2026', 'bot website');
  BEGIN
    PERFORM public.join_email_updates('no-consent@example.com', FALSE, '2026-10-03');
    RAISE EXCEPTION 'Consent was not enforced';
  EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN
    PERFORM public.join_email_updates('invalid@@email.com', TRUE, '2026-10-03');
    RAISE EXCEPTION 'Invalid email accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN
    PERFORM public.join_email_updates('old-consent@example.com', TRUE, 'old');
    RAISE EXCEPTION 'Stale consent accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN
    PERFORM public.join_email_updates('wrong-event@example.com', TRUE, '2026-10-03', 'unknown-event');
    RAISE EXCEPTION 'Unknown event accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN
    PERFORM email FROM public.email_update_signups;
    RAISE EXCEPTION 'Anonymous read was allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    DELETE FROM public.email_update_signups;
    RAISE EXCEPTION 'Anonymous delete was allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END;
$$;
RESET ROLE;
DO $$
BEGIN
  IF (SELECT count(*) FROM public.email_update_signups) <> 1 THEN
    RAISE EXCEPTION 'Expected one deduplicated signup, no honeypot or rejected rows';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.email_update_signups WHERE email = 'test@example.com' AND consent_version = '2026-10-03' AND consent_text = 'Notify me when Jackson Hacks 2027 applications open.' AND subscribed_at IS NOT NULL) THEN
    RAISE EXCEPTION 'Missing normalized signup or consent evidence';
  END IF;
END;
$$;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '90000000-0000-0000-0000-000000000002', TRUE);
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.email_update_signups) THEN
    RAISE EXCEPTION 'Non-admin read was allowed';
  END IF;
  BEGIN
    UPDATE public.email_update_signups SET email = 'changed@example.com';
    RAISE EXCEPTION 'Client update was allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END;
$$;
SELECT set_config('request.jwt.claim.sub', '90000000-0000-0000-0000-000000000001', TRUE);
DO $$
BEGIN
  IF (SELECT count(*) FROM public.email_update_signups) <> 1 THEN
    RAISE EXCEPTION 'Admin cannot read signup';
  END IF;
END;
$$;
RESET ROLE;
ROLLBACK;
