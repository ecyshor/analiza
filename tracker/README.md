# tracker (JS Client)

## Purpose
Client-side analytics event sender for websites.

## Usage
- Embed `<script src="https://cdn.jsdelivr.net/gh/ecyshor/analiza@main/tracker/analiza.min.js" tenant="<UUID>"></script>` in site HTML.
- `tenant` attribute must be a valid UUID.
- Optionally set `hostname` attribute to override API endpoint (default: `https://api.analiza.dev`).

## Event Types
- "view": page visible or navigation
- "gone": page hidden

## Data Flow
- Sends events to `/eye` API endpoint
