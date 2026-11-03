# Visual direction (approved 2026-11-03)

Source comp: `docs/design/mockup/index.html` (screenshots in `docs/design/mockup/screenshots/`).
Dealt with design-taste-frontend: direction **Type and nothing else** (seed 379427772), hero "Name across the middle",
AI section redrawn to "Big names, fixed preview". User changed type to the Roboto family.

## Idea

The Panama Canal locks (Panama, the world's oldest middleware between two oceans) become the stage-by-stage path a
real event takes through each AI system. Live thing: "Send a test event" lights each stage of the active project in turn.

## Tokens

| Token | Light | Dark |
| --- | --- | --- |
| `--carmine` (hero field) | `#9c1220` | `#8a101c` |
| `--carmine-ink` | `#ffffff` | `#ffffff` |
| `--carmine-muted` | `#f6c9cc` | `#f6c9cc` |
| `--pink` (actions, lit stage) | `#ffd9dc` | `#ffd9dc` |
| `--navy` (AI field) | `#0b2341` | `#081a31` |
| `--navy-surface` (panel) | `#12305a` | `#0f2849` |
| `--navy-stage` (lock) | `#0a1d36` | `#0a1d36` |
| `--navy-ink` / `--navy-muted` | `#ffffff` / `#a9b9cf` | same |
| `--bg` / `--ink` / `--muted` | `#f7f7f5` / `#141414` / `#555555` | `#0f0f10` / `#f2f2f0` / `#b3b3b0` |
| `--foot-name` | `#9c1220` | `#ff8a94` |

Colours come from the Panama flag (red, blue, white). One radius: 0 (square). No gradients, shadows, rules, glass.

## Type

- Display: **Roboto Flex**, `font-variation-settings: "opsz" 144, "wdth" 125`, weight 250, tracking -0.03em, leading 1.
  The name is fitted by script to the full measure (`(100vw - 2*margin)` starting size `/ 8.2`).
- Project names: Roboto Flex weight 300, `"opsz" 96, "wdth" 100`, `--step-head` = `clamp(2.75rem, 1.6rem + 3.9vw, 5rem)`.
- Text: **Roboto** 400/500. Steps: small `1rem`, body `clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)`,
  lead `clamp(1.25rem, 1.1rem + 0.7vw, 1.625rem)`, section heading `1.75rem`.
- Google Fonts: `Roboto+Flex:opsz,wdth,wght@8..144,25..151,100..1000` and `Roboto:wght@400;500`.

## Layout

- Margin `clamp(16px, 2vw, 32px)`, equal both sides. Sections 120-160px apart (96-120 on phone).
- Hero (carmine, 100svh): top-left role (lead) + sentence (body, muted) + "Email me" pink block; top-right nav
  (AI work, Experience, Resume, Español); name across the middle; bottom-left "Panama City · GMT-5 · English and Spanish";
  bottom-right LinkedIn, GitHub. Phone: nav first, intro full width, button full width, name, then a 4:5 archive photo.
- Archive band: Gatun Locks 1913 panorama full width, grayscale, caption ending "so do the events below".
- AI experience (navy): heading 28px + note right; names 8 cols, sticky panel 4 cols (`top: 12vh`).
  Panel: h3, summary, the locks (`ol`, each stage indented 10px more), "Send a test event", status (`aria-live`), tags, link.
  Tabs: `role=tablist`, arrows move, hover selects on desktop. Phone: name then its panel, all panels visible.
- Experience/where (bg): text + facts, archive photo 4:5, portrait 4:5 (3 cols desktop, 2 on tablet).
- Footer: invite line, name fitted again in `--foot-name`, photo credits.

## Motion

Entrance `.rise` (opacity + 24px rise, 600ms, 80ms stagger per sibling), band image slow scale 1.08 to 1, hero name
scales down to 0.93 over the first screen, button press/hover lift 2px, lock light-up 450ms per stage. All off under
`prefers-reduced-motion`; content visible without script.

## Pictures and credits (public domain, Wikimedia Commons)

- "Panama Canal Gatun Locks 1913", Isthmian Historical Society (band)
- "Testing the Emergency Dam, Gatun Locks", Ernest Hallen, 1913 (phone hero)
- "Gatun locks looking toward Atlantic entrance of canal", Byron Company, about 1913 (experience)
- Portrait: Firebase Storage `profile.png` (the user's own; consider a neutral replacement)
