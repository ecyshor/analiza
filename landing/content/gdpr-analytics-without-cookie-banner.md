---
title: "GDPR-compliant analytics without a cookie banner"
linkTitle: "Analytics without a cookie banner"
description: "Can you run website analytics in the EU without a cookie consent banner? When cookie-free analytics is exempt from consent, and how Analiza is designed for it."
date: 2026-11-17
lastmod: 2026-11-17
weight: 11
---

Yes, in most cases you can measure website traffic in the EU without a cookie banner. Cookie-free analytics such as Analiza can do this because it stores nothing on the visitor's device, collects no personal profiles and only produces aggregate statistics for your own site. Consent banners exist mainly because of cookies and similar device storage, which tools like Google Analytics rely on.

*This page explains the general rules and is not legal advice. Check your specific situation with your own legal counsel or data protection officer.*

## Why do websites need cookie banners?

Two sets of rules apply:

- **The ePrivacy Directive (Article 5(3))** requires consent before storing information on, or reading information from, a visitor's device, unless it is strictly necessary for the service the visitor asked for. Analytics cookies are not considered strictly necessary, so they need consent. This is where cookie banners come from.
- **The GDPR** governs any processing of personal data, such as IP addresses or identifiers. It needs a legal basis, which for analytics is often legitimate interest rather than consent, plus transparency in your privacy policy.

Most analytics tools set cookies and build user-level profiles. They need consent under ePrivacy, so they need a banner.

## How does cookie-free analytics avoid the banner?

Analiza does not set cookies, does not use localStorage or any other browser storage, and does not fingerprint the browser. Unique visitors are counted on the server with a hash that rotates every month and never leaves the server. The tracker stores and reads nothing on the device, so the cookie-consent requirement for analytics cookies does not apply. Several regulators also explicitly exempt privacy-friendly audience measurement from consent. The French CNIL, for example, does so when the statistics are anonymous, limited to the site's own audience measurement and not combined with other data.

The European Data Protection Board's Guidelines 2/2023 interpret Article 5(3) broadly, and national regulators do not all apply it the same way. Collecting as little as possible, as Analiza does, is the most robust position.

## What still applies under GDPR?

Even without a banner, you should:

- mention in your privacy policy that you use Analiza for aggregate audience statistics, hosted in the EU
- name the legal basis you rely on (typically legitimate interest)
- keep the data limited to your own site's statistics

Analiza is built to keep this simple: all data is stored and processed in the EU (Germany), raw IP addresses are never stored, and you can export all of your data at any time. See [exactly what data is collected](/docs/what-data-is-collected/).

## Do I still need a banner for other things on my site?

Possibly. Advertising pixels, embedded videos, chat widgets or social media embeds may set their own cookies and need consent. Analiza does not remove that requirement for other services; it only means analytics is not the reason you need a banner.

## Related

- [What data does Analiza collect?](/docs/what-data-is-collected/)
- [Analiza vs Google Analytics 4](/compare/google-analytics/)
- [Install Analiza](/docs/install/)
