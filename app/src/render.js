// Panel Vice renderer: paints the whole cover onto any 2D canvas at the canvas's own size.
// Each panel photo is cover-fitted into its polygon's bounds, clipped to the polygon, graded,
// then the panels are inked with white keylines and the title block is lettered over a scrim.
// The same function drives the live preview and the full-resolution PNG export.

import { gradeById, panelBounds } from './layouts.js';

let grainPattern = null;

/** Builds (once) a small monochrome noise tile used for the print-grain overlay. */
function getGrainPattern(ctx) {
  if (grainPattern) return grainPattern;
  const tile = document.createElement('canvas');
  tile.width = 140; tile.height = 140;
  const tctx = tile.getContext('2d');
  const data = tctx.createImageData(140, 140);
  for (let i = 0; i < data.data.length; i += 4) {
    const v = 108 + Math.floor(Math.random() * 110);
    data.data[i] = v; data.data[i + 1] = v; data.data[i + 2] = v; data.data[i + 3] = 255;
  }
  tctx.putImageData(data, 0, 0);
  grainPattern = ctx.createPattern(tile, 'repeat');
  return grainPattern;
}

/** Traces a panel polygon scaled to pixel space. */
function tracePanel(ctx, panel, w, h) {
  ctx.beginPath();
  panel.points.forEach(([x, y], i) => {
    if (i === 0) ctx.moveTo(x * w, y * h);
    else ctx.lineTo(x * w, y * h);
  });
  ctx.closePath();
}

/**
 * Draws one panel: the photo cover-fitted into the polygon bounds with the panel's zoom and
 * pan applied, clipped to the polygon, with the grade's filter and tint wash over it.
 */
function paintPanel(ctx, panel, view, grade, w, h) {
  const b = panelBounds(panel);
  const bw = b.w * w, bh = b.h * h;
  ctx.save();
  tracePanel(ctx, panel, w, h);
  ctx.clip();
  ctx.fillStyle = '#2a1838';
  ctx.fillRect(b.minX * w, b.minY * h, bw, bh);
  const img = view?.img ?? null;
  if (img) {
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    const zoom = view.zoom ?? 1;
    const scale = Math.max(bw / iw, bh / ih) * zoom;
    const dw = iw * scale, dh = ih * scale;
    const roomX = Math.max(0, (dw - bw) / 2), roomY = Math.max(0, (dh - bh) / 2);
    const cx = b.minX * w + bw / 2 + (view.ox ?? 0) * roomX;
    const cy = b.minY * h + bh / 2 + (view.oy ?? 0) * roomY;
    ctx.filter = grade.filter;
    try { ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh); } catch { /* image not ready */ }
    ctx.filter = 'none';
  }
  const tint = ctx.createLinearGradient(b.minX * w, b.minY * h, b.maxX * w, b.maxY * h);
  tint.addColorStop(0, grade.tint[0]);
  tint.addColorStop(1, grade.tint[1]);
  ctx.globalCompositeOperation = grade.tintMode;
  ctx.fillStyle = tint;
  ctx.fillRect(b.minX * w, b.minY * h, bw, bh);
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
}

/** Inks every panel edge: a soft black under-stroke, then the signature white keyline. */
function inkPanels(ctx, layout, w, h) {
  const unit = Math.min(w, h);
  for (const pass of [
    { width: unit * 0.016, color: 'rgba(10,4,18,0.85)' },
    { width: unit * 0.008, color: '#ffffff' },
  ]) {
    ctx.lineWidth = pass.width;
    ctx.strokeStyle = pass.color;
    ctx.lineJoin = 'round';
    for (const panel of layout.panels) {
      tracePanel(ctx, panel, w, h);
      ctx.stroke();
    }
  }
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = unit * 0.014;
  ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, w - ctx.lineWidth, h - ctx.lineWidth);
}

/** Fits a font size so `text` spans at most `maxWidth`, shrinking from `start`. */
function fitFontSize(ctx, text, fontFamily, start, maxWidth) {
  let size = start;
  ctx.font = `${size}px ${fontFamily}`;
  while (ctx.measureText(text).width > maxWidth && size > 14) {
    size *= 0.94;
    ctx.font = `${size}px ${fontFamily}`;
  }
  return size;
}

/** Letters the title block: sunset-gradient Anton title, neon script subtitle, heat stars, badge. */
function letterTitle(ctx, state, w, h) {
  const unit = Math.min(w, h);
  const title = (state.caption ?? '').trim().toUpperCase();
  const subtitle = (state.subtitle ?? '').trim();
  const base = h - unit * 0.035;

  const scrim = ctx.createLinearGradient(0, h * 0.60, 0, h);
  scrim.addColorStop(0, 'rgba(12,4,20,0)');
  scrim.addColorStop(0.55, 'rgba(12,4,20,0.45)');
  scrim.addColorStop(1, 'rgba(12,4,20,0.82)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, h * 0.60, w, h * 0.40);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  if (subtitle) {
    ctx.save();
    ctx.translate(w / 2, base - unit * 0.155);
    ctx.rotate(-0.045);
    const sSize = fitFontSize(ctx, subtitle, '"Pacifico", cursive', unit * 0.085, w * 0.72);
    ctx.font = `${sSize}px "Pacifico", cursive`;
    ctx.shadowColor = 'rgba(255,47,180,0.95)';
    ctx.shadowBlur = unit * 0.028;
    ctx.lineWidth = sSize * 0.16;
    ctx.strokeStyle = 'rgba(30,2,24,0.9)';
    ctx.strokeText(subtitle, 0, 0);
    ctx.fillStyle = '#ffd7f2';
    ctx.fillText(subtitle, 0, 0);
    ctx.restore();
  }

  if (title) {
    const tSize = fitFontSize(ctx, title, '"Anton", sans-serif', unit * 0.185, w * 0.94);
    ctx.font = `${tSize}px "Anton", sans-serif`;
    const grad = ctx.createLinearGradient(0, base - tSize, 0, base);
    grad.addColorStop(0, '#fff6d8');
    grad.addColorStop(0.45, '#ffc93e');
    grad.addColorStop(0.78, '#ff7a1a');
    grad.addColorStop(1, '#ff2f92');
    ctx.lineJoin = 'round';
    ctx.lineWidth = tSize * 0.22;
    ctx.strokeStyle = '#160a12';
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = unit * 0.02;
    ctx.shadowOffsetY = unit * 0.008;
    ctx.strokeText(title, w / 2, base);
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    ctx.fillStyle = grad;
    ctx.fillText(title, w / 2, base);
  }

  const stars = Math.max(0, Math.min(5, state.stars ?? 5));
  if (stars > 0) {
    const sSize = unit * 0.045;
    ctx.font = `${sSize}px sans-serif`;
    ctx.fillStyle = '#ffd23e';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = unit * 0.008;
    ctx.fillText('★'.repeat(stars), w / 2, unit * 0.085);
    ctx.shadowBlur = 0;
  }

  // Corner badge ribbon, top-left: the studio's own mark, no borrowed logos.
  ctx.save();
  ctx.translate(unit * 0.105, unit * 0.075);
  ctx.rotate(-0.06);
  ctx.fillStyle = '#ff2f92';
  ctx.fillRect(-unit * 0.085, -unit * 0.032, unit * 0.17, unit * 0.064);
  ctx.fillStyle = '#ffffff';
  ctx.font = `${unit * 0.036}px "Anton", sans-serif`;
  ctx.fillText('PANEL VICE', 0, unit * 0.013);
  ctx.restore();
}

/** Overlays print grain and a vignette so flat photos sit together as one poster. */
function finishPoster(ctx, w, h) {
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = getGrainPattern(ctx);
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
  const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.78);
  vig.addColorStop(0, 'rgba(8,2,14,0)');
  vig.addColorStop(1, 'rgba(8,2,14,0.34)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
}

/** Outlines the selected panel in amber so the editor shows what a drag will move. */
function markSelected(ctx, layout, selected, w, h) {
  const panel = layout.panels[selected];
  if (!panel) return;
  ctx.save();
  ctx.setLineDash([Math.min(w, h) * 0.02, Math.min(w, h) * 0.012]);
  ctx.lineWidth = Math.min(w, h) * 0.007;
  ctx.strokeStyle = '#ffb340';
  tracePanel(ctx, panel, w, h);
  ctx.stroke();
  ctx.restore();
}

/**
 * Draws the full cover described by `state` onto `canvas` at the canvas's own pixel size.
 * `state.panels[i]` is { img, zoom, ox, oy, gradeId } per layout panel; `options.mark`
 * adds the editor's selection outline (never used on exports).
 */
export function drawCover(canvas, state, layout, options = {}) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.fillStyle = '#241634';
  ctx.fillRect(0, 0, w, h);
  const baseGrade = gradeById(state.gradeId);
  layout.panels.forEach((panel, i) => {
    const view = state.panels[i] ?? {};
    const grade = view.gradeId ? gradeById(view.gradeId) : baseGrade;
    paintPanel(ctx, panel, view, grade, w, h);
  });
  inkPanels(ctx, layout, w, h);
  finishPoster(ctx, w, h);
  letterTitle(ctx, state, w, h);
  if (options.mark) markSelected(ctx, layout, state.selected ?? 0, w, h);
}
