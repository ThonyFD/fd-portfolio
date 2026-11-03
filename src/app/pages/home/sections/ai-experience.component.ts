import { Component, computed, input, signal } from '@angular/core';
import { Locale, Section } from '../../../content/content.types';
import { STRINGS } from '../../../i18n/strings';
import { TagsComponent, text } from './shared';

const STAGE_MS = 450;

@Component({
  selector: 'app-ai-experience',
  imports: [TagsComponent],
  template: `
    <section class="ai" id="ai-experience" aria-labelledby="ai-h">
      <div class="ai__head">
        <h2 id="ai-h" class="rise">{{ s().aiHeading }}</h2>
        <p class="ai__note rise">{{ s().aiNote }}</p>
      </div>
      <ul class="ai__list" [attr.aria-label]="s().aiHeading" [style.--n]="projects().length">
        @for (p of projects(); track p.title; let i = $index) {
          <li class="ai__item">
            <button
              class="ai__name rise"
              type="button"
              [id]="'t-' + i"
              [attr.aria-controls]="'p-' + i"
              [attr.aria-expanded]="active() === i"
              (click)="select(i)"
              (mouseenter)="select(i)"
              (keydown)="onKey($event, i)"
            >
              <span class="ai__title">{{ p.title }}</span>
              <span class="ai__meta">{{ meta(p) }}</span>
            </button>
            <article class="panel" role="region" [id]="'p-' + i" [attr.aria-labelledby]="'t-' + i" [class.is-active]="active() === i" data-ui>
              @if (p.summary || p.description) {
                <h3>{{ heading(p) }}</h3>
              }
              @if (p.description) {
                <div class="panel__summary" [innerHTML]="p.description"></div>
              } @else if (p.summary) {
                <p class="panel__summary">{{ p.summary }}</p>
              }
              @if (p.stages?.length) {
                <ol class="stages">
                  @for (stage of p.stages; track stage.name; let j = $index) {
                    <li class="stage" [class.is-lit]="lit()[i] > j"><b>{{ stage.name }}</b><span>{{ stage.detail }}</span></li>
                  }
                </ol>
                <button class="trace" type="button" [disabled]="running() === i" (click)="trace(i)">{{ s().sendEvent }}</button>
                <span class="trace__status" aria-live="polite">{{ status()[i] }}</span>
              }
              <app-tags [tags]="p.tags" />
              @for (link of p.links ?? []; track link.url) {
                <a class="panel__link" [href]="link.url">{{ link.label }}</a>
              }
            </article>
          </li>
        }
      </ul>
    </section>
  `,
})
export class AiExperienceComponent {
  readonly section = input.required<Section>();
  readonly locale = input.required<Locale>();
  protected readonly s = computed(() => STRINGS[this.locale()]);
  protected readonly projects = computed(() => this.section().slots);
  protected readonly active = signal(0);
  protected readonly lit = signal<Record<number, number>>({});
  protected readonly status = signal<Record<number, string>>({});
  protected readonly running = signal<number | null>(null);

  protected meta(p: Section): string {
    return [text(p.subTitle), p.start].filter(Boolean).join(' · ');
  }

  protected heading(p: Section): string {
    return p.label || text(p.subTitle) || p.title || '';
  }

  protected select(i: number): void {
    this.active.set(i);
  }

  protected onKey(event: KeyboardEvent, i: number): void {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    const n = this.projects().length;
    const next = (i + (event.key === 'ArrowDown' ? 1 : -1) + n) % n;
    this.select(next);
    (event.currentTarget as HTMLElement).closest('ul')?.querySelectorAll<HTMLElement>('.ai__name')[next]?.focus();
  }

  protected trace(i: number): void {
    const stages = this.projects()[i].stages ?? [];
    const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.running.set(i);
    this.lit.update((l) => ({ ...l, [i]: 0 }));
    stages.forEach((stage, j) =>
      setTimeout(() => {
        this.lit.update((l) => ({ ...l, [i]: j + 1 }));
        this.status.update((st) => ({ ...st, [i]: this.s().stageOf(j + 1, stages.length, stage.name) }));
        if (j === stages.length - 1) {
          setTimeout(() => {
            this.status.update((st) => ({ ...st, [i]: this.s().delivered }));
            this.running.set(null);
          }, STAGE_MS);
        }
      }, reduce ? 0 : j * STAGE_MS),
    );
  }
}
