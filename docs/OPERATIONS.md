# Operations Runbook

## Release sequence

1. Export or snapshot the current Supabase schema and verify the most recent database backup.
2. Run the frontend `npm run check` gate and PostgreSQL integration suite.
3. Apply migrations to staging and test signup, login, submit, edit, close, decision, export, and RLS denial flows.
4. Deploy staging and hard-refresh `/`, `/Register`, `/Dashboard`, and an unknown route.
5. Verify OAuth redirect URLs, responsive layouts, keyboard operation, reduced motion, CSP, and monitoring.
6. Obtain organizer sign-off before applying the migration and frontend build to production.
7. Repeat the smoke test immediately after deployment.

## Rollback

- Record the frontend deployment identifier and database backup identifier before release.
- Prefer a forward-fix for additive database migrations. Do not drop new columns or tables while an older or newer frontend may still use them.
- Roll back the frontend through the hosting provider’s immutable deployment history.
- Restore a database backup only after the designated data owner accepts the loss window and applicants are notified if needed.

## Backup and recovery test

- Enable managed database backups before accepting applications.
- At least once before launch, restore the latest backup into an isolated project and run the PostgreSQL integration suite against it.
- Record restore duration and the person authorized to initiate recovery. Those names must be supplied by organizers.

## Incident response

1. Close submissions through the admin control if application integrity or privacy may be affected.
2. Preserve audit records and deployment/database identifiers; do not export additional personal data.
3. Remove compromised administrator membership and rotate affected credentials/OAuth secrets.
4. Determine affected records and time range using status/export audit tables and provider logs.
5. The approved incident owner decides applicant notification, regulatory/school escalation, and reopening.

Operational monitoring accepts only allowlisted event names, environment, route path, and timestamp. It must never receive form answers, email addresses, tokens, or application records.

## Organizer-owned launch blockers

- Privacy notice, consent language, retention/deletion date, and minor-participant process
- Support expectations and incident owner
- Eligibility, guardian consent, acceptance schedule, and edit-after-decision policy
- Confirmed duration/capacity/prize claims and sponsor/logo approvals
- Production host and Supabase owners
