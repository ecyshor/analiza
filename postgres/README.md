# postgres

## Purpose
Primary relational database for analytics and admin data.

## Workflow
- Init scripts in `init/`
- Data lives in `$ANALIZA_DATA_DIR/postgres/<major>/docker` (postgres 18+
  images default `PGDATA` to `/var/lib/postgresql/<major>/docker` and the
  compose file mounts `$ANALIZA_DATA_DIR/postgres` at `/var/lib/postgresql`).
  A major-version bump cannot reuse the old dir in place: dump/restore
  (`pg_dumpall` into a fresh container, see analiza-infra
  `migrations/0003-postgres-18.sh`); local dev can just delete the dir and
  start fresh.
- Managed via Docker Compose
