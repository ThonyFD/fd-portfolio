import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FdSystemsPage } from './fd-systems.page';

describe('FdSystemsPage', () => {
  async function render(): Promise<HTMLElement> {
    await TestBed.configureTestingModule({ imports: [FdSystemsPage], providers: [provideRouter([])] }).compileComponents();
    const fixture = TestBed.createComponent(FdSystemsPage);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('keeps the contact email and the Hablemos call to action', async () => {
    const el = await render();
    expect(el.querySelector('a[href="mailto:contact@fdsystems.dev"]')).not.toBeNull();
    expect(el.textContent).toContain('Hablemos');
  });

  it('renders all six services and three differentiators', async () => {
    const el = await render();
    expect(el.querySelectorAll('#services .fds-card').length).toBe(6);
    expect(el.querySelectorAll('#why-us .fds-diff-card').length).toBe(3);
  });

  it('has no Ionic elements', async () => {
    const el = await render();
    expect(el.innerHTML).not.toMatch(/<ion-/);
  });
});
