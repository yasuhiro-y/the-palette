"use client";

import { useState, useCallback } from "react";
import { type ColorResult } from "@/lib/color-utils";
import { getContrastTextColorFast } from "@/lib/contrast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type ColorFormat = "hex" | "rgb" | "oklch" | "hsl";
export type TextColorMode = "auto" | "white" | "black" | "none";

interface ColorSwatchProps {
  color: ColorResult;
  format?: ColorFormat;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
  textColorMode?: TextColorMode;
}

export function ColorSwatch({
  color,
  format = "hex",
  showLabel = true,
  size = "md",
  label,
  className = "",
  textColorMode = "auto",
}: ColorSwatchProps) {
  const [copied, setCopied] = useState(false);

  const getTextColor = () => {
    switch (textColorMode) {
      case "white":
        return "#FFFFFF";
      case "black":
        return "#000000";
      case "none":
        return "transparent";
      case "auto":
      default:
        return getContrastTextColorFast(color);
    }
  };

  const textColor = getTextColor();

  const getDisplayValue = useCallback(() => {
    switch (format) {
      case "hex":
        return color.hex.toUpperCase();
      case "rgb":
        return `${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}`;
      case "oklch":
        return `${(color.oklch.l * 100).toFixed(0)}% ${color.oklch.c.toFixed(2)} ${color.oklch.h.toFixed(0)}°`;
      case "hsl":
        return `${color.hsl.h.toFixed(0)}° ${color.hsl.s.toFixed(0)}% ${color.hsl.l.toFixed(0)}%`;
      default:
        return color.hex.toUpperCase();
    }
  }, [color, format]);

  const getCopyValue = useCallback(() => {
    switch (format) {
      case "hex":
        return color.hex.toUpperCase();
      case "rgb":
        return color.cssRgb;
      case "oklch":
        return color.cssOklch;
      case "hsl":
        return color.cssHsl;
      default:
        return color.hex.toUpperCase();
    }
  }, [color, format]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getCopyValue());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const sizeClasses = {
    sm: "h-10 text-[10px]",
    md: "h-14 text-xs",
    lg: "h-20 text-sm",
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleCopy}
            className={`
              relative w-full rounded-lg transition-all duration-150
              hover:scale-[1.02] hover:shadow-md active:scale-[0.98]
              focus:outline-none focus-visible:ring-2 focus-visible:ring-ring
              ${sizeClasses[size]}
              ${className}
            `}
            style={{ backgroundColor: color.hex }}
          >
            {showLabel && (
              <span
                className="absolute inset-0 flex items-center justify-center font-medium tracking-tight"
                style={{ color: textColor }}
              >
                {copied ? "Copied!" : label || getDisplayValue()}
              </span>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          <div className="space-y-1">
            <div className="font-semibold">{color.hex.toUpperCase()}</div>
            <div className="text-muted-foreground">
              RGB: {color.rgb.r}, {color.rgb.g}, {color.rgb.b}
            </div>
            <div className="text-muted-foreground">
              OKLCH: {(color.oklch.l * 100).toFixed(1)}% {color.oklch.c.toFixed(3)}{" "}
              {color.oklch.h.toFixed(1)}°
            </div>
            <div className="text-muted-foreground text-[10px] mt-1">
              Click to copy
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface ColorGridProps {
  colors: ColorResult[];
  format?: ColorFormat;
  columns?: number;
  size?: "sm" | "md" | "lg";
  labels?: string[];
  textColorMode?: TextColorMode;
}

export function ColorGrid({
  colors,
  format = "hex",
  columns = 5,
  size = "md",
  labels,
  textColorMode = "auto",
}: ColorGridProps) {
  // Auto-calculate columns based on color count if not specified
  const effectiveColumns = Math.min(columns, colors.length);
  
  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${effectiveColumns}, minmax(0, 1fr))` }}
    >
      {colors.map((color, index) => (
        <ColorSwatch
          key={`${color.hex}-${index}`}
          color={color}
          format={format}
          size={size}
          label={labels?.[index]}
          textColorMode={textColorMode}
        />
      ))}
    </div>
  );
}
