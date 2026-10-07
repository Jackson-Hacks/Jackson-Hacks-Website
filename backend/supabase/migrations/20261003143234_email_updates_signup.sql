-- Anonymous signup is intentionally write-only: no account is needed.
CREATE TABLE IF NOT EXISTS public.email_update_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID NOT NULL REFERENCES public.application_cycles(id),
  email TEXT NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254 AND email = lower(btrim(email))),
  consent_version TEXT NOT NULL CHECK (consent_version = '2026-10-03'),
  consent_text TEXT NOT NULL DEFAULT 'Notify me when Jackson Hacks 2027 applications open.',
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source TEXT NOT NULL DEFAULT 'homepage',
  UNIQUE (cycle_id, email)
);
ALTER TABLE public.email_update_signups ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.email_update_signups FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.email_update_signups TO authenticated;
DROP POLICY IF EXISTS "Admins can read email update signups" ON public.email_update_signups;
CREATE POLICY "Admins can read email update signups" ON public.email_update_signups
  FOR SELECT TO authenticated USING ((SELECT public.is_admin()));

-- The privileged implementation lives in a non-exposed schema. The public
-- invoker wrapper only accepts bounded, validated signup input and returns no PII.
CREATE SCHEMA IF NOT EXISTS email_updates_private;
REVOKE ALL ON SCHEMA email_updates_private FROM PUBLIC;
GRANT USAGE ON SCHEMA email_updates_private TO anon, authenticated;

CREATE OR REPLACE FUNCTION email_updates_private.add_signup(
  p_email TEXT, p_consent BOOLEAN, p_consent_version TEXT, p_event_key TEXT, p_website TEXT
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  normalized_email TEXT;
  signup_cycle_id UUID;
BEGIN
  IF char_length(coalesce(p_email, '')) > 254
     OR char_length(coalesce(p_event_key, '')) > 128
     OR char_length(coalesce(p_website, '')) > 254 THEN
    RAISE EXCEPTION 'invalid_email_signup' USING ERRCODE = '23514';
  END IF;
  normalized_email := lower(btrim(coalesce(p_email, '')));
  IF p_consent IS DISTINCT FROM TRUE
     OR p_consent_version IS DISTINCT FROM '2026-10-03'
     OR normalized_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN
    RAISE EXCEPTION 'invalid_email_signup' USING ERRCODE = '23514';
  END IF;
  -- Honeypot submissions get the same acknowledgment but are never stored.
  IF btrim(coalesce(p_website, '')) <> '' THEN
    RETURN jsonb_build_object('accepted', TRUE);
  END IF;
  SELECT id INTO signup_cycle_id FROM public.application_cycles WHERE event_key = p_event_key;
  IF signup_cycle_id IS NULL THEN
    RAISE EXCEPTION 'invalid_email_signup' USING ERRCODE = '23514';
  END IF;
  INSERT INTO public.email_update_signups (cycle_id, email, consent_version)
    VALUES (signup_cycle_id, normalized_email, p_consent_version)
    ON CONFLICT (cycle_id, email) DO NOTHING;
  -- Do not expose whether an email was already subscribed or return stored rows.
  RETURN jsonb_build_object('accepted', TRUE);
END;
$$;
REVOKE ALL ON FUNCTION email_updates_private.add_signup(TEXT, BOOLEAN, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION email_updates_private.add_signup(TEXT, BOOLEAN, TEXT, TEXT, TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.join_email_updates(
  p_email TEXT,
  p_consent BOOLEAN,
  p_consent_version TEXT,
  p_event_key TEXT DEFAULT 'jackson-hacks-2026',
  p_website TEXT DEFAULT ''
) RETURNS JSONB LANGUAGE sql SECURITY INVOKER SET search_path = ''
AS $$
  SELECT email_updates_private.add_signup(p_email, p_consent, p_consent_version, p_event_key, p_website);
$$;
REVOKE ALL ON FUNCTION public.join_email_updates(TEXT, BOOLEAN, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.join_email_updates(TEXT, BOOLEAN, TEXT, TEXT, TEXT) TO anon, authenticated;
