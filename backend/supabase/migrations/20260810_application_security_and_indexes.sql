-- Follow-up hardening for Supabase's default function grants and database
-- advisor recommendations. Safe to apply after application_edit_window.

BEGIN;

CREATE INDEX IF NOT EXISTS applications_user_id_idx
  ON public.applications (user_id);
CREATE INDEX IF NOT EXISTS application_cycles_closed_by_idx
  ON public.application_cycles (closed_by);
CREATE INDEX IF NOT EXISTS application_status_events_application_id_idx
  ON public.application_status_events (application_id);
CREATE INDEX IF NOT EXISTS application_status_events_changed_by_idx
  ON public.application_status_events (changed_by);
CREATE INDEX IF NOT EXISTS application_export_events_exported_by_idx
  ON public.application_export_events (exported_by);
CREATE INDEX IF NOT EXISTS application_export_events_cycle_id_idx
  ON public.application_export_events (cycle_id);

ALTER FUNCTION public.is_admin() SECURITY INVOKER;

DROP POLICY IF EXISTS "Users can view own application" ON public.applications;
CREATE POLICY "Users can view own application" ON public.applications
  FOR SELECT USING ((SELECT auth.uid()) = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can view own admin row" ON public.admin_users;
CREATE POLICY "Admins can view own admin row" ON public.admin_users
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.save_application(JSONB, UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_application_window_closed(BOOLEAN, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_application_status(UUID, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.log_application_export(INTEGER, TEXT) FROM PUBLIC;

-- Supabase can grant functions to API roles explicitly through default
-- privileges, so revoking only from PUBLIC is not sufficient.
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.save_application(JSONB, UUID, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.set_application_window_closed(BOOLEAN, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.set_application_status(UUID, TEXT, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.log_application_export(INTEGER, TEXT) FROM anon;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_application(JSONB, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_application_window_closed(BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_application_status(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_application_export(INTEGER, TEXT) TO authenticated;

COMMIT;
