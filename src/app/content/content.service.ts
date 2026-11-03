import { Injectable, InjectionToken, inject } from '@angular/core';
import snapshot from '../../content/snapshot.json';
import { Locale, LocaleContent, Section, SectionKind, Snapshot } from './content.types';

export const CONTENT_SNAPSHOT = new InjectionToken<Snapshot>('CONTENT_SNAPSHOT', {
  providedIn: 'root',
  factory: () => snapshot as Snapshot,
});

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly snapshot = inject(CONTENT_SNAPSHOT);

  get(locale: Locale): LocaleContent {
    return this.snapshot.locales[locale];
  }

  byKind(locale: Locale, kind: SectionKind): Section[] {
    return this.get(locale).sections.filter((s) => s.kind === kind);
  }
}
