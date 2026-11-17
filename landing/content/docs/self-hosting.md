---
title: "Self-hosting Analiza"
linkTitle: "Self-hosting"
description: "Analiza is fully open source and runs with Docker Compose. What you need to self-host it and how to point the tracker at your own server."
date: 2026-11-17
lastmod: 2026-11-17
weight: 4
---

Yes, you can self-host Analiza. The whole stack (tracker, ingestion API, storage and dashboards) is open source on [GitHub](https://github.com/ecyshor/analiza) and runs with Docker Compose. Point the tracker at your own server with the script's `hostname` attribute.

## What is in the stack?

- **Tracker**: the small JavaScript snippet you add to your site.
- **eye**: a Go service that receives events, adds country and device information and writes them to the database.
- **ClickHouse**: stores the analytics events.
- **PostgreSQL and PostgREST**: store sites and accounts and serve the admin API.
- **Admin UI**: a React app to manage your sites and view dashboards.
- **Metabase**: renders the analytics dashboards.
- **Traefik**: the reverse proxy that routes traffic to the services.

## What do I need?

- A Docker host with the Compose plugin
- DNS names for the ingestion API, the admin API and Metabase
- A TLS-terminating reverse proxy or load balancer in front of the stack
- An Auth0 tenant for admin logins
- Static hosting for the admin UI and the tracker script

The full step-by-step guide, including the configuration and secrets to set, is in the [self-hosting section of the README](https://github.com/ecyshor/analiza#self-hosting).

## How do I point the tracker at my server?

Add a `hostname` attribute with the base URL of your ingestion API. Events are sent to `<hostname>/eye`:

```html
<script defer src="https://your-cdn.example.com/analiza.js"
        tenant="YOUR-SITE-ID"
        hostname="https://analytics-api.example.com"></script>
```

Without `hostname`, events go to the hosted service at `https://api.analiza.dev`.

## Should I self-host or use the hosted service?

Self-hosting gives you full control and costs only your own infrastructure, but you run upgrades, backups and monitoring yourself. The [hosted service](https://app.analiza.dev) is free up to 100k events a year and €9 a year up to 1M events, runs in the EU, and lets you export all your data at any time if you want to move to your own server later.
