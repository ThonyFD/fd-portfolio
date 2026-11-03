import { Component, computed, input } from '@angular/core';
import { Locale, Section } from '../../../content/content.types';
import { STRINGS } from '../../../i18n/strings';
import { PeriodComponent, text } from './shared';

@Component({
  selector: 'app-education',
  imports: [PeriodComponent],
  template: `
    <section class="education" id="education" aria-labelledby="edu-h">
      <h2 id="edu-h" class="rise">{{ s().educationHeading }}</h2>
      <div class="education__cols">
        @for (group of groups(); track group.id) {
          <div class="education__group rise">
            <h3>{{ group.kind === 'courses' ? s().coursesHeading : s().educationHeading }}</h3>
            <ul>
              @for (item of group.slots; track $index) {
                <li>
                  <span class="education__title">{{ item.title }}</span>
                  @if (sub(item)) {
                    <span class="education__org">{{ sub(item) }}</span>
                  }
                  <app-period [start]="item.start" [end]="item.end" [locale]="locale()" />
                </li>
              }
            </ul>
          </div>
        }
      </div>
    </section>
  `,
})
export class EducationComponent {
  readonly sections = input.required<Section[]>();
  readonly locale = input.required<Locale>();
  protected readonly s = computed(() => STRINGS[this.locale()]);
  protected readonly groups = computed(() => this.sections());

  protected sub(item: Section): string {
    return text(item.subTitle);
  }
}
