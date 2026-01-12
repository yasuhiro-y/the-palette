"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { parseColor, isValidHex, randomColor, type ColorResult } from "@/lib/color-utils";
import { getContrastTextColorFast } from "@/lib/contrast";

interface ColorInputProps {
  value: ColorResult;
  onChange: (color: ColorResult) => void;
}

export function ColorInput({ value, onChange }: ColorInputProps) {
  const [inputValue, setInputValue] = useState(value.hex);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setInputValue(value.hex.toUpperCase());
  }, [value.hex]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = e.target.value.toUpperCase();
      
      // Auto-add # prefix if missing
      if (newValue && !newValue.startsWith("#")) {
        newValue = "#" + newValue;
      }

      setInputValue(newValue);

      // Validate and update
      if (isValidHex(newValue)) {
        const parsed = parseColor(newValue);
        if (parsed) {
          setIsValid(true);
          onChange(parsed);
        }
      } else {
        setIsValid(newValue === "#" || newValue === "");
      }
    },
    [onChange]
  );

  const handleColorPickerChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = parseColor(e.target.value);
      if (parsed) {
        onChange(parsed);
        setInputValue(parsed.hex.toUpperCase());
        setIsValid(true);
      }
    },
    [onChange]
  );

  const handleRandomize = useCallback(() => {
    const random = randomColor();
    onChange(random);
    setInputValue(random.hex.toUpperCase());
    setIsValid(true);
  }, [onChange]);

  const textColor = getContrastTextColorFast(value);

  return (
    <div className="flex gap-2 items-center">
      {/* Native color picker */}
      <div className="relative">
        <input
          type="color"
          value={value.hex}
          onChange={handleColorPickerChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Pick color"
        />
        <div
          className="w-10 h-10 rounded-lg border border-border shadow-sm cursor-pointer transition-transform hover:scale-105"
          style={{ backgroundColor: value.hex }}
        />
      </div>

      {/* HEX input */}
      <Input
        value={inputValue}
        onChange={handleInputChange}
        placeholder="#000000"
        className={`
          w-28 font-mono text-sm uppercase
          ${!isValid ? "border-destructive focus-visible:ring-destructive" : ""}
        `}
        maxLength={7}
      />

      {/* Random button */}
      <button
        onClick={handleRandomize}
        className="h-10 px-3 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
        aria-label="Random color"
      >
        Random
      </button>

      {/* Preview with info */}
      <div
        className="hidden sm:flex items-center gap-3 px-4 h-10 rounded-lg text-xs font-mono"
        style={{ backgroundColor: value.hex, color: textColor }}
      >
        <span>L: {(value.oklch.l * 100).toFixed(0)}%</span>
        <span>C: {value.oklch.c.toFixed(2)}</span>
        <span>H: {value.oklch.h.toFixed(0)}°</span>
      </div>
    </div>
  );
}

interface MultiColorInputProps {
  colors: ColorResult[];
  onChange: (colors: ColorResult[]) => void;
  min?: number;
  max?: number;
}

export function MultiColorInput({
  colors,
  onChange,
  min = 2,
  max = 10,
}: MultiColorInputProps) {
  const handleColorChange = (index: number, color: ColorResult) => {
    const newColors = [...colors];
    newColors[index] = color;
    onChange(newColors);
  };

  const handleAddColor = () => {
    if (colors.length < max) {
      onChange([...colors, randomColor()]);
    }
  };

  const handleRemoveColor = (index: number) => {
    if (colors.length > min) {
      onChange(colors.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-3">
      {colors.map((color, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-4">{index + 1}</span>
          <ColorInput
            value={color}
            onChange={(c) => handleColorChange(index, c)}
          />
          {colors.length > min && (
            <button
              onClick={() => handleRemoveColor(index)}
              className="h-10 w-10 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors flex items-center justify-center"
              aria-label="Remove color"
            >
              ×
            </button>
          )}
        </div>
      ))}
      
      {colors.length < max && (
        <button
          onClick={handleAddColor}
          className="w-full h-10 rounded-lg border-2 border-dashed border-border text-muted-foreground hover:border-foreground hover:text-foreground transition-colors text-sm"
        >
          + Add Color
        </button>
      )}
    </div>
  );
}
