"use client";

import { useState, useCallback, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { extractColorsFromImage } from "@/lib/image-colors";
import { type ColorResult, type ColorSpace } from "@/lib/color-utils";
import { ColorGrid, type ColorFormat, type TextColorMode } from "./color-swatch";
import { JsonExport } from "./json-export";

interface ImagePanelProps {
  colorSpace: ColorSpace;
  format: ColorFormat;
  textColorMode: TextColorMode;
  onBaseColorChange?: (color: ColorResult) => void;
}

export function ImagePanel({
  format,
  textColorMode,
  onBaseColorChange,
}: ImagePanelProps) {
  const [colors, setColors] = useState<ColorResult[]>([]);
  const [colorCount, setColorCount] = useState(8);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExtract = useCallback(
    async (source: File | string) => {
      setIsLoading(true);
      setError(null);
      
      try {
        const extracted = await extractColorsFromImage(source, colorCount);
        setColors(extracted);
        
        // Set first color as base color
        if (extracted.length > 0 && onBaseColorChange) {
          onBaseColorChange(extracted[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to extract colors");
        setColors([]);
      } finally {
        setIsLoading(false);
      }
    },
    [colorCount, onBaseColorChange]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      // Create preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      handleExtract(file);
    },
    [handleExtract]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      const file = e.dataTransfer.files?.[0];
      if (!file || !file.type.startsWith("image/")) return;
      
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      handleExtract(file);
    },
    [handleExtract]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleReextract = useCallback(() => {
    if (previewUrl) {
      handleExtract(previewUrl);
    }
  }, [previewUrl, handleExtract]);

  const handleClear = useCallback(() => {
    setColors([]);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200
          ${previewUrl 
            ? "border-foreground/20 bg-secondary/20" 
            : "border-foreground/30 hover:border-foreground/50 hover:bg-secondary/30"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        
        {previewUrl ? (
          <div className="space-y-4">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-48 mx-auto rounded-lg object-contain"
            />
            <p className="text-sm text-muted-foreground">
              Click or drop to replace
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-4xl">🖼️</div>
            <p className="text-sm font-medium text-foreground">
              Drop an image or click to upload
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, GIF, WebP supported
            </p>
          </div>
        )}
        
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 rounded-xl flex items-center justify-center">
            <div className="text-sm font-medium">Extracting colors...</div>
          </div>
        )}
      </div>

      {/* Color Count */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-foreground">Number of Colors</label>
          <Input
            type="number"
            value={colorCount}
            onChange={(e) => setColorCount(Math.max(2, Math.min(20, parseInt(e.target.value) || 2)))}
            className="w-20 h-8 text-sm"
            min={2}
            max={20}
          />
        </div>
        <Slider
          value={[colorCount]}
          onValueChange={([v]) => setColorCount(v)}
          min={2}
          max={20}
          step={1}
        />
      </div>

      {/* Actions */}
      {previewUrl && (
        <div className="flex gap-2">
          <button
            onClick={handleReextract}
            disabled={isLoading}
            className="flex-1 h-10 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50"
          >
            Re-extract
          </button>
          <button
            onClick={handleClear}
            className="px-4 h-10 rounded-lg border border-border text-foreground font-medium hover:bg-secondary/50 transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Extracted Colors */}
      {colors.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-foreground">Extracted Colors</label>
            <span className="text-xs text-muted-foreground">
              {colors.length} colors (sorted by dominance)
            </span>
          </div>
          <ColorGrid
            colors={colors}
            format={format}
            columns={Math.min(colors.length, 8)}
            size="lg"
            textColorMode={textColorMode}
          />
        </div>
      )}

      {/* Export - at bottom */}
      {colors.length > 0 && (
        <div className="flex justify-end pt-2">
          <JsonExport colors={colors} name="extracted" />
        </div>
      )}
    </div>
  );
}
