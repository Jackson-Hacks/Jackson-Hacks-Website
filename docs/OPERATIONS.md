# Operations Runbook

## Email updates signup rollout

- The October 3 local preview does not require working signups. No live database migration was applied for this change.
- Clicking **Notify me** submits an explicit opt-in to the application-opening announcement; there is no separate consent checkbox. This does not authorize unrelated event marketing.
- Before publishing the signup form, apply `backend/supabase/migrations/20261003143234_email_updates_signup.sql` to staging and then production after verification. Do not blindly reapply historical migrations.
- The public `join_email_updates` RPC accepts only a valid email, explicit consent and the current consent version. Duplicate addresses receive the same generic acknowledgment; no subscriber data is returned. Anonymous users cannot read or directly modify the list. Admins can read `email_update_signups` through the database's RLS-protected API.
- The form only collects subscribers; it does not send email. Before sending, choose an authorized sender workflow, include sender identity/contact and working unsubscribe instructions, and process unsubscribe requests within 10 business days. An email signup is not an event application.
- Add gateway/server-side rate limiting and, if public traffic warrants it, a verified CAPTCHA before promoting the signup widely. The honeypot only filters simple bots and is not robust abuse prevention.
- A subscriber's email is unverified: do not treat it as an authenticated identity, application, or admission. Follow the published event-specific retention policy and protect any exported list.
- Run `backend/supabase/tests/email_updates.sql` to verify consent, deduplication, honeypot filtering, anonymous read denial and admin-only access. Sending/unsubscribe automation is not part of this release.

## Release sequence

1. Export or snapshot the current Supabase schema and verify the most recent database backup.
2. Run the frontend `npm run check` gate and PostgreSQL integration suite.
3. Apply migrations to staging and test signup, login, submit, edit, demographics, close, blind review, scoring, random assignment, export, and RLS denial flows.
4. Deploy staging and hard-refresh `/`, `/Register`, `/Dashboard`, and an unknown route.
5. Verify OAuth redirect URLs, responsive layouts, keyboard operation, reduced motion, CSP, and monitoring.
6. Obtain organizer sign-off before applying the migration and frontend build to production.
7. Repeat the smoke test immediately after deployment.

## Application location rollout

- Apply `backend/supabase/migrations/20260902234026_application_location.sql` before deploying the frontend with location fields. Otherwise the old RPC will not persist them.
- The new form requires country and city; province/state remains optional. Existing age, optional gender identity, and optional race/ethnicity questions are unchanged.
- Existing applications and drafts are preserved. Older clients that omit the entire location group remain compatible and cannot erase saved location answers. New clients validate missing location answers before submitting an older draft.
- Verify location survives draft resume, submit, and edit, and remains hidden in blind review. The PostgreSQL suite includes location validation, legacy-client preservation, cutoff, ownership, and RLS checks.

## Application launch gate

- The current application cycle starts unlaunched in Supabase. While unlaunched, `/Register` shows the public “Applications Opening Soon” page and the database rejects submissions and drafts.
- When applications are ready, an administrator can select **Open Applications** in `/Dashboard`. This records the launch time and opens the page and database immediately; no Vercel setting or redeployment is required.
- The same control closes or reopens applications. The scheduled opening and cutoff timestamps remain hard server-side limits.
- Password-recovery links remain available while the public application gate is closed.

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
- Eligibility, guardian consent, acceptance schedule, demographic-data use, reviewer rubric, and score-to-decision policy
- Confirmed duration/capacity/prize claims and sponsor/logo approvals
- Production host and Supabase owners
