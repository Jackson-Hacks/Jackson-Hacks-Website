$ErrorActionPreference = 'Stop'
$container = 'jackson-hacks-db-test-' + [Guid]::NewGuid().ToString('N').Substring(0, 10)

function Invoke-Docker {
  & docker @args
  if ($LASTEXITCODE -ne 0) {
    throw "Docker command failed: docker $($args -join ' ')"
  }
}

try {
  Invoke-Docker run --rm -d --name $container -e POSTGRES_PASSWORD=local-test-only postgres:17-alpine

  $ready = $false
  for ($attempt = 0; $attempt -lt 30; $attempt++) {
    & docker exec $container pg_isready -U postgres *> $null
    if ($LASTEXITCODE -eq 0) {
      $ready = $true
      break
    }
    Start-Sleep -Seconds 1
  }
  if (-not $ready) { throw 'PostgreSQL did not become ready within 30 seconds.' }

  Invoke-Docker cp backend/supabase/. "${container}:/sql"

  $bootstrap = "CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE SCHEMA auth; CREATE TABLE auth.users (id uuid PRIMARY KEY); CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS 'SELECT nullif(current_setting(''request.jwt.claim.sub'', true), '''')::uuid';"
  Invoke-Docker exec $container psql -U postgres -v ON_ERROR_STOP=1 -c $bootstrap
  Invoke-Docker exec $container psql -U postgres -v ON_ERROR_STOP=1 -f /sql/schema.sql
  Invoke-Docker exec $container psql -U postgres -v ON_ERROR_STOP=1 -f /sql/tests/application_edit_window.sql

  Invoke-Docker exec $container createdb -U postgres legacy
  $legacyBootstrap = "CREATE SCHEMA auth; CREATE TABLE auth.users (id uuid PRIMARY KEY); CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS 'SELECT nullif(current_setting(''request.jwt.claim.sub'', true), '''')::uuid';"
  Invoke-Docker exec $container psql -U postgres -d legacy -v ON_ERROR_STOP=1 -c $legacyBootstrap
  Invoke-Docker exec $container psql -U postgres -d legacy -v ON_ERROR_STOP=1 -f /sql/tests/legacy_schema.sql
  $legacyApplicant = "INSERT INTO auth.users (id) VALUES ('20000000-0000-0000-0000-000000000001'); INSERT INTO applications (user_id, full_name, email, age, school, grade, experience_level, why_attend, agree_to_terms) VALUES ('20000000-0000-0000-0000-000000000001', 'Legacy Applicant', 'legacy@example.com', 17, 'Legacy School', '11', 'beginner', 'Legacy application', true);"
  Invoke-Docker exec $container psql -U postgres -d legacy -v ON_ERROR_STOP=1 -c $legacyApplicant
  Invoke-Docker exec $container psql -U postgres -d legacy -v ON_ERROR_STOP=1 -f /sql/migrations/20260807_application_edit_window.sql
  Invoke-Docker exec $container psql -U postgres -d legacy -v ON_ERROR_STOP=1 -f /sql/migrations/20260810_application_security_and_indexes.sql
  Invoke-Docker exec $container psql -U postgres -d legacy -v ON_ERROR_STOP=1 -f /sql/migrations/20260817211104_application_review_scoring.sql
  Invoke-Docker exec $container psql -U postgres -d legacy -v ON_ERROR_STOP=1 -f /sql/migrations/20260817230812_application_review_five_point_scale.sql
  Invoke-Docker exec $container psql -U postgres -d legacy -v ON_ERROR_STOP=1 -f /sql/migrations/20260821033736_application_drafts.sql
  Invoke-Docker exec $container psql -U postgres -d legacy -v ON_ERROR_STOP=1 -f /sql/tests/application_edit_window.sql
  Invoke-Docker exec $container psql -U postgres -d legacy -v ON_ERROR_STOP=1 -f /sql/migrations/20260807_application_edit_window.sql
  Invoke-Docker exec $container psql -U postgres -d legacy -v ON_ERROR_STOP=1 -f /sql/migrations/20260810_application_security_and_indexes.sql
  Invoke-Docker exec $container psql -U postgres -d legacy -v ON_ERROR_STOP=1 -f /sql/migrations/20260817211104_application_review_scoring.sql
  Invoke-Docker exec $container psql -U postgres -d legacy -v ON_ERROR_STOP=1 -f /sql/migrations/20260817230812_application_review_five_point_scale.sql
  Invoke-Docker exec $container psql -U postgres -d legacy -v ON_ERROR_STOP=1 -f /sql/migrations/20260821033736_application_drafts.sql

  Write-Host 'Fresh schema, legacy migration, database behavior, and migration idempotency tests passed.'
}
finally {
  & docker rm -f $container *> $null
}
