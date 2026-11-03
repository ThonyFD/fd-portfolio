import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Locale } from '../content/content.types';
import { SITE_URL } from './site';

export interface PageMeta {
  title: string;
  description: string;
  /** Path on the canonical origin, starting with "/". */
  path: string;
  locale: Locale;
  ogImage: string;
  jsonLd?: object;
  /** Emit en/es hreflang links (home pages only). Defaults to true. */
  alternates?: boolean;
}

const OG_LOCALE: Record<Locale, string> = { en: 'en_US', es: 'es_PA' };
const ALTERNATES: [string, string][] = [
  ['en', '/'],
  ['es', '/es'],
  ['x-default', '/'],
];

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  apply(page: PageMeta): void {
    const url = SITE_URL + page.path;
    const image = page.ogImage.startsWith('http') ? page.ogImage : SITE_URL + page.ogImage;

    this.title.setTitle(page.title);
    this.meta.updateTag({ name: 'description', content: page.description });
    this.meta.updateTag({ property: 'og:type', content: 'profile' });
    this.meta.updateTag({ property: 'og:site_name', content: 'Anthony Mosquera' });
    this.meta.updateTag({ property: 'og:title', content: page.title });
    this.meta.updateTag({ property: 'og:description', content: page.description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:image:width', content: '1200' });
    this.meta.updateTag({ property: 'og:image:height', content: '630' });
    this.meta.updateTag({ property: 'og:locale', content: OG_LOCALE[page.locale] });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: page.title });
    this.meta.updateTag({ name: 'twitter:description', content: page.description });
    this.meta.updateTag({ name: 'twitter:image', content: image });

    this.link('canonical', url);
    this.document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((l) => l.remove());
    for (const [lang, path] of page.alternates === false ? [] : ALTERNATES) {
      const link = this.document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', lang);
      link.setAttribute('href', SITE_URL + path);
      this.document.head.appendChild(link);
    }

    this.document.getElementById('ld-profile')?.remove();
    if (page.jsonLd) {
      const script = this.document.createElement('script');
      script.id = 'ld-profile';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(page.jsonLd).replace(/</g, '\\u003c');
      this.document.head.appendChild(script);
    }
  }

  private link(rel: string, href: string): void {
    let link = this.document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', rel);
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }
}
