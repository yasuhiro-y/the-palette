import {
  type ColorResult,
  fromOklch,
  fromHsl,
  type ColorSpace,
} from "../color-utils";

export type InterpolationMethod = "linear" | "catmull-rom";

export interface InterpolationConfig {
  method: InterpolationMethod;
  steps: number;
}

/**
 * Linear interpolation between values
 */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Interpolate hue values, taking the shortest path around the color wheel
 */
function lerpHue(h1: number, h2: number, t: number): number {
  // Handle undefined/NaN hues (achromatic colors)
  if (isNaN(h1) || h1 === undefined) h1 = h2;
  if (isNaN(h2) || h2 === undefined) h2 = h1;
  if (isNaN(h1) && isNaN(h2)) return 0;

  let diff = h2 - h1;
  
  // Take the shortest path around the wheel
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  
  return (h1 + diff * t + 360) % 360;
}

/**
 * Generate colors by linear interpolation between two or more colors
 */
export function interpolateLinear(
  colors: ColorResult[],
  steps: number,
  colorSpace: ColorSpace = "oklch"
): ColorResult[] {
  if (colors.length === 0) return [];
  if (colors.length === 1) return [colors[0]];
  if (steps < 2) return [colors[0], colors[colors.length - 1]];

  const results: ColorResult[] = [];
  const segments = colors.length - 1;
  const stepsPerSegment = (steps - 1) / segments;

  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const globalPos = t * segments;
    const segmentIndex = Math.min(Math.floor(globalPos), segments - 1);
    const localT = globalPos - segmentIndex;

    const c1 = colors[segmentIndex];
    const c2 = colors[segmentIndex + 1];

    let color: ColorResult | null;

    if (colorSpace === "oklch") {
      const l = lerp(c1.oklch.l, c2.oklch.l, localT);
      const c = lerp(c1.oklch.c, c2.oklch.c, localT);
      const h = lerpHue(c1.oklch.h, c2.oklch.h, localT);
      color = fromOklch(l, c, h);
    } else {
      const h = lerpHue(c1.hsl.h, c2.hsl.h, localT);
      const s = lerp(c1.hsl.s, c2.hsl.s, localT);
      const l = lerp(c1.hsl.l, c2.hsl.l, localT);
      color = fromHsl(h, s, l);
    }

    if (color) results.push(color);
  }

  return results;
}

/**
 * Catmull-Rom spline interpolation
 * Creates smoother curves that pass through all control points
 */
function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;

  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

/**
 * Catmull-Rom interpolation for hue (handles wrapping)
 */
function catmullRomHue(
  h0: number,
  h1: number,
  h2: number,
  h3: number,
  t: number
): number {
  // Convert to continuous values to avoid 360->0 jumps
  const unwrap = (prev: number, curr: number): number => {
    let diff = curr - prev;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    return prev + diff;
  };

  const uh1 = h1;
  const uh0 = unwrap(uh1, h0);
  const uh2 = unwrap(uh1, h2);
  const uh3 = unwrap(uh2, h3);

  const result = catmullRom(uh0, uh1, uh2, uh3, t);
  return ((result % 360) + 360) % 360;
}

/**
 * Generate colors using Catmull-Rom spline interpolation
 */
export function interpolateCatmullRom(
  colors: ColorResult[],
  steps: number,
  colorSpace: ColorSpace = "oklch"
): ColorResult[] {
  if (colors.length === 0) return [];
  if (colors.length === 1) return [colors[0]];
  if (colors.length === 2) return interpolateLinear(colors, steps, colorSpace);
  if (steps < 2) return [colors[0], colors[colors.length - 1]];

  const results: ColorResult[] = [];
  const segments = colors.length - 1;

  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const globalPos = t * segments;
    const segmentIndex = Math.min(Math.floor(globalPos), segments - 1);
    const localT = globalPos - segmentIndex;

    // Get 4 control points for Catmull-Rom
    const p0 = colors[Math.max(0, segmentIndex - 1)];
    const p1 = colors[segmentIndex];
    const p2 = colors[Math.min(colors.length - 1, segmentIndex + 1)];
    const p3 = colors[Math.min(colors.length - 1, segmentIndex + 2)];

    let color: ColorResult | null;

    if (colorSpace === "oklch") {
      const l = catmullRom(p0.oklch.l, p1.oklch.l, p2.oklch.l, p3.oklch.l, localT);
      const c = Math.max(
        0,
        catmullRom(p0.oklch.c, p1.oklch.c, p2.oklch.c, p3.oklch.c, localT)
      );
      const h = catmullRomHue(p0.oklch.h, p1.oklch.h, p2.oklch.h, p3.oklch.h, localT);
      // Clamp lightness to valid range
      color = fromOklch(Math.max(0, Math.min(1, l)), c, h);
    } else {
      const h = catmullRomHue(p0.hsl.h, p1.hsl.h, p2.hsl.h, p3.hsl.h, localT);
      const s = Math.max(
        0,
        Math.min(100, catmullRom(p0.hsl.s, p1.hsl.s, p2.hsl.s, p3.hsl.s, localT))
      );
      const l = Math.max(
        0,
        Math.min(100, catmullRom(p0.hsl.l, p1.hsl.l, p2.hsl.l, p3.hsl.l, localT))
      );
      color = fromHsl(h, s, l);
    }

    if (color) results.push(color);
  }

  return results;
}

/**
 * Main interpolation function
 */
export function interpolateColors(
  colors: ColorResult[],
  config: InterpolationConfig,
  colorSpace: ColorSpace = "oklch"
): ColorResult[] {
  const { method, steps } = config;

  switch (method) {
    case "catmull-rom":
      return interpolateCatmullRom(colors, steps, colorSpace);
    case "linear":
    default:
      return interpolateLinear(colors, steps, colorSpace);
  }
}

/**
 * Get interpolation method display name
 */
export function getInterpolationMethodName(method: InterpolationMethod): string {
  const names: Record<InterpolationMethod, string> = {
    linear: "Linear",
    "catmull-rom": "Catmull-Rom (Smooth)",
  };
  return names[method];
}

/**
 * Get all interpolation methods
 */
export function getAllInterpolationMethods(): InterpolationMethod[] {
  return ["linear", "catmull-rom"];
}
