import { Component, computed, input } from '@angular/core';
import { Locale, Section } from '../../../content/content.types';
import { STRINGS } from '../../../i18n/strings';
import { CONTACT_EMAIL, PERSON, SOCIAL } from '../../../seo/site';
import { text } from './shared';

@Component({
  selector: 'app-hero',
  template: `
    <header class="hero">
      <div class="hero__intro">
        <p class="hero__role rise">{{ role() }}</p>
        <p class="hero__sentence rise">{{ sentence() }}</p>
        <a class="btn rise" [href]="mailto()">{{ s().emailMe }}</a>
      </div>
      <nav class="hero__nav" [attr.aria-label]="s().nav.ai">
        <a href="#ai-experience">{{ s().nav.ai }}</a>
        <a href="#experience">{{ s().nav.experience }}</a>
        <a href="/resume.md">{{ s().nav.resume }}</a>
        <a [href]="s().nav.otherLocaleHref" [attr.hreflang]="s().nav.otherLocaleLang" [attr.lang]="s().nav.otherLocaleLang">{{ s().nav.otherLocale }}</a>
      </nav>
      <h1 class="hero__name" id="wordmark">{{ name }}</h1>
      <figure class="hero__shot" aria-hidden="true">
        <img src="assets/archive/gatun-emergency-dam-1913.jpg" alt="" width="1289" height="830">
      </figure>
      <div class="hero__corner"><p>{{ s().place }}</p></div>
      <div class="hero__corner hero__corner--right">
        <a [href]="social.linkedin">LinkedIn</a>
        <a [href]="social.github">GitHub</a>
      </div>
    </header>
  `,
})
export class HeroComponent {
  readonly intro = input<Section | null>(null);
  readonly locale = input.required<Locale>();
  protected readonly name = PERSON.name;
  protected readonly social = SOCIAL;
  protected readonly s = computed(() => STRINGS[this.locale()]);
  protected readonly role = computed(() => this.s().role);
  protected readonly sentence = computed(() => text(this.intro()?.summary) || this.s().sentence);
  protected readonly mailto = computed(() => `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(this.s().emailSubject)}`);
}
