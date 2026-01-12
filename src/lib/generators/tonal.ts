import {
  type ColorResult,
  fromOklch,
  fromHsl,
  normalizeHue,
  type ColorSpace,
} from "../color-utils";

export interface TonalConfig {
  steps: number[]; // Lightness steps (e.g., [50, 100, 200, ..., 900])
  hues: number[]; // Array of hue values to generate
}

export interface TonalMatrixResult {
  steps: number[];
  hues: number[];
  matrix: ColorResult[][]; // [hueIndex][stepIndex]
}

// Default Material Design-like lightness steps
export const DEFAULT_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

/**
 * Map step value (50-950) to OKLCH lightness (0-1)
 * Using a curve that matches perceptual expectations
 */
function stepToLightness(step: number): number {
  // Map 50 -> 0.97, 500 -> 0.55, 950 -> 0.15
  // Using polynomial curve for smooth transition
  const normalized = step / 1000; // 0.05 to 0.95
  return 0.97 - normalized * 0.87;
}

/**
 * Calculate chroma curve based on lightness
 * Chroma peaks at mid-lightness and drops near white/black
 */
function getChromaForLightness(
  baseLightness: number,
  baseChroma: number,
  targetLightness: number
): number {
  // Parabolic curve: max at L=0.55, drops to 0 at L=0 and L=1
  const chromaCurve = 1 - Math.pow((targetLightness - 0.55) / 0.55, 2);
  const maxChroma = baseChroma * 1.2; // Allow slight boost
  return Math.max(0.01, Math.min(maxChroma, baseChroma * Math.max(0.3, chromaCurve)));
}

/**
 * Generate a tonal scale for a single hue
 */
export function generateTonalScale(
  baseColor: ColorResult,
  steps: number[] = DEFAULT_STEPS,
  colorSpace: ColorSpace = "oklch"
): ColorResult[] {
  if (colorSpace === "oklch") {
    return generateTonalScaleOklch(baseColor, steps);
  } else {
    return generateTonalScaleHsl(baseColor, steps);
  }
}

function generateTonalScaleOklch(
  baseColor: ColorResult,
  steps: number[]
): ColorResult[] {
  const { c, h } = baseColor.oklch;
  const results: ColorResult[] = [];

  for (const step of steps) {
    const l = stepToLightness(step);
    const adjustedChroma = getChromaForLightness(baseColor.oklch.l, c, l);
    const color = fromOklch(l, adjustedChroma, h);
    if (color) results.push(color);
  }

  return results;
}

function generateTonalScaleHsl(
  baseColor: ColorResult,
  steps: number[]
): ColorResult[] {
  const { h, s } = baseColor.hsl;
  const results: ColorResult[] = [];

  for (const step of steps) {
    // Map step to HSL lightness (inverted from OKLCH mapping)
    const l = Math.max(5, Math.min(98, (1000 - step) / 10));
    // Reduce saturation at extremes
    const satMultiplier = 1 - Math.pow((l - 50) / 50, 2) * 0.3;
    const adjustedSat = s * Math.max(0.2, satMultiplier);
    const color = fromHsl(h, adjustedSat, l);
    if (color) results.push(color);
  }

  return results;
}

/**
 * Generate a full tonal matrix (multiple hues × multiple steps)
 */
export function generateTonalMatrix(
  baseColor: ColorResult,
  config: Partial<TonalConfig> = {},
  colorSpace: ColorSpace = "oklch"
): TonalMatrixResult {
  const steps = config.steps ?? DEFAULT_STEPS;
  const baseHue = colorSpace === "oklch" ? baseColor.oklch.h : baseColor.hsl.h;
  const hues = config.hues ?? [baseHue]; // Default to just the base hue

  const matrix: ColorResult[][] = [];

  for (const hue of hues) {
    // Create a color with the target hue but same lightness/chroma as base
    let hueBaseColor: ColorResult | null;
    if (colorSpace === "oklch") {
      hueBaseColor = fromOklch(baseColor.oklch.l, baseColor.oklch.c, normalizeHue(hue));
    } else {
      hueBaseColor = fromHsl(normalizeHue(hue), baseColor.hsl.s, baseColor.hsl.l);
    }

    if (hueBaseColor) {
      matrix.push(generateTonalScale(hueBaseColor, steps, colorSpace));
    }
  }

  return {
    steps,
    hues,
    matrix,
  };
}

/**
 * Generate hues at even intervals around the color wheel
 */
export function generateEvenHues(count: number, startHue: number = 0): number[] {
  const hues: number[] = [];
  const interval = 360 / count;
  for (let i = 0; i < count; i++) {
    hues.push(normalizeHue(startHue + i * interval));
  }
  return hues;
}

/**
 * Generate hues based on harmony relationships
 */
export function generateHarmonyHues(
  baseHue: number,
  type: "triadic" | "tetradic" | "complementary-split"
): number[] {
  switch (type) {
    case "triadic":
      return [baseHue, normalizeHue(baseHue + 120), normalizeHue(baseHue + 240)];
    case "tetradic":
      return [
        baseHue,
        normalizeHue(baseHue + 90),
        normalizeHue(baseHue + 180),
        normalizeHue(baseHue + 270),
      ];
    case "complementary-split":
      return [baseHue, normalizeHue(baseHue + 150), normalizeHue(baseHue + 210)];
    default:
      return [baseHue];
  }
}

/**
 * Get step name (for display)
 */
export function getStepName(step: number): string {
  return step.toString();
}
