import { Component, computed, input } from '@angular/core';
import { Locale, Section } from '../../../content/content.types';
import { STRINGS } from '../../../i18n/strings';
import { text } from './shared';

@Component({
  selector: 'app-skills',
  template: `
    <section class="skills" id="skills" aria-labelledby="skills-h">
      <h2 id="skills-h" class="rise">{{ s().skillsHeading }}</h2>
      <div class="skills__groups">
        @for (group of groups(); track group.id) {
          <div class="skills__group rise">
            <h3>{{ group.label }}</h3>
            <ul>
              @for (skill of group.slots; track $index) {
                <li><span class="skill">{{ skill.title }}</span>@if (level(skill)) {<span class="skill__level">{{ level(skill) }}</span>}</li>
              }
            </ul>
          </div>
        }
      </div>
    </section>
  `,
})
export class SkillsComponent {
  readonly sections = input.required<Section[]>();
  readonly locale = input.required<Locale>();
  protected readonly s = computed(() => STRINGS[this.locale()]);
  /** The AI group leads; the rest keep their Firestore order. */
  protected readonly groups = computed(() => {
    const all = this.sections();
    return [...all.filter((g) => g.id?.startsWith('tech-ai')), ...all.filter((g) => !g.id?.startsWith('tech-ai'))];
  });

  protected level(skill: Section): string {
    return text(skill.subTitle);
  }
}
