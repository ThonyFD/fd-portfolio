import { Component, computed, input } from '@angular/core';
import { Locale, Section } from '../../../content/content.types';
import { STRINGS } from '../../../i18n/strings';
import { PeriodComponent, TagsComponent, text } from './shared';

@Component({
  selector: 'app-projects',
  imports: [PeriodComponent, TagsComponent],
  template: `
    <section class="projects" id="projects" aria-labelledby="proj-h">
      <h2 id="proj-h" class="rise">{{ s().projectsHeading }}</h2>
      <div class="projects__list">
        @for (p of featured(); track $index) {
          <article class="project rise">
            <h3>{{ p.title }}</h3>
            @if (sub(p)) {
              <p class="project__org">{{ sub(p) }}</p>
            }
            <app-period [start]="p.start" [end]="p.end" [locale]="locale()" />
            @if (p.description) {
              <div class="project__body" [innerHTML]="p.description"></div>
            }
            <app-tags [tags]="p.tags" />
          </article>
        }
      </div>
      @if (earlier().length) {
        <div class="earlier rise">
          <h3>{{ s().earlierWork }}</h3>
          <ul>
            @for (p of earlier(); track $index) {
              <li>{{ p.title }}@if (p.start) {<span>, {{ p.start }}</span>}</li>
            }
          </ul>
        </div>
      }
    </section>
  `,
})
export class ProjectsComponent {
  readonly section = input.required<Section>();
  readonly locale = input.required<Locale>();
  protected readonly s = computed(() => STRINGS[this.locale()]);
  protected readonly featured = computed(() => this.section().slots.filter((p) => !p.compact).reverse());
  protected readonly earlier = computed(() => this.section().slots.filter((p) => p.compact));

  protected sub(p: Section): string {
    return text(p.subTitle);
  }
}
