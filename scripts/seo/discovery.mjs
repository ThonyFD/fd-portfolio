// Pure builders for the crawler and agent discovery files published next to the prerendered pages.

const PERSON = {
  name: 'Anthony Mosquera',
  email: 'fdsystems.fd@gmail.com',
  linkedin: 'https://www.linkedin.com/in/thonyfd/',
  github: 'https://github.com/ThonyFD',
};

const AI_CRAWLERS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot',
  'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'CCBot', 'Bingbot',
];

const L10N = {
  en: {
    headline: 'Solutions Architect · AI Systems Engineer',
    summary: 'Solutions Architect and AI Systems Engineer in Panama City (GMT-5). Designs AI agent systems and runs them in production. Open to remote roles. English and Spanish.',
    present: 'Present', ai: 'AI Experience', experience: 'Experience', projects: 'Selected projects', skills: 'Skills',
    education: 'Education', courses: 'Courses', contact: 'Contact', location: 'Location', locationValue: 'Panama City, Panama (GMT-5), open to remote',
  },
  es: {
    headline: 'Arquitecto de Soluciones · Ingeniero de Sistemas con IA',
    summary: 'Arquitecto de Soluciones e Ingeniero de Sistemas con IA en Ciudad de Panamá (GMT-5). Diseña sistemas de agentes de IA y los opera en producción. Disponible para trabajo remoto. Inglés y español.',
    present: 'Actualidad', ai: 'Experiencia con IA', experience: 'Experiencia', projects: 'Proyectos destacados', skills: 'Habilidades',
    education: 'Educación', courses: 'Cursos', contact: 'Contacto', location: 'Ubicación', locationValue: 'Ciudad de Panamá, Panamá (GMT-5), disponible en remoto',
  },
};

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'" };

/** Same contract as src/app/content/format.ts stripHtml. */
export function stripHtml(html) {
  if (!html) return '';
  return String(html)
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (all, code) => {
      if (code[0] === '#') {
        return String.fromCodePoint(code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10));
      }
      return ENTITIES[code.toLowerCase()] ?? all;
    })
    .replace(/\s+/g, ' ')
    .replace(/ ([,.;:!?])/g, '$1')
    .trim();
}

function period(start, end, locale) {
  const word = (v) => (v && String(v).trim().toLowerCase() === 'now' ? L10N[locale].present : v);
  return [word(start), word(end)].filter(Boolean).join(' – ');
}

function toIso(value) {
  const v = String(value).trim();
  let m = v.match(/^(\d{1,2})\/(\d{4})$/);
  if (m) return `${m[2]}-${m[1].padStart(2, '0')}`;
  m = v.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
  if (m) return m[3] ? `${m[1]}-${m[2]}-${m[3]}` : `${m[1]}-${m[2]}`;
  return /^\d{4}$/.test(v) ? v : '';
}

/** Same contract as src/app/content/format.ts byStartDesc. */
export function byStartDesc(list) {
  return list
    .map((slot, i) => ({ slot, i, key: slot.start ? toIso(slot.start) : '' }))
    .sort((a, b) => (a.key === b.key ? a.i - b.i : !a.key ? 1 : !b.key ? -1 : a.key < b.key ? 1 : -1))
    .map((x) => x.slot);
}

const of = (content, kind) => content.sections.filter((s) => s.kind === kind);
const slots = (content, kind) => of(content, kind).flatMap((s) => s.slots);
const techGroups = (content) => {
  const t = of(content, 'tech');
  return [...t.filter((g) => g.id?.startsWith('tech-ai')), ...t.filter((g) => !g.id?.startsWith('tech-ai'))];
};

export function buildRobots(siteUrl) {
  const blocks = ['User-agent: *\nAllow: /', ...AI_CRAWLERS.map((bot) => `User-agent: ${bot}\nAllow: /`)];
  return `${blocks.join('\n\n')}\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
}

export function buildSitemap(siteUrl, entries) {
  const url = (e) => {
    const alt = Object.entries(e.alternates ?? {})
      .map(([lang, p]) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${siteUrl}${p}"/>`)
      .join('\n');
    return `  <url>\n    <loc>${siteUrl}${e.path}</loc>\n    <lastmod>${e.lastmod}</lastmod>${alt ? `\n${alt}` : ''}\n  </url>`;
  };
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.map(url).join('\n')}\n</urlset>\n`;
}

function aiLines(content) {
  return slots(content, 'ai-experience').map((p) => {
    const what = stripHtml(p.summary) || stripHtml(p.description);
    const tags = p.tags?.length ? ` (${p.tags.join(', ')})` : '';
    return `- ${p.title}${p.subTitle ? `, ${stripHtml(p.subTitle)}` : ''}${p.start ? `, ${p.start}` : ''}: ${what}${tags}`;
  });
}

export function buildLlmsTxt(snapshot, siteUrl) {
  const en = snapshot.locales.en;
  const t = L10N.en;
  const roles = byStartDesc(slots(en, 'experience')).map((r) => `- ${r.title}, ${stripHtml(r.subTitle)} (${period(r.start, r.end, 'en')})`);
  return [
    `# ${PERSON.name}`,
    '',
    `> ${t.summary}`,
    '',
    `${PERSON.name} (ThonyFD) is a ${t.headline}. Current role: Solutions Architect at ASSA.`,
    '',
    ...(aiLines(en).length ? [`## ${t.ai}`, '', ...aiLines(en), ''] : []),
    `## ${t.experience}`,
    '',
    ...roles,
    '',
    `## ${t.contact}`,
    '',
    `- Email: ${PERSON.email}`,
    `- LinkedIn: ${PERSON.linkedin}`,
    `- GitHub: ${PERSON.github}`,
    `- ${t.location}: ${t.locationValue}`,
    '',
    '## Links',
    '',
    `- [Resume](${siteUrl}/resume.md): full text resume in Markdown`,
    `- [Full profile](${siteUrl}/llms-full.txt): resume in English and Spanish`,
    `- [Portfolio (English)](${siteUrl}/)`,
    `- [Portafolio (Español)](${siteUrl}/es)`,
    '',
  ].join('\n');
}

export function buildResumeMarkdown(snapshot, locale) {
  const c = snapshot.locales[locale];
  const t = L10N[locale];
  const out = [`# ${PERSON.name}`, '', `**${t.headline}**`, '', t.summary, '', `## ${t.contact}`, '',
    `- Email: ${PERSON.email}`, `- LinkedIn: ${PERSON.linkedin}`, `- GitHub: ${PERSON.github}`, `- ${t.location}: ${t.locationValue}`, ''];

  const ai = slots(c, 'ai-experience');
  if (ai.length) {
    out.push(`## ${t.ai}`, '');
    for (const p of ai) {
      out.push(`### ${p.title}${p.subTitle ? ` · ${stripHtml(p.subTitle)}` : ''}`, '');
      if (p.start) out.push(`${p.start}`, '');
      const body = stripHtml(p.description) || stripHtml(p.summary);
      if (body) out.push(body, '');
      for (const s of p.stages ?? []) out.push(`- ${s.name}: ${s.detail}`);
      if (p.stages?.length) out.push('');
      if (p.tags?.length) out.push(`${p.tags.join(', ')}`, '');
      for (const l of p.links ?? []) out.push(`${l.label}: ${l.url}`, '');
    }
  }

  const roles = byStartDesc(slots(c, 'experience'));
  if (roles.length) {
    out.push(`## ${t.experience}`, '');
    for (const r of roles) {
      out.push(`### ${r.title}${r.subTitle ? ` · ${stripHtml(r.subTitle)}` : ''}`, '');
      const p = period(r.start, r.end, locale);
      if (p) out.push(p, '');
      const body = stripHtml(r.description);
      if (body) out.push(body, '');
    }
  }

  const projects = byStartDesc(slots(c, 'projects').filter((p) => !p.compact));
  if (projects.length) {
    out.push(`## ${t.projects}`, '');
    for (const p of projects) {
      out.push(`### ${p.title}${p.subTitle ? ` · ${stripHtml(p.subTitle)}` : ''}`, '');
      const body = stripHtml(p.description);
      if (body) out.push(body, '');
    }
  }

  const groups = techGroups(c);
  if (groups.length) {
    out.push(`## ${t.skills}`, '');
    for (const g of groups) out.push(`- ${g.label ?? g.id}: ${g.slots.map((s) => s.title).join(', ')}`);
    out.push('');
  }

  for (const [kind, heading] of [['schooling', t.education], ['courses', t.courses]]) {
    const items = slots(c, kind);
    if (!items.length) continue;
    out.push(`## ${heading}`, '');
    for (const i of items) out.push(`- ${i.title}${i.subTitle ? `, ${stripHtml(i.subTitle)}` : ''}${i.end || i.start ? ` (${period(i.start, i.end, locale)})` : ''}`);
    out.push('');
  }
  return out.join('\n');
}

export function buildRedirects() {
  return ['/en / 301', '/en/* / 301', ''].join('\n');
}

export function buildHeaders() {
  return [
    'https://fd-portfolio.pages.dev/*',
    '  X-Robots-Tag: noindex',
    '',
    'https://:version.fd-portfolio.pages.dev/*',
    '  X-Robots-Tag: noindex',
    '',
    '/*',
    '  X-Content-Type-Options: nosniff',
    '  Referrer-Policy: strict-origin-when-cross-origin',
    '',
    '/*.txt',
    '  Content-Type: text/plain; charset=utf-8',
    '',
    '/resume.md',
    '  Content-Type: text/markdown; charset=utf-8',
    '',
    '/*.js',
    '  Cache-Control: public, max-age=31536000, immutable',
    '',
    '/*.css',
    '  Cache-Control: public, max-age=31536000, immutable',
    '',
    '/assets/*',
    '  Cache-Control: public, max-age=604800',
    '',
  ].join('\n');
}
