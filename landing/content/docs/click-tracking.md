---
title: "Click, download and goal tracking"
linkTitle: "Click tracking"
description: "Analiza tracks outbound links and file downloads automatically. Add data-analiza-click to any element to count a named goal, or set it to off to opt out."
date: 2026-11-17
lastmod: 2026-11-17
weight: 3
---

Analiza records clicks on outbound links and file downloads automatically, with no configuration. To count a named goal, such as a sign-up button, add `data-analiza-click="goal-name"` to the element. To exclude part of a page, add `data-analiza-click="off"`.

## What is tracked automatically?

| Click on | What is recorded |
| --- | --- |
| A link to another website | The target as `https://host/path`. The query string and `#hash` are never sent. |
| A link to a file download on any host (`.pdf`, `.zip`, `.csv`, `.docx`, `.xlsx`, `.mp4`, `.dmg`, `.exe` and similar) | The file URL as `https://host/path`, without query or hash. |
| A `mailto:` or `tel:` link | Only the scheme (`mailto:` or `tel:`), never the address or number. |
| A link to another page of your own site | Nothing, unless the link has a `data-analiza-click` name. |

Left clicks and middle clicks (open in new tab) are counted. Right clicks are not.

## How do I track a named goal?

Add a `data-analiza-click` attribute with a name to any element: a link, a button, or a container. A click anywhere inside it is recorded under that name.

```html
<a href="/signup" data-analiza-click="signup-hero">Start for free</a>

<button data-analiza-click="newsletter-subscribe">Subscribe</button>
```

Use short, stable names such as `pricing-standard` or `contact-form`; they appear as-is in your dashboard.

## How do I stop clicks from being tracked?

Add `data-analiza-click="off"` to an element. No click inside that element is recorded, including outbound links and downloads.

```html
<div data-analiza-click="off">
  <a href="https://partner.example.com/private">Not tracked</a>
</div>
```

## Are links with tokens or secrets recorded?

No. If a link looks like it carries a credential (a username or password in the URL, a parameter named like `token`, `key`, `session`, `code` or `signature`, or a long token-like value or path segment), its target is not sent at all. The same check runs again on the server.

## Related

- [Install guide](/docs/install/)
- [What data does Analiza collect?](/docs/what-data-is-collected/)
