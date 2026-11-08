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

## Local Development & Installation

### 1. Hosts Configuration
For local development, you must update your `/etc/hosts` file with the following domains mapping to `127.0.0.1`:
```text
127.0.0.1 api.dev.analiza.lan
127.0.0.1 admin.dev.analiza.lan
127.0.0.1 metabase.dev.analiza.lan
127.0.0.1 openapi.dev.analiza.lan
```

### 2. Environment Variables
Local development relies on the `.env.private` files inside the respective project directories (such as `eye-admin`). These are not checked into Git. Make sure to configure them per the documentation in the subfolders.

#### Deployment environment variables (`.env` next to `docker-compose.yml`)
All of these have working defaults for local dev and CI; production must override them in `.env`:

| Variable | Default | Used for |
| --- | --- | --- |
| `ANALIZA_POSTGRES_PASSWORD` | `super_secret_password` | `POSTGRES_PASSWORD` and both flyway `-password` args |
| `ANALIZA_EYE_PG_PASSWORD` | `super_secret_password` | eye's `POSTGRES_PASSWORD` env |
| `ANALIZA_CH_ADMIN_PASSWORD` | `eye_super_duper_password` | ClickHouse `CLICKHOUSE_PASSWORD` |
| `ANALIZA_EYE_CH_PASSWORD` | `eye_super_password` | eye's `CLICKHOUSE_PASSWORD` env |
| `ANALIZA_METABASE_DB_PASSWORD` | `metabase_super_password` | Metabase `MB_DB_PASS` |
| `ANALIZA_HASH_SEED` | hex literal in `eye/config.go` | eye's visitor-hash seed (must be 64 hex chars) |
| `ANALIZA_HTTP_BIND` | `0.0.0.0` | traefik port mapping host (`"${ANALIZA_HTTP_BIND:-0.0.0.0}:8080:80"`) |
| `ANALIZA_ADMIN_CORS_ORIGINS` | app origins list | PostgREST router CORS allow-origin list |
| `ANALIZA_METABASE_ADMIN_ALLOWLIST` | `0.0.0.0/0,::/0` | traefik `ipAllowList` source ranges for the non-embed Metabase routes — restrict this in production |
| `DOCKER_SOCK` | `/var/run/docker.sock` | socket mounted into the `docker-socket-proxy` containers |

The swagger UI (`openapi.dev.analiza.lan`) only runs under the compose `dev` profile, which the Makefile start targets enable; production `docker compose up` does not start it.

### 3. Build & Run
To run the complete stack:
```bash
# Clean previous containers/volumes if necessary
make clean

# Build and start all services attached
make start

# Or start detached
make start_detached
```

### 4. Running End-to-End (E2E) Tests

We use Playwright for robust E2E testing of the `eye-admin` frontend and the Go/PostgREST backends. To avoid triggering Auth0 rate limits and bot protection during automated tests, we provide a **Mocked Authentication** flow.

When the mock is enabled, the frontend bypasses the real Auth0 Universal Login and uses a locally signed dummy JWT token. This token is accepted by the local PostgREST instance running with the test configuration (`postgrest.test.conf`).

**To run the tests locally:**
```bash
# 1. Start the backend with the test configuration
export ANALIZA_POSTGREST_CONFIG=./postgrest/postgrest.test.conf
make start_detached

# 2. Enter the eye-admin directory
cd eye-admin

# 3. Install dependencies
npm install

# 4. Run the Playwright E2E tests using the mock auth wrapper
npm run test:e2e
```
