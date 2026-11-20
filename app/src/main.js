// Panel Vice: Cover Studio — page wiring.
// Holds the cover state, builds the control panel from the layout / grade / scene data,
// loads the scene library, wires uploads and exports, and exposes window.__coverStudio
// so the app can be driven (and screenshotted) programmatically.

import { GRADES, LAYOUTS, SCENES, SIZES, gradeById, layoutById } from './layouts.js';
import { drawCover } from './render.js';
import { attachEditor, centreView } from './editor.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('stage');
const statusEl = document.getElementById('statusEl');
const captionInput = document.getElementById('captionInput');
const subtitleInput = document.getElementById('subtitleInput');
const starsRange = document.getElementById('starsRange');
const starsValue = document.getElementById('starsValue');
const zoomRange = document.getElementById('zoomRange');
const zoomValue = document.getElementById('zoomValue');
const selectedLabel = document.getElementById('selectedLabel');
const gradeOverrideSel = document.getElementById('gradeOverrideSel');

const sceneImages = new Map();
let uploadImage = null;

const state = {
  layoutId: 'hero-grid',
  gradeId: 'sunset-vice',
  caption: 'PANEL VICE',
  subtitle: 'neon coast',
  stars: 5,
  sizeId: 'portrait',
  selected: 0,
  panels: [],
};

/** A fresh per-panel view: a scene image plus its framing and optional grade override. */
function freshView(sceneId) {
  return { sceneId, img: sceneImages.get(sceneId) ?? null, zoom: 1, ox: 0, oy: 0, gradeId: null };
}

/** Rebuilds the panel views for the current layout, keeping the layout's default scenes. */
function resetPanels() {
  const layout = layoutById(state.layoutId);
  state.panels = layout.panels.map((panel) => freshView(panel.scene));
  state.selected = 0;
}

/** Loads an image from a URL inside app/, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** Loads every scene in the library so panels and thumbnails are instant. */
async function loadScenes() {
  await Promise.all(SCENES.map(async (scene) => {
    sceneImages.set(scene.id, await loadImage(scene.file));
  }));
  for (const view of state.panels) {
    if (!view.img) view.img = sceneImages.get(view.sceneId) ?? null;
  }
}

/** Repaints the preview at a resolution matched to the chosen aspect. */
function redraw() {
  const size = SIZES[state.sizeId];
  const scale = 864 / size.w;
  canvas.width = Math.round(size.w * scale);
  canvas.height = Math.round(size.h * scale);
  drawCover(canvas, state, layoutById(state.layoutId), { mark: true });
  syncPanelTools();
}

/** Keeps the selected-panel controls honest about the current selection. */
function syncPanelTools() {
  const view = state.panels[state.selected];
  selectedLabel.textContent = view
    ? `Panel ${state.selected + 1} of ${state.panels.length} — ${sceneLabel(view.sceneId)}`
    : 'No panel selected';
  if (view) {
    zoomRange.value = String(Math.round((view.zoom ?? 1) * 100));
    zoomValue.textContent = `${Math.round((view.zoom ?? 1) * 100)}%`;
    gradeOverrideSel.value = view.gradeId ?? '';
  }
  document.querySelectorAll('.scene-thumb').forEach((el, i) => {
    el.classList.toggle('on', view?.sceneId === SCENES[i].id);
  });
}

function sceneLabel(sceneId) {
  if (sceneId === 'upload') return 'your photo';
  return SCENES.find((s) => s.id === sceneId)?.label ?? sceneId;
}

function setStatus(text) { statusEl.textContent = text; }

/** Applies a scene (library id or 'upload') to the selected panel. */
function applyScene(sceneId) {
  const view = state.panels[state.selected];
  if (!view) return;
  view.sceneId = sceneId;
  view.img = sceneId === 'upload' ? uploadImage : sceneImages.get(sceneId) ?? null;
  centreView(view);
  redraw();
}

/** Builds the layout chips, grade chips, scene thumbnails and the override select. */
function buildControls() {
  const layoutGrid = document.getElementById('layoutGrid');
  for (const layout of LAYOUTS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip' + (layout.id === state.layoutId ? ' on' : '');
    btn.dataset.layout = layout.id;
    btn.innerHTML = '';
    btn.append(`${layout.label}`);
    const small = document.createElement('small');
    small.textContent = `${layout.panels.length} panels · ${layout.blurb}`;
    btn.append(small);
    btn.addEventListener('click', () => {
      state.layoutId = layout.id;
      layoutGrid.querySelectorAll('.chip').forEach((c) => c.classList.toggle('on', c.dataset.layout === layout.id));
      resetPanels();
      redraw();
    });
    layoutGrid.append(btn);
  }

  const gradeRow = document.getElementById('gradeRow');
  for (const grade of GRADES) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip' + (grade.id === state.gradeId ? ' on' : '');
    btn.dataset.grade = grade.id;
    btn.textContent = grade.label;
    btn.title = grade.blurb;
    btn.addEventListener('click', () => {
      state.gradeId = grade.id;
      gradeRow.querySelectorAll('.chip').forEach((c) => c.classList.toggle('on', c.dataset.grade === grade.id));
      redraw();
    });
    gradeRow.append(btn);
  }

  const sceneGrid = document.getElementById('sceneGrid');
  for (const scene of SCENES) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'scene-thumb';
    btn.title = scene.label;
    btn.dataset.scene = scene.id;
    const img = document.createElement('img');
    img.src = scene.file;
    img.alt = scene.label;
    btn.append(img);
    btn.addEventListener('click', () => applyScene(scene.id));
    sceneGrid.append(btn);
  }

  gradeOverrideSel.append(new Option('Use cover grade', ''));
  for (const grade of GRADES) gradeOverrideSel.append(new Option(grade.label, grade.id));
  gradeOverrideSel.addEventListener('change', () => {
    const view = state.panels[state.selected];
    if (view) { view.gradeId = gradeOverrideSel.value || null; redraw(); }
  });

  document.querySelectorAll('#sizeSeg button').forEach((btn) => {
    btn.classList.toggle('on', btn.dataset.size === state.sizeId);
    btn.addEventListener('click', () => {
      state.sizeId = btn.dataset.size;
      document.querySelectorAll('#sizeSeg button').forEach((b) => b.classList.toggle('on', b === btn));
      redraw();
    });
  });
}

/** Renders the cover at full export resolution on an offscreen canvas and saves the PNG. */
function exportPNG() {
  const size = SIZES[state.sizeId];
  const out = document.createElement('canvas');
  out.width = size.w; out.height = size.h;
  drawCover(out, state, layoutById(state.layoutId));
  out.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `panel-vice-${size.w}x${size.h}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    setStatus(`Saved panel-vice-${size.w}x${size.h}.png`);
  }, 'image/png');
}

/** Deterministic shuffle so a "surprise" never repeats the current arrangement exactly. */
function shuffledScenes() {
  const ids = SCENES.map((s) => s.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
}

function wireActions() {
  captionInput.addEventListener('input', () => { state.caption = captionInput.value; redraw(); });
  subtitleInput.addEventListener('input', () => { state.subtitle = subtitleInput.value; redraw(); });
  starsRange.addEventListener('input', () => {
    state.stars = Number(starsRange.value);
    starsValue.textContent = String(state.stars);
    redraw();
  });
  zoomRange.addEventListener('input', () => {
    const view = state.panels[state.selected];
    if (!view) return;
    view.zoom = Number(zoomRange.value) / 100;
    zoomValue.textContent = `${zoomRange.value}%`;
    redraw();
  });
  document.getElementById('centerBtn').addEventListener('click', () => {
    const view = state.panels[state.selected];
    if (view) { centreView(view); redraw(); }
  });
  document.getElementById('cycleBtn').addEventListener('click', () => {
    const view = state.panels[state.selected];
    if (!view) return;
    const idx = SCENES.findIndex((s) => s.id === view.sceneId);
    applyScene(SCENES[(idx + 1) % SCENES.length].id);
  });
  document.getElementById('fillAllBtn').addEventListener('click', () => {
    const view = state.panels[state.selected];
    if (!view) return;
    for (const panel of state.panels) {
      panel.sceneId = view.sceneId;
      panel.img = view.img;
    }
    redraw();
    setStatus(`Every panel now shows ${sceneLabel(view.sceneId)} — drag each one to reframe it.`);
  });
  document.getElementById('shuffleBtn').addEventListener('click', () => {
    const ids = shuffledScenes();
    state.panels.forEach((view, i) => {
      view.sceneId = ids[i % ids.length];
      view.img = sceneImages.get(view.sceneId) ?? null;
      centreView(view);
    });
    redraw();
  });
  document.getElementById('surpriseBtn').addEventListener('click', () => {
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    state.layoutId = pick(LAYOUTS).id;
    state.gradeId = pick(GRADES).id;
    document.querySelectorAll('#layoutGrid .chip').forEach((c) => c.classList.toggle('on', c.dataset.layout === state.layoutId));
    document.querySelectorAll('#gradeRow .chip').forEach((c) => c.classList.toggle('on', c.dataset.grade === state.gradeId));
    resetPanels();
    document.getElementById('shuffleBtn').click();
    setStatus(`Surprise: ${layoutById(state.layoutId).label} in ${gradeById(state.gradeId).label}.`);
  });
  document.getElementById('exportBtn').addEventListener('click', exportPNG);
  document.getElementById('uploadInput').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    uploadImage = await loadImage(URL.createObjectURL(file));
    applyScene('upload');
    setStatus('Your photo is in the selected panel — drag to pan, scroll to zoom.');
  });
  attachEditor(canvas, {
    getLayout: () => layoutById(state.layoutId),
    getState: () => state,
    onSelect: (i) => { state.selected = i; redraw(); },
    onChange: () => redraw(),
  });
}

/** Reflects the current layout / grade / size state onto the control chips. */
function reflectControls() {
  document.querySelectorAll('#layoutGrid .chip').forEach((c) => c.classList.toggle('on', c.dataset.layout === state.layoutId));
  document.querySelectorAll('#gradeRow .chip').forEach((c) => c.classList.toggle('on', c.dataset.grade === state.gradeId));
  document.querySelectorAll('#sizeSeg button').forEach((b) => b.classList.toggle('on', b.dataset.size === state.sizeId));
}

/** The automation hook: lets a driver (or the screenshot scenes) run the studio. */
window.__coverStudio = {
  getState: () => JSON.parse(JSON.stringify({ ...state, panels: state.panels.map(({ img, ...rest }) => rest) })),
  setLayout: (id) => { state.layoutId = id; resetPanels(); reflectControls(); redraw(); },
  setGrade: (id) => { state.gradeId = id; reflectControls(); redraw(); },
  setCaption: (text) => { state.caption = text; captionInput.value = text; redraw(); },
  setSubtitle: (text) => { state.subtitle = text; subtitleInput.value = text; redraw(); },
  setSize: (id) => { state.sizeId = id; reflectControls(); redraw(); },
  setScene: (panel, sceneId) => {
    const view = state.panels[panel];
    if (view) { view.sceneId = sceneId; view.img = sceneImages.get(sceneId) ?? null; redraw(); }
  },
  select: (i) => { state.selected = i; redraw(); },
  exportPNG,
  scenes: SCENES.map((s) => s.id),
  layouts: LAYOUTS.map((l) => l.id),
  grades: GRADES.map((g) => g.id),
};

async function boot() {
  resetPanels();
  buildControls();
  wireActions();
  redraw();
  await loadScenes();
  redraw();
  const query = new URLSearchParams(location.search);
  const shot = query.get('shot');
  if (shot) await runShot(shot, query, state, canvas, redraw);
  else window.__shotReady = true;
}

boot();
