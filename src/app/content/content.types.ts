export type Locale = 'en' | 'es';

export type SectionKind =
  | 'introduction'
  | 'ai-experience'
  | 'experience'
  | 'projects'
  | 'tech'
  | 'courses'
  | 'schooling';

export interface Stage {
  name: string;
  detail: string;
}

export interface Link {
  label: string;
  url: string;
}

/** A Firestore portfolio document or one of its slots, as written by scripts/content/snapshot.mjs. */
export interface Section {
  id?: string;
  kind?: SectionKind;
  order: number;
  slots: Section[];
  color?: string;
  description?: string;
  end?: string;
  fit?: string;
  hasHeading?: boolean;
  icon?: string;
  isHead?: boolean;
  label?: string;
  locale?: string;
  logo?: string;
  orientation?: string;
  sizeLg?: number;
  start?: string;
  subTitle?: string;
  tags?: string[];
  title?: string;
  visible?: boolean;
  links?: Link[];
  stages?: Stage[];
  highlights?: string[];
  compact?: boolean;
  hidden?: boolean;
  summary?: string;
  staged?: boolean;
}

export interface LocaleContent {
  intro: Section | null;
  sections: Section[];
}

export interface Snapshot {
  generatedAt: string;
  preview: boolean;
  locales: Record<Locale, LocaleContent>;
}
