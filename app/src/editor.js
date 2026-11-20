// Panel Vice editor gestures: clicking a panel selects it, dragging pans its photo inside
// the polygon, and the mouse wheel zooms the selected panel's photo around its centre.
// All coordinates are normalised, so the gestures behave the same at any preview size.

import { pointInPanel } from './layouts.js';

/** Returns the topmost panel index under a normalised point, or -1 when none is hit. */
export function panelAt(layout, x, y) {
  for (let i = layout.panels.length - 1; i >= 0; i--) {
    if (pointInPanel(layout.panels[i], x, y)) return i;
  }
  return -1;
}

/** Converts a pointer event on the canvas into normalised cover coordinates. */
export function eventPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) / rect.width,
    y: (event.clientY - rect.top) / rect.height,
  };
}

const clampPan = (v) => Math.max(-1, Math.min(1, v));

/**
 * Attaches the pointer gestures to the preview canvas.
 * `hooks` is { getLayout, getState, onSelect, onChange } supplied by main.js; the editor
 * mutates the selected panel's view (ox, oy, zoom) and reports through the hooks.
 */
export function attachEditor(canvas, hooks) {
  let drag = null;

  canvas.addEventListener('pointerdown', (event) => {
    const pt = eventPoint(canvas, event);
    const layout = hooks.getLayout();
    const hit = panelAt(layout, pt.x, pt.y);
    if (hit < 0) return;
    hooks.onSelect(hit);
    const view = hooks.getState().panels[hit];
    drag = { panel: hit, startX: pt.x, startY: pt.y, ox: view.ox ?? 0, oy: view.oy ?? 0 };
    canvas.setPointerCapture(event.pointerId);
  });

  canvas.addEventListener('pointermove', (event) => {
    if (!drag) return;
    const pt = eventPoint(canvas, event);
    const state = hooks.getState();
    const view = state.panels[drag.panel];
    if (!view) return;
    // Pan is stored as a fraction of the available slack, so a full-canvas drag crosses it.
    view.ox = clampPan(drag.ox + (pt.x - drag.startX) * 2.2);
    view.oy = clampPan(drag.oy + (pt.y - drag.startY) * 2.2);
    hooks.onChange();
  });

  const endDrag = () => { drag = null; };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  canvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    const state = hooks.getState();
    const view = state.panels[state.selected ?? 0];
    if (!view) return;
    const factor = event.deltaY < 0 ? 1.09 : 1 / 1.09;
    view.zoom = Math.max(1, Math.min(3.2, (view.zoom ?? 1) * factor));
    hooks.onChange();
  }, { passive: false });
}

/** Recentres a panel view and resets its zoom to the plain cover fit. */
export function centreView(view) {
  view.ox = 0;
  view.oy = 0;
  view.zoom = 1;
}
