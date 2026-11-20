// Panel Vice data: the scene library, the colour grades and the polygonal panel layouts.
// Every layout is a set of polygon panels in normalised cover coordinates (0..1 on both axes),
// each panel naming the scene it opens with. The renderer clips each photo to its polygon,
// so one layout works at every export size and aspect.

/** The twelve original illustrated scenes the studio ships with, all made for this app. */
export const SCENES = [
  { id: 'hero-character', label: 'Hero & Convertible', file: 'scenes/hero-character.jpg' },
  { id: 'hero-car', label: 'Hero Car', file: 'scenes/hero-car.jpg' },
  { id: 'neon-street', label: 'Neon Street', file: 'scenes/neon-street.jpg' },
  { id: 'marina', label: 'Marina Dusk', file: 'scenes/marina.jpg' },
  { id: 'coast-road', label: 'Coast Road', file: 'scenes/coast-road.jpg' },
  { id: 'palm-boulevard', label: 'Palm Boulevard', file: 'scenes/palm-boulevard.jpg' },
  { id: 'rooftop', label: 'Rooftop Pool', file: 'scenes/rooftop.jpg' },
  { id: 'speedboat', label: 'Speedboat', file: 'scenes/speedboat.jpg' },
  { id: 'beach', label: 'Beach Tower', file: 'scenes/beach.jpg' },
  { id: 'lowrider-meet', label: 'Lowrider Meet', file: 'scenes/lowrider-meet.jpg' },
  { id: 'boardwalk', label: 'Boardwalk', file: 'scenes/boardwalk.jpg' },
  { id: 'skyline-dusk', label: 'Skyline Dusk', file: 'scenes/skyline-dusk.jpg' },
];

/** Colour grades: a canvas filter chain plus a tint gradient washed over each panel. */
export const GRADES = [
  {
    id: 'sunset-vice', label: 'Sunset Vice', blurb: 'orange into magenta',
    filter: 'saturate(1.28) contrast(1.07) brightness(1.03)',
    tint: ['rgba(255,122,26,0.20)', 'rgba(255,47,146,0.30)'], tintMode: 'overlay',
  },
  {
    id: 'neon-nights', label: 'Neon Nights', blurb: 'teal and hot pink',
    filter: 'saturate(1.4) contrast(1.16) brightness(0.98) hue-rotate(-8deg)',
    tint: ['rgba(20,220,200,0.16)', 'rgba(255,40,160,0.26)'], tintMode: 'overlay',
  },
  {
    id: 'golden-hour', label: 'Golden Hour', blurb: 'warm honey glow',
    filter: 'saturate(1.15) contrast(1.02) brightness(1.09) sepia(0.24)',
    tint: ['rgba(255,196,64,0.22)', 'rgba(255,110,40,0.18)'], tintMode: 'soft-light',
  },
  {
    id: 'midnight-bay', label: 'Midnight Bay', blurb: 'deep blue dusk',
    filter: 'saturate(1.08) contrast(1.12) brightness(0.94) hue-rotate(12deg)',
    tint: ['rgba(30,80,220,0.20)', 'rgba(10,10,60,0.30)'], tintMode: 'overlay',
  },
  {
    id: 'mono-noir', label: 'Mono Noir', blurb: 'hard black and white',
    filter: 'grayscale(1) contrast(1.28) brightness(1.04)',
    tint: ['rgba(255,255,255,0.05)', 'rgba(0,0,0,0.22)'], tintMode: 'overlay',
  },
];

/** The three post sizes the studio exports, as full-resolution PNG canvases. */
export const SIZES = {
  square: { id: 'square', label: '1080 x 1080', w: 1080, h: 1080 },
  portrait: { id: 'portrait', label: '1080 x 1350', w: 1080, h: 1350 },
  wide: { id: 'wide', label: '1920 x 1080', w: 1920, h: 1080 },
};

const P = (points, scene) => ({ points, scene });

/** Seven polygonal layouts. Points are [x, y] pairs in normalised cover space. */
export const LAYOUTS = [
  {
    id: 'hero-grid', label: 'Hero Grid', blurb: 'one star panel, three cuts',
    panels: [
      P([[0, 0], [0.60, 0], [0.54, 1], [0, 1]], 'hero-character'),
      P([[0.60, 0], [1, 0], [1, 0.34], [0.575, 0.34]], 'hero-car'),
      P([[0.575, 0.34], [1, 0.34], [1, 0.67], [0.555, 0.67]], 'neon-street'),
      P([[0.555, 0.67], [1, 0.67], [1, 1], [0.54, 1]], 'marina'),
    ],
  },
  {
    id: 'vice-classic', label: 'Vice Classic', blurb: 'the six-panel poster grid',
    panels: [
      P([[0, 0], [0.36, 0], [0.33, 0.52], [0, 0.52]], 'hero-character'),
      P([[0.36, 0], [0.68, 0], [0.66, 0.52], [0.33, 0.52]], 'palm-boulevard'),
      P([[0.68, 0], [1, 0], [1, 0.52], [0.66, 0.52]], 'speedboat'),
      P([[0, 0.52], [0.33, 0.52], [0.34, 1], [0, 1]], 'neon-street'),
      P([[0.33, 0.52], [0.66, 0.52], [0.67, 1], [0.34, 1]], 'hero-car'),
      P([[0.66, 0.52], [1, 0.52], [1, 1], [0.67, 1]], 'skyline-dusk'),
    ],
  },
  {
    id: 'diagonal-rush', label: 'Diagonal Rush', blurb: 'four slashing bands',
    panels: [
      P([[0, 0], [1, 0], [1, 0.16], [0, 0.42]], 'skyline-dusk'),
      P([[0, 0.42], [1, 0.16], [1, 0.42], [0, 0.66]], 'coast-road'),
      P([[0, 0.66], [1, 0.42], [1, 0.70], [0, 0.88]], 'hero-car'),
      P([[0, 0.88], [1, 0.70], [1, 1], [0, 1]], 'neon-street'),
    ],
  },
  {
    id: 'skyline-stack', label: 'Skyline Stack', blurb: 'bands over a wide hero',
    panels: [
      P([[0, 0], [0.52, 0], [0.50, 0.30], [0, 0.30]], 'rooftop'),
      P([[0.52, 0], [1, 0], [1, 0.30], [0.50, 0.30]], 'boardwalk'),
      P([[0, 0.30], [1, 0.30], [1, 1], [0, 1]], 'hero-character'),
    ],
  },
  {
    id: 'triad', label: 'Triad', blurb: 'three wedges, one meeting point',
    panels: [
      P([[0, 0], [0.55, 0], [0.50, 0.55], [0, 0.72]], 'hero-car'),
      P([[0.55, 0], [1, 0], [1, 0.72], [0.50, 0.55]], 'neon-street'),
      P([[0, 0.72], [0.50, 0.55], [1, 0.72], [1, 1], [0, 1]], 'marina'),
    ],
  },
  {
    id: 'mosaic-nine', label: 'Mosaic Nine', blurb: 'nine cuts, full collage',
    panels: [
      P([[0, 0], [0.34, 0], [0.33, 0.34], [0, 0.34]], 'beach'),
      P([[0.34, 0], [0.67, 0], [0.66, 0.34], [0.33, 0.34]], 'hero-car'),
      P([[0.67, 0], [1, 0], [1, 0.34], [0.66, 0.34]], 'boardwalk'),
      P([[0, 0.34], [0.33, 0.34], [0.34, 0.67], [0, 0.67]], 'lowrider-meet'),
      P([[0.33, 0.34], [0.66, 0.34], [0.67, 0.67], [0.34, 0.67]], 'hero-character'),
      P([[0.66, 0.34], [1, 0.34], [1, 0.67], [0.67, 0.67]], 'speedboat'),
      P([[0, 0.67], [0.34, 0.67], [0.33, 1], [0, 1]], 'neon-street'),
      P([[0.34, 0.67], [0.67, 0.67], [0.66, 1], [0.33, 1]], 'marina'),
      P([[0.67, 0.67], [1, 0.67], [1, 1], [0.66, 1]], 'skyline-dusk'),
    ],
  },
  {
    id: 'spotlight', label: 'Spotlight', blurb: 'diamond hero, four corners',
    panels: [
      P([[0, 0], [0.52, 0], [0.40, 0.38], [0, 0.46]], 'palm-boulevard'),
      P([[0.52, 0], [1, 0], [1, 0.46], [0.60, 0.38]], 'rooftop'),
      P([[0.40, 0.16], [0.60, 0.16], [0.76, 0.52], [0.50, 0.88], [0.24, 0.52]], 'hero-character'),
      P([[0, 0.46], [0.40, 0.38], [0.24, 0.52], [0.50, 0.88], [0.44, 1], [0, 1]], 'coast-road'),
      P([[0.60, 0.38], [1, 0.46], [1, 1], [0.44, 1], [0.50, 0.88], [0.76, 0.52]], 'speedboat'),
    ],
  },
];

/** Finds a layout by id, falling back to the first. */
export function layoutById(id) {
  return LAYOUTS.find((l) => l.id === id) ?? LAYOUTS[0];
}

/** Finds a grade by id, falling back to the first. */
export function gradeById(id) {
  return GRADES.find((g) => g.id === id) ?? GRADES[0];
}

/** The axis-aligned bounds of a panel polygon, in normalised coordinates. */
export function panelBounds(panel) {
  let minX = 1, minY = 1, maxX = 0, maxY = 0;
  for (const [x, y] of panel.points) {
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY };
}

/** Point-in-polygon test in normalised coordinates (ray casting). */
export function pointInPanel(panel, x, y) {
  let inside = false;
  const pts = panel.points;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
