import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f3d26 0%, #1b5e3a 60%, #0f3d26 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 96,
            height: 96,
            borderRadius: 24,
            background: "rgba(255,255,255,0.12)",
            fontSize: 44,
            fontWeight: 700,
            marginBottom: 28,
          }}
        >
          BRK
        </div>
        <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: -1 }}>BRK Estates</div>
        <div style={{ fontSize: 26, marginTop: 16, color: "#d4af37", fontWeight: 600 }}>
          Apartments · Villas · Open Plots · Farm Land
        </div>
      </div>
    ),
    { ...size }
  );
}
