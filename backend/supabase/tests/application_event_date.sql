\set ON_ERROR_STOP on

DO $$
BEGIN
  ASSERT EXISTS (
    SELECT 1 FROM public.application_cycles
    WHERE event_key = 'jackson-hacks-2026'
      AND name = 'Jackson Hacks 2027'
      AND edits_close_at = '2027-02-20T08:00:00-05:00'::timestamptz
  ), 'rescheduled application cycle was not updated';
END;
$$;
