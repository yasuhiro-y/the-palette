import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Palette - Perceptual Color Generator",
  description:
    "Professional color palette generator using perceptually uniform OKLCH color space. Create harmonious palettes, tonal scales, gradients, and extract colors from images.",
  keywords: [
    "color generator",
    "palette generator",
    "OKLCH",
    "color harmony",
    "color scheme",
    "gradient generator",
    "tonal scale",
    "color extraction",
    "design tool",
    "perceptual color",
  ],
  authors: [{ name: "Yasuhiro Yokota" }],
  creator: "Yasuhiro Yokota",
  publisher: "Yasuhiro Yokota",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://the-palette.vercel.app",
    siteName: "The Palette",
    title: "The Palette - Perceptual Color Generator",
    description:
      "Professional color palette generator using perceptually uniform OKLCH color space. Create harmonious palettes, tonal scales, gradients, and extract colors from images.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "The Palette - Perceptual Color Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Palette - Perceptual Color Generator",
    description:
      "Professional color palette generator using perceptually uniform OKLCH color space.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://the-palette.vercel.app",
  },
  category: "Design Tools",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

// JSON-LD Schema
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "The Palette",
  alternateName: "The Palette - Perceptual Color Generator",
  description:
    "Professional color palette generator using perceptually uniform OKLCH color space. Create harmonious palettes, tonal scales, gradients, and extract colors from images.",
  url: "https://the-palette.vercel.app",
  applicationCategory: "DesignApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Color harmony generation (complementary, triadic, tetradic, analogous)",
    "Tonal matrix generation",
    "Gradient interpolation (linear, Catmull-Rom)",
    "Image color extraction",
    "OKLCH and HSL color space support",
    "Multiple export formats (HEX, RGB, OKLCH, CSS, Tailwind)",
    "APCA contrast calculation",
  ],
  author: {
    "@type": "Person",
    name: "Yasuhiro Yokota",
  },
  creator: {
    "@type": "Person",
    name: "Yasuhiro Yokota",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} antialiased font-sans`}>
        {children}
      </body>
    </html>
  );
}
