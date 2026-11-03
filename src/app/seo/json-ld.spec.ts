import { SNAPSHOT_FIXTURE } from '../testing/snapshot.fixture';
import { LocaleContent } from '../content/content.types';
import { buildProfileJsonLd } from './json-ld';

const content: LocaleContent = structuredClone(SNAPSHOT_FIXTURE.locales.en);
content.sections[0].slots.push({
  order: 2,
  title: 'Agent Mesh Lab',
  description: '<p>Google ADK agents. Adapted from <b>aaronthewarrior</b>\'s Cloud Runner 2049.</p>',
  tags: ['Google ADK', 'MCP'],
  slots: [],
});

describe('buildProfileJsonLd', () => {
  const ld = buildProfileJsonLd(content, 'en') as any;
  const person = ld.mainEntity;

  it('is a ProfilePage about the person', () => {
    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@type']).toBe('ProfilePage');
    expect(ld.url).toBe('https://thonyfd.com/');
    expect(ld.inLanguage).toBe('en');
    expect(person['@type']).toBe('Person');
    expect(person.name).toBe('Anthony Mosquera');
    expect(person.alternateName).toBe('ThonyFD');
    expect(person.jobTitle).toBe('Solutions Architect');
    expect(person.worksFor).toEqual({ '@type': 'Organization', name: 'ASSA' });
  });

  it('carries contact, profiles and location', () => {
    expect(person.email).toBe('mailto:fdsystems.fd@gmail.com');
    expect(person.sameAs).toEqual(['https://www.linkedin.com/in/thonyfd/', 'https://github.com/ThonyFD']);
    expect(person.address).toEqual({ '@type': 'PostalAddress', addressLocality: 'Panama City', addressCountry: 'PA' });
    expect(person.knowsLanguage).toEqual(['en', 'es']);
  });

  it('lists skills with AI first and schools', () => {
    expect(person.knowsAbout[0]).toBe('Claude Code');
    expect(person.knowsAbout).toContain('NodeJS');
    expect(person.alumniOf).toEqual([{ '@type': 'EducationalOrganization', name: 'UTP' }]);
  });

  it('has one part per AI project, code repo only where public, credit kept', () => {
    expect(ld.hasPart.length).toBe(3);
    const finance = ld.hasPart.find((p: any) => p.name === 'AI Finance Agent');
    expect(finance['@type']).toBe('SoftwareSourceCode');
    expect(finance.codeRepository).toBe('https://github.com/ThonyFD/personal-dashboard');
    expect(ld.hasPart.find((p: any) => p.name === 'Datacentria')['@type']).toBe('CreativeWork');
    expect(ld.hasPart.find((p: any) => p.name === 'Agent Mesh Lab').description).toContain('aaronthewarrior');
  });

  it('contains no HTML in any string', () => {
    expect(JSON.stringify(ld)).not.toMatch(/</);
  });

  it('uses the /es URL for Spanish', () => {
    expect((buildProfileJsonLd(SNAPSHOT_FIXTURE.locales.es, 'es') as any).url).toBe('https://thonyfd.com/es');
  });
});
