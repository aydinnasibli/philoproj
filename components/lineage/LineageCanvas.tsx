"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { LineageNode } from "@/lib/mockData";

type Props = { nodes: LineageNode[] };

type Edge = { from: LineageNode; to: LineageNode; index: number };

function buildEdges(nodes: LineageNode[]): Edge[] {
  const map = new Map(nodes.map((n) => [n._id, n]));
  const seen = new Set<string>();
  const edges: Edge[] = [];
  let i = 0;
  for (const n of nodes) {
    for (const sid of n.students) {
      const student = map.get(sid);
      if (!student) continue;
      const key = [n._id, sid].sort().join("--");
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ from: n, to: student, index: i++ });
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

function nodeSize(n: LineageNode): number {
  const deg = n.mentors.length + n.students.length;
  if (deg >= 2) return 120;
  if (deg === 1) return 96;
  return 76;
}

function borderWidth(n: LineageNode): number {
  const deg = n.mentors.length + n.students.length;
  return deg >= 2 ? 4 : 2;
}

export default function LineageCanvas({ nodes }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const edges = buildEdges(nodes);

  const hoveredNode = hoveredId ? nodes.find((n) => n._id === hoveredId) ?? null : null;

  const isRelevantEdge = useCallback(
    (e: Edge) => hoveredId === e.from._id || hoveredId === e.to._id,
    [hoveredId]
  );

  const defaultEraNode = nodes[0] ?? null;
  const contextNode = hoveredNode ?? defaultEraNode;

  if (nodes.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--ink-muted)" }}>
        No lineage data found.
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        background: "radial-gradient(ellipse at 52% 48%, rgba(212,176,140,0.18) 0%, var(--canvas) 60%)",
      }}
    >
      {/* Canvas texture overlay */}
      <div style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E")`,
        opacity: 0.8,
      }} />

      {/* SVG edge layer */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <marker id="arrowTip" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
            <path d="M 0 0 L 5 2.5 L 0 5 z" fill="var(--ink)" opacity="0.3" />
          </marker>
          <marker id="arrowTipAccent" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
            <path d="M 0 0 L 5 2.5 L 0 5 z" fill="var(--accent)" opacity="0.7" />
          </marker>
        </defs>

        {edges.map((edge) => {
          const relevant = isRelevantEdge(edge);
          const dimmed = hoveredId !== null && !relevant;
          return (
            <motion.path
              key={`${edge.from._id}-${edge.to._id}`}
              d={curvePath(edge.from.networkX, edge.from.networkY, edge.to.networkX, edge.to.networkY)}
              fill="none"
              stroke={relevant ? "var(--accent)" : "var(--ink)"}
              strokeWidth={relevant ? 0.25 : 0.15}
              opacity={dimmed ? 0.05 : relevant ? 0.65 : 0.22}
              strokeDasharray={relevant ? "none" : "0.8 0.8"}
              markerEnd={relevant ? "url(#arrowTipAccent)" : "url(#arrowTip)"}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: 1,
                opacity: dimmed ? 0.05 : relevant ? 0.65 : 0.22,
              }}
              transition={{
                pathLength: { duration: 2.2, ease: "easeOut", delay: edge.index * 0.12 },
                opacity: { duration: 0.25 },
              }}
            />
          );
        })}
      </svg>

      {/* Philosopher portrait nodes */}
      {nodes.map((n, idx) => {
        const isHovered = hoveredId === n._id;
        const isDimmed = hoveredId !== null && !isHovered;
        const size = nodeSize(n);
        const bw = borderWidth(n);
        const isPeripheral = n.mentors.length + n.students.length === 0;

        return (
          <motion.div
            key={n._id}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: isDimmed ? (isPeripheral ? 0.15 : 0.25) : 1, scale: 1 }}
            transition={{ duration: 0.5, delay: idx * 0.06, opacity: { duration: 0.25 } }}
            style={{
              position: "absolute",
              left: `${n.networkX}%`,
              top: `${n.networkY}%`,
              transform: "translate(-50%, -50%)",
              zIndex: isHovered ? 30 : 10,
            }}
            onMouseEnter={() => setHoveredId(n._id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Portrait ring */}
            <motion.div
              animate={{
                scale: isHovered ? 1.06 : 1,
                boxShadow: isHovered
                  ? "0 0 40px 12px rgba(196,112,41,0.18), 0 0 0 3px rgba(196,112,41,0.25)"
                  : "0 4px 24px rgba(17,21,26,0.08)",
              }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              style={{
                width: size,
                height: size,
                borderRadius: "50%",
                overflow: "hidden",
                border: `${bw}px solid ${isHovered ? "var(--accent)" : "var(--ink)"}`,
                cursor: "pointer",
                backgroundColor: "var(--canvas-warm)",
                transition: "border-color 0.25s ease",
              }}
            >
              {n.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={n.avatarUrl}
                  alt={n.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    filter: isHovered
                      ? "saturate(0.5) contrast(1.05) brightness(0.98)"
                      : "saturate(0) contrast(1.1) brightness(0.9)",
                    transition: "filter 0.4s ease",
                  }}
                  loading="lazy"
                />
              ) : (
                <div style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-serif)",
                  fontSize: size * 0.35,
                  color: "var(--ink-muted)",
                }}>
                  {n.name[0]}
                </div>
              )}
            </motion.div>

            {/* Name label */}
            <div style={{ marginTop: 12, textAlign: "center", pointerEvents: "none", whiteSpace: "nowrap" }}>
              <span style={{
                display: "block",
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: isPeripheral ? "0.85rem" : "1.1rem",
                fontWeight: 500,
                color: "var(--ink)",
              }}>
                {n.name}
              </span>
              <span style={{
                display: "block",
                fontFamily: "var(--font-sans)",
                fontSize: "8px",
                fontWeight: 600,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--ink-muted)",
                marginTop: 3,
                opacity: isPeripheral ? 0.6 : 1,
              }}>
                {n.coreBranch}
              </span>
            </div>

            {/* Hover detail card */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, x: 12, scale: 0.97 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 12, scale: 0.97 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "calc(100% + 20px)",
                    width: 300,
                    padding: "28px 28px 24px",
                    backgroundColor: "rgba(252,251,249,0.97)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    borderRadius: 16,
                    boxShadow: "0 16px 48px rgba(17,21,26,0.10)",
                    border: "1px solid var(--border-pale)",
                    zIndex: 50,
                    pointerEvents: "auto",
                  }}
                >
                  {/* Accent left border */}
                  <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", borderRadius: "16px 0 0 16px", backgroundColor: "var(--accent)" }} />

                  {/* Quote mark */}
                  <div style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", lineHeight: 1, color: "var(--accent)", marginBottom: 8, opacity: 0.7 }}>
                    &ldquo;
                  </div>

                  <p style={{
                    fontFamily: "var(--font-serif)",
                    fontStyle: "italic",
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                    color: "var(--ink)",
                    marginBottom: 16,
                  }}>
                    {n.hookQuote}
                  </p>

                  <p style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.75rem",
                    lineHeight: 1.65,
                    color: "var(--ink-muted)",
                    marginBottom: 20,
                  }}>
                    {n.shortSummary.slice(0, 130)}
                    {n.shortSummary.length > 130 ? "…" : ""}
                  </p>

                  <Link
                    href={`/philosophers/${n.slug}`}
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "9px",
                      fontWeight: 700,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "var(--accent)",
                      textDecoration: "none",
                      borderBottom: "1px solid var(--accent)",
                      paddingBottom: 1,
                    }}
                  >
                    Deep Dive Into {n.name.split(" ").pop()}
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* Bottom-left: Current era panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={contextNode?.eraId ?? "none"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "fixed",
            bottom: "2.5rem",
            left: "calc(80px + 2rem)",
            width: 380,
            padding: "24px 28px",
            backgroundColor: "rgba(252,251,249,0.55)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderRadius: 14,
            border: "1px solid rgba(17,21,26,0.06)",
            boxShadow: "0 4px 24px rgba(17,21,26,0.04)",
            zIndex: 20,
            pointerEvents: "none",
          }}
        >
          <span style={{
            fontFamily: "var(--font-sans)",
            fontSize: "8.5px",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--accent)",
            display: "block",
            marginBottom: 8,
          }}>
            Current View
          </span>
          <h2 style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: "1.9rem",
            fontWeight: 500,
            color: "var(--ink)",
            letterSpacing: "-0.01em",
            marginBottom: 10,
            lineHeight: 1.15,
          }}>
            {contextNode?.eraTitle ?? "The Philosophical Lineage"}
          </h2>
          <p style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.78rem",
            lineHeight: 1.7,
            color: "var(--ink-muted)",
          }}>
            {contextNode?.eraDescription.slice(0, 180)}
            {(contextNode?.eraDescription.length ?? 0) > 180 ? "…" : ""}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Bottom-right: Zoom controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        style={{
          position: "fixed",
          bottom: "2.5rem",
          right: "2.5rem",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          alignItems: "center",
          zIndex: 20,
        }}
      >
        {/* +/- controls */}
        <div style={{
          backgroundColor: "rgba(252,251,249,0.85)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          borderRadius: 100,
          padding: "6px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          boxShadow: "0 2px 16px rgba(17,21,26,0.06)",
          border: "1px solid var(--border-pale)",
        }}>
          <button style={{
            width: 40, height: 40, borderRadius: "50%", border: "none", background: "none",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--ink)", fontSize: "1.1rem", transition: "background 0.2s",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 5v14M5 12h14" /></svg>
          </button>
          <div style={{ width: 20, height: 1, backgroundColor: "var(--border)", margin: "0 auto" }} />
          <button style={{
            width: 40, height: 40, borderRadius: "50%", border: "none", background: "none",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--ink)", transition: "background 0.2s",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 12h14" /></svg>
          </button>
        </div>

        {/* Navigation button */}
        <button style={{
          width: 52, height: 52, borderRadius: "50%",
          backgroundColor: "var(--ink)", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--canvas)",
          boxShadow: "0 4px 20px rgba(17,21,26,0.18)",
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L22 22L12 18L2 22L12 2Z" />
          </svg>
        </button>
      </motion.div>
    </div>
  );
}
