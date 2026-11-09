#!/bin/bash
set -eo pipefail

# The postgrest role password follows POSTGRES_PASSWORD (ANALIZA_POSTGRES_PASSWORD)
# so the flyway and postgrest containers stay in sync with the env contract.
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	CREATE USER postgrest WITH PASSWORD '$POSTGRES_PASSWORD';
	CREATE DATABASE eye_admin;
	GRANT ALL PRIVILEGES ON DATABASE eye_admin TO postgrest;
EOSQL
