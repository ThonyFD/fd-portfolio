import { Locale } from './content.types';

export interface Period {
  text: string;
  startIso?: string;
  endIso?: string;
}

const PRESENT: Record<Locale, string> = { en: 'Present', es: 'Actualidad' };

/** ISO 8601 form of the date formats found in Firestore, or undefined when the value is free text. */
function toIso(value: string): string | undefined {
  const v = value.trim();
  let m = v.match(/^(\d{1,2})\/(\d{4})$/);
  if (m) return `${m[2]}-${m[1].padStart(2, '0')}`;
  m = v.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
  if (m) return m[3] ? `${m[1]}-${m[2]}-${m[3]}` : `${m[1]}-${m[2]}`;
  if (/^\d{4}$/.test(v)) return v;
  return undefined;
}

export function formatPeriod(start: string | undefined, end: string | undefined, locale: Locale): Period {
  const endText = end && end.trim().toLowerCase() === 'now' ? PRESENT[locale] : end?.trim();
  const text = [start?.trim(), endText].filter(Boolean).join(' – ');
  const period: Period = { text };
  const startIso = start ? toIso(start) : undefined;
  const endIso = end ? toIso(end) : undefined;
  if (startIso) period.startIso = startIso;
  if (endIso) period.endIso = endIso;
  return period;
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'" };

/** Plain text from Firestore description HTML, safe for meta tags, JSON-LD and text files. */
export function stripHtml(html: string | undefined): string {
  if (!html) return '';
  return html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (all, code: string) => {
      if (code[0] === '#') {
        const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
        return String.fromCodePoint(n);
      }
      return ENTITIES[code.toLowerCase()] ?? all;
    })
    .replace(/\s+/g, ' ')
    .replace(/ ([,.;:!?])/g, '$1')
    .trim();
}
