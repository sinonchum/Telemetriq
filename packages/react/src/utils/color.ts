/**
 * Shared color interpolation utilities for Telemetriq renderers.
 */

export type ColorScale = {
  type: 'linear';
  domain: [number, number];
  range: string[];
};

/** Linear interpolation between two numbers. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Parse a hex color (#RRGGBB) to [0-1, 0-1, 0-1] RGB tuple. */
export function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

/** Parse a hex color (#RRGGBB) to a 0xRRGGBB number (for Three.js). */
export function hexToColor(hex: string): number {
  return parseInt(hex.replace('#', ''), 16);
}

/** Lerp between two RGB [0-1] triples. */
export function lerpRgb(c1: [number, number, number], c2: [number, number, number], t: number): [number, number, number] {
  return [c1[0] + (c2[0] - c1[0]) * t, c1[1] + (c2[1] - c1[1]) * t, c1[2] + (c2[2] - c1[2]) * t];
}

/** Lerp between two 0xRRGGBB numbers (for Three.js vertex colors). */
export function lerpColor(c1: number, c2: number, t: number): number {
  const r1 = (c1 >> 16) & 0xff, g1 = (c1 >> 8) & 0xff, b1 = c1 & 0xff;
  const r2 = (c2 >> 16) & 0xff, g2 = (c2 >> 8) & 0xff, b2 = c2 & 0xff;
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return (r << 16) | (g << 8) | b;
}

/**
 * Map a value to an interpolated CSS rgb() string using a color scale.
 * Used by Canvas2D (PathRenderer, MapPathRenderer).
 */
export function colorToRgbString(value: number, domain: [number, number], range: string[]): string {
  const t = Math.max(0, Math.min(1, (value - domain[0]) / (domain[1] - domain[0])));
  if (range.length === 1) return range[0];
  const segment = t * (range.length - 1);
  const i = Math.min(Math.floor(segment), range.length - 2);
  const localT = segment - i;
  const c1 = range[i], c2 = range[i + 1];
  const r1 = parseInt(c1.slice(1, 3), 16), g1 = parseInt(c1.slice(3, 5), 16), b1 = parseInt(c1.slice(5, 7), 16);
  const r2 = parseInt(c2.slice(1, 3), 16), g2 = parseInt(c2.slice(3, 5), 16), b2 = parseInt(c2.slice(5, 7), 16);
  const r = Math.round(lerp(r1, r2, localT));
  const g = Math.round(lerp(g1, g2, localT));
  const b = Math.round(lerp(b1, b2, localT));
  return `rgb(${r},${g},${b})`;
}

/**
 * Map a value to an interpolated [0-1, 0-1, 0-1] RGB triple.
 * Used by WebGLPathRenderer.
 */
export function colorToRgbTuple(value: number, domain: [number, number], range: string[]): [number, number, number] {
  const t = Math.max(0, Math.min(1, (value - domain[0]) / (domain[1] - domain[0])));
  const rgbs = range.map(hexToRgb);
  if (rgbs.length === 1) return rgbs[0];
  const segment = t * (rgbs.length - 1);
  const i = Math.min(Math.floor(segment), rgbs.length - 2);
  return lerpRgb(rgbs[i], rgbs[i + 1], segment - i);
}

/**
 * Map a value to an interpolated 0xRRGGBB number.
 * Used by PathRenderer3D (Three.js).
 */
export function colorToNumber(value: number, domain: [number, number], range: string[]): number {
  const t = Math.max(0, Math.min(1, (value - domain[0]) / (domain[1] - domain[0])));
  const colors = range.map(hexToColor);
  if (colors.length === 1) return colors[0];
  const segment = t * (colors.length - 1);
  const i = Math.min(Math.floor(segment), colors.length - 2);
  return lerpColor(colors[i], colors[i + 1], segment - i);
}
