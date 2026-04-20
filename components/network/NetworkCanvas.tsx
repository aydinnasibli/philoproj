"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { PhilosopherNode } from "@/lib/mockData";

type Props = { philosophers: PhilosopherNode[] };

type Edge = { from: PhilosopherNode; to: PhilosopherNode; index: number };

function buildEdges(philosophers: PhilosopherNode[]): Edge[] {
  const map = new Map(philosophers.map((p) => [p._id, p]));
  const seen = new Set<string>();
  const edges: Edge[] = [];
  let i = 0;
  for (const p of philosophers) {
    for (const sid of p.students) {
      const student = map.get(sid);
      if (!student) continue;
      const key = [p._id, sid].sort().join("--");
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ from: p, to: student, index: i++ });
    }
  }
  return edges;
}

function curvePath(
  x1: number, y1: number,
  x2: number, y2: number
): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  // perpendicular offset scaled to edge length
  const off = len * 0.28;
  const cx = mx - (dy / len) * off;
  const cy = my + (dx / len) * off;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

function nodeDotSize(p: PhilosopherNode): number {
  const deg = p.mentors.length + p.students.length;
  if (deg >= 2) return 16;
  if (deg === 1) return 11;
  return 8;
}

function nodeGlowSize(p: PhilosopherNode): number {
  return nodeDotSize(p) * 3.5;
}

function edgeCount(philosophers: PhilosopherNode[]): number {
  return buildEdges(philosophers).length;
}

function threadDensity(philosophers: PhilosopherNode[]): string {
  if (philosophers.length === 0) return "0.00";
  const density = edgeCount(philosophers) / philosophers.length;
  return density.toFixed(2);
}

export default function NetworkCanvas({ philosophers }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const edges = buildEdges(philosophers);

  const isRelevantEdge = useCallback(
    (e: Edge) => hoveredId === e.from._id || hoveredId === e.to._id,
    [hoveredId]
  );

  if (philosophers.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--ink-muted)", fontSize: "1.25rem" }}>
        The network is empty. Run <code style={{ margin: "0 6px", fontStyle: "normal", background: "var(--canvas-warm)", padding: "2px 6px" }}>npm run seed</code> to populate.
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
        background: "radial-gradient(ellipse at 50% 40%, rgba(252,245,230,0.6) 0%, var(--canvas) 65%)",
      }}
    >
      {/* Atmospheric soft glow */}
      <div style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background: "radial-gradient(circle at 50% 50%, rgba(196,112,41,0.06) 0%, transparent 65%)",
      }} />

      {/* SVG connection layer — viewBox matches percentage space so left/top % align */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {edges.map((edge) => {
          const relevant = isRelevantEdge(edge);
          const dimmed = hoveredId !== null && !relevant;
          const x1 = edge.from.networkX;
          const y1 = edge.from.networkY;
          const x2 = edge.to.networkX;
          const y2 = edge.to.networkY;
          return (
            <motion.path
              key={`${edge.from._id}-${edge.to._id}`}
              d={curvePath(x1, y1, x2, y2)}
              fill="none"
              stroke={relevant ? "var(--accent)" : "var(--ink)"}
              strokeWidth={relevant ? 0.22 : 0.12}
              opacity={dimmed ? 0.08 : relevant ? 0.6 : 0.25}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: dimmed ? 0.08 : relevant ? 0.6 : 0.25 }}
              transition={{
                pathLength: { duration: 2.4, ease: "easeOut", delay: edge.index * 0.15 },
                opacity: { duration: 0.3 },
              }}
            />
          );
        })}
      </svg>

      {/* Philosopher Dot Nodes */}
      {philosophers.map((p) => {
        const isHovered = hoveredId === p._id;
        const isDimmed = hoveredId !== null && !isHovered;
        const dotSize = nodeDotSize(p);
        const glowSize = nodeGlowSize(p);

        return (
          <div
            key={p._id}
            style={{
              position: "absolute",
              left: `${p.networkX}%`,
              top: `${p.networkY}%`,
              transform: "translate(-50%, -50%)",
              zIndex: isHovered ? 30 : 10,
              opacity: isDimmed ? 0.2 : 1,
              transition: "opacity 0.3s ease",
            }}
            onMouseEnter={() => setHoveredId(p._id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Pulsing glow */}
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.15, 0.3] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: (p.networkX % 2) }}
              style={{
                position: "absolute",
                width: glowSize,
                height: glowSize,
                borderRadius: "50%",
                backgroundColor: isHovered ? "rgba(196,112,41,0.25)" : "rgba(17,21,26,0.12)",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                filter: "blur(6px)",
                pointerEvents: "none",
              }}
            />

            {/* Dot */}
            <motion.div
              animate={{ scale: isHovered ? 1.6 : 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              style={{
                width: dotSize,
                height: dotSize,
                borderRadius: "50%",
                backgroundColor: isHovered ? "var(--accent)" : "var(--ink)",
                border: `2.5px solid var(--canvas)`,
                cursor: "pointer",
                position: "relative",
                zIndex: 2,
                boxShadow: isHovered ? "0 0 0 3px rgba(196,112,41,0.2)" : "none",
                transition: "background-color 0.25s ease, box-shadow 0.25s ease",
              }}
            />

            {/* Name + branch label */}
            <div style={{ marginTop: 14, textAlign: "center", pointerEvents: "none", whiteSpace: "nowrap" }}>
              <span style={{
                display: "block",
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: "1rem",
                fontWeight: 500,
                color: "var(--ink)",
                letterSpacing: "-0.01em",
              }}>
                {p.name}
              </span>
              <span style={{
                display: "block",
                fontFamily: "var(--font-sans)",
                fontSize: "8.5px",
                fontWeight: 600,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--ink-muted)",
                marginTop: 3,
              }}>
                {p.coreBranch}
              </span>
            </div>

            {/* Floating quote card on hover */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    top: dotSize + 68,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 256,
                    padding: "24px",
                    backgroundColor: "rgba(252,251,249,0.96)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    borderRadius: 16,
                    boxShadow: "0 12px 40px rgba(17,21,26,0.10)",
                    border: "1px solid var(--border-pale)",
                    zIndex: 50,
                    pointerEvents: "auto",
                  }}
                >
                  <p style={{
                    fontFamily: "var(--font-serif)",
                    fontStyle: "italic",
                    fontSize: "0.82rem",
                    lineHeight: 1.65,
                    color: "var(--ink)",
                    marginBottom: 16,
                  }}>
                    &ldquo;{p.hookQuote}&rdquo;
                  </p>
                  <div style={{ height: 1, width: 28, backgroundColor: "var(--accent)", marginBottom: 10 }} />
                  <p style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "9px",
                    fontWeight: 600,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--ink-muted)",
                    marginBottom: 16,
                  }}>
                    {p.name}
                  </p>
                  <Link
                    href={`/philosophers/${p.slug}`}
                    style={{
                      display: "inline-block",
                      fontFamily: "var(--font-sans)",
                      fontSize: "9px",
                      fontWeight: 700,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "var(--accent)",
                      textDecoration: "none",
                      borderBottom: "1px solid var(--accent)",
                      paddingBottom: 1,
                    }}
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
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        style={{
          position: "fixed",
          bottom: "2.5rem",
          right: "2.5rem",
          width: 300,
          padding: "28px 32px",
          backgroundColor: "rgba(252,251,249,0.62)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderRadius: 14,
          border: "1px solid rgba(17,21,26,0.07)",
          boxShadow: "0 4px 28px rgba(17,21,26,0.04)",
          zIndex: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ height: 1, width: 28, backgroundColor: "var(--ink)" }} />
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--ink)" }}>
            Map Statistics
          </span>
        </div>

        {[
          { label: "Active Cognitions", value: String(philosophers.length) },
          { label: "Thread Density", value: threadDensity(philosophers) },
          { label: "Atmospheric Sync", value: "Active" },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "1px solid rgba(17,21,26,0.08)", paddingBottom: 14, marginBottom: 14 }}>
            <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "0.85rem", color: "var(--ink)" }}>{label}</span>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "1.2rem", fontWeight: 300, color: "var(--ink)" }}>{value}</span>
          </div>
        ))}

        <p style={{ fontFamily: "var(--font-sans)", fontSize: "10.5px", lineHeight: 1.7, color: "var(--ink-muted)", opacity: 0.75, marginTop: 8 }}>
          The map represents a living network of ideas. Connections expand and contract based on collective intellectual focus within the archive.
        </p>
      </motion.div>

      {/* Bottom-left: Navigation hints */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.55 }}
        style={{
          position: "fixed",
          bottom: "2.5rem",
          left: "calc(80px + 2rem)",
          display: "flex",
          gap: 40,
          zIndex: 20,
        }}
      >
        {[
          { hint: "Hover Node", desc: "To manifest a fragment" },
          { hint: "Click Core", desc: "To enter the archive" },
        ].map(({ hint, desc }) => (
          <div key={hint} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "8px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-muted)", opacity: 0.55 }}>{hint}</span>
            <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "0.8rem", color: "var(--ink)" }}>{desc}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
