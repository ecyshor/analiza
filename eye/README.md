# eye (Go Backend)

## Purpose
Event ingestion and analytics API. Stores data in ClickHouse and Postgres.

## Architecture
- Main entry: `eye.go` (HTTP API, event batching, geo-IP enrichment)
- Config: `config.go` (env-driven, sensible defaults)
- Geo-IP: `geo_ip.go` (MaxMind DB)
- Data models: `UserEvent`, `Event`, etc.
- Uses channels for event batching.

## Developer Workflow
- Build: `make build`
- Install deps: `make install`
- Run via Docker Compose (`make start` from repo root)
- Env vars: see `config.go` for supported keys

## Integration
- ClickHouse/Postgres: connection via env vars
- Traefik: routes API traffic
