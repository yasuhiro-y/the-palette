import {
  type ColorResult,
  fromOklch,
  fromHsl,
  normalizeHue,
  type ColorSpace,
} from "../color-utils";

export type HarmonyType =
  | "complementary"
  | "split-complementary"
  | "triadic"
  | "tetradic"
  | "analogous"
  | "golden-ratio";

export interface HarmonyConfig {
  type: HarmonyType;
  count?: number; // For golden-ratio expansion
  spread?: number; // For analogous (default 30)
}

/**
 * Generate harmonic colors from a base color
 */
export function generateHarmony(
  baseColor: ColorResult,
  config: HarmonyConfig,
  colorSpace: ColorSpace = "oklch"
): ColorResult[] {
  const { type, count = 5, spread = 30 } = config;

  if (colorSpace === "oklch") {
    return generateHarmonyOklch(baseColor, type, count, spread);
  } else {
    return generateHarmonyHsl(baseColor, type, count, spread);
  }
}

function generateHarmonyOklch(
  baseColor: ColorResult,
  type: HarmonyType,
  count: number,
  spread: number
): ColorResult[] {
  const { l, c, h } = baseColor.oklch;
  const results: ColorResult[] = [];

  const createColor = (hue: number) => fromOklch(l, c, normalizeHue(hue));

  switch (type) {
    case "complementary":
      results.push(baseColor);
      results.push(createColor(h + 180)!);
      break;

    case "split-complementary":
      results.push(baseColor);
      results.push(createColor(h + 150)!);
      results.push(createColor(h + 210)!);
      break;

    case "triadic":
      results.push(baseColor);
      results.push(createColor(h + 120)!);
      results.push(createColor(h + 240)!);
      break;

    case "tetradic":
      results.push(baseColor);
      results.push(createColor(h + 90)!);
      results.push(createColor(h + 180)!);
      results.push(createColor(h + 270)!);
      break;

    case "analogous":
      results.push(createColor(h - spread * 2)!);
      results.push(createColor(h - spread)!);
      results.push(baseColor);
      results.push(createColor(h + spread)!);
      results.push(createColor(h + spread * 2)!);
      break;

    case "golden-ratio":
      // Golden angle ≈ 137.507764°
      const goldenAngle = 137.507764;
      for (let i = 0; i < count; i++) {
        results.push(createColor(h + i * goldenAngle)!);
      }
      break;
  }

  return results.filter((c) => c !== null);
}

function generateHarmonyHsl(
  baseColor: ColorResult,
  type: HarmonyType,
  count: number,
  spread: number
): ColorResult[] {
  const { h, s, l } = baseColor.hsl;
  const results: ColorResult[] = [];

  const createColor = (hue: number) => fromHsl(normalizeHue(hue), s, l);

  switch (type) {
    case "complementary":
      results.push(baseColor);
      results.push(createColor(h + 180)!);
      break;

    case "split-complementary":
      results.push(baseColor);
      results.push(createColor(h + 150)!);
      results.push(createColor(h + 210)!);
      break;

    case "triadic":
      results.push(baseColor);
      results.push(createColor(h + 120)!);
      results.push(createColor(h + 240)!);
      break;

    case "tetradic":
      results.push(baseColor);
      results.push(createColor(h + 90)!);
      results.push(createColor(h + 180)!);
      results.push(createColor(h + 270)!);
      break;

    case "analogous":
      results.push(createColor(h - spread * 2)!);
      results.push(createColor(h - spread)!);
      results.push(baseColor);
      results.push(createColor(h + spread)!);
      results.push(createColor(h + spread * 2)!);
      break;

    case "golden-ratio":
      const goldenAngle = 137.507764;
      for (let i = 0; i < count; i++) {
        results.push(createColor(h + i * goldenAngle)!);
      }
      break;
  }

  return results.filter((c) => c !== null);
}

/**
 * Get harmony type display name
 */
export function getHarmonyName(type: HarmonyType): string {
  const names: Record<HarmonyType, string> = {
    complementary: "Complementary",
    "split-complementary": "Split Complementary",
    triadic: "Triadic",
    tetradic: "Tetradic",
    analogous: "Analogous",
    "golden-ratio": "Golden Ratio",
  };
  return names[type];
}

/**
 * Get all harmony types
 */
export function getAllHarmonyTypes(): HarmonyType[] {
  return [
    "complementary",
    "split-complementary",
    "triadic",
    "tetradic",
    "analogous",
    "golden-ratio",
  ];
}
