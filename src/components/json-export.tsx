"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type ColorResult } from "@/lib/color-utils";

type ExportFormat = "json-full" | "json-hex" | "json-rgb" | "json-oklch" | "css-vars" | "tailwind";

interface JsonExportProps {
  colors: ColorResult[];
  name?: string;
}

export function JsonExport({ colors, name = "palette" }: JsonExportProps) {
  const [copied, setCopied] = useState(false);

  const generateExport = useCallback(
    (format: ExportFormat): string => {
      switch (format) {
        case "json-full":
          return JSON.stringify(
            colors.map((c, i) => ({
              index: i,
              hex: c.hex,
              rgb: c.rgb,
              oklch: c.oklch,
              hsl: c.hsl,
            })),
            null,
            2
          );

        case "json-hex":
          return JSON.stringify(colors.map((c) => c.hex), null, 2);

        case "json-rgb":
          return JSON.stringify(
            colors.map((c) => c.cssRgb),
            null,
            2
          );

        case "json-oklch":
          return JSON.stringify(
            colors.map((c) => c.cssOklch),
            null,
            2
          );

        case "css-vars":
          return colors
            .map((c, i) => `--${name}-${i + 1}: ${c.hex};`)
            .join("\n");

        case "tailwind":
          const obj: Record<string, string> = {};
          colors.forEach((c, i) => {
            obj[(i + 1) * 100] = c.hex;
          });
          return JSON.stringify({ [name]: obj }, null, 2);

        default:
          return JSON.stringify(colors.map((c) => c.hex));
      }
    },
    [colors, name]
  );

  const handleExport = async (format: ExportFormat) => {
    const content = generateExport(format);
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownload = (format: ExportFormat) => {
    const content = generateExport(format);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.${format.startsWith("css") ? "css" : "json"}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {copied ? "Copied!" : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Copy to Clipboard</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport("json-hex")}>
          JSON (HEX array)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("json-rgb")}>
          JSON (RGB array)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("json-oklch")}>
          JSON (OKLCH array)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("json-full")}>
          JSON (Full data)
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport("css-vars")}>
          CSS Variables
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("tailwind")}>
          Tailwind Config
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Download File</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleDownload("json-full")}>
          Download JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
