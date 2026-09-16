-- A cycle that has never launched is closed by launched_at alone. Clearing the
-- older manual-close fields keeps applicant errors and admin UI state
-- unambiguous while the database trigger continues to fail closed.
BEGIN;

UPDATE public.application_cycles
SET closed_at = NULL,
    closed_by = NULL,
    updated_at = NOW()
WHERE launched_at IS NULL;

COMMIT;
