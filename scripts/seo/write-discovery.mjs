#!/usr/bin/env node
// Post-build: flattens nested route pages and writes crawler/agent discovery files.
// Usage: node scripts/seo/write-discovery.mjs dist/portfolio/browser
import { existsSync } from 'node:fs';
import { readFile, rename, rmdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  buildHeaders, buildLlmsTxt, buildRedirects, buildResumeMarkdown, buildRobots, buildSitemap,
} from './discovery.mjs';

const SITE_URL = 'https://thonyfd.com';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const out = path.resolve(process.argv[2] ?? 'dist/portfolio/browser');

// Cloudflare Pages serves "es.html" at /es; "es/index.html" would force a redirect to /es/.
for (const route of ['es', 'fd-systems']) {
  const nested = path.join(out, route, 'index.html');
  if (existsSync(nested)) {
    await rename(nested, path.join(out, `${route}.html`));
    await rmdir(path.join(out, route)).catch(() => {});
  }
}

const snapshot = JSON.parse(await readFile(path.join(root, 'src/content/snapshot.json'), 'utf8'));
const lastmod = snapshot.generatedAt.slice(0, 10);
const home = { en: '/', es: '/es', 'x-default': '/' };

const files = {
  'robots.txt': buildRobots(SITE_URL),
  'sitemap.xml': buildSitemap(SITE_URL, [
    { path: '/', lastmod, alternates: home },
    { path: '/es', lastmod, alternates: home },
    { path: '/fd-systems', lastmod },
  ]),
  'llms.txt': buildLlmsTxt(snapshot, SITE_URL),
  'llms-full.txt': `${buildResumeMarkdown(snapshot, 'en')}\n\n---\n\n${buildResumeMarkdown(snapshot, 'es')}`,
  'resume.md': buildResumeMarkdown(snapshot, 'en'),
  'resume.es.md': buildResumeMarkdown(snapshot, 'es'),
  _redirects: buildRedirects(),
  _headers: buildHeaders(),
};

for (const [name, body] of Object.entries(files)) await writeFile(path.join(out, name), body);
console.log(`discovery files written to ${path.relative(root, out)}: ${Object.keys(files).join(', ')}`);
