"use client";

import { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  generateHarmony,
  getAllHarmonyTypes,
  getHarmonyName,
  type HarmonyType,
} from "@/lib/generators/harmonic";
import { type ColorResult, type ColorSpace } from "@/lib/color-utils";
import { ColorGrid, type ColorFormat, type TextColorMode } from "./color-swatch";
import { JsonExport } from "./json-export";

interface HarmonicPanelProps {
  baseColor: ColorResult;
  colorSpace: ColorSpace;
  format: ColorFormat;
  textColorMode: TextColorMode;
}

export function HarmonicPanel({
  baseColor,
  colorSpace,
  format,
  textColorMode,
}: HarmonicPanelProps) {
  const [harmonyType, setHarmonyType] = useState<HarmonyType>("triadic");
  const [goldenCount, setGoldenCount] = useState(12);
  const [analogousSpread, setAnalogousSpread] = useState(30);

  const colors = useMemo(() => {
    return generateHarmony(
      baseColor,
      {
        type: harmonyType,
        count: goldenCount,
        spread: analogousSpread,
      },
      colorSpace
    );
  }, [baseColor, harmonyType, goldenCount, analogousSpread, colorSpace]);

  const harmonyTypes = getAllHarmonyTypes();

  // Calculate optimal columns
  const columns = colors.length <= 6 ? colors.length : colors.length <= 12 ? 6 : 10;

  return (
    <div className="space-y-6">
      {/* Harmony Type Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Harmony Type</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {harmonyTypes.map((type) => (
            <button
              key={type}
              onClick={() => setHarmonyType(type)}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  harmonyType === type
                    ? "bg-foreground text-background"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }
              `}
            >
              {getHarmonyName(type)}
            </button>
          ))}
        </div>
      </div>

      {/* Golden Ratio Count */}
      {harmonyType === "golden-ratio" && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-foreground">
              Number of Colors
            </label>
            <Input
              type="number"
              value={goldenCount}
              onChange={(e) => setGoldenCount(Math.max(3, Math.min(200, parseInt(e.target.value) || 3)))}
              className="w-20 h-8 text-sm"
              min={3}
              max={200}
            />
          </div>
          <Slider
            value={[goldenCount]}
            onValueChange={([v]) => setGoldenCount(v)}
            min={3}
            max={200}
            step={1}
            className="w-full"
          />
        </div>
      )}

      {/* Analogous Spread */}
      {harmonyType === "analogous" && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-foreground">
              Spread Angle
            </label>
            <span className="text-sm text-muted-foreground">{analogousSpread}°</span>
          </div>
          <Slider
            value={[analogousSpread]}
            onValueChange={([v]) => setAnalogousSpread(v)}
            min={5}
            max={90}
            step={5}
            className="w-full"
          />
        </div>
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
          size={colors.length > 20 ? "sm" : "lg"}
          textColorMode={textColorMode}
        />
      </div>

      {/* Export - at bottom */}
      <div className="flex justify-end pt-2">
        <JsonExport colors={colors} name="harmony" />
      </div>
    </div>
  );
}
