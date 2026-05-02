import { ImageResponse } from "next/og";

export const alt = "The Living Manuscript";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
          background: "#11151a",
          position: "relative",
        }}
      >
        {/* Subtle grid lines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(196,112,41,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(196,112,41,0.06) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        {/* Gold accent line top */}
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 80,
            right: 80,
            height: "1px",
            background: "linear-gradient(90deg, transparent, #c47029, transparent)",
          }}
        />

        {/* Eyebrow */}
        <div
          style={{
            display: "flex",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#c47029",
            marginBottom: 28,
          }}
        >
          Philosophy · Lineage · Ideas
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            fontSize: 80,
            fontStyle: "italic",
            fontWeight: 400,
            color: "#f5f0e8",
            lineHeight: 1.05,
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          The Living Manuscript
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: "flex",
            fontSize: 22,
            fontWeight: 400,
            color: "#8a7a6a",
            marginTop: 28,
            textAlign: "center",
            maxWidth: 680,
            lineHeight: 1.6,
          }}
        >
          A living map of Western philosophical thought — trace the lineage,
          ideas, and connections of history&apos;s greatest thinkers.
        </div>

        {/* Gold accent line bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: 80,
            right: 80,
            height: "1px",
            background: "linear-gradient(90deg, transparent, #c47029, transparent)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
