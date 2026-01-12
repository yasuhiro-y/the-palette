declare module "culori" {
  export interface Rgb {
    mode: "rgb";
    r: number;
    g: number;
    b: number;
    alpha?: number;
  }

  export interface Oklch {
    mode: "oklch";
    l: number;
    c: number;
    h?: number;
    alpha?: number;
  }

  export interface Hsl {
    mode: "hsl";
    h?: number;
    s: number;
    l: number;
    alpha?: number;
  }

  export type Color = Rgb | Oklch | Hsl | string;

  export function parse(color: string): Rgb | undefined;
  export function formatHex(color: Color): string;
  export function formatRgb(color: Color): string;
  export function formatCss(color: Color): string;
  
  export function oklch(color: Color): Oklch | undefined;
  export function rgb(color: Color): Rgb | undefined;
  export function hsl(color: Color): Hsl | undefined;
  
  // Converter function overloads for specific modes
  export function converter(mode: "rgb"): (color: Color) => Rgb | undefined;
  export function converter(mode: "oklch"): (color: Color) => Oklch | undefined;
  export function converter(mode: "hsl"): (color: Color) => Hsl | undefined;
  export function converter(mode: string): (color: Color) => Color | undefined;
  
  export function clampChroma(color: Color, mode?: string): Oklch;
  export function toGamut(mode: string): (color: Color) => Color;
  
  export function interpolate(
    colors: Color[],
    mode?: string,
    overrides?: object
  ): (t: number) => Color;
  
  export function interpolateWith(
    premap: (t: number) => number,
    postmap?: (t: number) => number
  ): (
    colors: Color[],
    mode?: string,
    overrides?: object
  ) => (t: number) => Color;
  
  export const interpolatorSplineBasis: (arr: number[]) => (t: number) => number;
  export const interpolatorSplineNatural: (arr: number[]) => (t: number) => number;
  export const interpolatorSplineMonotone: (arr: number[]) => (t: number) => number;
}
