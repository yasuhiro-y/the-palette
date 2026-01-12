"use client";

import { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  generateVariations,
  getAllVariationTypes,
  getVariationTypeName,
  type VariationType,
} from "@/lib/generators/variations";
import { type ColorResult, type ColorSpace } from "@/lib/color-utils";
import { ColorGrid, type ColorFormat, type TextColorMode } from "./color-swatch";
import { JsonExport } from "./json-export";

interface VariationsPanelProps {
  baseColor: ColorResult;
  colorSpace: ColorSpace;
  format: ColorFormat;
  textColorMode: TextColorMode;
}

export function VariationsPanel({
  baseColor,
  colorSpace,
  format,
  textColorMode,
}: VariationsPanelProps) {
  const [variationType, setVariationType] = useState<VariationType>("monochromatic");
  const [count, setCount] = useState(10);

  const colors = useMemo(() => {
    return generateVariations(baseColor, { type: variationType, count }, colorSpace);
  }, [baseColor, variationType, count, colorSpace]);

  const variationTypes = getAllVariationTypes();

  // Calculate optimal column count
  const columns = count <= 8 ? count : count <= 15 ? Math.ceil(count / 2) : 10;

  return (
    <div className="space-y-6">
      {/* Variation Type Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Variation Type</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {variationTypes.map((type) => (
            <button
              key={type}
              onClick={() => setVariationType(type)}
              className={`
                px-3 py-2 rounded-lg text-xs font-medium transition-all
                ${
                  variationType === type
                    ? "bg-foreground text-background"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }
              `}
            >
              {getVariationTypeName(type)}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-foreground">Count</label>
          <Input
            type="number"
            value={count}
            onChange={(e) => setCount(Math.max(2, Math.min(100, parseInt(e.target.value) || 2)))}
            className="w-20 h-8 text-sm"
            min={2}
            max={100}
          />
        </div>
        <Slider
          value={[count]}
          onValueChange={([v]) => setCount(v)}
          min={2}
          max={100}
          step={1}
        />
      </div>

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
          size={count > 30 ? "sm" : "md"}
          textColorMode={textColorMode}
        />
      </div>

      {/* Export - at bottom */}
      <div className="flex justify-end pt-2">
        <JsonExport colors={colors} name="variations" />
      </div>
    </div>
  );
}
