import { Component, computed, inject, input } from '@angular/core';
import { ContentService } from '../../content/content.service';
import { Locale } from '../../content/content.types';
import { STRINGS } from '../../i18n/strings';
import { AiExperienceComponent } from './sections/ai-experience.component';
import { ContactComponent } from './sections/contact.component';
import { EducationComponent } from './sections/education.component';
import { ExperienceComponent } from './sections/experience.component';
import { HeroComponent } from './sections/hero.component';
import { ProjectsComponent } from './sections/projects.component';
import { SkillsComponent } from './sections/skills.component';

@Component({
  selector: 'app-home',
  imports: [AiExperienceComponent, ContactComponent, EducationComponent, ExperienceComponent, HeroComponent, ProjectsComponent, SkillsComponent],
  templateUrl: './home.page.html',
})
export class HomePage {
  /** Bound from route data (withComponentInputBinding). */
  readonly locale = input<Locale>('en');

  private readonly content = inject(ContentService);
  protected readonly s = computed(() => STRINGS[this.locale()]);
  protected readonly intro = computed(() => this.content.get(this.locale()).intro);
  protected readonly ai = computed(() => this.content.byKind(this.locale(), 'ai-experience')[0]);
  protected readonly experience = computed(() => this.content.byKind(this.locale(), 'experience')[0]);
  protected readonly projects = computed(() => this.content.byKind(this.locale(), 'projects')[0]);
  protected readonly skills = computed(() => this.content.byKind(this.locale(), 'tech'));
  protected readonly education = computed(() => [
    ...this.content.byKind(this.locale(), 'schooling'),
    ...this.content.byKind(this.locale(), 'courses'),
  ]);
}
