# Deploy

Production: Cloudflare Pages project `fd-portfolio` (`fd-portfolio.pages.dev`), custom domain **https://thonyfd.com**.
Secondary: Firebase Hosting `thony-test.web.app` (GitHub Actions in `.github/workflows`), served with `X-Robots-Tag: noindex`.

## How the site is built

1. `npm run content:fetch` reads Firestore (`thony-test`, collection `portfolio`) into `src/content/snapshot.json`.
   The build fails if Firestore cannot be read or a locale has no intro or experience.
2. `ng build` prerenders `/`, `/es` and `/fd-systems` to static HTML (`outputMode: "static"`).
3. `scripts/seo/write-discovery.mjs` flattens `es/index.html` to `es.html` (and `fd-systems`), and writes
   `robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt`, `resume.md`, `resume.es.md`, `_redirects`, `_headers`.
4. `scripts/verify-build.mjs` fails the build if the HTML is not crawlable without JavaScript.

`npm run build` uses live Firestore content. `npm run build:preview` overlays `content/staged-docs` and
`content/cutover-patch.json` (for PR previews before the content cutover).

## Cloudflare Pages settings

| Setting | Value |
| --- | --- |
| Build command | `npm ci && npm run build` |
| Build output directory | `dist/portfolio/browser` |
| Environment variables (production) | `NODE_VERSION=24` |
| Environment variables (preview) | `NODE_VERSION=24`, `CONTENT_PREVIEW=1` (builds with staged content) |

Before 2026-11-03 the project used `npm run build` with output `www` (the Ionic build) and no Node version.

## Content changes

Edit Firestore, then rebuild: Actions > "Rebuild site from Firestore content" > Run workflow (also runs daily at
10:00 UTC). It POSTs the Pages deploy hook stored in the repo secret `CF_PAGES_DEPLOY_HOOK`
(Pages > Settings > Builds > Deploy hooks).

## Content cutover (one time)

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json   # never commit it
npm run content:stage -- --dry-run && npm run content:stage
npm run content:cutover -- --dry-run && npm run content:cutover
```

Each run backs up the whole collection to `content/backups/` (gitignored) before writing. Re-runs are no-ops.
Production builds fail until the cutover has run (the AI section must exist), so run it right before the deploy.
