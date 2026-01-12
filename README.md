# The Palette - Perceptual Color Generator

A professional color palette generator built with Next.js, featuring perceptually uniform OKLCH color space support.

## Features

- **Harmony Generation**: Create color harmonies (complementary, split-complementary, triadic, tetradic, analogous, golden ratio)
- **Variations**: Generate monochromatic, shades, tints, tones, and temperature variations
- **Tonal Matrix**: Material Design-style lightness scales across multiple hues
- **Gradient Interpolation**: Linear and Catmull-Rom spline interpolation between colors
- **Colorful Mode**: Generate diverse palettes without a base color (hue sweep, golden angle, pastel, neon, etc.)
- **Image Color Extraction**: Extract dominant colors from uploaded images using k-means clustering
- **OKLCH & HSL Support**: Switch between perceptually uniform OKLCH and traditional HSL color spaces
- **Multiple Export Formats**: HEX, RGB, OKLCH, CSS variables, Tailwind config
- **APCA Contrast**: Automatic text color selection based on APCA contrast algorithm

## Tech Stack

- [Next.js 15](https://nextjs.org/) - React framework
- [Tailwind CSS 4](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [culori](https://culorijs.org/) - Color manipulation library
- TypeScript

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Color Science

This tool uses the **OKLCH** color space by default, which provides:
- **Perceptual uniformity**: Equal numerical changes produce equal perceived changes
- **Predictable lightness**: L channel accurately represents perceived brightness
- **Wide gamut support**: Can represent P3 and Rec. 2020 colors
- **Better gradients**: Smooth transitions without muddy intermediate colors

## License

MIT
