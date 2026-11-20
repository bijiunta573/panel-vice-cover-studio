# Panel Vice: Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/bijiunta573/panel-vice-cover-studio/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/bijiunta573/panel-vice-cover-studio/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Panel Vice: Cover Studio** is a fully offline, vanilla-JS cover maker in the multi-panel
GTA poster style. Drop in your own photo — or start from the built-in scene library — frame
it across bold polygonal panels, letter a title over it, and export a share-ready PNG.
No build step, no network requests, no uploads: every file the app loads ships in `app/`,
and your photos never leave your machine.

## What's inside

- **7 polygonal panel layouts** — Hero Grid, Vice Classic (six panels), Diagonal Rush,
  Skyline Stack, Triad, Mosaic Nine and Spotlight, each panel clipped to its own polygon
  with white keyline inking.
- **5 colour grades** — Sunset Vice, Neon Nights, Golden Hour, Midnight Bay and Mono Noir,
  each a filter chain plus a tint wash, with **per-panel grade overrides** when one panel
  needs a different mood.
- **12 original illustrated scenes** — hero character, hero car, marina, beach, neon street,
  coast road, palm boulevard, rooftop, lowrider meet, boardwalk, speedboat and skyline dusk,
  all generated for this app. No borrowed artwork, logos or fonts.
- **Direct panel editing** — click a panel to select it, drag to pan its photo, scroll or
  use the zoom slider to reframe, centre it again in one click, cycle scenes per panel, or
  fill every panel with one photo and drag each into place.
- **Poster lettering** — a sunset-gradient display title in vendored Anton (SIL OFL), a neon
  script subtitle in vendored Pacifico (SIL OFL), a heat-star row and a badge ribbon, all
  drawn by the app itself.
- **One-step export** — PNG at **1080 × 1080**, **1080 × 1350** or **1920 × 1080**, rendered
  at full resolution from the same canvas pipeline as the preview.
- **Automation hook** — `window.__coverStudio` exposes layout / grade / scene / caption
  setters and `exportPNG()`, which is also how the screenshots in `screenshots/` were made.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

## Hand it in (dossier)

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output
directory and writes `dossier.json` with `buildDossier` from `vendor/makefun-app.ts`.

## Layout of the repo

- `app/index.html`, `app/style.css` — the studio page and its styling.
- `app/src/layouts.js` — scene library, colour grades and the seven polygon layouts.
- `app/src/render.js` — the canvas cover renderer (panels, grades, grain, title block).
- `app/src/editor.js` — click / drag / wheel panel editing gestures.
- `app/src/main.js` — state, controls, uploads, export and the `__coverStudio` hook.
- `app/src/shots.js` — the `?shot=` scenes used to capture the screenshots.
- `app/scenes/` — the twelve scene illustrations. `app/fonts/` — Anton and Pacifico with
  their SIL Open Font License texts.
- `screenshots/` — four captures from the running app: exported covers in all three post
  sizes and the editor at work.

---

<sub>Entered on [make.fun](https://make.fun/?ref=w7sqj453&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
