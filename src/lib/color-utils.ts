import {
  oklch,
  rgb,
  formatHex,
  formatRgb,
  parse,
  converter,
  clampChroma,
  type Oklch,
  type Rgb,
} from "culori";

// Color space types
export type ColorSpace = "oklch" | "hsl";

export interface ColorResult {
  hex: string;
  rgb: { r: number; g: number; b: number };
  oklch: { l: number; c: number; h: number };
  hsl: { h: number; s: number; l: number };
  cssOklch: string;
  cssRgb: string;
  cssHsl: string;
}

// Converters
const toOklch = converter("oklch");
const toRgb = converter("rgb");
const toHsl = converter("hsl");

/**
 * Parse any color input (HEX, RGB, HSL, OKLCH) and return normalized result
 */
export function parseColor(input: string): ColorResult | null {
  try {
    const parsed = parse(input);
    if (!parsed) return null;

    const oklchColor = toOklch(parsed);
    const rgbColor = toRgb(parsed);
    const hslColor = toHsl(parsed);

    if (!oklchColor || !rgbColor || !hslColor) return null;

    // Clamp to sRGB gamut while preserving hue and lightness
    const clamped = clampChroma(oklchColor, "oklch");
    const clampedRgb = toRgb(clamped);
    const clampedHsl = toHsl(clamped);

    if (!clampedRgb || !clampedHsl) return null;

    const hex = formatHex(clampedRgb) || "#000000";

    return {
      hex,
      rgb: {
        r: Math.round((clampedRgb.r ?? 0) * 255),
        g: Math.round((clampedRgb.g ?? 0) * 255),
        b: Math.round((clampedRgb.b ?? 0) * 255),
      },
      oklch: {
        l: clamped.l ?? 0,
        c: clamped.c ?? 0,
        h: clamped.h ?? 0,
      },
      hsl: {
        h: clampedHsl.h ?? 0,
        s: (clampedHsl.s ?? 0) * 100,
        l: (clampedHsl.l ?? 0) * 100,
      },
      cssOklch: `oklch(${((clamped.l ?? 0) * 100).toFixed(1)}% ${(clamped.c ?? 0).toFixed(3)} ${(clamped.h ?? 0).toFixed(1)})`,
      cssRgb: formatRgb(clampedRgb) || "rgb(0, 0, 0)",
      cssHsl: `hsl(${(clampedHsl.h ?? 0).toFixed(0)}, ${((clampedHsl.s ?? 0) * 100).toFixed(0)}%, ${((clampedHsl.l ?? 0) * 100).toFixed(0)}%)`,
    };
  } catch {
    return null;
  }
}

/**
 * Create a color from OKLCH values
 */
export function fromOklch(l: number, c: number, h: number): ColorResult | null {
  const color: Oklch = { mode: "oklch", l, c, h };
  const clamped = clampChroma(color, "oklch");
  const rgbColor = toRgb(clamped);
  const hslColor = toHsl(clamped);

  if (!rgbColor || !hslColor) return null;

  const hex = formatHex(rgbColor) || "#000000";

  return {
    hex,
    rgb: {
      r: Math.round((rgbColor.r ?? 0) * 255),
      g: Math.round((rgbColor.g ?? 0) * 255),
      b: Math.round((rgbColor.b ?? 0) * 255),
    },
    oklch: {
      l: clamped.l ?? 0,
      c: clamped.c ?? 0,
      h: clamped.h ?? 0,
    },
    hsl: {
      h: hslColor.h ?? 0,
      s: (hslColor.s ?? 0) * 100,
      l: (hslColor.l ?? 0) * 100,
    },
    cssOklch: `oklch(${((clamped.l ?? 0) * 100).toFixed(1)}% ${(clamped.c ?? 0).toFixed(3)} ${(clamped.h ?? 0).toFixed(1)})`,
    cssRgb: formatRgb(rgbColor) || "rgb(0, 0, 0)",
    cssHsl: `hsl(${(hslColor.h ?? 0).toFixed(0)}, ${((hslColor.s ?? 0) * 100).toFixed(0)}%, ${((hslColor.l ?? 0) * 100).toFixed(0)}%)`,
  };
}

/**
 * Create a color from HSL values
 */
export function fromHsl(h: number, s: number, l: number): ColorResult | null {
  const color = { mode: "hsl" as const, h, s: s / 100, l: l / 100 };
  const oklchColor = toOklch(color);
  const rgbColor = toRgb(color);

  if (!oklchColor || !rgbColor) return null;

  const clamped = clampChroma(oklchColor, "oklch");
  const clampedRgb = toRgb(clamped);

  if (!clampedRgb) return null;

  const hex = formatHex(clampedRgb) || "#000000";

  return {
    hex,
    rgb: {
      r: Math.round((clampedRgb.r ?? 0) * 255),
      g: Math.round((clampedRgb.g ?? 0) * 255),
      b: Math.round((clampedRgb.b ?? 0) * 255),
    },
    oklch: {
      l: clamped.l ?? 0,
      c: clamped.c ?? 0,
      h: clamped.h ?? 0,
    },
    hsl: { h, s, l },
    cssOklch: `oklch(${((clamped.l ?? 0) * 100).toFixed(1)}% ${(clamped.c ?? 0).toFixed(3)} ${(clamped.h ?? 0).toFixed(1)})`,
    cssRgb: formatRgb(clampedRgb) || "rgb(0, 0, 0)",
    cssHsl: `hsl(${h.toFixed(0)}, ${s.toFixed(0)}%, ${l.toFixed(0)}%)`,
  };
}

/**
 * Normalize hue to 0-360 range
 */
export function normalizeHue(h: number): number {
  return ((h % 360) + 360) % 360;
}

/**
 * Check if a color is valid hex
 */
export function isValidHex(hex: string): boolean {
  return /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

/**
 * Format hex with # prefix
 */
export function formatHexString(hex: string): string {
  const clean = hex.replace("#", "");
  return `#${clean.toUpperCase()}`;
}

/**
 * Generate a random color
 */
export function randomColor(): ColorResult {
  const l = 0.3 + Math.random() * 0.5; // 0.3-0.8 lightness
  const c = 0.05 + Math.random() * 0.2; // 0.05-0.25 chroma
  const h = Math.random() * 360;
  return fromOklch(l, c, h)!;
}
