import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sectionKind, buildSnapshot, applyPatch } from './snapshot.mjs';

const doc = (id, data) => ({ id, data });
const base = () => [
  doc('config', { visible: false, order: 2 }),
  doc('introduction-en', { visible: true, locale: 'en', order: 0, isHead: true, title: 'ThonyFD', subTitle: 'Just a human' }),
  doc('introduction-es', { visible: true, locale: 'es', order: 0, isHead: true, title: 'ThonyFD' }),
  doc('experience-en', { visible: true, locale: 'en', order: 1, slots: [
    { title: 'B', order: 2 }, { title: 'A', order: 1 }, { title: 'A2', order: 1 },
  ] }),
  doc('experience-es', { visible: true, locale: 'es', order: 1, slots: [] }),
  doc('courses-en', { visible: true, locale: 'en', order: 5, slots: [
    { title: 'C++', order: 0 }, { title: 'Hidden', order: 1, hidden: true },
  ] }),
  doc('tech-backend', { visible: true, locale: 'en', order: 2, slots: [] }),
  doc('hidden-en', { visible: false, locale: 'en', order: 3 }),
];

test('sectionKind derives kind from doc id', () => {
  assert.equal(sectionKind('tech-backend-es'), 'tech');
  assert.equal(sectionKind('projects-en'), 'projects');
  assert.equal(sectionKind('tech-ci-cd'), 'tech');
  assert.equal(sectionKind('ai-experience-es'), 'ai-experience');
  assert.equal(sectionKind('config'), null);
});

test('buildSnapshot groups visible docs per locale, sorted, with intro', () => {
  const s = buildSnapshot(base(), { preview: false, stagedDocs: [], patch: { docs: [] } });
  assert.equal(s.locales.en.intro.title, 'ThonyFD');
  assert.equal(s.locales.en.intro.kind, 'introduction');
  assert.deepEqual(s.locales.en.sections.map((x) => x.id), ['experience-en', 'tech-backend', 'courses-en']);
  assert.deepEqual(s.locales.en.sections[0].slots.map((x) => x.title), ['A', 'A2', 'B']);
  assert.deepEqual(s.locales.en.sections[2].slots.map((x) => x.title), ['C++']);
  assert.equal(s.preview, false);
  assert.ok(s.generatedAt);
});

test('locale missing a section omits it without throwing', () => {
  const s = buildSnapshot(base(), { preview: false, stagedDocs: [], patch: { docs: [] } });
  assert.equal(s.locales.es.sections.some((x) => x.kind === 'courses'), false);
});

test('preview includes staged docs; non-preview excludes them', () => {
  const staged = [doc('ai-experience-en', { visible: false, staged: true, locale: 'en', order: 0.25, slots: [] })];
  const on = buildSnapshot(base(), { preview: true, stagedDocs: staged, patch: { docs: [] } });
  const off = buildSnapshot(base(), { preview: false, stagedDocs: staged, patch: { docs: [] } });
  assert.equal(on.locales.en.sections[0].id, 'ai-experience-en');
  assert.equal(off.locales.en.sections.some((x) => x.id === 'ai-experience-en'), false);
});

test('preview applies the cutover patch', () => {
  const patch = { docs: [{ doc: 'introduction-en', set: { subTitle: 'X' } }] };
  const s = buildSnapshot(base(), { preview: true, stagedDocs: [], patch });
  assert.equal(s.locales.en.intro.subTitle, 'X');
});

test('applyPatch changes only targeted fields', () => {
  const patch = { docs: [
    { doc: 'introduction-en', set: { subTitle: 'X' } },
    { doc: 'courses-en', slots: [{ match: { title: 'C++' }, set: { hidden: true } }] },
  ] };
  const before = base();
  const out = applyPatch(before, patch);
  const intro = out.find((d) => d.id === 'introduction-en').data;
  assert.equal(intro.subTitle, 'X');
  assert.equal(intro.title, 'ThonyFD');
  const courses = out.find((d) => d.id === 'courses-en').data;
  assert.equal(courses.slots[0].hidden, true);
  assert.equal(courses.slots[0].title, 'C++');
  assert.equal(before.find((d) => d.id === 'introduction-en').data.subTitle, 'Just a human');
});

test('applyPatch throws naming an unmatched slot', () => {
  const patch = { docs: [{ doc: 'courses-en', slots: [{ match: { title: 'Nope' }, set: { hidden: true } }] }] };
  assert.throws(() => applyPatch(base(), patch), /Nope/);
});

test('buildSnapshot throws empty content when a locale lacks intro or experience', () => {
  const docs = base().filter((d) => d.id !== 'experience-es');
  assert.throws(() => buildSnapshot(docs, { preview: false, stagedDocs: [], patch: { docs: [] } }), /empty content/);
});

test('buildSnapshot demotes headings inside slot descriptions', () => {
  const docs = base();
  docs.find((d) => d.id === 'experience-en').data.slots[0].description = '<p>x</p><h2 class="a">Responsibilities:</h2><H3>Notable</H3>';
  const s = buildSnapshot(docs, { preview: false, stagedDocs: [], patch: { docs: [] } });
  const slot = s.locales.en.sections[0].slots.find((x) => x.title === 'B');
  assert.equal(slot.description, '<p>x</p><p><strong>Responsibilities:</strong></p><p><strong>Notable</strong></p>');
});
