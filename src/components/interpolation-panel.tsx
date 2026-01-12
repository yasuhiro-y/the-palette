"use client";

import { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  interpolateColors,
  getAllInterpolationMethods,
  getInterpolationMethodName,
  type InterpolationMethod,
} from "@/lib/generators/interpolation";
import { type ColorResult, type ColorSpace, randomColor } from "@/lib/color-utils";
import { ColorGrid, type ColorFormat, type TextColorMode } from "./color-swatch";
import { MultiColorInput } from "./color-input";
import { JsonExport } from "./json-export";

interface InterpolationPanelProps {
  baseColor: ColorResult;
  colorSpace: ColorSpace;
  format: ColorFormat;
  textColorMode: TextColorMode;
}

export function InterpolationPanel({
  baseColor,
  colorSpace,
  format,
  textColorMode,
}: InterpolationPanelProps) {
  const [inputColors, setInputColors] = useState<ColorResult[]>(() => [
    baseColor,
    randomColor(),
  ]);
  const [method, setMethod] = useState<InterpolationMethod>("linear");
  const [steps, setSteps] = useState(12);

  // Update first color when base color changes
  useMemo(() => {
    setInputColors((prev) => {
      if (prev[0].hex !== baseColor.hex) {
        return [baseColor, ...prev.slice(1)];
      }
      return prev;
    });
  }, [baseColor]);

  const interpolatedColors = useMemo(() => {
    return interpolateColors(inputColors, { method, steps }, colorSpace);
  }, [inputColors, method, steps, colorSpace]);

  const methods = getAllInterpolationMethods();

  // Calculate optimal columns
  const columns = steps <= 12 ? steps : steps <= 24 ? 12 : 15;

  return (
    <div className="space-y-6">
      {/* Input Colors */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Input Colors</label>
        <MultiColorInput
          colors={inputColors}
          onChange={setInputColors}
          min={2}
          max={12}
        />
      </div>

      {/* Interpolation Method */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Method</label>
        <div className="grid grid-cols-2 gap-2">
          {methods.map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  method === m
                    ? "bg-foreground text-background"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }
              `}
            >
              {getInterpolationMethodName(m)}
            </button>
          ))}
        </div>
      </div>

      {/* Step Count */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-foreground">Steps</label>
          <Input
            type="number"
            value={steps}
            onChange={(e) => setSteps(Math.max(2, Math.min(200, parseInt(e.target.value) || 2)))}
            className="w-20 h-8 text-sm"
            min={2}
            max={200}
          />
        </div>
        <Slider
          value={[steps]}
          onValueChange={([v]) => setSteps(v)}
          min={2}
          max={200}
          step={1}
        />
      </div>

      {/* Generated Gradient */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-foreground">Result</label>
          <span className="text-xs text-muted-foreground">
            {interpolatedColors.length} colors
          </span>
        </div>

        {/* Continuous gradient preview */}
        <div
          className="h-12 rounded-lg"
          style={{
            background: `linear-gradient(to right, ${interpolatedColors.map((c) => c.hex).join(", ")})`,
          }}
        />

        {/* Individual swatches */}
        <ColorGrid
          colors={interpolatedColors}
          format={format}
          columns={columns}
          size={steps > 30 ? "sm" : "md"}
          textColorMode={textColorMode}
        />
      </div>

      {/* Export - at bottom */}
      <div className="flex justify-end pt-2">
        <JsonExport colors={interpolatedColors} name="gradient" />
      </div>
    </div>
  );
}
