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

The user's gcloud credentials also work: `GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcloud/application_default_credentials.json`.

## Cutover log (2026-11-03)

- PR #12 merged to `master` (`ad45bd5`). The first production build failed as designed (`expected id="ai-experience"`), the old site stayed live.
- `npm run content:cutover` changed 8 docs; backup `content/backups/portfolio-2026-11-03T23-57-29-177Z.json`.
- Production build retried and deployed. Live checks on https://thonyfd.com passed: `/`, `/es`, `/fd-systems` 200,
  `/en` 301 to `/`, discovery files with the right content types, canonical, JSON-LD, AI section, no `noindex`.
- `www.thonyfd.com` added as a Pages custom domain (was 522, now 200; canonical points to the apex).

Pending:

- 301 `www` to apex: Cloudflare dashboard > thonyfd.com > Rules > Redirect Rules > "Redirect from WWW to root".
- Firebase Hosting deploy fails: Service Usage API disabled in GCP project `thony-test`. Enable it and re-run the workflow.
- Create the Pages deploy hook and store it as `CF_PAGES_DEPLOY_HOOK`.
- Submit `https://thonyfd.com/sitemap.xml` to Google Search Console and Bing Webmaster Tools; check Rich Results Test
  and LinkedIn Post Inspector.
