import {
  type ColorResult,
  fromOklch,
  fromHsl,
  normalizeHue,
  type ColorSpace,
} from "../color-utils";

export type ColorfulMethod =
  | "spectrum"      // Full spectrum, even distribution
  | "vibrant"       // High saturation, medium lightness
  | "pastel"        // Low saturation, high lightness
  | "dark"          // Low lightness
  | "neon"          // Very high saturation, high lightness
  | "warm"          // Red-yellow-orange range
  | "cool"          // Blue-green-cyan range
  | "earth"         // Brown/tan range
  | "random";       // Random hues and values

export interface ColorfulConfig {
  method: ColorfulMethod;
  count: number;
  seed?: number;
  shuffle?: boolean; // Shuffle the order (default: false for gradient effect)
  // Fixed parameters (OKLCH)
  fixedLightness?: number; // 0-1
  fixedChroma?: number; // 0-0.4
  // HSL equivalents
  fixedSaturation?: number; // 0-100
  fixedLightnessHsl?: number; // 0-100
}

/**
 * Seeded random number generator for reproducibility
 */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = Math.sin(s * 9999) * 10000;
    return s - Math.floor(s);
  };
}

/**
 * Sort colors by hue for gradient effect
 */
function sortByHue(colors: ColorResult[]): ColorResult[] {
  return [...colors].sort((a, b) => a.oklch.h - b.oklch.h);
}

/**
 * Shuffle array using Fisher-Yates algorithm with seeded random
 */
function shuffleArray<T>(arr: T[], random: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generate colorful palette without a base color
 */
export function generateColorful(
  config: ColorfulConfig,
  colorSpace: ColorSpace = "oklch"
): ColorResult[] {
  const { method, count, seed = Date.now(), shuffle = false } = config;
  const random = seededRandom(seed);

  let colors: ColorResult[];

  switch (method) {
    case "spectrum":
      colors = generateSpectrum(count, config, colorSpace);
      break;
    case "vibrant":
      colors = generateStyled(count, config, colorSpace, {
        oklch: { l: 0.65, c: 0.22 },
        hsl: { s: 85, l: 55 },
      });
      break;
    case "pastel":
      colors = generateStyled(count, config, colorSpace, {
        oklch: { l: 0.88, c: 0.08 },
        hsl: { s: 50, l: 85 },
      });
      break;
    case "dark":
      colors = generateStyled(count, config, colorSpace, {
        oklch: { l: 0.35, c: 0.12 },
        hsl: { s: 60, l: 25 },
      });
      break;
    case "neon":
      colors = generateStyled(count, config, colorSpace, {
        oklch: { l: 0.80, c: 0.28 },
        hsl: { s: 100, l: 60 },
      });
      break;
    case "warm":
      colors = generateWarmSpectrum(count, config, colorSpace);
      break;
    case "cool":
      colors = generateCoolSpectrum(count, config, colorSpace);
      break;
    case "earth":
      colors = generateEarthSpectrum(count, config, colorSpace);
      break;
    case "random":
      colors = generateRandom(count, random, config, colorSpace);
      break;
    default:
      colors = generateSpectrum(count, config, colorSpace);
  }

  // Shuffle if requested, otherwise colors are already sorted by hue
  if (shuffle && method !== "random") {
    colors = shuffleArray(colors, random);
  }

  return colors;
}

interface StyleDefaults {
  oklch: { l: number; c: number };
  hsl: { s: number; l: number };
}

/**
 * Generate full spectrum with even hue distribution
 */
function generateSpectrum(
  count: number,
  config: ColorfulConfig,
  colorSpace: ColorSpace
): ColorResult[] {
  const results: ColorResult[] = [];
  const hueStep = 360 / count;

  for (let i = 0; i < count; i++) {
    const h = normalizeHue(i * hueStep);
    
    if (colorSpace === "oklch") {
      const l = config.fixedLightness ?? 0.65;
      const c = config.fixedChroma ?? 0.18;
      const color = fromOklch(l, c, h);
      if (color) results.push(color);
    } else {
      const s = config.fixedSaturation ?? 75;
      const l = config.fixedLightnessHsl ?? 55;
      const color = fromHsl(h, s, l);
      if (color) results.push(color);
    }
  }

  return results;
}

/**
 * Generate styled spectrum (vibrant, pastel, dark, neon)
 */
function generateStyled(
  count: number,
  config: ColorfulConfig,
  colorSpace: ColorSpace,
  defaults: StyleDefaults
): ColorResult[] {
  const results: ColorResult[] = [];
  const hueStep = 360 / count;

  for (let i = 0; i < count; i++) {
    const h = normalizeHue(i * hueStep);
    
    if (colorSpace === "oklch") {
      const l = config.fixedLightness ?? defaults.oklch.l;
      const c = config.fixedChroma ?? defaults.oklch.c;
      const color = fromOklch(l, c, h);
      if (color) results.push(color);
    } else {
      const s = config.fixedSaturation ?? defaults.hsl.s;
      const l = config.fixedLightnessHsl ?? defaults.hsl.l;
      const color = fromHsl(h, s, l);
      if (color) results.push(color);
    }
  }

  return results;
}

/**
 * Generate warm spectrum (reds, oranges, yellows, magentas)
 * Hue range: 0-80 and 300-360 (warm colors)
 */
function generateWarmSpectrum(
  count: number,
  config: ColorfulConfig,
  colorSpace: ColorSpace
): ColorResult[] {
  const results: ColorResult[] = [];
  // Warm hues: 300-360 (magenta/pink) + 0-80 (red/orange/yellow)
  // Total range: 140 degrees
  const totalRange = 140;
  const hueStep = totalRange / count;

  for (let i = 0; i < count; i++) {
    let h = i * hueStep;
    // Map to warm range: start at 300, wrap around at 360 to 0
    h = h < 60 ? 300 + h : h - 60;
    h = normalizeHue(h);
    
    if (colorSpace === "oklch") {
      const l = config.fixedLightness ?? 0.65;
      const c = config.fixedChroma ?? 0.18;
      const color = fromOklch(l, c, h);
      if (color) results.push(color);
    } else {
      const s = config.fixedSaturation ?? 75;
      const lVal = config.fixedLightnessHsl ?? 55;
      const color = fromHsl(h, s, lVal);
      if (color) results.push(color);
    }
  }

  return sortByHue(results);
}

/**
 * Generate cool spectrum (greens, cyans, blues)
 * Hue range: 120-300 (cool colors)
 */
function generateCoolSpectrum(
  count: number,
  config: ColorfulConfig,
  colorSpace: ColorSpace
): ColorResult[] {
  const results: ColorResult[] = [];
  const startHue = 120;
  const endHue = 280;
  const hueStep = (endHue - startHue) / (count - 1 || 1);

  for (let i = 0; i < count; i++) {
    const h = normalizeHue(startHue + i * hueStep);
    
    if (colorSpace === "oklch") {
      const l = config.fixedLightness ?? 0.60;
      const c = config.fixedChroma ?? 0.15;
      const color = fromOklch(l, c, h);
      if (color) results.push(color);
    } else {
      const s = config.fixedSaturation ?? 65;
      const lVal = config.fixedLightnessHsl ?? 50;
      const color = fromHsl(h, s, lVal);
      if (color) results.push(color);
    }
  }

  return results;
}

/**
 * Generate earth tones spectrum (browns, tans, olives)
 * Hue range: 20-90 with low saturation
 */
function generateEarthSpectrum(
  count: number,
  config: ColorfulConfig,
  colorSpace: ColorSpace
): ColorResult[] {
  const results: ColorResult[] = [];
  const startHue = 20;
  const endHue = 90;
  const hueStep = (endHue - startHue) / (count - 1 || 1);

  for (let i = 0; i < count; i++) {
    const h = normalizeHue(startHue + i * hueStep);
    
    if (colorSpace === "oklch") {
      const l = config.fixedLightness ?? 0.50;
      const c = config.fixedChroma ?? 0.08;
      const color = fromOklch(l, c, h);
      if (color) results.push(color);
    } else {
      const s = config.fixedSaturation ?? 35;
      const lVal = config.fixedLightnessHsl ?? 40;
      const color = fromHsl(h, s, lVal);
      if (color) results.push(color);
    }
  }

  return results;
}

/**
 * Generate truly random colors
 */
function generateRandom(
  count: number,
  random: () => number,
  config: ColorfulConfig,
  colorSpace: ColorSpace
): ColorResult[] {
  const results: ColorResult[] = [];

  for (let i = 0; i < count; i++) {
    const h = random() * 360;
    
    if (colorSpace === "oklch") {
      const l = config.fixedLightness ?? (0.4 + random() * 0.4);
      const c = config.fixedChroma ?? (0.1 + random() * 0.18);
      const color = fromOklch(l, c, h);
      if (color) results.push(color);
    } else {
      const s = config.fixedSaturation ?? (50 + random() * 45);
      const lVal = config.fixedLightnessHsl ?? (35 + random() * 40);
      const color = fromHsl(h, s, lVal);
      if (color) results.push(color);
    }
  }

  return results;
}

/**
 * Get colorful method display name
 */
export function getColorfulMethodName(method: ColorfulMethod): string {
  const names: Record<ColorfulMethod, string> = {
    spectrum: "Spectrum",
    vibrant: "Vibrant",
    pastel: "Pastel",
    dark: "Dark",
    neon: "Neon",
    warm: "Warm",
    cool: "Cool",
    earth: "Earth",
    random: "Random",
  };
  return names[method];
}

/**
 * Get all colorful methods
 */
export function getAllColorfulMethods(): ColorfulMethod[] {
  return [
    "spectrum",
    "vibrant",
    "pastel",
    "dark",
    "neon",
    "warm",
    "cool",
    "earth",
    "random",
  ];
}
