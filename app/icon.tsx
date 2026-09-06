import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0b1220",
        borderRadius: "96px",
      }}
    >
      <div
        style={{
          width: "390px",
          height: "390px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "28px solid #1597ff",
          borderRadius: "999px",
          color: "white",
          fontSize: "180px",
          fontWeight: 900,
          letterSpacing: "-18px",
          paddingRight: "18px",
        }}
      >
        RD
      </div>
    </div>,
    size,
  );
}
