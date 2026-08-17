#!/usr/bin/env bash
set -euo pipefail

container="jackson-hacks-db-test-${RANDOM}"
cleanup() { docker rm -f "$container" >/dev/null 2>&1 || true; }
trap cleanup EXIT

docker run --rm -d --name "$container" -e POSTGRES_PASSWORD=local-test-only postgres:17-alpine >/dev/null
ready=false
for _ in $(seq 1 30); do
  if docker exec "$container" psql -U postgres -d postgres -Atqc "SELECT 1" >/dev/null 2>&1; then
    # The image briefly exposes a temporary server during initialization. A
    # second successful query avoids racing its restart into the final server.
    sleep 1
    if docker exec "$container" psql -U postgres -d postgres -Atqc "SELECT 1" >/dev/null 2>&1; then
      ready=true
      break
    fi
  fi
  sleep 1
done
if [[ "$ready" != true ]]; then
  docker logs "$container" >&2 || true
  echo "PostgreSQL did not become ready within 30 attempts." >&2
  exit 1
fi
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
docker exec "$container" psql -U postgres -d legacy -v ON_ERROR_STOP=1 -f /sql/migrations/20260810_application_security_and_indexes.sql
docker exec "$container" psql -U postgres -d legacy -v ON_ERROR_STOP=1 -f /sql/migrations/20260817211104_application_review_scoring.sql
docker exec "$container" psql -U postgres -d legacy -v ON_ERROR_STOP=1 -f /sql/tests/application_edit_window.sql
docker exec "$container" psql -U postgres -d legacy -v ON_ERROR_STOP=1 -f /sql/migrations/20260807_application_edit_window.sql
docker exec "$container" psql -U postgres -d legacy -v ON_ERROR_STOP=1 -f /sql/migrations/20260810_application_security_and_indexes.sql
docker exec "$container" psql -U postgres -d legacy -v ON_ERROR_STOP=1 -f /sql/migrations/20260817211104_application_review_scoring.sql
