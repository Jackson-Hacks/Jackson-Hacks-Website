#!/usr/bin/env bash
set -euo pipefail

container="jackson-hacks-db-test-${RANDOM}"
cleanup() { docker rm -f "$container" >/dev/null 2>&1 || true; }
trap cleanup EXIT

docker run --rm -d --name "$container" -e POSTGRES_PASSWORD=local-test-only postgres:17-alpine >/dev/null
for _ in $(seq 1 30); do docker exec "$container" pg_isready -U postgres >/dev/null 2>&1 && break; sleep 1; done
docker cp backend/supabase/. "$container":/sql

bootstrap="CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE SCHEMA auth; CREATE TABLE auth.users (id uuid PRIMARY KEY); CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS 'SELECT nullif(current_setting(''request.jwt.claim.sub'', true), '''')::uuid';"
docker exec "$container" psql -U postgres -v ON_ERROR_STOP=1 -c "$bootstrap"
docker exec "$container" psql -U postgres -v ON_ERROR_STOP=1 -f /sql/schema.sql
docker exec "$container" psql -U postgres -v ON_ERROR_STOP=1 -f /sql/tests/application_edit_window.sql

docker exec "$container" createdb -U postgres legacy
docker exec "$container" psql -U postgres -d legacy -v ON_ERROR_STOP=1 -c "CREATE SCHEMA auth; CREATE TABLE auth.users (id uuid PRIMARY KEY); CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS 'SELECT nullif(current_setting(''request.jwt.claim.sub'', true), '''')::uuid';"
docker exec "$container" psql -U postgres -d legacy -v ON_ERROR_STOP=1 -f /sql/tests/legacy_schema.sql
docker exec "$container" psql -U postgres -d legacy -v ON_ERROR_STOP=1 -c "INSERT INTO auth.users (id) VALUES ('20000000-0000-0000-0000-000000000001'); INSERT INTO applications (user_id, full_name, email, age, school, grade, experience_level, why_attend, agree_to_terms) VALUES ('20000000-0000-0000-0000-000000000001', 'Legacy Applicant', 'legacy@example.com', 17, 'Legacy School', '11', 'beginner', 'Legacy application', true);"
docker exec "$container" psql -U postgres -d legacy -v ON_ERROR_STOP=1 -f /sql/migrations/20260807_application_edit_window.sql
docker exec "$container" psql -U postgres -d legacy -v ON_ERROR_STOP=1 -f /sql/tests/application_edit_window.sql
docker exec "$container" psql -U postgres -d legacy -v ON_ERROR_STOP=1 -f /sql/migrations/20260807_application_edit_window.sql
