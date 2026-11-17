---
title: "How to install Analiza"
linkTitle: "Install guide"
description: "Add Analiza to any website with one script tag: step-by-step for HTML, WordPress, Shopify, Wix, Squarespace, Webflow, Ghost, Framer, Next.js and SPAs."
date: 2026-11-17
lastmod: 2026-11-17
weight: 1
---

To install Analiza, add your site in the [Analiza app](https://app.analiza.dev) to get its site id, then paste one script tag into the `<head>` of every page. There is no plugin, no build step and no cookie banner to configure.

```html
<script defer src="https://cdn.analiza.dev/analiza.js" tenant="YOUR-SITE-ID"></script>
```

## What is the site id (`tenant`)?

The `tenant` attribute is the id of your site in Analiza, a 36-character UUID such as `123e4567-e89b-12d3-a456-426614174000`. You get it when you add your domain in the [app](https://app.analiza.dev). If the attribute is missing or not a valid UUID, the tracker disables itself and logs a note to the browser console.

Events are only accepted from the domain you registered for that site id, so copying your snippet onto another website does not pollute your stats.

## Plain HTML

Paste the snippet inside `<head>` on every page, or in the shared header template if your site generator has one (Hugo, Jekyll, Eleventy, Astro and so on).

## WordPress

Use a plugin that adds code to the site header (for example WPCode or any "insert headers and footers" plugin) and paste the snippet into the header section. Editing your theme's `header.php` also works, but a theme update can overwrite it.

## Shopify

In the Shopify admin, open **Online Store → Themes**, choose **Edit code** on your current theme, open `layout/theme.liquid` and paste the snippet just before `</head>`. Save.

## Wix

Open **Settings → Custom Code** (under Advanced), click **Add Custom Code**, paste the snippet, choose **All pages** and place it in **Head**. Wix only runs custom code on sites with a connected domain.

## Squarespace

Open **Code Injection** (in **Settings → Advanced**, or **Website → Pages → Custom code** in newer dashboards) and paste the snippet into the **Header** field. Code injection is only available on some Squarespace plans.

## Webflow

Open **Site settings → Custom code**, paste the snippet into **Head code**, save and publish the site. Webflow requires a paid site plan for custom code.

## Ghost

In Ghost Admin, open **Settings → Code injection** and paste the snippet into **Site header**. Save.

## Framer

Open **Site Settings → General → Custom Code**, paste the snippet into the **End of `<head>` tag** field and publish.

## Next.js

With the App Router, add the script to the `<head>` of your root layout. The spread syntax keeps TypeScript happy with the non-standard `tenant` attribute:

```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script defer src="https://cdn.analiza.dev/analiza.js" {...{ tenant: "YOUR-SITE-ID" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

With the Pages Router, put the same `<script>` inside `<Head>` in `pages/_document.tsx`.

## React, Vue, Svelte and other single-page apps

Add the snippet to the `<head>` of your `index.html`. Client-side navigations made with `history.pushState` and the back/forward buttons (`popstate`) are tracked as page views automatically, so routers such as React Router, Vue Router and the Next.js router need no extra code.

## How do I check it works?

Open your site, then open the browser developer tools on the **Network** tab: each page view sends a small `POST` request to `https://api.analiza.dev/eye`. Your visit then shows up in the dashboard at [app.analiza.dev](https://app.analiza.dev). If nothing is sent, check the console for the "tenant not set" message.

## What next?

- [Track clicks, downloads and goals](/docs/click-tracking/)
- [See exactly what data is collected](/docs/what-data-is-collected/)
- [Self-host Analiza](/docs/self-hosting/) and point the tracker at your own server
