import { TestBed } from '@angular/core/testing';
import { CONTENT_SNAPSHOT, ContentService } from './content.service';
import { Snapshot } from './content.types';

const fixture: Snapshot = {
  generatedAt: '2026-11-03T00:00:00.000Z',
  preview: false,
  locales: {
    en: {
      intro: { id: 'introduction-en', kind: 'introduction', order: 0, title: 'ThonyFD', slots: [] },
      sections: [
        { id: 'experience-en', kind: 'experience', order: 1, slots: [] },
        { id: 'courses-en', kind: 'courses', order: 5, slots: [] },
      ],
    },
    es: {
      intro: { id: 'introduction-es', kind: 'introduction', order: 0, title: 'ThonyFD ES', slots: [] },
      sections: [{ id: 'experience-es', kind: 'experience', order: 1, slots: [] }],
    },
  },
};

describe('ContentService', () => {
  let service: ContentService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [{ provide: CONTENT_SNAPSHOT, useValue: fixture }] });
    service = TestBed.inject(ContentService);
  });

  it('returns the intro for a locale', () => {
    expect(service.get('en').intro?.title).toBe('ThonyFD');
    expect(service.get('es').intro?.title).toBe('ThonyFD ES');
  });

  it('returns sections of a kind, empty when the locale has none', () => {
    expect(service.byKind('en', 'courses').map((s) => s.id)).toEqual(['courses-en']);
    expect(service.byKind('es', 'courses')).toEqual([]);
  });
});
