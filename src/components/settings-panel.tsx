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

export type TextColorMode = "auto" | "white" | "black" | "none";

interface SettingsPanelProps {
  format: ColorFormat;
  onFormatChange: (format: ColorFormat) => void;
  colorSpace: ColorSpace;
  onColorSpaceChange: (space: ColorSpace) => void;
  textColorMode: TextColorMode;
  onTextColorModeChange: (mode: TextColorMode) => void;
}

export function SettingsPanel({
  format,
  onFormatChange,
  colorSpace,
  onColorSpaceChange,
  textColorMode,
  onTextColorModeChange,
}: SettingsPanelProps) {
  const formatLabels: Record<ColorFormat, string> = {
    hex: "HEX",
    rgb: "RGB",
    oklch: "OKLCH",
    hsl: "HSL",
  };

  const textModeLabels: Record<TextColorMode, string> = {
    auto: "Auto",
    white: "White",
    black: "Black",
    none: "None",
  };

  return (
    <div className="flex items-center gap-2">
      {/* Color Space */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="w-20">
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
              OKLCH (Perceptual)
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="hsl">
              HSL (Traditional)
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Output Format */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="w-20">
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
            <DropdownMenuRadioItem value="hex">HEX</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="rgb">RGB</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="oklch">OKLCH</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="hsl">HSL</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Text Color Mode */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="w-20">
            Text: {textModeLabels[textColorMode]}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Text Color</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={textColorMode}
            onValueChange={(v) => onTextColorModeChange(v as TextColorMode)}
          >
            <DropdownMenuRadioItem value="auto">
              Auto (APCA)
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="white">
              Always White
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="black">
              Always Black
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="none">
              No Text
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
