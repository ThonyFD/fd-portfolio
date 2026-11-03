import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildHeaders, buildLlmsTxt, buildRedirects, buildResumeMarkdown, buildRobots, buildSitemap, stripHtml,
} from './discovery.mjs';

const SITE = 'https://thonyfd.com';
const slot = (o) => ({ order: 0, slots: [], ...o });
const snapshot = {
  generatedAt: '2026-11-03T00:00:00.000Z',
  preview: false,
  locales: {
    en: {
      intro: slot({ id: 'introduction-en', kind: 'introduction', title: 'ThonyFD', summary: 'I design AI agent systems.' }),
      sections: [
        slot({ id: 'ai-experience-en', kind: 'ai-experience', slots: [
          slot({ title: 'Datacentria', subTitle: 'Agent middleware', start: '2026', summary: 'Event-driven <b>AI</b> middleware.', tags: ['AWS', 'SQS'] }),
        ] }),
        slot({ id: 'experience-en', kind: 'experience', slots: [
          slot({ title: 'Manager', subTitle: 'Tigo', start: '11/2021', end: '01/2024', order: 4 }),
          slot({ title: 'Junior Developer', subTitle: 'Movistar', start: '08/2009', end: '05/2014' }),
          slot({ title: 'Solutions Architect', subTitle: 'ASSA', start: '06/2026', end: 'Now', description: '<p>Designs &amp; ships.</p>' }),
        ] }),
        slot({ id: 'tech-ai', kind: 'tech', label: 'AI', slots: [slot({ title: 'Claude Code', subTitle: 'Advance' })] }),
        slot({ id: 'schooling-en', kind: 'schooling', slots: [slot({ title: 'BSc', subTitle: 'UTP', end: '2012' })] }),
      ],
    },
    es: {
      intro: slot({ id: 'introduction-es', kind: 'introduction', title: 'ThonyFD' }),
      sections: [slot({ id: 'experience-es', kind: 'experience', slots: [slot({ title: 'Arquitecto', subTitle: 'ASSA', start: '06/2026', end: 'Now' })] })],
    },
  },
};

test('robots allows everyone and named AI crawlers, points to the sitemap', () => {
  const r = buildRobots(SITE);
  assert.match(r, /^User-agent: \*\nAllow: \//m);
  for (const bot of ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended', 'CCBot']) {
    assert.match(r, new RegExp(`User-agent: ${bot}\\nAllow: /`));
  }
  assert.match(r, /Sitemap: https:\/\/thonyfd\.com\/sitemap\.xml/);
});

test('sitemap lists the three pages with hreflang alternates on the home pair', () => {
  const xml = buildSitemap(SITE, [
    { path: '/', lastmod: '2026-11-03', alternates: { en: '/', es: '/es', 'x-default': '/' } },
    { path: '/es', lastmod: '2026-11-03', alternates: { en: '/', es: '/es', 'x-default': '/' } },
    { path: '/fd-systems', lastmod: '2026-11-03' },
  ]);
  assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>/);
  assert.match(xml, /xmlns:xhtml="http:\/\/www.w3.org\/1999\/xhtml"/);
  for (const loc of ['https://thonyfd.com/', 'https://thonyfd.com/es', 'https://thonyfd.com/fd-systems']) {
    assert.ok(xml.includes(`<loc>${loc}</loc>`), loc);
  }
  assert.equal((xml.match(/<xhtml:link /g) ?? []).length, 6);
});

test('llms.txt follows the llmstxt.org shape and has no HTML', () => {
  const t = buildLlmsTxt(snapshot, SITE);
  const lines = t.split('\n');
  assert.equal(lines[0], '# Anthony Mosquera');
  assert.ok(lines.find((l) => l.startsWith('> ')));
  for (const h of ['## AI Experience', '## Experience', '## Contact', '## Links']) assert.ok(t.includes(h), h);
  assert.ok(t.includes('[Resume](https://thonyfd.com/resume.md)'));
  assert.ok(t.includes('[Full profile](https://thonyfd.com/llms-full.txt)'));
  assert.ok(t.includes('fdsystems.fd@gmail.com'));
  assert.ok(!t.includes('<'));
});

test('resume lists every role newest first with periods, AI projects with tags, and contact', () => {
  const md = buildResumeMarkdown(snapshot, 'en');
  assert.ok(md.startsWith('# Anthony Mosquera'));
  const a = md.indexOf('### Solutions Architect · ASSA');
  const m = md.indexOf('### Manager · Tigo');
  const b = md.indexOf('### Junior Developer · Movistar');
  assert.ok(a > 0 && m > a && b > m);
  assert.ok(md.includes('06/2026 – Present'));
  assert.ok(md.includes('Designs & ships.'));
  assert.ok(md.includes('### Datacentria'));
  assert.ok(md.includes('AWS, SQS'));
  assert.ok(md.includes('fdsystems.fd@gmail.com'));
  assert.ok(!md.includes('<'));
  assert.ok(buildResumeMarkdown(snapshot, 'es').includes('06/2026 – Actualidad'));
});

test('redirects send /en to / permanently', () => {
  const r = buildRedirects();
  assert.match(r, /^\/en \/ 301$/m);
  assert.match(r, /^\/en\/\* \/ 301$/m);
});

test('headers noindex the pages.dev host and type the text files', () => {
  const h = buildHeaders();
  assert.match(h, /https:\/\/fd-portfolio\.pages\.dev\/\*\n {2}X-Robots-Tag: noindex/);
  assert.match(h, /\/\*\.txt\n {2}Content-Type: text\/plain; charset=utf-8/);
  assert.match(h, /\/resume\.md\n {2}Content-Type: text\/markdown; charset=utf-8/);
  assert.match(h, /\/\*\.js\n {2}Cache-Control: public, max-age=31536000, immutable/);
});

test('stripHtml matches the app helper', () => {
  assert.equal(stripHtml('<b>A</b>&amp; <script>x</script>B'), 'A & B');
});

test('llms.txt omits the AI heading when there are no AI projects', () => {
  const bare = structuredClone(snapshot);
  bare.locales.en.sections = bare.locales.en.sections.filter((s) => s.kind !== 'ai-experience');
  assert.ok(!buildLlmsTxt(bare, SITE).includes('## AI Experience'));
});
