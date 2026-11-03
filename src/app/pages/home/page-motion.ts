/**
 * Browser-only behaviour for the home page: staggered entrances, the name fitted to the
 * full measure, and the wordmark easing down as the first screen leaves. Returns a cleanup.
 */
export function startPageMotion(root: HTMLElement): () => void {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cleanups: (() => void)[] = [];

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        const siblings = [...(el.parentElement?.children ?? [])].filter((c) => c.classList.contains('rise'));
        el.style.transitionDelay = `${Math.min(3, Math.max(0, siblings.indexOf(el))) * 80}ms`;
        el.classList.add('in');
        io.unobserve(el);
      }
    },
    { threshold: 0, rootMargin: '0px 0px 15% 0px' },
  );
  root.querySelectorAll('.rise').forEach((el) => io.observe(el));
  cleanups.push(() => io.disconnect());

  const fit = () =>
    root.querySelectorAll<HTMLElement>('.hero__name, .contact__name').forEach((el) => {
      el.style.fontSize = '';
      const box = el.parentElement!;
      const cs = getComputedStyle(box);
      const avail = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const range = document.createRange();
      range.selectNodeContents(el);
      const width = range.getBoundingClientRect().width;
      if (width > 0) el.style.fontSize = `${Math.floor(parseFloat(getComputedStyle(el).fontSize) * (avail / width) * 10) / 10}px`;
    });
  document.fonts.ready.then(fit);
  addEventListener('resize', fit);
  cleanups.push(() => removeEventListener('resize', fit));

  const mark = root.querySelector<HTMLElement>('.hero__name');
  if (mark && !reduce) {
    const onScroll = () => {
      const p = Math.min(1, scrollY / innerHeight);
      mark.style.transform = `scale(${1 - p * 0.07})`;
    };
    addEventListener('scroll', onScroll, { passive: true });
    cleanups.push(() => removeEventListener('scroll', onScroll));
  }

  return () => cleanups.forEach((c) => c());
}
