import { Component, computed, input } from '@angular/core';
import { Locale } from '../../../content/content.types';
import { STRINGS } from '../../../i18n/strings';
import { CONTACT_EMAIL, PERSON, SOCIAL } from '../../../seo/site';

@Component({
  selector: 'app-contact',
  template: `
    <section class="contact" id="contact" aria-labelledby="contact-h">
      <h2 id="contact-h" class="contact__invite rise">{{ s().contactInvite }}</h2>
      <a class="contact__name rise" [href]="mailto()" [attr.aria-label]="s().contactHeading + ': ' + email">{{ name }}</a>
      <ul class="contact__links rise">
        <li><a [href]="mailto()">{{ email }}</a></li>
        <li><a [href]="social.linkedin">LinkedIn</a></li>
        <li><a [href]="social.github">GitHub</a></li>
      </ul>
    </section>
  `,
})
export class ContactComponent {
  readonly locale = input.required<Locale>();
  protected readonly name = PERSON.name;
  protected readonly email = CONTACT_EMAIL;
  protected readonly social = SOCIAL;
  protected readonly s = computed(() => STRINGS[this.locale()]);
  protected readonly mailto = computed(() => `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(this.s().emailSubject)}`);
}
