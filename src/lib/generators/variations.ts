import {
  type ColorResult,
  fromOklch,
  fromHsl,
  type ColorSpace,
} from "../color-utils";

export type VariationType =
  | "monochromatic"
  | "shades"
  | "tints"
  | "tones"
  | "temperature"
  | "saturation-gradient"
  | "lightness-gradient";

export interface VariationConfig {
  type: VariationType;
  count: number;
}

/**
 * Generate color variations from a base color
 */
export function generateVariations(
  baseColor: ColorResult,
  config: VariationConfig,
  colorSpace: ColorSpace = "oklch"
): ColorResult[] {
  const { type, count } = config;

  switch (type) {
    case "monochromatic":
      return generateMonochromatic(baseColor, count, colorSpace);
    case "shades":
      return generateShades(baseColor, count, colorSpace);
    case "tints":
      return generateTints(baseColor, count, colorSpace);
    case "tones":
      return generateTones(baseColor, count, colorSpace);
    case "temperature":
      return generateTemperature(baseColor, count, colorSpace);
    case "saturation-gradient":
      return generateSaturationGradient(baseColor, count, colorSpace);
    case "lightness-gradient":
      return generateLightnessGradient(baseColor, count, colorSpace);
    default:
      return generateMonochromatic(baseColor, count, colorSpace);
  }
}

function generateMonochromatic(
  baseColor: ColorResult,
  count: number,
  colorSpace: ColorSpace
): ColorResult[] {
  const results: ColorResult[] = [];

  if (colorSpace === "oklch") {
    const { c, h } = baseColor.oklch;
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1 || 1);
      const l = 0.15 + t * 0.75; // 0.15 to 0.90
      // Adjust chroma based on lightness (lower at extremes)
      const chromaMultiplier = 1 - Math.pow((l - 0.5) / 0.5, 2) * 0.5;
      const adjustedC = c * chromaMultiplier;
      const color = fromOklch(l, adjustedC, h);
      if (color) results.push(color);
    }
  } else {
    const { h, s } = baseColor.hsl;
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1 || 1);
      const l = 10 + t * 80; // 10% to 90%
      const color = fromHsl(h, s * 0.9, l);
      if (color) results.push(color);
    }
  }

  return results;
}

function generateShades(
  baseColor: ColorResult,
  count: number,
  colorSpace: ColorSpace
): ColorResult[] {
  const results: ColorResult[] = [];

  if (colorSpace === "oklch") {
    const { l, c, h } = baseColor.oklch;
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1 || 1);
      const newL = l * (1 - t * 0.85); // Darken progressively
      const newC = c * (1 - t * 0.3); // Slightly reduce chroma
      const color = fromOklch(Math.max(0.05, newL), newC, h);
      if (color) results.push(color);
    }
  } else {
    const { h, s, l } = baseColor.hsl;
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1 || 1);
      const newL = l * (1 - t * 0.9);
      const color = fromHsl(h, s, Math.max(5, newL));
      if (color) results.push(color);
    }
  }

  return results;
}

function generateTints(
  baseColor: ColorResult,
  count: number,
  colorSpace: ColorSpace
): ColorResult[] {
  const results: ColorResult[] = [];

  if (colorSpace === "oklch") {
    const { l, c, h } = baseColor.oklch;
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1 || 1);
      const newL = l + (0.97 - l) * t; // Lighten progressively
      const newC = c * (1 - t * 0.7); // Reduce chroma as it lightens
      const color = fromOklch(newL, newC, h);
      if (color) results.push(color);
    }
  } else {
    const { h, s, l } = baseColor.hsl;
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1 || 1);
      const newL = l + (95 - l) * t;
      const newS = s * (1 - t * 0.5);
      const color = fromHsl(h, newS, newL);
      if (color) results.push(color);
    }
  }

  return results;
}

function generateTones(
  baseColor: ColorResult,
  count: number,
  colorSpace: ColorSpace
): ColorResult[] {
  const results: ColorResult[] = [];

  if (colorSpace === "oklch") {
    const { l, c, h } = baseColor.oklch;
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1 || 1);
      // Mix with gray (reduce chroma)
      const newC = c * (1 - t * 0.9);
      const color = fromOklch(l, newC, h);
      if (color) results.push(color);
    }
  } else {
    const { h, s, l } = baseColor.hsl;
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1 || 1);
      const newS = s * (1 - t * 0.95);
      const color = fromHsl(h, newS, l);
      if (color) results.push(color);
    }
  }

  return results;
}

function generateTemperature(
  baseColor: ColorResult,
  count: number,
  colorSpace: ColorSpace
): ColorResult[] {
  const results: ColorResult[] = [];
  // Generate from cool (blue-ish) to warm (orange-ish) versions

  if (colorSpace === "oklch") {
    const { l, c } = baseColor.oklch;
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1 || 1);
      // Shift hue from cool (240) to warm (30)
      const h = 240 - t * 210;
      const color = fromOklch(l, c * 0.8, h);
      if (color) results.push(color);
    }
  } else {
    const { s, l } = baseColor.hsl;
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1 || 1);
      const h = 240 - t * 210;
      const color = fromHsl(h, s, l);
      if (color) results.push(color);
    }
  }

  return results;
}

function generateSaturationGradient(
  baseColor: ColorResult,
  count: number,
  colorSpace: ColorSpace
): ColorResult[] {
  const results: ColorResult[] = [];

  if (colorSpace === "oklch") {
    const { l, h } = baseColor.oklch;
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1 || 1);
      const c = 0.01 + t * 0.28; // 0.01 to 0.29
      const color = fromOklch(l, c, h);
      if (color) results.push(color);
    }
  } else {
    const { h, l } = baseColor.hsl;
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1 || 1);
      const s = 5 + t * 90; // 5% to 95%
      const color = fromHsl(h, s, l);
      if (color) results.push(color);
    }
  }

  return results;
}

function generateLightnessGradient(
  baseColor: ColorResult,
  count: number,
  colorSpace: ColorSpace
): ColorResult[] {
  const results: ColorResult[] = [];

  if (colorSpace === "oklch") {
    const { c, h } = baseColor.oklch;
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1 || 1);
      const l = 0.1 + t * 0.85; // 0.1 to 0.95
      // Adjust chroma for gamut
      const chromaMultiplier = 1 - Math.pow((l - 0.55) / 0.55, 2) * 0.4;
      const adjustedC = c * chromaMultiplier;
      const color = fromOklch(l, adjustedC, h);
      if (color) results.push(color);
    }
  } else {
    const { h, s } = baseColor.hsl;
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1 || 1);
      const l = 5 + t * 90; // 5% to 95%
      const color = fromHsl(h, s, l);
      if (color) results.push(color);
    }
  }

  return results;
}

/**
 * Get variation type display name
 */
export function getVariationTypeName(type: VariationType): string {
  const names: Record<VariationType, string> = {
    monochromatic: "Monochromatic",
    shades: "Shades (Darker)",
    tints: "Tints (Lighter)",
    tones: "Tones (Muted)",
    temperature: "Temperature",
    "saturation-gradient": "Saturation",
    "lightness-gradient": "Lightness",
  };
  return names[type];
}

/**
 * Get all variation types
 */
export function getAllVariationTypes(): VariationType[] {
  return [
    "monochromatic",
    "shades",
    "tints",
    "tones",
    "saturation-gradient",
    "lightness-gradient",
    "temperature",
  ];
}
