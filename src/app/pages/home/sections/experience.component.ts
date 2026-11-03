import { Component, computed, input } from '@angular/core';
import { Locale, Section } from '../../../content/content.types';
import { STRINGS } from '../../../i18n/strings';
import { CONTACT_EMAIL } from '../../../seo/site';
import { byStartDesc } from '../../../content/format';
import { PeriodComponent, TagsComponent, text } from './shared';

@Component({
  selector: 'app-experience',
  imports: [PeriodComponent, TagsComponent],
  template: `
    <section class="experience" id="experience" aria-labelledby="exp-h">
      <div class="experience__lead">
        <h2 id="exp-h" class="rise">{{ s().experienceHeading }}</h2>
        <p class="rise">{{ s().experienceIntro }}</p>
        <dl class="facts">
          <div class="rise"><dt>{{ s().facts.basedIn }}</dt><dd>{{ s().facts.basedInValue }}</dd></div>
          <div class="rise"><dt>{{ s().facts.works }}</dt><dd>{{ s().facts.worksValue }}</dd></div>
          <div class="rise"><dt>{{ s().facts.reach }}</dt><dd><a [href]="'mailto:' + email">{{ email }}</a></dd></div>
        </dl>
      </div>
      <figure class="experience__archive rise">
        <img src="assets/archive/gatun-locks-atlantic-1913.jpg" [alt]="archiveAlt()" width="1024" height="821" loading="lazy">
        <figcaption>{{ archiveCaption() }}</figcaption>
      </figure>
      <figure class="experience__portrait rise">
        <img src="assets/archive/profile.jpg" alt="Anthony Mosquera" width="704" height="1472" loading="lazy">
        <figcaption>Anthony Mosquera.</figcaption>
      </figure>
      <ol class="roles">
        @for (role of roles(); track $index) {
          <li>
            <article class="role rise">
              <h3>{{ role.title }}</h3>
              @if (org(role)) {
                <p class="role__org">{{ org(role) }}</p>
              }
              <app-period [start]="role.start" [end]="role.end" [locale]="locale()" />
              @if (role.description) {
                <div class="role__body" [innerHTML]="role.description"></div>
              }
              <app-tags [tags]="role.tags" />
            </article>
          </li>
        }
      </ol>
    </section>
  `,
})
export class ExperienceComponent {
  readonly section = input.required<Section>();
  readonly locale = input.required<Locale>();
  protected readonly email = CONTACT_EMAIL;
  protected readonly s = computed(() => STRINGS[this.locale()]);
  /** Recruiters read newest first; Firestore `order` has ties, so sort by start date. */
  protected readonly roles = computed(() => byStartDesc(this.section().slots));
  protected readonly archiveAlt = computed(() =>
    this.locale() === 'es'
      ? 'Remolcadores, dragas y barcazas esperando en las esclusas de Gatún, hacia el Atlántico, hacia 1913'
      : 'Tugs, dredges and barges waiting in the Gatun Locks, looking toward the Atlantic entrance, about 1913',
  );
  protected readonly archiveCaption = computed(() =>
    this.locale() === 'es' ? 'Esclusas de Gatún hacia el Atlántico, hacia 1913.' : 'Gatun Locks toward the Atlantic, about 1913.',
  );

  protected org(role: Section): string {
    return text(role.subTitle);
  }
}
