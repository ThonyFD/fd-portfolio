#!/usr/bin/env node
// Writes portfolio content changes to Firestore in two phases, with a backup first.
//   stage:   create content/staged-docs/*.json as hidden docs (skips docs that exist)
//   cutover: publish staged docs and apply content/cutover-patch.json
// Usage: GOOGLE_APPLICATION_CREDENTIALS=key.json node scripts/content/apply.mjs --phase stage|cutover [--dry-run]
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { applyPatch } from './snapshot.mjs';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');

function changedFields(before, after) {
  const keys = new Set([...Object.keys(before ?? {}), ...Object.keys(after)]);
  return [...keys].filter((k) => !isDeepStrictEqual(before?.[k], after[k]));
}

/**
 * @param {{ db: { list(): Promise<{id: string, data: object}[]>, set(id: string, data: object): Promise<void> },
 *   phase: 'stage'|'cutover', dryRun: boolean, backupDir: string, stagedDocs: {id: string, data: object}[], patch: object }} opts
 * @returns {Promise<{ changes: { id: string, fields: string[] }[], backup: string|null }>}
 */
export async function applyContent({ db, phase, dryRun, backupDir, stagedDocs, patch }) {
  if (phase !== 'stage' && phase !== 'cutover') throw new Error(`Unknown phase: ${phase}`);
  const current = await db.list();
  const byId = new Map(current.map((d) => [d.id, d.data]));

  let target = current.map((d) => ({ id: d.id, data: structuredClone(d.data) }));
  for (const staged of stagedDocs) {
    const existing = target.find((d) => d.id === staged.id);
    if (phase === 'stage') {
      if (!existing) target.push({ id: staged.id, data: { ...structuredClone(staged.data), visible: false, staged: true } });
    } else {
      const base = existing ? existing.data : structuredClone(staged.data);
      const { staged: _flag, ...published } = { ...base, visible: true };
      if (existing) existing.data = published;
      else target.push({ id: staged.id, data: published });
    }
  }
  if (phase === 'cutover') target = applyPatch(target, patch); // throws on unmatched docs or slots

  const changes = target
    .map((d) => ({ id: d.id, data: d.data, fields: changedFields(byId.get(d.id), d.data) }))
    .filter((c) => c.fields.length);

  let backup = null;
  if (!dryRun && changes.length) {
    await mkdir(backupDir, { recursive: true });
    backup = path.join(backupDir, `portfolio-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    await writeFile(backup, JSON.stringify(current, null, 2));
    for (const c of changes) await db.set(c.id, c.data);
  }
  return { changes: changes.map(({ id, fields }) => ({ id, fields })), backup };
}

async function firestoreAdapter() {
  const { initializeApp, applicationDefault } = await import('firebase-admin/app');
  const { getFirestore } = await import('firebase-admin/firestore');
  const config = JSON.parse(await readFile(path.join(root, 'content/firebase-config.json'), 'utf8'));
  const app = initializeApp({ credential: applicationDefault(), projectId: config.projectId });
  const col = getFirestore(app).collection('portfolio');
  return {
    async list() {
      const snap = await col.get();
      return snap.docs.map((d) => ({ id: d.id, data: d.data() }));
    },
    async set(id, data) {
      await col.doc(id).set(data);
    },
  };
}

async function main() {
  const args = process.argv.slice(2);
  const phase = args[args.indexOf('--phase') + 1];
  const dryRun = args.includes('--dry-run');
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) throw new Error('Set GOOGLE_APPLICATION_CREDENTIALS to a service account key path');

  const dir = path.join(root, 'content/staged-docs');
  const stagedDocs = await Promise.all(
    (await readdir(dir)).filter((n) => n.endsWith('.json')).map(async (n) => ({
      id: n.replace(/\.json$/, ''),
      data: JSON.parse(await readFile(path.join(dir, n), 'utf8')),
    })),
  );
  const patch = JSON.parse(await readFile(path.join(root, 'content/cutover-patch.json'), 'utf8'));

  const result = await applyContent({
    db: await firestoreAdapter(), phase, dryRun, backupDir: path.join(root, 'content/backups'), stagedDocs, patch,
  });
  console.log(`${dryRun ? '[dry run] ' : ''}${phase}: ${result.changes.length} doc(s) ${dryRun ? 'would change' : 'changed'}`);
  for (const c of result.changes) console.log(`  ${c.id}: ${c.fields.join(', ')}`);
  if (result.backup) console.log(`backup: ${path.relative(root, result.backup)}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(`content:apply failed: ${err.message}`);
    process.exit(1);
  });
}
