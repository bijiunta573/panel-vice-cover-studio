// Fixed scenes for screenshots, driven by the ?shot= query the maker captures with.
// ?shot=cover draws one exported cover full-frame at an exact pixel size; ?shot=editor
// frames the whole studio with a composed cover loaded. Recognised parameters:
// layout, grade, size (square|portrait|wide), w and h (exact cover pixels for shot=cover),
// caption, subtitle, stars, scenes (comma-separated scene ids, one per panel), select.
// window.__shotReady is set only after fonts and two frames, so captures never race.

import { SIZES } from './layouts.js';
import { drawCover } from './render.js';
import { layoutById } from './layouts.js';

/** Applies the shared query parameters to the live studio state. */
function applyQuery(query, state) {
  if (query.get('layout')) state.layoutId = query.get('layout');
  if (query.get('grade')) state.gradeId = query.get('grade');
  if (query.get('caption') !== null) state.caption = query.get('caption');
  if (query.get('subtitle') !== null) state.subtitle = query.get('subtitle');
  if (query.get('stars') !== null) state.stars = Number(query.get('stars'));
  if (query.get('size')) state.sizeId = query.get('size');
  if (query.get('select') !== null) state.selected = Number(query.get('select'));
  const captionEl = document.getElementById('captionInput');
  const subtitleEl = document.getElementById('subtitleInput');
  if (captionEl) captionEl.value = state.caption;
  if (subtitleEl) subtitleEl.value = state.subtitle;
}

/** Points each panel at the scene the query names for it, when a scenes list is given. */
function applyScenes(query, state) {
  const list = query.get('scenes');
  if (!list) return;
  const ids = list.split(',').map((s) => s.trim()).filter(Boolean);
  const api = window.__coverStudio;
  ids.forEach((id, i) => { if (i < state.panels.length) api.setScene(i, id); });
}

/** Waits for the vendored display fonts so lettering in captures is the real thing. */
async function awaitFonts() {
  try {
    await Promise.race([
      Promise.all([
        document.fonts.load('100px "Anton"'),
        document.fonts.load('40px "Pacifico"'),
        document.fonts.ready,
      ]),
      new Promise((resolve) => setTimeout(resolve, 3500)),
    ]);
  } catch { /* fall back to whatever is ready */ }
}

function markReady() {
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}

export async function runShot(shot, query, state, canvas, redraw) {
  await awaitFonts();
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    applyQuery(query, state);
    // Rebuild panels for a possibly changed layout, then aim them at the query's scenes.
    window.__coverStudio.setLayout(state.layoutId);
    applyQuery(query, state);
    applyScenes(query, state);
    const size = SIZES[state.sizeId] ?? SIZES.portrait;
    canvas.width = Number(query.get('w') ?? size.w);
    canvas.height = Number(query.get('h') ?? size.h);
    drawCover(canvas, state, layoutById(state.layoutId));
  } else {
    applyQuery(query, state);
    window.__coverStudio.setLayout(state.layoutId);
    applyQuery(query, state);
    applyScenes(query, state);
    redraw();
  }
  markReady();
}
