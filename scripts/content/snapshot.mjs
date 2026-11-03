// Pure transformation from Firestore portfolio docs to the build snapshot.

/**
 * @typedef {'en'|'es'} Locale
 * @typedef {'introduction'|'ai-experience'|'experience'|'projects'|'tech'|'courses'|'schooling'} SectionKind
 * @typedef {{ intro: object|null, sections: object[] }} LocaleContent
 * @typedef {{ generatedAt: string, preview: boolean, locales: Record<Locale, LocaleContent> }} Snapshot
 */

const LOCALES = ['en', 'es'];
const KINDS = ['introduction', 'ai-experience', 'experience', 'projects', 'courses', 'schooling'];

/** @returns {SectionKind|null} */
export function sectionKind(id) {
  const stem = id.replace(/-(en|es)$/, '');
  if (stem.startsWith('tech-')) return 'tech';
  return KINDS.includes(stem) ? stem : null;
}

const byOrder = (a, b) => (Number(a.order) || 0) - (Number(b.order) || 0);

export function applyPatch(docs, patch) {
  const out = docs.map((d) => ({ id: d.id, data: structuredClone(d.data) }));
  for (const entry of patch?.docs ?? []) {
    const target = out.find((d) => d.id === entry.doc);
    if (!target) throw new Error(`Patch doc not found: ${entry.doc}`);
    Object.assign(target.data, entry.set ?? {});
    for (const s of entry.slots ?? []) {
      const slot = (target.data.slots ?? []).find((x) => x.title === s.match.title);
      if (!slot) throw new Error(`Patch slot not found in ${entry.doc}: ${s.match.title}`);
      Object.assign(slot, s.set);
    }
  }
  return out;
}

/** Headings inside Firestore HTML would break the page outline; render them as bold paragraphs. */
function demoteHeadings(html) {
  return typeof html === 'string' ? html.replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, '<p><strong>$1</strong></p>') : html;
}

function toSection({ id, data }) {
  const slots = (data.slots ?? [])
    .filter((s) => !s.hidden)
    .map((s, i) => ({ ...s, description: demoteHeadings(s.description), slots: s.slots ?? [], _i: i }))
    .sort((a, b) => byOrder(a, b) || a._i - b._i)
    .map(({ _i, ...s }) => s);
  return { ...data, id, kind: sectionKind(id), slots };
}

/** @returns {Snapshot} */
export function buildSnapshot(docs, { preview, stagedDocs = [], patch = { docs: [] } }) {
  let all = docs;
  if (preview) {
    const staged = stagedDocs.map((d) => ({ id: d.id, data: { ...d.data, visible: true } }));
    all = applyPatch([...docs.filter((d) => !staged.some((s) => s.id === d.id)), ...staged], patch);
  }
  const locales = {};
  for (const locale of LOCALES) {
    const sections = all
      .filter((d) => d.data.visible && d.data.locale === locale && sectionKind(d.id))
      .map(toSection)
      .sort(byOrder);
    const intro = sections.find((s) => s.kind === 'introduction') ?? null;
    const rest = sections.filter((s) => s.kind !== 'introduction');
    if (!intro || !rest.some((s) => s.kind === 'experience')) {
      throw new Error(`empty content: locale "${locale}" has no intro or experience`);
    }
    locales[locale] = { intro, sections: rest };
  }
  return { generatedAt: new Date().toISOString(), preview: Boolean(preview), locales };
}
