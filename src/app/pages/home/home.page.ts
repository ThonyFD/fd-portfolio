import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { ContentService } from '../../content/content.service';
import { Locale } from '../../content/content.types';

@Component({
  selector: 'app-home',
  template: '<h1>{{ content().intro?.title }}</h1>',
})
export class HomePage {
  private readonly contentService = inject(ContentService);
  private readonly locale = toSignal(
    inject(ActivatedRoute).data.pipe(map((d) => (d['locale'] ?? 'en') as Locale)),
    { initialValue: 'en' as Locale },
  );
  protected readonly content = () => this.contentService.get(this.locale());
}
