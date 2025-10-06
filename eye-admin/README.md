# eye-admin (React Admin UI)

## Purpose
Admin interface for managing analytics data and domains.

## Architecture
- Main entry: `src/admin.tsx` (react-admin, Auth0, PostgREST)
- Domain management: `src/domains.tsx`
- Tracking setup: `src/setup.tsx` (injects JS tracker)
- Vite for dev/build

## Developer Workflow
- Build: `make build` or `yarn build`
- Start: `make start` or `yarn dev`
- Env vars: `.env.private` for local, Netlify for deploy

## Integration
- Auth0: authentication
- PostgREST: data provider
- Metabase: analytics UI