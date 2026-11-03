#!/usr/bin/env node
// Fetches the portfolio collection from Firestore and writes the build snapshot.
// Usage: node scripts/content/fetch-snapshot.mjs --out src/content/snapshot.json [--preview]
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fetchCollection } from './firestore.mjs';
import { buildSnapshot } from './snapshot.mjs';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');

async function firebaseConfig() {
  if (process.env.FIREBASE_API_KEY && process.env.FIREBASE_PROJECT_ID) {
    return { apiKey: process.env.FIREBASE_API_KEY, projectId: process.env.FIREBASE_PROJECT_ID };
  }
  // Public web config (the same values every browser received from the old site).
  const config = JSON.parse(await readFile(path.join(root, 'content/firebase-config.json'), 'utf8'));
  if (!config.apiKey || !config.projectId) throw new Error('Firebase apiKey/projectId not found');
  return config;
}

async function readJsonDir(dir) {
  let names = [];
  try {
    names = (await readdir(dir)).filter((n) => n.endsWith('.json'));
  } catch {
    return [];
  }
  return Promise.all(names.map(async (n) => ({
    id: n.replace(/\.json$/, ''),
    data: JSON.parse(await readFile(path.join(dir, n), 'utf8')),
  })));
}

async function readPatch() {
  try {
    return JSON.parse(await readFile(path.join(root, 'content/cutover-patch.json'), 'utf8'));
  } catch {
    return { docs: [] };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const outIdx = args.indexOf('--out');
  const out = path.resolve(outIdx >= 0 ? args[outIdx + 1] : 'src/content/snapshot.json');
  // CONTENT_PREVIEW=1 is set only on the Cloudflare Pages preview environment (see docs/deploy.md).
  const preview = args.includes('--preview') || process.env.CONTENT_PREVIEW === '1';

  const { apiKey, projectId } = await firebaseConfig();
  const docs = await fetchCollection({ projectId, collection: 'portfolio', apiKey });
  if (!docs.length) throw new Error('Firestore portfolio collection is empty');

  const snapshot = buildSnapshot(docs, {
    preview,
    stagedDocs: preview ? await readJsonDir(path.join(root, 'content/staged-docs')) : [],
    patch: preview ? await readPatch() : { docs: [] },
  });

  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, JSON.stringify(snapshot, null, 2) + '\n');
  const counts = Object.entries(snapshot.locales).map(([l, c]) => `${l}:${c.sections.length}`).join(' ');
  console.log(`snapshot written to ${path.relative(root, out)} (${counts}${preview ? ', preview' : ''})`);
}

main().catch((err) => {
  console.error(`content:fetch failed: ${err.message}`);
  process.exit(1);
});
