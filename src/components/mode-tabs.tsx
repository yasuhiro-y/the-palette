"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type GeneratorMode = "harmony" | "variations" | "tonal" | "interpolation" | "colorful" | "image";

interface ModeTabsProps {
  value: GeneratorMode;
  onChange: (mode: GeneratorMode) => void;
}

export function ModeTabs({ value, onChange }: ModeTabsProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as GeneratorMode)}>
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="harmony" className="text-xs sm:text-sm">
          Harmony
        </TabsTrigger>
        <TabsTrigger value="variations" className="text-xs sm:text-sm">
          Variations
        </TabsTrigger>
        <TabsTrigger value="tonal" className="text-xs sm:text-sm">
          Tonal
        </TabsTrigger>
        <TabsTrigger value="interpolation" className="text-xs sm:text-sm">
          Gradient
        </TabsTrigger>
        <TabsTrigger value="colorful" className="text-xs sm:text-sm">
          Colorful
        </TabsTrigger>
        <TabsTrigger value="image" className="text-xs sm:text-sm">
          Image
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
