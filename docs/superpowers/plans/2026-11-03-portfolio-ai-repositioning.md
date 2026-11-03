# Portfolio AI Repositioning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild thonyfd.com as a prerendered, AI-first portfolio (EN `/`, ES `/es`, `/fd-systems`) that humans, search engines, AI answer engines and ATS tools can read without JavaScript.

**Architecture:** A Node script reads Firestore (`thony-test`, collection `portfolio`) at build time into `src/content/snapshot.json`. Angular (latest stable, no Ionic) renders every route from that snapshot and the Angular SSR builder prerenders them to static HTML (`outputMode: "static"`). A post-build script writes `robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt`, `resume.md`, `_redirects` and `_headers`; Cloudflare Pages serves the output.

**Tech Stack:** Angular 22 (or the latest stable at execution time) + `@angular/ssr` static prerender, standalone components, signals, plain SCSS with CSS custom properties, Vitest (Angular default runner) for app tests, `node --test` for scripts, `firebase-admin` for Firestore writes, Cloudflare Pages.

**Spec:** `docs/superpowers/specs/2026-11-03-portfolio-ai-repositioning-design.md`

## Global Constraints

- Canonical origin: `https://thonyfd.com` (no trailing-path variants; `/` is EN, `/es` is ES, `/en` 301 to `/`).
- Contact email: `fdsystems.fd@gmail.com`. LinkedIn `https://www.linkedin.com/in/thonyfd/`, GitHub `https://github.com/ThonyFD`.
- Person facts: name `Anthony Mosquera`, alternateName `ThonyFD`, jobTitle `Solutions Architect`, worksFor `ASSA`, based in Panama, timezone `America/Panama` (GMT-5), languages English and Spanish, open to remote.
- Headline EN `Solutions Architect · AI Systems Engineer`; ES `Arquitecto de Soluciones · Ingeniero de Sistemas con IA`.
- No `@ionic/*`, `@capacitor/*`, `ionicons` in `package.json` at the end; no `<ion-` in any built HTML.
- Viewport meta is `width=device-width, initial-scale=1` (no `user-scalable=no`, no `maximum-scale`).
- Never use the em dash character in copy, comments, commits or docs.
- Never invent experience: AI project copy only states what the spec's "Decisiones tomadas por el usuario" section lists. Cloud Runner 2049 always credits aaronthewarrior.
- Only `https://github.com/ThonyFD/personal-dashboard` gets a code link.
- Hosts `fd-portfolio.pages.dev` and `thony-test.web.app` send `X-Robots-Tag: noindex`.
- No CV PDF; text CV lives at `/resume.md`.
- Use Context7 for Angular, `@angular/ssr`, Cloudflare Pages and firebase-admin docs before writing config.
- Writes to production Firestore and production deploys happen only in Task 12, after the user confirms.

## Review Focus

1. A Firestore read failure or an empty collection at build time must fail the build (non-zero exit), never ship an empty page.
2. Slots with missing fields (no `description`, no `logo`, no `tags`, no `start`/`end`) render cleanly: no `undefined`, `null` or empty chips in HTML.
3. Date strings arrive in mixed formats (`08/2009`, `2018-08`, `2012`, `2023-12-18`, `Now`, `Freelance`): show them as written; emit `<time datetime>` only when parseable; `Now` renders as "Present" / "Actualidad".
4. A section present in EN but missing in ES (or the reverse) is omitted for that locale without breaking the build.
5. Firestore `description` HTML must never inject scripts: Angular sanitizes `innerHTML`; text outputs (`llms*.txt`, `resume.md`, JSON-LD) are tag-stripped and entity-decoded.

---

## File Structure

```
scripts/
  content/firestore.mjs          Firestore REST value codec + collection fetch
  content/snapshot.mjs           pure: docs -> Snapshot (filter, sort, kind, preview overlay)
  content/fetch-snapshot.mjs     CLI: fetch + build + write src/content/snapshot.json
  content/apply.mjs              CLI: backup + stage/cutover writes via firebase-admin
  content/*.test.mjs
  seo/discovery.mjs              pure: robots, sitemap, llms, resume, _redirects, _headers
  seo/write-discovery.mjs        CLI: writes discovery files into build output
  seo/discovery.test.mjs
  verify-build.mjs               CLI: asserts built HTML is crawlable
content/
  staged-docs/ai-experience-en.json, ai-experience-es.json, tech-ai-en.json, tech-ai-es.json
  cutover-patch.json             edits to existing docs applied at cutover
  backups/                       gitignored
src/content/snapshot.json        generated, gitignored
src/app/
  content/content.types.ts       Section, SectionKind, Snapshot, LocaleContent, Locale
  content/content.service.ts     reads snapshot
  content/format.ts              date + text helpers
  seo/site.ts                    constants from Global Constraints
  seo/json-ld.ts                 pure JSON-LD builder
  seo/seo.service.ts             title/meta/canonical/hreflang/OG/JSON-LD into <head>
  pages/home/                    home.page.* (locale from route data)
  pages/home/sections/           hero, ai-experience, experience, projects, skills, education, contact components
  pages/fd-systems/              ported page, no Ionic
  app.routes.ts, app.routes.server.ts, app.config.ts, app.config.server.ts
```

Shared types (Task 1 defines them in `scripts/content/snapshot.mjs` as JSDoc and Task 3 mirrors them in `content.types.ts`):

```ts
type Locale = 'en' | 'es';
type SectionKind = 'introduction' | 'ai-experience' | 'experience' | 'projects'
  | 'tech' | 'courses' | 'schooling';
interface Link { label: string; url: string }
interface Section {            // existing model + optional additions
  id: string;                  // Firestore doc id (added by snapshot)
  kind: SectionKind;           // derived from id (added by snapshot)
  color?: string; description?: string; end?: string; fit?: string;
  hasHeading?: boolean; icon?: string; isHead?: boolean; label?: string;
  locale?: string; logo?: string; order: number; orientation?: string;
  sizeLg?: number; start?: string; slots: Section[]; subTitle?: string;
  tags?: string[]; title?: string; visible?: boolean;
  links?: Link[]; highlights?: string[]; compact?: boolean; hidden?: boolean;
  summary?: string; staged?: boolean;
}
interface LocaleContent { intro: Section | null; sections: Section[] }
interface Snapshot { generatedAt: string; preview: boolean;
  locales: Record<Locale, LocaleContent> }
```

---

### Task 1: Content snapshot pipeline

**Files:**
- Create: `scripts/content/firestore.mjs`, `scripts/content/snapshot.mjs`, `scripts/content/fetch-snapshot.mjs`
- Test: `scripts/content/firestore.test.mjs`, `scripts/content/snapshot.test.mjs`
- Modify: `.gitignore` (add `/src/content/snapshot.json`, `/content/backups`), `package.json` scripts

**Interfaces:**
- Produces: `fromFirestoreValue(v: object): unknown`, `toFirestoreValue(x: unknown): object`, `fetchCollection({projectId, collection, apiKey}): Promise<{id: string, data: object}[]>` (follows `nextPageToken`; throws on non-200).
- Produces: `sectionKind(id: string): SectionKind | null` (strip `-en`/`-es` suffix; `tech-*` -> `tech`; `config` -> null), `applyPatch(docs, patch): docs`, `buildSnapshot(docs, {preview: boolean, stagedDocs: object[], patch: object}): Snapshot`.
- Produces: npm script `content:fetch` = `node scripts/content/fetch-snapshot.mjs --out src/content/snapshot.json`; flag `--preview` overlays `content/staged-docs/*.json` (as visible) and `content/cutover-patch.json`.
- Produces: npm script `test:scripts` = `node --test scripts`.

- [ ] **Step 1: Write failing tests** in `firestore.test.mjs`: `fromFirestoreValue` maps `stringValue`, `integerValue` ("2" -> 2), `doubleValue`, `booleanValue`, `nullValue`, nested `mapValue`/`arrayValue` (including `arrayValue: {}` -> `[]`); `toFirestoreValue(fromFirestoreValue(x))` round-trips. In `snapshot.test.mjs`:
  - `sectionKind('tech-backend-es') === 'tech'`, `sectionKind('projects-en') === 'projects'`, `sectionKind('tech-ci-cd') === 'tech'`, `sectionKind('config') === null`.
  - `buildSnapshot` puts only `visible: true` docs into `locales[doc.locale]`, sets `intro` from kind `introduction`, sorts sections by `order` asc and slots by `order` asc (ties keep source order), drops slots with `hidden: true`.
  - EN has `courses-en` and ES has no courses doc: ES content has no `courses` section, no throw.
  - `preview: true` with a staged doc `{id:'ai-experience-en', visible:false, staged:true}` includes it; `preview: false` excludes it.
  - `applyPatch` with `{docs:[{doc:'introduction-en', set:{subTitle:'X'}}, {doc:'courses-en', slots:[{match:{title:'C++'}, set:{hidden:true}}]}]}` changes only those fields.
  - `buildSnapshot` throws `Error('empty content')` when either locale has no `intro` or no `experience` section.
- [ ] **Step 2: Run** `node --test scripts/content` and confirm the tests fail because the modules don't exist yet.
- [ ] **Step 3: Implement** the three modules. The CLI reads `apiKey` and `projectId` from `src/environments/environment.prod.ts` via regex, or from the env vars `FIREBASE_API_KEY`/`FIREBASE_PROJECT_ID` when set, and exits 1 with a clear message on any error.
- [ ] **Step 4: Run** `node --test scripts/content` and confirm PASS. Then run `npm run content:fetch` and confirm the snapshot is written and has both locales and 10+ sections for EN.
- [ ] **Step 5: Commit** `feat(content): build-time Firestore snapshot pipeline`.

### Task 2: Visual direction and mockup (approval gate)

**Files:**
- Create: `docs/design/mockup/index.html` (self-contained, real copy from the snapshot), screenshots `docs/design/mockup/*.png`

**Interfaces:**
- Consumes: `src/content/snapshot.json` (Task 1, `--preview`) for real copy.
- Produces: an approved direction recorded in `docs/design/DIRECTION.md` (palette tokens, type pair, spacing scale, motion rules) that Task 9 implements.

- [ ] **Step 1:** Invoke the `design-taste-frontend` skill for a senior "solutions architect / AI systems" portfolio. Constraints come from the spec's anti-goals: no purple gradients, no glassmorphism, no emoji bullets, light and dark modes, works at 360px width.
- [ ] **Step 2:** Build the comp for the hero plus the AI Experience section (desktop 1440 and mobile 390) with real EN copy: headline, one-sentence summary, remote/GMT-5/EN+ES signals, CTAs (email, LinkedIn, GitHub, Resume) and the 5 AI projects in the spec's order.
- [ ] **Step 3:** Capture screenshots of both widths in both themes.
- [ ] **Step 4: Stop and present the comp to the user.** Iterate until they approve. Write `docs/design/DIRECTION.md` from the approved comp.
- [ ] **Step 5: Commit** `docs(design): approved portfolio direction and mockup`.

### Task 3: Upgrade Angular, remove Ionic, standalone bootstrap

**Files:**
- Modify: `package.json`, `angular.json`, `tsconfig*.json`, `src/main.ts`, `src/index.html`, `src/global.scss`
- Delete: `src/app/app.module.ts`, `src/app/app-routing.module.ts`, `src/app/explore-container/**`, `src/theme/variables.scss`, `capacitor.config.json`, `ionic.config.json`, `src/zone-flags.ts`, `src/polyfills.ts`, `src/test.ts`, `karma.conf.js`, `src/app/services/firebase.service.ts`, `src/app/services/global.service.ts`, `src/app/services/message.service.ts`, `src/app/components/**`, `src/app/pipes/**`
- Create: `src/app/app.config.ts`, `src/app/app.routes.ts`, `src/app/content/content.types.ts`, `src/app/content/content.service.ts`, `src/app/content/content.service.spec.ts`

**Interfaces:**
- Produces: routes `''` -> HomePage `{data: {locale: 'en'}}`, `'es'` -> HomePage `{data: {locale: 'es'}}`, `'fd-systems'` -> FdSystemsPage, `'**'` -> redirect `''`.
- Produces: `ContentService.get(locale: Locale): LocaleContent` and `ContentService.byKind(locale, kind: SectionKind): Section[]`, reading `src/content/snapshot.json` via a JSON import (`resolveJsonModule`).
- Produces: a temporary HomePage that renders `<h1>{{intro.title}}</h1>` (replaced in Task 5) and a temporary FdSystemsPage stub (replaced in Task 4).

- [ ] **Step 1:** Remove Ionic and Capacitor packages and every Ionic import; replace `app.module` with `bootstrapApplication(AppComponent, appConfig)` and `provideRouter(routes)`; app component template is `<router-outlet />`.
- [ ] **Step 2:** Run `ng update` one major at a time (16 -> 17 -> ... -> latest), migrating to the `application` builder. Set `outputPath` to `{"base": "dist/portfolio"}`. Switch tests to the Angular Vitest runner and remove Karma/Jasmine.
- [ ] **Step 3: Write failing test** `content.service.spec.ts`: with a fixture snapshot, `get('en').intro.title` equals the fixture title, and `byKind('es','courses')` returns `[]` when ES has no courses.
- [ ] **Step 4:** Implement `content.types.ts` (the shared types above) and `ContentService`.
- [ ] **Step 5: Run** `ng test` (PASS) and `npm run content:fetch && ng build` (no errors). Run `grep -r "ionic\|capacitor" package.json src` and expect no matches.
- [ ] **Step 6: Commit** `chore: upgrade Angular to latest and remove Ionic/Capacitor`.

### Task 4: Port `/fd-systems` without Ionic

**Files:**
- Modify: `src/app/pages/fd-systems/fd-systems.page.{html,scss,ts}`

**Interfaces:**
- Produces: `FdSystemsPage` with the same sections, copy, links and look as today; `scrollTo(id: string): void` uses `document.getElementById(id)?.scrollIntoView({behavior: 'smooth'})`.

- [ ] **Step 1:** Before changing anything, take screenshots of the current `https://thonyfd.com/fd-systems` at 1440 and 390 as the reference.
- [ ] **Step 2:** Replace `ion-content` with `<main>`, `ion-button` with `<a>`/`<button>` styled to match, and `ion-icon` with inline SVG (export from `ionicons` once, then drop the package). Move any `--ion-*` variables into local tokens.
- [ ] **Step 3: Write test** `fd-systems.page.spec.ts`: the rendered HTML contains `contact@fdsystems.dev` and the `Hablemos` CTA, and has no `ion-` tags.
- [ ] **Step 4:** Run `ng test`, then build and serve. Compare against the reference screenshots and fix visible differences.
- [ ] **Step 5: Commit** `refactor(fd-systems): port page to plain Angular without Ionic`.

### Task 5: Home page structure (semantic, unstyled)

**Files:**
- Create: `src/app/pages/home/home.page.{ts,html}`, `src/app/pages/home/sections/{hero,ai-experience,experience,projects,skills,education,contact}.component.ts`, `src/app/content/format.ts`, specs alongside
- Create: `src/app/i18n/strings.ts` (UI labels EN/ES: section headings, "Present"/"Actualidad", "Earlier work"/"Trabajo anterior", "View code"/"Ver código", CTA labels)

**Interfaces:**
- Consumes: `ContentService` (Task 3).
- Produces: `formatPeriod(start?: string, end?: string, locale: Locale): {text: string, startIso?: string, endIso?: string}`; `stripHtml(html: string): string` (removes tags, decodes entities, collapses whitespace).
- Produces: section order per the spec: hero, AI Experience, Experience (most recent first), Selected projects + Earlier work (`compact: true` slots as a one-line list), Skills (kind `tech`, the `tech-ai` doc first), Education, Contact.
- Produces DOM contract for later tasks: `<main>`, one `<h1>` (name), `<section id="ai-experience">`, `<section id="experience">`, `<section id="projects">`, `<section id="skills">`, `<section id="education">`, `<section id="contact">`; each slot is an `<article>` with an `<h3>`.

- [ ] **Step 1: Write failing tests** `format.spec.ts`:
  - `formatPeriod('08/2009','05/2014','en')` -> text `08/2009 – 05/2014`, startIso `2009-08`, endIso `2014-05`.
  - `formatPeriod('2018-08', undefined, 'en')` -> text `2018-08`.
  - `formatPeriod('06/2026','Now','es')` -> text contains `Actualidad`, with no endIso.
  - `formatPeriod('01/2020','Freelance','en')` -> text `01/2020 – Freelance`, with no endIso.
  - `formatPeriod(undefined, undefined, 'en')` -> text `''`.
  - `stripHtml('<b>A</b>&amp; <script>x</script>B')` -> `A& B`.
- [ ] **Step 2: Write failing test** `home.page.spec.ts`: with a fixture snapshot, EN render has exactly one `h1`, the sections appear in the order above, a slot with no `description`/`tags`/`logo` renders with no `undefined`/`null` text and no empty chip list, and `compact` slots render inside the Earlier work list and not as articles.
- [ ] **Step 3:** Implement the components. Descriptions are bound with `[innerHTML]` (Angular sanitizer). Periods use `<time [attr.datetime]>` only when an ISO value exists. Logos use `NgOptimizedImage` with explicit width and height, `alt` set to the slot title, and `loading="lazy"` except in the hero.
- [ ] **Step 4: Run** `ng test` and confirm PASS.
- [ ] **Step 5: Commit** `feat(home): semantic AI-first page structure from snapshot`.

### Task 6: Static prerender

**Files:**
- Create: `src/app/app.config.server.ts`, `src/app/app.routes.server.ts`, `src/main.server.ts` (via `ng add @angular/ssr`), `scripts/verify-build.mjs`
- Modify: `angular.json` (`outputMode: "static"`), `package.json`

**Interfaces:**
- Produces: `serverRoutes = [{path: '**', renderMode: RenderMode.Prerender}]`; build output `dist/portfolio/browser/{index.html, es/index.html, fd-systems/index.html}`.
- Produces: npm `build` = `npm run content:fetch && ng build && node scripts/seo/write-discovery.mjs dist/portfolio/browser && node scripts/verify-build.mjs dist/portfolio/browser`.
- Produces: `verify-build.mjs <dir>` that exits 1 with a list of failures.

- [ ] **Step 1: Write** `verify-build.mjs` checks:
  - `index.html` contains `Anthony Mosquera`, `id="ai-experience"`, `Datacentria`, `<html lang="en"`, `rel="canonical" href="https://thonyfd.com/"`, and `application/ld+json`.
  - `es/index.html` contains `<html lang="es"` and the canonical `https://thonyfd.com/es`.
  - `fd-systems/index.html` exists.
  - No HTML file contains `<ion-` or `user-scalable`.
  - `robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt`, `resume.md`, `_redirects` and `_headers` exist.

  Before Tasks 7 and 8 land, the canonical, JSON-LD and discovery-file checks are expected to fail.
- [ ] **Step 2:** Run `ng add @angular/ssr` (check Context7 for the current flags), set static output and the prerender route, and make `<html lang>` follow route data through `DOCUMENT`.
- [ ] **Step 3:** Run `ng build && node scripts/verify-build.mjs dist/portfolio/browser`. The content and lang checks must pass. Also run `curl`-free proof: `grep -c "<article" dist/portfolio/browser/index.html` must be greater than 10.
- [ ] **Step 4: Commit** `feat(build): static prerender for all routes`.

### Task 7: Head metadata and JSON-LD

**Files:**
- Create: `src/app/seo/site.ts`, `src/app/seo/json-ld.ts`, `src/app/seo/json-ld.spec.ts`, `src/app/seo/seo.service.ts`, `src/app/seo/seo.service.spec.ts`, `public/og/og-en.png`, `public/og/og-es.png` (1200x630, made from the approved comp)
- Modify: `src/index.html` (viewport, base head), `home.page.ts`, `fd-systems.page.ts`

**Interfaces:**
- Produces: `SITE_URL`, `CONTACT_EMAIL`, `SOCIAL = {linkedin, github}`, `PERSON` constants (values from Global Constraints).
- Produces: `buildProfileJsonLd(content: LocaleContent, locale: Locale): object` returning `{"@context":"https://schema.org","@type":"ProfilePage", url, inLanguage, mainEntity: Person}`. Person has `name`, `alternateName`, `jobTitle`, `worksFor {Organization ASSA}`, `email: "mailto:fdsystems.fd@gmail.com"`, `url`, `image`, `sameAs [linkedin, github]`, `address {addressCountry:"PA"}`, `knowsLanguage ["en","es"]`, `knowsAbout` (the AI and cloud topics from `tech-ai` and `tech-*` titles), `alumniOf` (from schooling slots' `subTitle`), and `hasPart`: one `CreativeWork` per AI Experience slot (name, description via `stripHtml`, `keywords` from tags); the personal-dashboard item becomes `SoftwareSourceCode` with `codeRepository`.
- Produces: `SeoService.apply({title, description, path, locale, ogImage, jsonLd?}): void` that sets `<title>`, `meta description`, `link rel=canonical` (`SITE_URL + path`), `link rel=alternate hreflang` for `en` (`/`), `es` (`/es`) and `x-default` (`/`), OG/Twitter tags with absolute URLs, and one `<script type="application/ld+json" id="ld-profile">` (replaced, not duplicated, when re-applied).

- [ ] **Step 1: Write failing tests**:
  - `json-ld.spec.ts`: `email` is `mailto:fdsystems.fd@gmail.com`, `sameAs` has both URLs, `hasPart.length` equals the number of AI Experience slots, the Cloud Runner item's description contains `aaronthewarrior`, and no string value contains `<`.
  - `seo.service.spec.ts`: calling `apply` twice leaves exactly one canonical, one `ld-profile` script and three hreflang links; the canonical for `path: '/es'` is `https://thonyfd.com/es`.
- [ ] **Step 2:** Implement. Titles: EN `Anthony Mosquera | Solutions Architect · AI Systems Engineer`; ES `Anthony Mosquera | Arquitecto de Soluciones · Ingeniero de Sistemas con IA`. Descriptions are under 160 characters, written from the intro summary.
- [ ] **Step 3: Run** `ng test`, then `npm run build`. The verify-build head checks now pass. Validate the JSON-LD from `dist/.../index.html` with `npx --yes structured-data-testing-tool` or by pasting it into the Schema.org validator (manual check, record the result).
- [ ] **Step 4: Commit** `feat(seo): head metadata, hreflang and ProfilePage JSON-LD`.

### Task 8: Discovery files (robots, sitemap, llms, resume, Pages config)

**Files:**
- Create: `scripts/seo/discovery.mjs`, `scripts/seo/write-discovery.mjs`, `scripts/seo/discovery.test.mjs`

**Interfaces:**
- Consumes: `src/content/snapshot.json`, `stripHtml` logic (re-implemented in `.mjs`; same contract as Task 5).
- Produces: `buildRobots(siteUrl): string`, `buildSitemap(siteUrl, entries: {path, lastmod, alternates?}[]): string`, `buildLlmsTxt(snapshot, siteUrl): string`, `buildResumeMarkdown(snapshot, locale): string`, `buildRedirects(): string`, `buildHeaders(): string`.

- [ ] **Step 1: Write failing tests** `discovery.test.mjs`:
  - robots has `User-agent: *` / `Allow: /`, explicit `Allow: /` blocks for `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `Claude-User`, `PerplexityBot`, `Google-Extended`, `Applebot-Extended` and `CCBot`, and `Sitemap: https://thonyfd.com/sitemap.xml`.
  - The sitemap is valid XML with `<loc>` entries for `https://thonyfd.com/`, `https://thonyfd.com/es` and `https://thonyfd.com/fd-systems`, plus `xhtml:link` alternates on the first two.
  - `llms.txt` starts with `# Anthony Mosquera`, then a `>` summary line, then sections `## AI Experience`, `## Experience`, `## Contact` and `## Links` (to `/resume.md` and `/llms-full.txt`), and contains no `<`.
  - `buildResumeMarkdown(snapshot,'en')` lists every experience slot as `### {title} · {subTitle}` with its period, every AI project with its tags, and the contact email.
  - `_redirects` contains `/en / 301` and `/en/* / 301`.
  - `_headers` contains `https://fd-portfolio.pages.dev/*` with `X-Robots-Tag: noindex`, `/*.txt` and `/resume.md` with `Content-Type: text/plain; charset=utf-8` (markdown as `text/markdown; charset=utf-8`), and long `Cache-Control` for hashed assets.
- [ ] **Step 2: Run** `node --test scripts/seo` and confirm FAIL.
- [ ] **Step 3: Implement.** `write-discovery.mjs <outDir>` writes all files. `llms-full.txt` is the EN resume plus the ES resume.
- [ ] **Step 4: Run** `node --test scripts`, then `npm run build`. The full verify-build must pass.
- [ ] **Step 5: Commit** `feat(seo): robots, sitemap, llms.txt, text resume and Pages config`.

### Task 9: Implement approved visual design

**Files:**
- Create: `src/styles/tokens.scss`, `src/styles/base.scss`; component styles in the sections
- Modify: `src/global.scss` (import tokens/base), section components

**Interfaces:**
- Consumes: `docs/design/DIRECTION.md` (Task 2) and the DOM contract (Task 5).

- [ ] **Step 1:** Implement tokens (color, type, space, radius, motion) for light and dark (`prefers-color-scheme`), following the approved direction exactly.
- [ ] **Step 2:** Style each section to the comp; sections not in the comp (Experience, Projects, Skills, Education, Contact) extend its system. Respect `prefers-reduced-motion`.
- [ ] **Step 3:** Accessibility pass: AA contrast in both themes, visible `:focus-visible`, a skip link to `<main>`, every interactive element reachable by keyboard.
- [ ] **Step 4:** Serve the prerendered build. Screenshot 1440/390 in both themes, compare with the comp, and fix differences. Run Lighthouse (or the `web-perf` skill) on `/` and `/es`: SEO, Accessibility and Best Practices must each be 95 or higher, with no horizontal scroll at 360px.
- [ ] **Step 5:** Run the `design-taste-frontend` look-and-fix review loop against the comp and apply the material fixes.
- [ ] **Step 6: Commit** `feat(home): apply approved visual design`.

### Task 10: Content edits (staged docs, cutover patch, apply script)

**Files:**
- Create: `content/staged-docs/ai-experience-en.json`, `content/staged-docs/ai-experience-es.json`, `content/staged-docs/tech-ai-en.json`, `content/staged-docs/tech-ai-es.json`, `content/cutover-patch.json`, `scripts/content/apply.mjs`, `scripts/content/apply.test.mjs`
- Modify: `package.json` (add `firebase-admin` devDependency, scripts `content:stage`, `content:cutover`)

**Interfaces:**
- Consumes: `applyPatch`, `toFirestoreValue` (Task 1).
- Produces: `apply.mjs --phase stage|cutover [--dry-run]`. Every run first writes a full collection backup to `content/backups/portfolio-<ISO>.json`. `stage` creates the staged docs with `visible:false, staged:true` and skips docs that already exist. `cutover` sets `visible:true` and removes `staged` on staged docs, then applies `cutover-patch.json`. `--dry-run` prints a per-doc diff and writes nothing. Re-running either phase is a no-op.

- [ ] **Step 1:** Write the staged docs using the existing `Section` shape (`hasHeading:true`, `label` "AI Experience" / "Experiencia con IA", `icon`, `order: 0.25`, `locale`, `slots`). One slot per AI project in the spec, in the spec's order, with `title`, `subTitle` (role · org), `start`, `summary` (one sentence), `description` (HTML, facts only from the spec), `tags` and `links` (only personal-dashboard gets a GitHub link; Cloud Runner gets a credit line). `tech-ai-*` lists: Claude, Gemini, OpenAI, Claude Code, Codex CLI, OpenCode, MCP, Google ADK, A2A, Prompt engineering, Spec-driven development with agents.
- [ ] **Step 2:** Write `cutover-patch.json`:
  - `introduction-en`/`-es`: `subTitle` is the headline, `summary` is one or two sentences, and `tags` become `["AI Agents","LLM Integration","MCP","Serverless","Solutions Architecture","AWS","GCP","Azure"]`.
  - `projects-*`: `compact:true` on the 2012-2020 freelance slots (Generali App, LPF Fantasy, MINSA Inspector, TVN Alertas App, Dektro SAAS, Rentabilidad Sucursales, Canon Web, Bladex SysApp), and `hidden:true` on the Datacentria slot (it now lives in AI Experience).
  - `courses-*`: `hidden:true` on WordPress Plugins Course, Unique Interface Design Course and C++.
  - Match ES slots by their ES titles as found in the snapshot.
- [ ] **Step 3: Write failing test** `apply.test.mjs` with an in-memory fake Firestore: `stage` twice creates each doc once; `cutover` twice yields identical state; `--dry-run` leaves the fake untouched; a backup is written before any write; a patch entry whose `match.title` finds no slot fails with an error naming it.
- [ ] **Step 4:** Implement `apply.mjs`. It uses `firebase-admin` with `GOOGLE_APPLICATION_CREDENTIALS` (ask the user for the service account path at run time; never commit it).
- [ ] **Step 5: Run** `node --test scripts`, then `npm run content:fetch -- --preview && ng build`, and check locally that the new copy renders in EN and ES.
- [ ] **Step 6: Commit** `feat(content): AI experience docs, cutover patch and safe apply script`.

### Task 11: Deployment pipeline

**Files:**
- Modify: `.github/workflows/firebase-hosting-merge.yml`, `.github/workflows/firebase-hosting-pull-request.yml`, `firebase.json`
- Create: `.github/workflows/rebuild-content.yml`, `docs/deploy.md`

**Interfaces:**
- Consumes: npm `build` (Task 6), output `dist/portfolio/browser`.

- [ ] **Step 1:** Find out how Cloudflare Pages builds `fd-portfolio`, using `npx wrangler pages project list` and the dashboard settings (ask the user if access is missing): Git integration or direct upload, current build command, output dir, Node version. Record the findings in `docs/deploy.md`.
- [ ] **Step 2:** Set the Pages build command to `npm ci && npm run build`, the output dir to `dist/portfolio/browser` and `NODE_VERSION` to 22. Changing dashboard settings is outward-facing, so confirm with the user before doing it.
- [ ] **Step 3:** Update the Firebase workflows to drop the Ionic CLI, run `npm ci && npm run build`, and deploy `dist/portfolio/browser`. In `firebase.json`, set `public: dist/portfolio/browser`, remove the catch-all rewrite, enable `cleanUrls: true`, and add the header `X-Robots-Tag: noindex` on `**`.
- [ ] **Step 4:** Create `rebuild-content.yml` (`workflow_dispatch` plus a daily `schedule` at 10:00 UTC) that POSTs to the Pages deploy hook in secret `CF_PAGES_DEPLOY_HOOK`. Ask the user to create the hook and the secret.
- [ ] **Step 5:** Open a PR and confirm the Pages preview deployment builds. On the preview URL, `curl -s <preview>/ | grep "AI Experience"`, `curl -sI <preview>/robots.txt` (content-type text/plain) and `curl -sI <preview>/en` (301 to `/`) all succeed.
- [ ] **Step 6: Commit** `ci: build and deploy prerendered site to Cloudflare Pages`.

### Task 12: Cutover (confirm with user before each outward step)

- [ ] **Step 1:** Ask the user for go-ahead. Run `npm run content:stage -- --dry-run`, show the diff, and run without `--dry-run` once approved.
- [ ] **Step 2:** Run `npm run content:cutover -- --dry-run`, show the diff, and on approval run it. Then merge the PR, or trigger the deploy, so the new site ships right after.
- [ ] **Step 3:** Fix `www.thonyfd.com` (currently 522). Check the DNS record and add a Cloudflare redirect rule `www.thonyfd.com/*` -> `https://thonyfd.com/$1` (301), or add `www` as a Pages custom domain. Confirm the approach with the user first.
- [ ] **Step 4: Verify live:**
  - `curl -s https://thonyfd.com/ | grep -c "<article"` is greater than 10.
  - `curl -s https://thonyfd.com/robots.txt` starts with `User-agent`.
  - `curl -sI https://thonyfd.com/en` returns 301.
  - `curl -sI https://www.thonyfd.com` returns 301.
  - `curl -sI https://fd-portfolio.pages.dev/` has `x-robots-tag: noindex`.
  - Google Rich Results Test passes on `/`.
  - The LinkedIn Post Inspector shows the OG image.
- [ ] **Step 5:** Suggest to the user that they submit the sitemap in Google Search Console and Bing Webmaster Tools, and update their LinkedIn website link. Record the results in `docs/deploy.md` and commit `docs: record cutover`.
