import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "The Palette - Perceptual Color Generator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)",
        }}
      >
        {/* Color swatches */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "48px",
          }}
        >
          {["#E2568B", "#E85A48", "#D17400", "#AF8A00", "#849C00", "#00AC4F", "#00A692", "#00A1B5", "#0099E0", "#6684FB", "#A170EB", "#C95FC2"].map(
            (color) => (
              <div
                key={color}
                style={{
                  width: "64px",
                  height: "64px",
                  backgroundColor: color,
                  borderRadius: "12px",
                }}
              />
            )
          )}
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: "72px",
              fontWeight: "bold",
              color: "#ffffff",
              marginBottom: "16px",
              letterSpacing: "-2px",
            }}
          >
            The Palette
          </div>
          <div
            style={{
              fontSize: "32px",
              color: "#888888",
              letterSpacing: "0.5px",
            }}
          >
            Perceptual Color Generator
          </div>
        </div>

        {/* Features */}
        <div
          style={{
            display: "flex",
            gap: "32px",
            marginTop: "48px",
            color: "#666666",
            fontSize: "20px",
          }}
        >
          <span>OKLCH</span>
          <span>•</span>
          <span>Harmony</span>
          <span>•</span>
          <span>Gradients</span>
          <span>•</span>
          <span>Image Extraction</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
