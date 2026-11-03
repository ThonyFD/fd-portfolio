import { Snapshot } from '../content/content.types';

/** Small snapshot covering every section kind, including slots with missing fields. */
export const SNAPSHOT_FIXTURE: Snapshot = {
  generatedAt: '2026-11-03T00:00:00.000Z',
  preview: false,
  locales: {
    en: {
      intro: {
        id: 'introduction-en', kind: 'introduction', order: 0, title: 'ThonyFD',
        subTitle: 'Solutions Architect · AI Systems Engineer',
        summary: 'I design AI agent systems and run them in production.',
        tags: ['AI Agents', 'MCP'], slots: [],
      },
      sections: [
        {
          id: 'ai-experience-en', kind: 'ai-experience', order: 0.25, label: 'AI experience', slots: [
            {
              order: 0, title: 'Datacentria', subTitle: 'Agent middleware', start: '2026',
              summary: 'Event-driven middleware.', description: '<p>Event-driven middleware.</p>',
              tags: ['AWS'], stages: [{ name: 'Agent message', detail: 'GHL AI Studio posts to /webhooks' }], slots: [],
            },
            {
              order: 1, title: 'AI Finance Agent', subTitle: 'Gemini agent', start: '2026', slots: [],
              links: [{ label: 'View code on GitHub', url: 'https://github.com/ThonyFD/personal-dashboard' }],
            },
          ],
        },
        { id: 'projects-en', kind: 'projects', order: 0.5, label: 'Featured Projects', slots: [
          { order: 0, title: 'Generali App', start: '2012', compact: true, slots: [] },
          { order: 18, title: 'Banca Móvil', subTitle: 'Frontend lead · Banco General', start: '2018-08', tags: ['Angular'], slots: [] },
        ] },
        { id: 'experience-en', kind: 'experience', order: 1, label: 'Experience', slots: [
          { order: 0, title: 'Junior Developer', subTitle: 'Movistar Panamá', start: '08/2009', end: '05/2014', slots: [] },
          { order: 8, title: 'Solutions Architect', subTitle: 'ASSA', start: '06/2026', end: 'Now', slots: [] },
          { order: 9, title: 'Bare slot', slots: [] },
        ] },
        { id: 'tech-backend', kind: 'tech', order: 2, label: 'Backend', slots: [{ order: 0, title: 'NodeJS', subTitle: 'Expert', slots: [] }] },
        { id: 'tech-ai', kind: 'tech', order: 2, label: 'AI', slots: [{ order: 0, title: 'Claude Code', subTitle: 'Advance', slots: [] }] },
        { id: 'schooling-en', kind: 'schooling', order: 4, label: 'Education', slots: [{ order: 0, title: 'BSc Computer Science', subTitle: 'UTP', end: '2012', slots: [] }] },
        { id: 'courses-en', kind: 'courses', order: 5, label: 'Courses', slots: [{ order: 0, title: 'AZ-900', subTitle: 'Platzi', end: '2025', slots: [] }] },
      ],
    },
    es: {
      intro: { id: 'introduction-es', kind: 'introduction', order: 0, title: 'ThonyFD', subTitle: 'Arquitecto de Soluciones', slots: [] },
      sections: [{ id: 'experience-es', kind: 'experience', order: 1, label: 'Experiencia', slots: [] }],
    },
  },
};
