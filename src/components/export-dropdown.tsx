"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { type ColorFormat } from "./color-swatch";
import { type ColorSpace } from "@/lib/color-utils";

interface FormatDropdownProps {
  format: ColorFormat;
  onFormatChange: (format: ColorFormat) => void;
}

export function FormatDropdown({ format, onFormatChange }: FormatDropdownProps) {
  const formatLabels: Record<ColorFormat, string> = {
    hex: "HEX",
    rgb: "RGB",
    oklch: "OKLCH",
    hsl: "HSL",
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="w-24">
          {formatLabels[format]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Output Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={format}
          onValueChange={(v) => onFormatChange(v as ColorFormat)}
        >
          <DropdownMenuRadioItem value="hex">
            HEX (#FF0000)
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="rgb">
            RGB (255, 0, 0)
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="oklch">
            OKLCH (62.8% 0.26 29.2°)
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="hsl">
            HSL (0° 100% 50%)
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface ColorSpaceDropdownProps {
  colorSpace: ColorSpace;
  onColorSpaceChange: (space: ColorSpace) => void;
}

export function ColorSpaceDropdown({
  colorSpace,
  onColorSpaceChange,
}: ColorSpaceDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="w-24">
          {colorSpace.toUpperCase()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Color Space</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={colorSpace}
          onValueChange={(v) => onColorSpaceChange(v as ColorSpace)}
        >
          <DropdownMenuRadioItem value="oklch">
            OKLCH (Perceptually Uniform)
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="hsl">
            HSL (Traditional)
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
