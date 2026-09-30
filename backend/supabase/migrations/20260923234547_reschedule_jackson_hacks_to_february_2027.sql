-- Keep the existing cycle ID and event key so applications, drafts, and reviews
-- stay attached to the same event after its date changes.
BEGIN;

UPDATE public.application_cycles
SET name = 'Jackson Hacks 2027',
    edits_close_at = '2027-02-20T08:00:00-05:00',
    updated_at = NOW()
WHERE event_key = 'jackson-hacks-2026'
  AND (name IS DISTINCT FROM 'Jackson Hacks 2027'
    OR edits_close_at IS DISTINCT FROM '2027-02-20T08:00:00-05:00'::timestamptz);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.application_cycles
    WHERE event_key = 'jackson-hacks-2026'
      AND name = 'Jackson Hacks 2027'
      AND edits_close_at = '2027-02-20T08:00:00-05:00'::timestamptz
  ) THEN
    RAISE EXCEPTION 'jackson_hacks_2027_cycle_missing';
  END IF;
END;
$$;

COMMIT;
