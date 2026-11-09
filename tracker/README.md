# tracker (JS Client)

## Purpose
Client-side analytics event sender for websites.

## Usage
- Embed `<script src="https://cdn.analiza.dev/analiza.js" tenant="<UUID>"></script>` in site HTML. This stable URL is served from our own CDN; `.github/workflows/tracker-publish.yml` minifies `tracker/analiza.js` and publishes it there on every push to `main` (CDN cache time is 1 hour).
- `tracker/analiza.js` must stay at its current path in this repo: sites installed before the move to our own CDN still load it from jsDelivr at this path (served there as `analiza.min.js`).
- `tenant` attribute must be a valid UUID.
- Optionally set `hostname` attribute to override API endpoint (default: `https://api.analiza.dev`).

## Event Types
- "view": page visible or navigation
- "gone": page hidden

## Data Flow
- Sends events to `/eye` API endpoint
