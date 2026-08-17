# Jackson Hacks Website

React/Vite website and Supabase-backed application system for Jackson Hacks.

## Prerequisites

- Node.js 22 and npm
- A development Supabase project
- Docker Desktop only when running the PostgreSQL integration suite locally

## Local setup

1. Copy `frontend/.env.example` to `frontend/.env.local`.
2. Fill in a **development** Supabase URL and public anonymous key. Never use a service-role key in the browser.
3. From `frontend`, run `npm ci` and then `npm run dev`.
4. Apply `backend/supabase/schema.sql` to a fresh project, or apply the migration under `backend/supabase/migrations` to an existing project.

Direct visits to `/Register` and `/Dashboard` require the host’s SPA fallback configuration. Netlify-compatible `_redirects`/`_headers` and a Vercel configuration are included under `frontend`.

## Commands

- `npm run lint` — lint source files
- `npm run typecheck` — validate the configured JS/TS project
- `npm test` — run unit tests
- `npm run build` — create the production bundle
- `npm run check:bundle` — enforce JavaScript and image budgets after a build
- `npm run check` — run all frontend release checks
- `bash backend/supabase/tests/run-local-postgres.sh` — test fresh schema, RPC security, legacy migration, and migration repeatability on macOS/Linux
- `./backend/supabase/tests/run-local-postgres.ps1` — run the same database suite from Windows PowerShell

## Application model

- One application is allowed per user and event cycle.
- Applicants save through `save_application`; direct INSERT/UPDATE permissions are revoked.
- The database clock and application-cycle row enforce opening and closing times.
- The form has one scored long-answer response plus a demographic survey; demographic answers are hidden in blind review mode.
- Reviewers score five 0–5 categories (one decimal allowed) for a total out of 25, with one scorecard per reviewer and application.
- Random review mode selects an application the current reviewer has not scored and excludes the reviewer's own application.
- Scoring opens only after submissions close. If submissions are reopened and an applicant edits, prior scorecards for that application are invalidated.
- Legacy administrative statuses remain available for applicant communication, but they are separate from reviewer scoring.
- CSV exports contain a reduced column set, neutralize spreadsheet formulas, and create an export audit event.

Dashboard is intentionally public at present for UI testing. Database RLS still prevents logged-out visitors from reading applicant data. Protect the route before production once the testing exception is removed.

## Admin provisioning

Provision an administrator only through an approved SQL/service process, never from the browser:

```sql
insert into public.admin_users (user_id) values ('AUTH_USER_UUID');
```

Review `admin_users` periodically and delete access that is no longer required.

## Environment separation

Use separate Supabase projects for development, staging, and production. Configure each project’s site URL and approved OAuth redirect URLs exactly. Run migrations and the database tests in staging before production.

See [operations](docs/OPERATIONS.md) for deployment, backup, rollback, and incident procedures. Organizer approval is still required for legal/privacy wording, eligibility, retention periods, sponsor permissions, and final event claims.
