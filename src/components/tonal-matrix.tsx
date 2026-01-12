"use client";

import { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  generateTonalMatrix,
  generateEvenHues,
  generateHarmonyHues,
  DEFAULT_STEPS,
  getStepName,
} from "@/lib/generators/tonal";
import { type ColorResult, type ColorSpace, normalizeHue } from "@/lib/color-utils";
import { ColorSwatch, type ColorFormat, type TextColorMode } from "./color-swatch";
import { JsonExport } from "./json-export";

type HuePreset = "single" | "triadic" | "tetradic" | "custom";

interface TonalMatrixProps {
  baseColor: ColorResult;
  colorSpace: ColorSpace;
  format: ColorFormat;
  textColorMode: TextColorMode;
}

export function TonalMatrix({
  baseColor,
  colorSpace,
  format,
  textColorMode,
}: TonalMatrixProps) {
  const [huePreset, setHuePreset] = useState<HuePreset>("single");
  const [customHueCount, setCustomHueCount] = useState(6);
  const [stepPreset, setStepPreset] = useState<"full" | "minimal" | "custom">("full");
  const [customStepCount, setCustomStepCount] = useState(7);

  const baseHue = colorSpace === "oklch" ? baseColor.oklch.h : baseColor.hsl.h;

  const hues = useMemo(() => {
    switch (huePreset) {
      case "single":
        return [baseHue];
      case "triadic":
        return generateHarmonyHues(baseHue, "triadic");
      case "tetradic":
        return generateHarmonyHues(baseHue, "tetradic");
      case "custom":
        return generateEvenHues(customHueCount, baseHue);
      default:
        return [baseHue];
    }
  }, [huePreset, customHueCount, baseHue]);

  const steps = useMemo(() => {
    switch (stepPreset) {
      case "full":
        return DEFAULT_STEPS;
      case "minimal":
        return [100, 300, 500, 700, 900];
      case "custom":
        const stepInterval = 900 / (customStepCount - 1);
        return Array.from(
          { length: customStepCount },
          (_, i) => Math.round(50 + i * stepInterval)
        );
      default:
        return DEFAULT_STEPS;
    }
  }, [stepPreset, customStepCount]);

  const matrixResult = useMemo(() => {
    return generateTonalMatrix(baseColor, { steps, hues }, colorSpace);
  }, [baseColor, steps, hues, colorSpace]);

  // Flatten matrix for export
  const allColors = useMemo(() => {
    return matrixResult.matrix.flat();
  }, [matrixResult]);

  const huePresets: { value: HuePreset; label: string }[] = [
    { value: "single", label: "Single" },
    { value: "triadic", label: "Triadic" },
    { value: "tetradic", label: "Tetradic" },
    { value: "custom", label: "Custom" },
  ];

  const stepPresets: { value: typeof stepPreset; label: string }[] = [
    { value: "full", label: "Full (11)" },
    { value: "minimal", label: "Minimal (5)" },
    { value: "custom", label: "Custom" },
  ];

  return (
    <div className="space-y-6">
      {/* Hue Preset Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Hue Columns</label>
        <div className="grid grid-cols-4 gap-2">
          {huePresets.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setHuePreset(value)}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  huePreset === value
                    ? "bg-foreground text-background"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>

        {huePreset === "custom" && (
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Number of hues</span>
              <Input
                type="number"
                value={customHueCount}
                onChange={(e) => setCustomHueCount(Math.max(2, Math.min(24, parseInt(e.target.value) || 2)))}
                className="w-20 h-8 text-sm"
                min={2}
                max={24}
              />
            </div>
            <Slider
              value={[customHueCount]}
              onValueChange={([v]) => setCustomHueCount(v)}
              min={2}
              max={24}
              step={1}
            />
          </div>
        )}
      </div>

      {/* Step Preset Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Lightness Steps</label>
        <div className="grid grid-cols-3 gap-2">
          {stepPresets.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setStepPreset(value)}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  stepPreset === value
                    ? "bg-foreground text-background"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>

        {stepPreset === "custom" && (
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Number of steps</span>
              <Input
                type="number"
                value={customStepCount}
                onChange={(e) => setCustomStepCount(Math.max(2, Math.min(30, parseInt(e.target.value) || 2)))}
                className="w-20 h-8 text-sm"
                min={2}
                max={30}
              />
            </div>
            <Slider
              value={[customStepCount]}
              onValueChange={([v]) => setCustomStepCount(v)}
              min={2}
              max={30}
              step={1}
            />
          </div>
        )}
      </div>

      {/* Matrix Display */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-foreground">Matrix</label>
          <span className="text-xs text-muted-foreground">
            {hues.length} × {steps.length} = {hues.length * steps.length} colors
          </span>
        </div>

        <div className="overflow-x-auto -mx-4 px-4">
          <div className="min-w-fit">
            {/* Header row with hue values */}
            <div
              className="grid gap-1 mb-1"
              style={{
                gridTemplateColumns: `48px repeat(${hues.length}, minmax(50px, 1fr))`,
              }}
            >
              <div className="text-xs text-muted-foreground flex items-center justify-end pr-2">
                Step
              </div>
              {hues.map((hue, i) => (
                <div
                  key={i}
                  className="text-xs text-muted-foreground text-center truncate"
                >
                  {normalizeHue(hue).toFixed(0)}°
                </div>
              ))}
            </div>

            {/* Matrix rows */}
            {steps.map((step, stepIndex) => (
              <div
                key={step}
                className="grid gap-1 mb-1"
                style={{
                  gridTemplateColumns: `48px repeat(${hues.length}, minmax(50px, 1fr))`,
                }}
              >
                <div className="text-xs text-muted-foreground flex items-center justify-end pr-2">
                  {getStepName(step)}
                </div>
                {matrixResult.matrix.map((hueColors, hueIndex) => (
                  <ColorSwatch
                    key={`${hueIndex}-${stepIndex}`}
                    color={hueColors[stepIndex]}
                    format={format}
                    size="sm"
                    showLabel={hues.length <= 6}
                    textColorMode={textColorMode}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export - at bottom */}
      <div className="flex justify-end pt-2">
        <JsonExport colors={allColors} name="tonal" />
      </div>
    </div>
  );
}
