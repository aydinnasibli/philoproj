import { ImageResponse } from "next/og";
import { getPhilosopherBySlug } from "@/sanity/queries";

export const alt = "Philosopher card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function formatYear(y: number): string {
  return y < 0 ? `${Math.abs(y)} BC` : `${y}`;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getPhilosopherBySlug(slug);

  if (!p) {
    return new ImageResponse(
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#11151a", color: "#f5f0e8", fontSize: 40 }}>
        Philosopher not found
      </div>,
      { ...size },
    );
  }

  const lifespan = p.birthYear
    ? `${formatYear(p.birthYear)} – ${p.deathYear ? formatYear(p.deathYear) : "present"}`
    : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#11151a",
          position: "relative",
        }}
      >
        {/* Grid texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(196,112,41,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(196,112,41,0.06) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        {/* Gold accent top */}
        <div style={{ position: "absolute", top: 50, left: 70, right: 70, height: "1px", background: "linear-gradient(90deg, transparent, #c47029, transparent)" }} />

        {/* Content area */}
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", padding: "0 90px", gap: 60, width: "100%", zIndex: 1 }}>
          {/* Avatar */}
          {p.avatarUrl ? (
            <div style={{ display: "flex", width: 220, height: 220, borderRadius: "50%", overflow: "hidden", border: "3px solid rgba(196,112,41,0.6)", flexShrink: 0 }}>
              <img src={p.avatarUrl} alt="" width={220} height={220} style={{ objectFit: "cover", filter: "grayscale(0.7) brightness(0.9) contrast(1.1)" }} />
            </div>
          ) : (
            <div style={{ display: "flex", width: 220, height: 220, borderRadius: "50%", background: "#1a1714", border: "3px solid rgba(196,112,41,0.6)", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 90, fontStyle: "italic", color: "rgba(245,240,232,0.4)" }}>{p.name[0]}</span>
            </div>
          )}

          {/* Text */}
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            {/* Branch eyebrow */}
            <div style={{ display: "flex", fontSize: 12, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#c47029", marginBottom: 16 }}>
              {p.coreBranch}
            </div>

            {/* Name */}
            <div style={{ display: "flex", fontSize: 64, fontStyle: "italic", fontWeight: 400, color: "#f5f0e8", lineHeight: 1.05, marginBottom: 12 }}>
              {p.name}
            </div>

            {/* Lifespan */}
            {lifespan && (
              <div style={{ display: "flex", fontSize: 18, color: "#8a7a6a", letterSpacing: "0.08em", marginBottom: 28 }}>
                {lifespan}
              </div>
            )}

            {/* Divider */}
            <div style={{ display: "flex", width: 60, height: 2, background: "rgba(196,112,41,0.5)", marginBottom: 24 }} />

            {/* Quote */}
            {p.hookQuote && (
              <div style={{ display: "flex", fontSize: 20, fontStyle: "italic", color: "#c4b8a8", lineHeight: 1.5, maxWidth: 550 }}>
                &ldquo;{p.hookQuote}&rdquo;
              </div>
            )}
          </div>
        </div>

        {/* Branding */}
        <div style={{ position: "absolute", bottom: 50, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div style={{ display: "flex", fontSize: 14, fontStyle: "italic", color: "#5a5045", letterSpacing: "0.1em" }}>
            The Living Manuscript
          </div>
        </div>

        {/* Gold accent bottom */}
        <div style={{ position: "absolute", bottom: 50, left: 70, right: 70, height: "1px", background: "linear-gradient(90deg, transparent, #c47029, transparent)" }} />
      </div>
    ),
    { ...size },
  );
}
