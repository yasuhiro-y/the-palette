import { parseColor, type ColorResult } from "./color-utils";

/**
 * Calculate relative luminance for WCAG
 * @see https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * APCA (Accessible Perceptual Contrast Algorithm) contrast calculation
 * Simplified implementation based on APCA-W3 specification
 * @see https://github.com/Myndex/SAPC-APCA
 */
function sRGBtoY(rgb: { r: number; g: number; b: number }): number {
  // Convert 0-255 to 0-1 and linearize
  const mainTRC = 2.4;
  
  const r = Math.pow(rgb.r / 255, mainTRC);
  const g = Math.pow(rgb.g / 255, mainTRC);
  const b = Math.pow(rgb.b / 255, mainTRC);
  
  // sRGB coefficients
  return 0.2126729 * r + 0.7151522 * g + 0.0721750 * b;
}

function APCAcontrast(txtY: number, bgY: number): number {
  const normBG = 0.56;
  const normTXT = 0.57;
  const revTXT = 0.62;
  const revBG = 0.65;
  
  const scaleBoW = 1.14;
  const scaleWoB = 1.14;
  const loBoWoffset = 0.027;
  const loWoBoffset = 0.027;
  const loClip = 0.1;
  
  let SAPC = 0;
  
  // Clamp Y values
  txtY = Math.max(0, txtY);
  bgY = Math.max(0, bgY);
  
  // Determine polarity
  if (bgY > txtY) {
    // Black text on white background
    SAPC = (Math.pow(bgY, normBG) - Math.pow(txtY, normTXT)) * scaleBoW;
    return SAPC < loClip ? 0 : SAPC - loBoWoffset;
  } else {
    // White text on black background
    SAPC = (Math.pow(bgY, revBG) - Math.pow(txtY, revTXT)) * scaleWoB;
    return SAPC > -loClip ? 0 : SAPC + loWoBoffset;
  }
}

/**
 * Get APCA contrast value between two colors
 * Positive = black text on light bg, Negative = white text on dark bg
 */
export function getAPCAContrast(
  textColor: ColorResult,
  bgColor: ColorResult
): number {
  const txtY = sRGBtoY(textColor.rgb);
  const bgY = sRGBtoY(bgColor.rgb);
  return APCAcontrast(txtY, bgY) * 100;
}

/**
 * Get WCAG 2.1 contrast ratio between two colors
 */
export function getWCAGContrast(
  color1: ColorResult,
  color2: ColorResult
): number {
  const l1 = getRelativeLuminance(color1.rgb.r, color1.rgb.g, color1.rgb.b);
  const l2 = getRelativeLuminance(color2.rgb.r, color2.rgb.g, color2.rgb.b);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Determine the best text color (black or white) for a given background
 * Uses APCA for better perceptual accuracy
 */
export function getContrastTextColor(
  bgColor: ColorResult | string
): "#FFFFFF" | "#000000" {
  const bg = typeof bgColor === "string" ? parseColor(bgColor) : bgColor;
  if (!bg) return "#000000";
  
  const white = parseColor("#FFFFFF")!;
  const black = parseColor("#000000")!;
  
  const whiteContrast = Math.abs(getAPCAContrast(white, bg));
  const blackContrast = Math.abs(getAPCAContrast(black, bg));
  
  return whiteContrast > blackContrast ? "#FFFFFF" : "#000000";
}

/**
 * Quick contrast check using OKLCH lightness
 * Faster alternative for real-time updates
 */
export function getContrastTextColorFast(
  bgColor: ColorResult | string
): "#FFFFFF" | "#000000" {
  const bg = typeof bgColor === "string" ? parseColor(bgColor) : bgColor;
  if (!bg) return "#000000";
  
  // OKLCH lightness threshold (perceptually uniform)
  // Values below 0.6 need white text, above need black
  return bg.oklch.l < 0.6 ? "#FFFFFF" : "#000000";
}
