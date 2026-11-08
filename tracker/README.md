# tracker (JS Client)

## Purpose
Client-side analytics event sender for websites.

## Usage
- Embed `<script defer src="https://cdn.jsdelivr.net/gh/ecyshor/analiza@edbfc622baa5332b248ed4f15553a1917dfeb9a6/tracker/analiza.js" integrity="sha384-782mWdFBLTPCCt/X6gdEItCq88O+HLOUKGrjjftVmdwXpDBhVS/s2gGnVVqmHWfV" crossorigin="anonymous" tenant="<UUID>"></script>` in site HTML. The URL is pinned to a commit and the integrity hash pins the exact file, so `@main` cannot silently change the code.
- `tenant` attribute must be a valid UUID.
- Optionally set `hostname` attribute to override API endpoint (default: `https://api.analiza.dev`).

## Event Types
- "view": page visible or navigation
- "gone": page hidden

## Data Flow
- Sends events to `/eye` API endpoint
