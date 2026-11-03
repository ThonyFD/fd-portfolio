import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { applyContent } from './apply.mjs';

function fakeDb(initial) {
  const docs = new Map(Object.entries(structuredClone(initial)));
  let writes = 0;
  return {
    docs,
    get writes() { return writes; },
    async list() { return [...docs].map(([id, data]) => ({ id, data: structuredClone(data) })); },
    async set(id, data) { writes++; docs.set(id, structuredClone(data)); },
  };
}

const initial = {
  'introduction-en': { visible: true, locale: 'en', subTitle: 'Just a human', slots: [] },
  'courses-en': { visible: true, locale: 'en', slots: [{ title: 'C++' }, { title: 'AZ-900' }] },
};
const stagedDocs = [{ id: 'ai-experience-en', data: { visible: false, staged: true, locale: 'en', slots: [{ title: 'Datacentria' }] } }];
const patch = { docs: [
  { doc: 'introduction-en', set: { subTitle: 'Solutions Architect' } },
  { doc: 'courses-en', slots: [{ match: { title: 'C++' }, set: { hidden: true } }] },
] };

const run = async (db, phase, extra = {}) => {
  const backupDir = await mkdtemp(path.join(os.tmpdir(), 'apply-'));
  const result = await applyContent({ db, phase, dryRun: false, backupDir, stagedDocs, patch, ...extra });
  return { result, backupDir };
};

test('stage creates each staged doc once, hidden', async () => {
  const db = fakeDb(initial);
  await run(db, 'stage');
  await run(db, 'stage');
  assert.equal(db.docs.get('ai-experience-en').visible, false);
  assert.equal(db.docs.get('ai-experience-en').staged, true);
  assert.equal(db.writes, 1);
});

test('cutover publishes staged docs and applies the patch, idempotently', async () => {
  const db = fakeDb(initial);
  await run(db, 'stage');
  await run(db, 'cutover');
  const once = structuredClone(Object.fromEntries(db.docs));
  const writesAfterFirst = db.writes;
  await run(db, 'cutover');
  assert.deepEqual(Object.fromEntries(db.docs), once);
  assert.equal(db.writes, writesAfterFirst);
  assert.equal(once['ai-experience-en'].visible, true);
  assert.equal('staged' in once['ai-experience-en'], false);
  assert.equal(once['introduction-en'].subTitle, 'Solutions Architect');
  assert.equal(once['courses-en'].slots[0].hidden, true);
});

test('dry run writes nothing and reports the changes', async () => {
  const db = fakeDb(initial);
  const { result } = await run(db, 'stage', { dryRun: true });
  assert.equal(db.writes, 0);
  assert.deepEqual(result.changes.map((c) => c.id), ['ai-experience-en']);
});

test('a backup of the whole collection is written before any write', async () => {
  const db = fakeDb(initial);
  const { backupDir } = await run(db, 'stage');
  const [file] = await readdir(backupDir);
  assert.match(file, /^portfolio-.*\.json$/);
  const backup = JSON.parse(await readFile(path.join(backupDir, file), 'utf8'));
  assert.deepEqual(backup.map((d) => d.id).sort(), ['courses-en', 'introduction-en']);
});

test('a patch entry matching no slot fails naming it, and writes nothing', async () => {
  const db = fakeDb(initial);
  await run(db, 'stage');
  const before = db.writes;
  const bad = { docs: [{ doc: 'courses-en', slots: [{ match: { title: 'Nope' }, set: { hidden: true } }] }] };
  await assert.rejects(run(db, 'cutover', { patch: bad }), /Nope/);
  assert.equal(db.writes, before);
});

test('cutover publishes the repo staged file, not an older staged copy in Firestore', async () => {
  const db = fakeDb(initial);
  await run(db, 'stage');
  const edited = [{ id: 'ai-experience-en', data: { visible: false, staged: true, locale: 'en', slots: [{ title: 'Datacentria v2' }] } }];
  await run(db, 'cutover', { stagedDocs: edited });
  assert.equal(db.docs.get('ai-experience-en').slots[0].title, 'Datacentria v2');
  assert.equal(db.docs.get('ai-experience-en').visible, true);
});
