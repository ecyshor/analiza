# analiza.dev

Simple analytics for website

Data must be owned by 1001

## Architecture Overview

- Monorepo with multiple services: `eye` (Go backend), `eye-admin` (React admin UI), `tracker` (JS client), `landing` (Hugo site), plus supporting infra (`promtail`, `metabase`, `postgrest`, `postgres`, `clickhouse`).
- Data flows from `tracker/analiza.js` (client) → `eye` (Go API) → ClickHouse/Postgres → `eye-admin` (React UI) via PostgREST/Metabase.
- Traefik routes traffic and manages CORS.

## Developer Workflows

### Nix setup

The project is configured with direnv and nix to manage all the dependencies.
Direnv is in the `.envrc` file and the nix setup is in the `nix` directory.

Installation steps can be found in the [direnv and Nix setup guide](https://nicu.dev/dirnev-nix-shell).

### Local dev

- Local dev: Set `*.dev.analiza.lan` domains to `127.0.0.1`. Data dirs must be owned by UID 1001.
- Build/run: `make start` (Docker Compose), `make clean` (teardown), subfolder Makefiles for service-specific builds.
- Secrets: `.env.private` for local, Netlify for deploy.

## Key Files

- `docker-compose.yml`: Service orchestration
- `Makefile`: Build/run commands
- See subfolder READMEs for service details.

## Dev

- `api.dev.analiza.lan` must point to 127.0.0.1 for the local setup to work
- `admin.dev.analiza.lan` must point to 127.0.0.1 for the local setup to work
- `metabase.dev.analiza.lan` must point to 127.0.0.1 for the local setup to work
- `openapi.dev.analiza.lan` must point to 127.0.0.1 for the local setup to work
