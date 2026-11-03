import { byStartDesc, formatPeriod, stripHtml } from './format';

describe('formatPeriod', () => {
  it('formats month/year ranges with ISO values', () => {
    expect(formatPeriod('08/2009', '05/2014', 'en')).toEqual({ text: '08/2009 – 05/2014', startIso: '2009-08', endIso: '2014-05' });
  });

  it('keeps a lone year-month start', () => {
    expect(formatPeriod('2018-08', undefined, 'en')).toEqual({ text: '2018-08', startIso: '2018-08' });
  });

  it('renders Now as Actualidad in Spanish without an end ISO', () => {
    const p = formatPeriod('06/2026', 'Now', 'es');
    expect(p.text).toBe('06/2026 – Actualidad');
    expect(p.endIso).toBeUndefined();
  });

  it('renders Now as Present in English', () => {
    expect(formatPeriod('06/2026', 'now', 'en').text).toBe('06/2026 – Present');
  });

  it('keeps free text ends as written', () => {
    expect(formatPeriod('01/2020', 'Freelance', 'en')).toEqual({ text: '01/2020 – Freelance', startIso: '2020-01' });
  });

  it('parses full dates and bare years', () => {
    expect(formatPeriod('2023-12-18', undefined, 'en').startIso).toBe('2023-12-18');
    expect(formatPeriod(undefined, '2012', 'en')).toEqual({ text: '2012', endIso: '2012' });
  });

  it('returns empty text when there are no dates', () => {
    expect(formatPeriod(undefined, undefined, 'en')).toEqual({ text: '' });
  });
});

describe('stripHtml', () => {
  it('removes tags and scripts, decodes entities, collapses whitespace', () => {
    expect(stripHtml('<b>A</b>&amp; <script>x</script>B')).toBe('A & B');
    expect(stripHtml('<p>Done</p>, then <b>more</b>.')).toBe('Done, then more.');
    expect(stripHtml('<p>One</p>\n   <p>Two&nbsp;&quot;3&quot;</p>')).toBe('One Two "3"');
  });

  it('handles undefined', () => {
    expect(stripHtml(undefined)).toBe('');
  });
});

describe('byStartDesc', () => {
  it('orders by start date newest first, undated last, stable for ties', () => {
    const slots = [
      { title: 'Tigo', start: '11/2021', order: 4, slots: [] },
      { title: 'Banca', start: '08/2018', order: 4, slots: [] },
      { title: 'Undated', order: 9, slots: [] },
      { title: 'Wicon', start: '01/2020', order: 5, slots: [] },
      { title: 'ASSA', start: '06/2026', order: 8, slots: [] },
      { title: 'Yappy', start: '2018-09', order: 3, slots: [] },
    ];
    expect(byStartDesc(slots).map((s) => s.title)).toEqual(['ASSA', 'Tigo', 'Wicon', 'Yappy', 'Banca', 'Undated']);
  });
});
