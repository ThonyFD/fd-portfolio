// Browser check: without JS (or with the bundle blocked) every AI panel and entrance stays visible.
// Needs the design-taste-frontend skill's CDP helper. Usage: node scripts/checks/no-js.mjs http://localhost:8766/index.html
import { Browser, sleep } from '/Users/thonyfd/.claude/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const url = process.argv[2];
const b = await Browser.launch();
let failed = false;
for (const [label, js, width, block] of [['no-js desktop', false, 1440], ['no-js phone', false, 390], ['bundle blocked', true, 1440, true], ['js desktop', true, 1440]]) {
  const p = await b.newPage({ width, height: 900, mobile: width < 600 });
  await p.send('Emulation.setScriptExecutionDisabled', { value: !js });
  if (block) { await p.send('Network.enable'); await p.send('Network.setBlockedURLs', { urls: ['*main-*.js', '*chunk-*.js'] }); }
  await p.goto(url);
  await sleep(1500);
  const r = await p.eval(() => {
    const vis = (el) => { const cs = getComputedStyle(el); return cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.5; };
    return {
      panelsVisible: [...document.querySelectorAll('.panel')].filter(vis).length,
      panels: document.querySelectorAll('.panel').length,
      hiddenRise: [...document.querySelectorAll('.rise')].filter((e) => getComputedStyle(e).display !== 'contents' && parseFloat(getComputedStyle(e).opacity) < 0.5 && e.getBoundingClientRect().top < innerHeight).length,
      riseBelowHidden: [...document.querySelectorAll('.rise')].filter((e) => parseFloat(getComputedStyle(e).opacity) < 0.5).length,
    };
  });
  const ok = js && !block ? r.panelsVisible === 1 && r.hiddenRise === 0 : r.panelsVisible === r.panels && r.riseBelowHidden === 0;
  if (!ok) failed = true;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`, JSON.stringify(r));
  await p.close();
}
await b.close();
process.exit(failed ? 1 : 0);
