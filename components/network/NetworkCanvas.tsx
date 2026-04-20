"use client";

import { useState, useRef, useCallback } from "react";
import type { PhilosopherNode } from "@/lib/mockData";
import PhilosopherNodeComponent from "./PhilosopherNode";

type Props = {
  philosophers: PhilosopherNode[];
};

// Build a lookup map for edges
function buildEdgeMap(philosophers: PhilosopherNode[]) {
  const idMap = new Map(philosophers.map((p) => [p._id, p]));
  const edges: { from: PhilosopherNode; to: PhilosopherNode }[] = [];
  const seen = new Set<string>();

  for (const p of philosophers) {
    for (const studentId of p.students) {
      const student = idMap.get(studentId);
      if (student) {
        const key = [p._id, studentId].sort().join("--");
        if (!seen.has(key)) {
          seen.add(key);
          edges.push({ from: p, to: student });
        }
      }
    }
  }
  return edges;
}

export default function NetworkCanvas({ philosophers }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Highlight edges related to hovered node
  const relevantEdge = useCallback(
    (edge: { from: PhilosopherNode; to: PhilosopherNode }) => {
      if (!hoveredId) return false;
      return edge.from._id === hoveredId || edge.to._id === hoveredId;
    },
    [hoveredId]
  );

  const edges = buildEdgeMap(philosophers);

  if (philosophers.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "calc(100vh - 64px)",
          color: "var(--ink-muted)",
          fontFamily: "var(--font-serif)",
          fontSize: "1.25rem",
          fontStyle: "italic",
          gap: "1rem",
        }}
      >
        <p>The network is empty.</p>
        <p style={{ fontSize: "0.875rem", fontFamily: "var(--font-sans)", fontStyle: "normal" }}>
          Run <code style={{ background: "var(--canvas-warm)", padding: "2px 6px" }}>npm run seed</code> to populate the database.
        </p>
      </div>
    );
  }

  // Canvas dimensions (percentage-based positioning)
  const CANVAS_W = 1200;
  const CANVAS_H = 700;
  const NODE_W = 96;
  const NODE_H = 120;

  function xPx(pct: number) {
    return (pct / 100) * CANVAS_W;
  }
  function yPx(pct: number) {
    return (pct / 100) * CANVAS_H;
  }

  return (
    <div
      style={{
        width: "100%",
        height: "calc(100vh - 64px)",
        overflow: "auto",
        position: "relative",
        background: "var(--canvas)",
      }}
    >
      {/* Grid texture removed to match the smooth radial gradient mockup */}

      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: `${CANVAS_W}px`,
          minWidth: "100%",
          height: `${CANVAS_H}px`,
          minHeight: "100vh",
          margin: "0 auto",
        }}
      >
        {/* SVG Edge Layer */}
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            overflow: "visible",
            zIndex: 1,
          }}
          viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="6"
              markerHeight="6"
              refX="5"
              refY="3"
              orient="auto"
            >
              <path
                d="M0,0 L0,6 L6,3 z"
                fill="var(--accent)"
                opacity={0.5}
              />
            </marker>
          </defs>

          {edges.map((edge, i) => {
            const x1 = xPx(edge.from.networkX) + NODE_W / 2;
            const y1 = yPx(edge.from.networkY) + NODE_W / 2;
            const x2 = xPx(edge.to.networkX) + NODE_W / 2;
            const y2 = yPx(edge.to.networkY) + NODE_W / 2;
            const highlighted = relevantEdge(edge);

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={highlighted ? "var(--accent)" : "rgba(17, 21, 26, 0.25)"}
                strokeWidth={highlighted ? 1.5 : 1}
                strokeDasharray={highlighted ? "none" : i % 2 === 0 ? "none" : "3 3"}
                opacity={hoveredId && !highlighted ? 0.15 : 0.8}
                style={{ transition: "all 0.25s ease" }}
              />
            );
          })}
        </svg>

        {/* Philosopher Nodes */}
        {philosophers.map((p) => (
          <PhilosopherNodeComponent
            key={p._id}
            philosopher={p}
            isHovered={hoveredId === p._id}
            isDimmed={hoveredId !== null && hoveredId !== p._id}
            onHover={setHoveredId}
            xPx={xPx(p.networkX)}
            yPx={yPx(p.networkY)}
          />
        ))}

        {/* Bottom Left Panel */}
        <div style={{
          position: "fixed",
          bottom: "3rem",
          left: "calc(80px + 3rem)",
          background: "rgba(252, 251, 249, 0.6)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          padding: "1.75rem 2.25rem",
          borderRadius: "12px",
          border: "1px solid var(--border-pale)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.03)",
          width: "400px",
          zIndex: 30
        }}>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "9px", color: "var(--accent)", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>CURRENT VIEW</span>
          <h2 style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "1.85rem", marginTop: "0.75rem", color: "var(--ink)", fontWeight: 500, letterSpacing: "-0.01em" }}>The Socratic Epoch</h2>
          <p style={{ fontFamily: "var(--font-sans)", marginTop: "1rem", fontSize: "0.85rem", color: "var(--ink-muted)", lineHeight: 1.6 }}>You are tracing the foundational lineage of Western philosophy, beginning with Socratic questioning through the Academy and onto the Lyceum.</p>
        </div>

        {/* Bottom Right Controls */}
        <div style={{
          position: "fixed",
          bottom: "3rem",
          right: "3rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
          zIndex: 30,
          alignItems: "center"
        }}>
          <div style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(4px)", borderRadius: "100px", padding: "6px", display: "flex", flexDirection: "column", gap: "4px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <button style={{ width: "40px", height: "40px", borderRadius: "50%", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink)"}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            </button>
            <div style={{ width: "24px", height: "1px", background: "var(--border-pale)", margin: "0 auto" }} />
            <button style={{ width: "40px", height: "40px", borderRadius: "50%", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink)"}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/></svg>
            </button>
          </div>
          
          <button style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "var(--ink)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--canvas)", boxShadow: "0 4px 16px rgba(17,21,26,0.15)"}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L22 22L12 18L2 22L12 2Z"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
