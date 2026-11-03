import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { SeoService } from './seo.service';

describe('SeoService', () => {
  let seo: SeoService;
  let doc: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    seo = TestBed.inject(SeoService);
    doc = TestBed.inject(DOCUMENT);
  });

  const meta = { title: 'T', description: 'D', path: '/es', locale: 'es' as const, ogImage: '/og/og-es.png', jsonLd: { a: 1 } };

  it('sets title, description, canonical and OG with absolute URLs', () => {
    seo.apply(meta);
    expect(doc.title).toBe('T');
    expect(doc.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('D');
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://thonyfd.com/es');
    expect(doc.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe('https://thonyfd.com/es');
    expect(doc.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe('https://thonyfd.com/og/og-es.png');
    expect(doc.querySelector('meta[property="og:locale"]')?.getAttribute('content')).toBe('es_PA');
    expect(doc.querySelector('meta[name="twitter:card"]')?.getAttribute('content')).toBe('summary_large_image');
  });

  it('is idempotent: one canonical, one JSON-LD script, three hreflang links', () => {
    seo.apply(meta);
    seo.apply({ ...meta, path: '/', locale: 'en' });
    expect(doc.querySelectorAll('link[rel="canonical"]').length).toBe(1);
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://thonyfd.com/');
    expect(doc.querySelectorAll('script#ld-profile').length).toBe(1);
    const alternates = [...doc.querySelectorAll('link[rel="alternate"][hreflang]')].map((l) => `${l.getAttribute('hreflang')}=${l.getAttribute('href')}`);
    expect(alternates.sort()).toEqual(['en=https://thonyfd.com/', 'es=https://thonyfd.com/es', 'x-default=https://thonyfd.com/']);
  });

  it('removes the JSON-LD script when a page has none', () => {
    seo.apply(meta);
    seo.apply({ ...meta, jsonLd: undefined });
    expect(doc.querySelector('script#ld-profile')).toBeNull();
  });

  it('drops hreflang links for pages without language alternates', () => {
    seo.apply(meta);
    seo.apply({ ...meta, path: '/fd-systems', alternates: false });
    expect(doc.querySelectorAll('link[rel="alternate"][hreflang]').length).toBe(0);
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://thonyfd.com/fd-systems');
  });
});
