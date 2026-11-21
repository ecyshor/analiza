---
title: "What data does Analiza collect?"
linkTitle: "What data is collected"
description: "Exactly what the Analiza tracker sends, what the server derives from it, and what is never collected: no cookies, no localStorage, no fingerprinting, no raw IPs."
date: 2026-11-17
lastmod: 2026-11-17
weight: 2
---

The Analiza tracker sends only the page URL, the referrer, your site id and the event type. It sets no cookies, uses no localStorage and contains no fingerprinting code. The server derives the visitor's country, browser and device, and a visitor identifier that rotates every month. Raw IP addresses are never stored.

## What does the tracker send?

Each event is a small JSON request to `https://api.analiza.dev/eye` with these fields:

| Field | Value |
| --- | --- |
| Event type | `view` (page view), `gone` (page hidden or closed) or `click` |
| Page URL | `location.href` of the current page |
| Referrer | `document.referrer`, the page the visitor came from; only its origin (`scheme://host`) is stored, never its path or query |
| Site id | Your `tenant` id |
| Click name | For clicks only: the `data-analiza-click` name, if any |
| Click target | For clicks only: an outbound or download link reduced to `https://host/path`, or `mailto:` / `tel:` |

You can read the whole tracker, about 150 lines, on [GitHub](https://github.com/ecyshor/analiza/blob/main/tracker/analiza.js).

## What does the server store?

- **Page path and UTM campaign parameters.** Only the path and the `utm_source`, `utm_medium`, `utm_campaign`, `utm_term` and `utm_content` parameters are kept. The rest of the query string is dropped, and URLs that look like they contain a token are not recorded.
- **Country.** Looked up from the IP address at ingestion time. The IP itself is not stored.
- **Browser, operating system and device type.** Parsed from the `User-Agent` header.
- **A monthly visitor identifier.** A keyed hash of the current month, the user agent, the `Accept-Language` header and the IP address. It lets Analiza count unique visitors without storing anything on the visitor's device. It changes every month, so visitors cannot be followed over longer periods, and it cannot be turned back into an IP address.

## What is never collected?

- No cookies, localStorage, sessionStorage or other browser storage
- No fingerprinting (canvas, fonts, screen size, plugins and so on)
- No raw IP addresses
- No cross-site or cross-device tracking, and no advertising profiles
- No form contents, keystrokes, mouse movements or session recordings

## Where is the data stored?

All analytics data is stored and processed in the European Union, on servers in Germany (Hetzner). You can request a full export of your data from the dashboard at any time, on every plan.

## Related

- [Do I need a cookie banner for analytics?](/gdpr-analytics-without-cookie-banner/)
- [Click tracking](/docs/click-tracking/)
- [Analiza vs Google Analytics](/compare/google-analytics/)
