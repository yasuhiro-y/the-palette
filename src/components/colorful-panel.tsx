"use client";

import { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  generateColorful,
  getAllColorfulMethods,
  getColorfulMethodName,
  type ColorfulMethod,
} from "@/lib/generators/colorful";
import { type ColorSpace } from "@/lib/color-utils";
import { ColorGrid, type ColorFormat, type TextColorMode } from "./color-swatch";
import { JsonExport } from "./json-export";

interface ColorfulPanelProps {
  colorSpace: ColorSpace;
  format: ColorFormat;
  textColorMode: TextColorMode;
}

export function ColorfulPanel({
  colorSpace,
  format,
  textColorMode,
}: ColorfulPanelProps) {
  const [method, setMethod] = useState<ColorfulMethod>("hue-sweep");
  const [count, setCount] = useState(12);
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 100000));
  
  // Fixed parameters
  const [useFixedLightness, setUseFixedLightness] = useState(true);
  const [fixedLightness, setFixedLightness] = useState(0.65);
  const [useFixedChroma, setUseFixedChroma] = useState(true);
  const [fixedChroma, setFixedChroma] = useState(0.18);
  // HSL
  const [fixedSaturation, setFixedSaturation] = useState(75);
  const [fixedLightnessHsl, setFixedLightnessHsl] = useState(55);

  const colors = useMemo(() => {
    return generateColorful(
      {
        method,
        count,
        seed,
        fixedLightness: useFixedLightness ? fixedLightness : undefined,
        fixedChroma: useFixedChroma ? fixedChroma : undefined,
        fixedSaturation: useFixedLightness ? fixedSaturation : undefined,
        fixedLightnessHsl: useFixedChroma ? fixedLightnessHsl : undefined,
      },
      colorSpace
    );
  }, [method, count, seed, colorSpace, useFixedLightness, fixedLightness, useFixedChroma, fixedChroma, fixedSaturation, fixedLightnessHsl]);

  const methods = getAllColorfulMethods();

  const handleReshuffle = () => {
    setSeed(Math.floor(Math.random() * 100000));
  };

  // Calculate optimal column count
  const columns = count <= 6 ? count : count <= 12 ? 6 : count <= 20 ? 10 : 12;

  return (
    <div className="space-y-6">
      {/* Method Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Generation Method</label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {methods.map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`
                px-3 py-2 rounded-lg text-xs font-medium transition-all
                ${
                  method === m
                    ? "bg-foreground text-background"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }
              `}
            >
              {getColorfulMethodName(m)}
            </button>
          ))}
        </div>
      </div>

      {/* Count Slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-foreground">Count</label>
          <Input
            type="number"
            value={count}
            onChange={(e) => setCount(Math.max(2, Math.min(200, parseInt(e.target.value) || 2)))}
            className="w-20 h-8 text-sm"
            min={2}
            max={200}
          />
        </div>
        <Slider
          value={[count]}
          onValueChange={([v]) => setCount(v)}
          min={2}
          max={200}
          step={1}
        />
      </div>

      {/* Fixed Parameters */}
      <div className="space-y-4 p-4 bg-secondary/30 rounded-lg">
        <label className="text-sm font-medium text-foreground">Fixed Parameters</label>
        
        {colorSpace === "oklch" ? (
          <>
            {/* Lightness (OKLCH) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={useFixedLightness}
                    onChange={(e) => setUseFixedLightness(e.target.checked)}
                    className="rounded"
                  />
                  Lightness (L)
                </label>
                <span className="text-sm text-muted-foreground">
                  {useFixedLightness ? `${(fixedLightness * 100).toFixed(0)}%` : "Random"}
                </span>
              </div>
              {useFixedLightness && (
                <Slider
                  value={[fixedLightness]}
                  onValueChange={([v]) => setFixedLightness(v)}
                  min={0.1}
                  max={0.95}
                  step={0.01}
                />
              )}
            </div>

            {/* Chroma (OKLCH) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={useFixedChroma}
                    onChange={(e) => setUseFixedChroma(e.target.checked)}
                    className="rounded"
                  />
                  Chroma (C)
                </label>
                <span className="text-sm text-muted-foreground">
                  {useFixedChroma ? fixedChroma.toFixed(2) : "Random"}
                </span>
              </div>
              {useFixedChroma && (
                <Slider
                  value={[fixedChroma]}
                  onValueChange={([v]) => setFixedChroma(v)}
                  min={0.01}
                  max={0.35}
                  step={0.01}
                />
              )}
            </div>
          </>
        ) : (
          <>
            {/* Saturation (HSL) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={useFixedLightness}
                    onChange={(e) => setUseFixedLightness(e.target.checked)}
                    className="rounded"
                  />
                  Saturation (S)
                </label>
                <span className="text-sm text-muted-foreground">
                  {useFixedLightness ? `${fixedSaturation}%` : "Random"}
                </span>
              </div>
              {useFixedLightness && (
                <Slider
                  value={[fixedSaturation]}
                  onValueChange={([v]) => setFixedSaturation(v)}
                  min={10}
                  max={100}
                  step={1}
                />
              )}
            </div>

            {/* Lightness (HSL) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={useFixedChroma}
                    onChange={(e) => setUseFixedChroma(e.target.checked)}
                    className="rounded"
                  />
                  Lightness (L)
                </label>
                <span className="text-sm text-muted-foreground">
                  {useFixedChroma ? `${fixedLightnessHsl}%` : "Random"}
                </span>
              </div>
              {useFixedChroma && (
                <Slider
                  value={[fixedLightnessHsl]}
                  onValueChange={([v]) => setFixedLightnessHsl(v)}
                  min={10}
                  max={90}
                  step={1}
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* Reshuffle */}
      {method !== "hue-sweep" && (
        <button
          onClick={handleReshuffle}
          className="w-full h-10 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors"
        >
          Reshuffle
        </button>
      )}

      {/* Generated Colors */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-foreground">Result</label>
          <span className="text-xs text-muted-foreground">
            {colors.length} colors
          </span>
        </div>
        <ColorGrid
          colors={colors}
          format={format}
          columns={columns}
          size={count > 50 ? "sm" : "md"}
          textColorMode={textColorMode}
        />
      </div>

      {/* Export - at bottom */}
      <div className="flex justify-end pt-2">
        <JsonExport colors={colors} name="colorful" />
      </div>
    </div>
  );
}
