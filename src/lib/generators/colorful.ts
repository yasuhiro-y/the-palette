import {
  type ColorResult,
  fromOklch,
  fromHsl,
  normalizeHue,
  type ColorSpace,
} from "../color-utils";

export type ColorfulMethod =
  | "hue-sweep"
  | "golden-angle"
  | "random-vibrant"
  | "random-pastel"
  | "random-dark"
  | "random-warm"
  | "random-cool"
  | "earth-tones"
  | "neon";

export interface ColorfulConfig {
  method: ColorfulMethod;
  count: number;
  seed?: number;
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
 * Generate colorful palette without a base color
 */
export function generateColorful(
  config: ColorfulConfig,
  colorSpace: ColorSpace = "oklch"
): ColorResult[] {
  const { method, count, seed = Date.now() } = config;
  const random = seededRandom(seed);

  switch (method) {
    case "hue-sweep":
      return generateHueSweep(count, config, colorSpace);
    case "golden-angle":
      return generateGoldenAngle(count, random, config, colorSpace);
    case "random-vibrant":
      return generateRandomVibrant(count, random, config, colorSpace);
    case "random-pastel":
      return generateRandomPastel(count, random, config, colorSpace);
    case "random-dark":
      return generateRandomDark(count, random, config, colorSpace);
    case "random-warm":
      return generateRandomWarm(count, random, config, colorSpace);
    case "random-cool":
      return generateRandomCool(count, random, config, colorSpace);
    case "earth-tones":
      return generateEarthTones(count, random, config, colorSpace);
    case "neon":
      return generateNeon(count, random, config, colorSpace);
    default:
      return generateHueSweep(count, config, colorSpace);
  }
}

function generateHueSweep(
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

function generateGoldenAngle(
  count: number,
  random: () => number,
  config: ColorfulConfig,
  colorSpace: ColorSpace
): ColorResult[] {
  const goldenAngle = 137.507764;
  const startHue = random() * 360;
  const results: ColorResult[] = [];

  for (let i = 0; i < count; i++) {
    const h = normalizeHue(startHue + i * goldenAngle);
    
    if (colorSpace === "oklch") {
      const l = config.fixedLightness ?? (0.45 + random() * 0.25);
      const c = config.fixedChroma ?? (0.12 + random() * 0.12);
      const color = fromOklch(l, c, h);
      if (color) results.push(color);
    } else {
      const s = config.fixedSaturation ?? (60 + random() * 30);
      const lHsl = config.fixedLightnessHsl ?? (45 + random() * 25);
      const color = fromHsl(h, s, lHsl);
      if (color) results.push(color);
    }
  }

  return results;
}

function generateRandomVibrant(
  count: number,
  random: () => number,
  config: ColorfulConfig,
  colorSpace: ColorSpace
): ColorResult[] {
  const results: ColorResult[] = [];

  for (let i = 0; i < count; i++) {
    const h = random() * 360;
    
    if (colorSpace === "oklch") {
      const l = config.fixedLightness ?? (0.55 + random() * 0.2);
      const c = config.fixedChroma ?? (0.2 + random() * 0.1);
      const color = fromOklch(l, c, h);
      if (color) results.push(color);
    } else {
      const s = config.fixedSaturation ?? (80 + random() * 20);
      const lHsl = config.fixedLightnessHsl ?? (50 + random() * 15);
      const color = fromHsl(h, s, lHsl);
      if (color) results.push(color);
    }
  }

  return results;
}

function generateRandomPastel(
  count: number,
  random: () => number,
  config: ColorfulConfig,
  colorSpace: ColorSpace
): ColorResult[] {
  const results: ColorResult[] = [];

  for (let i = 0; i < count; i++) {
    const h = random() * 360;
    
    if (colorSpace === "oklch") {
      const l = config.fixedLightness ?? (0.85 + random() * 0.1);
      const c = config.fixedChroma ?? (0.05 + random() * 0.08);
      const color = fromOklch(l, c, h);
      if (color) results.push(color);
    } else {
      const s = config.fixedSaturation ?? (40 + random() * 30);
      const lHsl = config.fixedLightnessHsl ?? (80 + random() * 15);
      const color = fromHsl(h, s, lHsl);
      if (color) results.push(color);
    }
  }

  return results;
}

function generateRandomDark(
  count: number,
  random: () => number,
  config: ColorfulConfig,
  colorSpace: ColorSpace
): ColorResult[] {
  const results: ColorResult[] = [];

  for (let i = 0; i < count; i++) {
    const h = random() * 360;
    
    if (colorSpace === "oklch") {
      const l = config.fixedLightness ?? (0.2 + random() * 0.25);
      const c = config.fixedChroma ?? (0.08 + random() * 0.12);
      const color = fromOklch(l, c, h);
      if (color) results.push(color);
    } else {
      const s = config.fixedSaturation ?? (50 + random() * 40);
      const lHsl = config.fixedLightnessHsl ?? (15 + random() * 25);
      const color = fromHsl(h, s, lHsl);
      if (color) results.push(color);
    }
  }

  return results;
}

function generateRandomWarm(
  count: number,
  random: () => number,
  config: ColorfulConfig,
  colorSpace: ColorSpace
): ColorResult[] {
  const results: ColorResult[] = [];

  for (let i = 0; i < count; i++) {
    let h: number;
    if (random() > 0.3) {
      h = random() * 80;
    } else {
      h = 300 + random() * 60;
    }
    h = normalizeHue(h);
    
    if (colorSpace === "oklch") {
      const l = config.fixedLightness ?? (0.5 + random() * 0.3);
      const c = config.fixedChroma ?? (0.12 + random() * 0.15);
      const color = fromOklch(l, c, h);
      if (color) results.push(color);
    } else {
      const s = config.fixedSaturation ?? (60 + random() * 35);
      const lHsl = config.fixedLightnessHsl ?? (45 + random() * 35);
      const color = fromHsl(h, s, lHsl);
      if (color) results.push(color);
    }
  }

  return results;
}

function generateRandomCool(
  count: number,
  random: () => number,
  config: ColorfulConfig,
  colorSpace: ColorSpace
): ColorResult[] {
  const results: ColorResult[] = [];

  for (let i = 0; i < count; i++) {
    const h = 120 + random() * 180;
    
    if (colorSpace === "oklch") {
      const l = config.fixedLightness ?? (0.45 + random() * 0.35);
      const c = config.fixedChroma ?? (0.1 + random() * 0.15);
      const color = fromOklch(l, c, h);
      if (color) results.push(color);
    } else {
      const s = config.fixedSaturation ?? (55 + random() * 40);
      const lHsl = config.fixedLightnessHsl ?? (40 + random() * 40);
      const color = fromHsl(h, s, lHsl);
      if (color) results.push(color);
    }
  }

  return results;
}

function generateEarthTones(
  count: number,
  random: () => number,
  config: ColorfulConfig,
  colorSpace: ColorSpace
): ColorResult[] {
  const results: ColorResult[] = [];

  for (let i = 0; i < count; i++) {
    const h = 20 + random() * 70;
    
    if (colorSpace === "oklch") {
      const l = config.fixedLightness ?? (0.35 + random() * 0.35);
      const c = config.fixedChroma ?? (0.04 + random() * 0.08);
      const color = fromOklch(l, c, h);
      if (color) results.push(color);
    } else {
      const s = config.fixedSaturation ?? (25 + random() * 35);
      const lHsl = config.fixedLightnessHsl ?? (30 + random() * 40);
      const color = fromHsl(h, s, lHsl);
      if (color) results.push(color);
    }
  }

  return results;
}

function generateNeon(
  count: number,
  random: () => number,
  config: ColorfulConfig,
  colorSpace: ColorSpace
): ColorResult[] {
  const results: ColorResult[] = [];

  for (let i = 0; i < count; i++) {
    const h = random() * 360;
    
    if (colorSpace === "oklch") {
      const l = config.fixedLightness ?? (0.75 + random() * 0.15);
      const c = config.fixedChroma ?? (0.25 + random() * 0.1);
      const color = fromOklch(l, c, h);
      if (color) results.push(color);
    } else {
      const s = config.fixedSaturation ?? (95 + random() * 5);
      const lHsl = config.fixedLightnessHsl ?? (55 + random() * 15);
      const color = fromHsl(h, s, lHsl);
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
    "hue-sweep": "Hue Sweep",
    "golden-angle": "Golden Angle",
    "random-vibrant": "Vibrant",
    "random-pastel": "Pastel",
    "random-dark": "Dark",
    "random-warm": "Warm",
    "random-cool": "Cool",
    "earth-tones": "Earth Tones",
    neon: "Neon",
  };
  return names[method];
}

/**
 * Get all colorful methods
 */
export function getAllColorfulMethods(): ColorfulMethod[] {
  return [
    "hue-sweep",
    "golden-angle",
    "random-vibrant",
    "random-pastel",
    "random-dark",
    "random-warm",
    "random-cool",
    "earth-tones",
    "neon",
  ];
}
