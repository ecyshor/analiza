# landing (Hugo Static Site)

## Purpose
Marketing site for analiza.dev.

## Workflow
- Built with Hugo (`hugo.yaml`), no theme or Hugo modules
- `make start` runs the dev server, `make build` builds into `public/`
- Deploy via Netlify (`netlify.toml`)

## Customization
- Page copy, features and pricing live under `params` in `hugo.yaml`
- Templates in `layouts/` (`_default/baseof.html`, `index.html`)
- Styles in `static/css/style.css`, images in `static/images/`
