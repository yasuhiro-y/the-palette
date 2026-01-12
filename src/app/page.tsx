"use client";

import { useState, useCallback } from "react";
import { parseColor, type ColorResult, type ColorSpace } from "@/lib/color-utils";
import { ColorInput } from "@/components/color-input";
import { ModeTabs, type GeneratorMode } from "@/components/mode-tabs";
import { HarmonicPanel } from "@/components/harmonic-panel";
import { VariationsPanel } from "@/components/variations-panel";
import { TonalMatrix } from "@/components/tonal-matrix";
import { InterpolationPanel } from "@/components/interpolation-panel";
import { ColorfulPanel } from "@/components/colorful-panel";
import { ImagePanel } from "@/components/image-panel";
import { SettingsPanel } from "@/components/settings-panel";
import { type ColorFormat, type TextColorMode } from "@/components/color-swatch";

const DEFAULT_COLOR = parseColor("#6366F1")!; // Indigo

export default function Home() {
  const [baseColor, setBaseColor] = useState<ColorResult>(DEFAULT_COLOR);
  const [mode, setMode] = useState<GeneratorMode>("harmony");
  const [colorSpace, setColorSpace] = useState<ColorSpace>("oklch");
  const [format, setFormat] = useState<ColorFormat>("hex");
  const [textColorMode, setTextColorMode] = useState<TextColorMode>("auto");

  // Check if current mode needs a base color
  const needsBaseColor = mode !== "colorful" && mode !== "image";

  const handleBaseColorFromImage = useCallback((color: ColorResult) => {
    setBaseColor(color);
  }, []);

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                The Palette
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Perceptual color generator with OKLCH support
              </p>
            </div>
            <SettingsPanel
              format={format}
              onFormatChange={setFormat}
              colorSpace={colorSpace}
              onColorSpaceChange={setColorSpace}
              textColorMode={textColorMode}
              onTextColorModeChange={setTextColorMode}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Color Input - only show when mode needs base color */}
          {needsBaseColor && (
            <section className="space-y-4">
              <label className="text-sm font-medium text-foreground">
                Base Color
              </label>
              <ColorInput value={baseColor} onChange={setBaseColor} />
            </section>
          )}

          {/* Mode Tabs */}
          <section className="space-y-6">
            <ModeTabs value={mode} onChange={setMode} />

            {/* Panel Content */}
            <div className="min-h-[400px]">
              {mode === "harmony" && (
                <HarmonicPanel
                  baseColor={baseColor}
                  colorSpace={colorSpace}
                  format={format}
                  textColorMode={textColorMode}
                />
              )}
              {mode === "variations" && (
                <VariationsPanel
                  baseColor={baseColor}
                  colorSpace={colorSpace}
                  format={format}
                  textColorMode={textColorMode}
                />
              )}
              {mode === "tonal" && (
                <TonalMatrix
                  baseColor={baseColor}
                  colorSpace={colorSpace}
                  format={format}
                  textColorMode={textColorMode}
                />
              )}
              {mode === "interpolation" && (
                <InterpolationPanel
                  baseColor={baseColor}
                  colorSpace={colorSpace}
                  format={format}
                  textColorMode={textColorMode}
                />
              )}
              {mode === "colorful" && (
                <ColorfulPanel
                  colorSpace={colorSpace}
                  format={format}
                  textColorMode={textColorMode}
                />
              )}
              {mode === "image" && (
                <ImagePanel
                  colorSpace={colorSpace}
                  format={format}
                  textColorMode={textColorMode}
                  onBaseColorChange={handleBaseColorFromImage}
                />
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <p className="text-xs text-muted-foreground text-center">
            Using {colorSpace.toUpperCase()} color space • Text: {textColorMode === "auto" ? "Auto (APCA)" : textColorMode}
          </p>
        </div>
      </footer>
    </main>
  );
}
