# landing (Hugo Static Site)

## Purpose
Marketing site for analiza.dev.

## Workflow
- Built with Hugo (`hugo.yaml`), no theme or Hugo modules
- `make start` runs the dev server, `make build` builds into `public/`
- Deploy via Netlify (`netlify.toml`)

## Customization
- Page copy, features, pricing and FAQ live under `params` in `hugo.yaml`
- Templates in `layouts/` (`_default/baseof.html`, `index.html`, `404.html`, `index.llms.txt`, `index.llmsfull.txt`)
- Styles in `static/css/style.css`, images in `static/images/`

## SEO / LLM discoverability
- `llms.txt` and `llms-full.txt` are generated from `hugo.yaml` via custom output
  formats (see `outputs`/`outputFormats` in `hugo.yaml` and `layouts/index.llms*.txt`),
  so they always match the site copy
- JSON-LD `@graph` (Organization, WebSite, SoftwareApplication, FAQPage) is built in
  `layouts/_default/baseof.html` from the same params
- `static/robots.txt` explicitly allows AI/search crawlers; `enableRobotsTXT` is false
  so Hugo doesn't generate a duplicate
- Social preview image: `static/images/og-image.png` (1200x630) is rendered from
  `scripts/og-image.svg`:
  `nix shell nixpkgs#librsvg -c rsvg-convert -w 1200 -h 630 -o static/images/og-image.png scripts/og-image.svg`
- `static/_redirects` redirects `www` to the apex domain; unknown URLs get the real
  `404.html` (noindex) instead of a soft 404
