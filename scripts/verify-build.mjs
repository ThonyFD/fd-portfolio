#!/usr/bin/env node
// Asserts the built site is readable without JavaScript. Usage: node scripts/verify-build.mjs dist/portfolio/browser
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const dir = path.resolve(process.argv[2] ?? 'dist/portfolio/browser');
const failures = [];
const read = (rel) => {
  const file = path.join(dir, rel);
  if (!existsSync(file)) {
    failures.push(`missing ${rel}`);
    return '';
  }
  return readFileSync(file, 'utf8');
};
const expectIn = (rel, html, needle, label = needle) => {
  if (!html.includes(needle)) failures.push(`${rel}: expected ${label}`);
};

const en = read('index.html');
for (const needle of ['Anthony Mosquera', 'id="ai-experience"', 'Datacentria', '<html lang="en"', 'application/ld+json']) {
  expectIn('index.html', en, needle);
}
if (!/rel="canonical" href="https:\/\/thonyfd\.com\/"/.test(en)) failures.push('index.html: expected canonical https://thonyfd.com/');
const articles = (en.match(/<article/g) ?? []).length;
if (articles <= 10) failures.push(`index.html: expected more than 10 <article>, found ${articles}`);

const es = read('es/index.html');
expectIn('es/index.html', es, '<html lang="es"');
if (!/rel="canonical" href="https:\/\/thonyfd\.com\/es"/.test(es)) failures.push('es/index.html: expected canonical https://thonyfd.com/es');

read('fd-systems/index.html');

for (const file of ['robots.txt', 'sitemap.xml', 'llms.txt', 'llms-full.txt', 'resume.md', '_redirects', '_headers']) read(file);

const walk = (d) => readdirSync(d).flatMap((n) => (statSync(path.join(d, n)).isDirectory() ? walk(path.join(d, n)) : [path.join(d, n)]));
for (const file of existsSync(dir) ? walk(dir).filter((f) => f.endsWith('.html')) : []) {
  const html = readFileSync(file, 'utf8');
  const rel = path.relative(dir, file);
  if (html.includes('<ion-')) failures.push(`${rel}: contains <ion-`);
  if (html.includes('user-scalable')) failures.push(`${rel}: contains user-scalable`);
}

if (failures.length) {
  console.error(`verify-build: ${failures.length} problem(s)\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
console.log('verify-build: ok');
