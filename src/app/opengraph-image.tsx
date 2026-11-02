import { ImageResponse } from "next/og";

export const alt = "LuhGab Imports | Suplementos de Alta Performance";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
          background: "linear-gradient(135deg, #0B0B0F 0%, #171722 100%)",
          color: "#F5F5F7",
        }}
      >
        <div style={{ fontSize: 112, fontWeight: 900, color: "#D4AF37", letterSpacing: -2 }}>
          LUHGAB
        </div>
        <div style={{ fontSize: 40, letterSpacing: 18, color: "#E5C158", marginTop: 4 }}>
          IMPORTS
        </div>
        <div style={{ fontSize: 34, marginTop: 48, color: "#D4D4D8" }}>
          Suplementos 100% originais
        </div>
      </div>
    ),
    size,
  );
}
