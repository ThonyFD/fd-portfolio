import { Component, computed, input } from '@angular/core';
import { formatPeriod, stripHtml } from '../../../content/format';
import { Locale } from '../../../content/content.types';

/** A slot's date range, with machine-readable <time> elements where the dates parse. */
@Component({
  selector: 'app-period',
  template: `
    @if (period().text) {
      <span class="period">
        @if (period().startIso && period().endIso) {
          <time [attr.datetime]="period().startIso">{{ start() }}</time> – <time [attr.datetime]="period().endIso">{{ end() }}</time>
        } @else if (period().startIso) {
          <time [attr.datetime]="period().startIso">{{ period().text }}</time>
        } @else if (period().endIso) {
          <time [attr.datetime]="period().endIso">{{ period().text }}</time>
        } @else {
          {{ period().text }}
        }
      </span>
    }
  `,
})
export class PeriodComponent {
  readonly start = input<string>();
  readonly end = input<string>();
  readonly locale = input.required<Locale>();
  protected readonly period = computed(() => formatPeriod(this.start(), this.end(), this.locale()));
}

/** Tag list that renders nothing when there are no tags. */
@Component({
  selector: 'app-tags',
  template: `
    @if (tags()?.length) {
      <ul class="tags">
        @for (tag of tags(); track tag) {
          <li>{{ tag }}</li>
        }
      </ul>
    }
  `,
})
export class TagsComponent {
  readonly tags = input<string[]>();
}

/** Plain text of a Firestore field that may carry HTML. */
export const text = (value: string | undefined): string => stripHtml(value);
