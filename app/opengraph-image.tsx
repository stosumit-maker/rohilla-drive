import { ImageResponse } from "next/og";

export const alt = "ROHILLA DRIVE — Official Vehicle & Mobility Network";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "#0b1220",
          color: "white",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 30, fontWeight: 800, color: "#55d6be", letterSpacing: 2 }}>
            OFFICIAL WEBSITE
          </div>
          <div style={{ fontSize: 82, fontWeight: 900, lineHeight: 1 }}>ROHILLA DRIVE</div>
          <div style={{ fontSize: 36, fontWeight: 700 }}>Complete Vehicle & Mobility Network</div>
          <div style={{ fontSize: 28, color: "#d7dee8", marginTop: 12 }}>
            New • Used • Verify • Services • Sell • Mobility
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 28, fontWeight: 800 }}>by Rohilla Multibrand Cars</div>
            <div style={{ fontSize: 24, color: "#d7dee8" }}>Ambala City, Haryana • +91 70152 60003</div>
          </div>
          <div style={{ fontSize: 34, fontWeight: 900, color: "#55d6be" }}>rohilladrive.com</div>
        </div>
      </div>
    ),
    size,
  );
}
