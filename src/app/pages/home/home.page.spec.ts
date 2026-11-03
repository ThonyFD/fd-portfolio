import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CONTENT_SNAPSHOT } from '../../content/content.service';
import { SNAPSHOT_FIXTURE } from '../../testing/snapshot.fixture';
import { HomePage } from './home.page';

async function render(locale: 'en' | 'es'): Promise<HTMLElement> {
  TestBed.configureTestingModule({
    imports: [HomePage],
    providers: [provideRouter([]), { provide: CONTENT_SNAPSHOT, useValue: SNAPSHOT_FIXTURE }],
  });
  const fixture = TestBed.createComponent(HomePage);
  fixture.componentRef.setInput('locale', locale);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('HomePage', () => {
  it('has exactly one h1 with the full name', async () => {
    const el = await render('en');
    const h1s = el.querySelectorAll('h1');
    expect(h1s.length).toBe(1);
    expect(h1s[0].textContent?.trim()).toBe('Anthony Mosquera');
  });

  it('orders sections as the spec says', async () => {
    const el = await render('en');
    const ids = [...el.querySelectorAll('main section')].map((s) => s.id);
    expect(ids).toEqual(['ai-experience', 'experience', 'projects', 'skills', 'education', 'contact']);
  });

  it('lists experience most recent first, with Present for Now', async () => {
    const el = await render('en');
    const titles = [...el.querySelectorAll('#experience article h3')].map((h) => h.textContent?.trim());
    expect(titles).toEqual(['Solutions Architect', 'Junior Developer', 'Bare slot']);
    expect(el.querySelector('#experience')?.textContent).toContain('06/2026 – Present');
    expect(el.querySelector('#experience time[datetime="2009-08"]')).not.toBeNull();
  });

  it('renders slots with missing fields without undefined, null or empty tag lists', async () => {
    const el = await render('en');
    expect(el.textContent).not.toMatch(/undefined|null/);
    el.querySelectorAll('ul.tags').forEach((ul) => expect(ul.children.length).toBeGreaterThan(0));
  });

  it('puts compact projects in Earlier work, not as articles', async () => {
    const el = await render('en');
    const articles = [...el.querySelectorAll('#projects article h3')].map((h) => h.textContent?.trim());
    expect(articles).toEqual(['Banca Móvil']);
    expect(el.querySelector('#projects .earlier')?.textContent).toContain('Generali App');
  });

  it('shows the AI skills group first', async () => {
    const el = await render('en');
    expect(el.querySelector('#skills h3')?.textContent?.trim()).toBe('AI');
  });

  it('renders AI projects as tabs with stages and only real links', async () => {
    const el = await render('en');
    expect(el.querySelectorAll('#ai-experience [role="tab"]').length).toBe(2);
    expect(el.querySelector('#ai-experience ol.stages li')?.textContent).toContain('Agent message');
    const links = [...el.querySelectorAll('#ai-experience a')].map((a) => a.getAttribute('href'));
    expect(links).toEqual(['https://github.com/ThonyFD/personal-dashboard']);
  });

  it('omits sections a locale lacks without failing', async () => {
    const el = await render('es');
    expect(el.querySelector('#ai-experience')).toBeNull();
    expect(el.querySelector('#experience')).not.toBeNull();
    expect(el.querySelector('#contact a[href^="mailto:fdsystems.fd@gmail.com"]')).not.toBeNull();
  });
});
