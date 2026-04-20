"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { PhilosopherNode } from "@/lib/mockData";

type Props = { philosophers: PhilosopherNode[] };
type Edge = { from: PhilosopherNode; to: PhilosopherNode };

function buildEdges(philosophers: PhilosopherNode[]): Edge[] {
  const map = new Map(philosophers.map((p) => [p._id, p]));
  const seen = new Set<string>();
  const edges: Edge[] = [];
  for (const p of philosophers) {
    for (const sid of p.students) {
      const s = map.get(sid);
      if (!s) continue;
      const key = [p._id, sid].sort().join("--");
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ from: p, to: s });
    }
  }
  return edges;
}

function curvePath(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const off = len * 0.25;
  const cx = mx - (dy / len) * off;
  const cy = my + (dx / len) * off;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

function dotRadius(p: PhilosopherNode): number {
  const deg = p.mentors.length + p.students.length;
  if (deg >= 2) return 8;
  if (deg === 1) return 6;
  return 5;
}

export default function NetworkCanvas({ philosophers }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const edges = buildEdges(philosophers);

  if (philosophers.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "var(--font-serif)", fontStyle: "italic", color: "#43474c" }}>
        No lineage data found.
      </div>
    );
  }

  return (
    <div
      className="philosophy-grid"
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        background: "#fafaf5",
      }}
    >
      {/* Warm centre-left radial glow */}
      <div
        style={{
          position: "absolute",
          top: "45%",
          left: "50%",
          width: "60vw",
          height: "60vw",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(ellipse, rgba(196,112,41,0.07) 0%, transparent 62%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* SVG edges — viewBox 0-100 matches CSS left/top percentages */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {edges.map((edge) => {
          const active = hoveredId === edge.from._id || hoveredId === edge.to._id;
          const dimmed = hoveredId !== null && !active;
          return (
            <path
              key={`${edge.from._id}-${edge.to._id}`}
              d={curvePath(
                edge.from.networkX, edge.from.networkY,
                edge.to.networkX, edge.to.networkY
              )}
              fill="none"
              stroke={active ? "#c47029" : "#11151a"}
              strokeWidth={active ? 0.2 : 0.12}
              opacity={dimmed ? 0.04 : active ? 0.6 : 0.18}
              style={{ transition: "opacity 0.25s, stroke 0.25s" }}
            />
          );
        })}
      </svg>

      {/* Philosopher dot nodes */}
      {philosophers.map((p) => {
        const isHovered = hoveredId === p._id;
        const isDimmed = hoveredId !== null && !isHovered;
        const r = dotRadius(p);
        const size = r * 2;
        const glowSize = r * 8;

        // Hover card flips above when node is near bottom, left when near right edge
        const cardAbove = p.networkY > 58;
        const cardOnLeft = p.networkX > 68;

        return (
          <div
            key={p._id}
            style={{
              position: "absolute",
              left: `${p.networkX}%`,
              top: `${p.networkY}%`,
              zIndex: isHovered ? 30 : 10,
              opacity: isDimmed ? 0.16 : 1,
              transition: "opacity 0.25s",
              cursor: "pointer",
            }}
            onMouseEnter={() => setHoveredId(p._id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Pulsing glow — centred at anchor */}
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.12, 0.3] }}
              transition={{
                duration: 3 + (p.networkX % 4) * 0.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                position: "absolute",
                width: glowSize,
                height: glowSize,
                top: -(glowSize / 2),
                left: -(glowSize / 2),
                borderRadius: "50%",
                background: isHovered
                  ? "rgba(196,112,41,0.22)"
                  : "rgba(17,21,26,0.07)",
                filter: "blur(10px)",
                pointerEvents: "none",
              }}
            />

            {/* Dot — centred at anchor via negative offset */}
            <div
              style={{
                position: "absolute",
                width: size,
                height: size,
                top: -(size / 2),
                left: -(size / 2),
                borderRadius: "50%",
                background: isHovered ? "#c47029" : "#11151a",
                border: "2px solid #fafaf5",
                boxShadow: isHovered
                  ? "0 0 0 4px rgba(196,112,41,0.2)"
                  : "0 1px 6px rgba(17,21,26,0.14)",
                transform: isHovered ? "scale(1.6)" : "scale(1)",
                transition: "transform 0.25s ease, background 0.25s, box-shadow 0.25s",
              }}
            />

            {/* Name + branch — below the anchor */}
            <div
              style={{
                position: "absolute",
                top: size / 2 + 10,
                left: 0,
                transform: "translateX(-50%)",
                textAlign: "center",
                whiteSpace: "nowrap",
                pointerEvents: "none",
              }}
            >
              <div style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: "0.9rem",
                fontWeight: 400,
                color: "#11151a",
                lineHeight: 1.2,
              }}>
                {p.name}
              </div>
              <div style={{
                fontFamily: "var(--font-sans)",
                fontSize: "8px",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#43474c",
                opacity: 0.6,
                marginTop: 3,
              }}>
                {p.coreBranch}
              </div>
            </div>

            {/* Hover quote card */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: cardAbove ? 6 : -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: cardAbove ? 6 : -6 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    ...(cardAbove
                      ? { bottom: size / 2 + 10 }
                      : { top: size / 2 + 54 }),
                    ...(cardOnLeft
                      ? { right: 16 }
                      : { left: 16 }),
                    width: 256,
                    background: "rgba(252,251,249,0.97)",
                    backdropFilter: "blur(18px)",
                    WebkitBackdropFilter: "blur(18px)",
                    borderRadius: 14,
                    padding: "20px 20px 16px 22px",
                    boxShadow: "0 10px 36px rgba(17,21,26,0.10), 0 2px 8px rgba(17,21,26,0.05)",
                    border: "1px solid rgba(17,21,26,0.07)",
                    pointerEvents: "auto",
                    zIndex: 50,
                    overflow: "hidden",
                  }}
                >
                  {/* Accent left border */}
                  <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 3, background: "#c47029", borderRadius: "14px 0 0 14px" }} />

                  {/* Large quote mark */}
                  <div style={{ fontFamily: "var(--font-serif)", fontSize: "2.4rem", lineHeight: 0.75, color: "#c47029", marginBottom: 8, userSelect: "none" }}>
                    &ldquo;
                  </div>

                  {/* Quote */}
                  <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "0.85rem", lineHeight: 1.65, color: "#11151a", marginBottom: 10 }}>
                    {p.hookQuote}
                  </p>

                  {/* Name · branch */}
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "8.5px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#43474c", marginBottom: 14 }}>
                    {p.name} · {p.coreBranch}
                  </p>

                  {/* CTA */}
                  <Link
                    href={`/philosophers/${p.slug}`}
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "9px",
                      fontWeight: 700,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "#c47029",
                      textDecoration: "none",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Enter the Archive →
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Bottom-right: Map Statistics */}
      <div
        style={{
          position: "fixed",
          bottom: 40,
          right: 40,
          width: 272,
          padding: "22px 26px",
          background: "rgba(252,251,249,0.80)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderRadius: 14,
          border: "1px solid rgba(17,21,26,0.07)",
          boxShadow: "0 4px 24px rgba(17,21,26,0.05)",
          zIndex: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <div style={{ height: 1, width: 22, background: "#11151a" }} />
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#11151a" }}>
            Map Statistics
          </span>
        </div>
        {[
          { label: "Thinkers", value: String(philosophers.length) },
          { label: "Connections", value: String(edges.length) },
          { label: "Eras Spanned", value: "4" },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "1px solid rgba(17,21,26,0.07)", paddingBottom: 11, marginBottom: 11 }}>
            <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "0.82rem", color: "#11151a" }}>{label}</span>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "1.1rem", fontWeight: 300, color: "#11151a" }}>{value}</span>
          </div>
        ))}
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "10px", lineHeight: 1.72, color: "#43474c", opacity: 0.7, marginTop: 4 }}>
          A living map of ideas. Hover any node to surface a fragment of thought.
        </p>
      </div>

      {/* Bottom-left: Navigation hints */}
      <div
        style={{
          position: "fixed",
          bottom: 40,
          left: "calc(80px + 32px)",
          display: "flex",
          gap: 36,
          zIndex: 20,
        }}
      >
        {[
          { hint: "Hover Node", desc: "Surface a fragment" },
          { hint: "Click Link", desc: "Enter the archive" },
        ].map(({ hint, desc }) => (
          <div key={hint}>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "8px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#43474c", opacity: 0.5, marginBottom: 4 }}>
              {hint}
            </div>
            <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "0.78rem", color: "#11151a" }}>
              {desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
