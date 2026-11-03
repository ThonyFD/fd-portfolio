import { Locale, LocaleContent, Section } from '../content/content.types';
import { stripHtml } from '../content/format';
import { CONTACT_EMAIL, PERSON, SITE_URL, SOCIAL } from './site';

const isRepo = (url: string) => url.startsWith('https://github.com/');

function project(slot: Section): Record<string, unknown> {
  const repo = slot.links?.find((l) => isRepo(l.url))?.url;
  const part: Record<string, unknown> = {
    '@type': repo ? 'SoftwareSourceCode' : 'CreativeWork',
    name: slot.title,
    description: stripHtml(slot.description) || stripHtml(slot.summary) || undefined,
    keywords: slot.tags?.length ? slot.tags.join(', ') : undefined,
    dateCreated: slot.start,
  };
  if (repo) part['codeRepository'] = repo;
  return Object.fromEntries(Object.entries(part).filter(([, v]) => v !== undefined));
}

/** schema.org ProfilePage describing the person, built from the locale's content. */
export function buildProfileJsonLd(content: LocaleContent, locale: Locale): object {
  const of = (kind: Section['kind']) => content.sections.filter((s) => s.kind === kind);
  const tech = of('tech');
  const ordered = [...tech.filter((g) => g.id?.startsWith('tech-ai')), ...tech.filter((g) => !g.id?.startsWith('tech-ai'))];
  const knowsAbout = [...new Set(ordered.flatMap((g) => g.slots.map((s) => stripHtml(s.title))).filter(Boolean))];
  const alumniOf = of('schooling')
    .flatMap((g) => g.slots)
    .map((s) => stripHtml(s.subTitle))
    .filter(Boolean)
    .map((name) => ({ '@type': 'EducationalOrganization', name }));
  const url = locale === 'es' ? `${SITE_URL}/es` : `${SITE_URL}/`;

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url,
    inLanguage: locale,
    mainEntity: {
      '@type': 'Person',
      name: PERSON.name,
      alternateName: PERSON.alternateName,
      jobTitle: PERSON.jobTitle,
      worksFor: { '@type': 'Organization', name: PERSON.worksFor },
      email: `mailto:${CONTACT_EMAIL}`,
      url,
      image: `${SITE_URL}/assets/archive/profile.jpg`,
      sameAs: [SOCIAL.linkedin, SOCIAL.github],
      address: { '@type': 'PostalAddress', addressLocality: PERSON.city, addressCountry: PERSON.addressCountry },
      knowsLanguage: [...PERSON.languages],
      knowsAbout,
      alumniOf,
    },
    hasPart: of('ai-experience').flatMap((g) => g.slots).map(project),
  };
}
