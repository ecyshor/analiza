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
- "click": link or button click

## Click tracking
Clicks (including middle/auxiliary clicks) on links are tracked automatically:
- Outbound links and file downloads (pdf, zip, docx, mp3, ...) are recorded as `scheme://host/path` — query strings and hashes are never sent.
- `mailto:` / `tel:` links are recorded as the scheme only ("mailto:" / "tel:"), never the address.
- Internal links are not recorded as targets.
- Add `data-analiza-click="name"` to any element (including buttons) to record a named click/goal.
- Add `data-analiza-click="off"` to an element or any ancestor to opt out that whole subtree.

## Data Flow
- Sends events to `/eye` API endpoint
