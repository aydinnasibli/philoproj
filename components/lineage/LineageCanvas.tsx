"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { LineageNode } from "@/lib/mockData";

type Props = { nodes: LineageNode[] };
type Edge = { from: LineageNode; to: LineageNode };
type Pos = { x: number; y: number }; // percentage 0–100

// ── Era bands — visual horizontal strips ──────────────────
const ERA_BANDS = [
  {
    id: "era-1",
    label: "The Socratic Epoch",
    subLabel: "470 – 322 BC",
    yStart: 5,
    yEnd: 34,
    fill: "rgba(215,170,50,0.055)",
    stroke: "rgba(215,170,50,0.22)",
    labelColor: "#7a5e00",
  },
  {
    id: "era-3",
    label: "The Early Modern Turn",
    subLabel: "1596 – 1780",
    yStart: 40,
    yEnd: 68,
    fill: "rgba(195,100,55,0.055)",
    stroke: "rgba(195,100,55,0.22)",
    labelColor: "#7a3c15",
  },
  {
    id: "era-4",
    label: "Critical & Post-Critical",
    subLabel: "1724 – 1951",
    yStart: 68,
    yEnd: 96,
    fill: "rgba(90,105,175,0.055)",
    stroke: "rgba(90,105,175,0.22)",
    labelColor: "#38407a",
  },
];

// ── Chronological Y mapping per era ──────────────────────
const ERA_Y_MAP: Record<string, { yStart: number; yEnd: number; yearStart: number; yearEnd: number }> = {
  "era-1": { yStart: 11, yEnd: 29, yearStart: -470, yearEnd: -322 },
  "era-3": { yStart: 45, yEnd: 63, yearStart: 1596, yearEnd: 1780 },
  "era-4": { yStart: 72, yEnd: 91, yearStart: 1724, yearEnd: 1951 },
};

function computeChronologicalY(n: LineageNode): number {
  const band = ERA_Y_MAP[n.eraId];
  if (!band) return n.networkY;
  const t = Math.max(0, Math.min(1, (n.birthYear - band.yearStart) / (band.yearEnd - band.yearStart)));
  return band.yStart + t * (band.yEnd - band.yStart);
}

// ── Edge helpers ──────────────────────────────────────────
function buildEdges(nodes: LineageNode[]): Edge[] {
  const map = new Map(nodes.map((n) => [n._id, n]));
  const seen = new Set<string>();
  const edges: Edge[] = [];
  for (const n of nodes) {
    for (const sid of n.students) {
      const s = map.get(sid);
      if (!s) continue;
      const key = `${n._id}--${sid}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ from: n, to: s });
    }
  }
  return edges;
}

// Adjusted endpoint: stops `margin` pixels before the target centre
function edgeEndpoint(
  x1: number, y1: number,
  x2: number, y2: number,
  margin: number
): [number, number] {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return [x2 - (dx / len) * margin, y2 - (dy / len) * margin];
}

// Gentle quadratic bezier
function curvePath(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const off = len * 0.2;
  const cx = mx - (dy / len) * off;
  const cy = my + (dx / len) * off;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

function circleSize(n: LineageNode): number {
  const deg = n.mentors.length + n.students.length;
  if (deg >= 2) return 120;
  if (deg === 1) return 96;
  return 76;
}

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;

export default function LineageCanvas({ nodes }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());
  const [viewport, setViewport] = useState({ zoom: 1, panX: 0, panY: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dims, setDims] = useState({ w: 1440, h: 900 });

  // Positions: X from data, Y computed chronologically
  const nodePos = useRef<Record<string, Pos>>(
    Object.fromEntries(
      nodes.map((n) => [n._id, { x: n.networkX, y: computeChronologicalY(n) }])
    )
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef(viewport);
  viewportRef.current = viewport;
  const isDraggingRef = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const edges = buildEdges(nodes);
  const hoveredNode = nodes.find((n) => n._id === hoveredId) ?? null;
  const contextNode = hoveredNode ?? nodes[0] ?? null;

  useEffect(() => {
    const update = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) setDims({ w: rect.width, h: rect.height });
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const v = viewportRef.current;
      const factor = 1 - e.deltaY * 0.001;
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, v.zoom * factor));
      const ratio = newZoom / v.zoom;
      setViewport({
        zoom: newZoom,
        panX: mouseX * (1 - ratio) + v.panX * ratio,
        panY: mouseY * (1 - ratio) + v.panY * ratio,
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("a, button")) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    const v = viewportRef.current;
    dragStart.current = { x: e.clientX, y: e.clientY, panX: v.panX, panY: v.panY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setViewport((prev) => ({ ...prev, panX: dragStart.current.panX + dx, panY: dragStart.current.panY + dy }));
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

  const zoomAtCenter = useCallback((factor: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    setViewport((prev) => {
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev.zoom * factor));
      const ratio = newZoom / prev.zoom;
      return { zoom: newZoom, panX: cx * (1 - ratio) + prev.panX * ratio, panY: cy * (1 - ratio) + prev.panY * ratio };
    });
  }, []);

  const resetViewport = useCallback(() => setViewport({ zoom: 1, panX: 0, panY: 0 }), []);

  if (nodes.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "var(--font-serif)", fontStyle: "italic", color: "#43474c" }}>
        No lineage data found.
      </div>
    );
  }

  const { zoom, panX, panY } = viewport;
  const pos = nodePos.current;

  return (
    <div
      ref={containerRef}
      style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#fcf9f4", cursor: isDragging ? "grabbing" : "grab" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Warm radial glow */}
      <div style={{
        position: "absolute", top: "50%", left: "55%", width: "55vw", height: "55vw",
        transform: "translate(-50%, -50%)",
        background: "radial-gradient(ellipse, rgba(212,176,140,0.18) 0%, transparent 65%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* Canvas texture */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.022'/%3E%3C/svg%3E")`,
      }} />

      {/* Transformed canvas layer */}
      <div style={{
        position: "absolute", inset: 0,
        transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
        transformOrigin: "0 0",
        willChange: "transform",
      }}>
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }}
          viewBox={`0 0 ${dims.w} ${dims.h}`}
        >
          <defs>
            {/* Arrowhead markers — normal and hovered */}
            <marker id="lc-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#1a1c19" opacity="0.32" />
            </marker>
            <marker id="lc-arrow-active" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#845400" opacity="0.9" />
            </marker>
          </defs>

          {/* Era band strips */}
          {ERA_BANDS.map((band) => {
            const y0 = (band.yStart / 100) * dims.h;
            const h  = ((band.yEnd - band.yStart) / 100) * dims.h;
            return (
              <g key={band.id}>
                <rect x={0} y={y0} width={dims.w} height={h} fill={band.fill} />
                {/* top dashed rule */}
                <line x1={0} y1={y0} x2={dims.w} y2={y0} stroke={band.stroke} strokeWidth={1} strokeDasharray="5 10" />
                {/* era label */}
                <text
                  x={52} y={y0 + 22}
                  fontFamily="var(--font-sans)" fontSize="9" fontWeight="700"
                  letterSpacing="0.2em" fill={band.labelColor} opacity="0.75"
                >
                  {band.label.toUpperCase()}
                </text>
                <text
                  x={52} y={y0 + 38}
                  fontFamily="var(--font-sans)" fontSize="8" fontWeight="500"
                  letterSpacing="0.1em" fill={band.labelColor} opacity="0.45"
                >
                  {band.subLabel}
                </text>
              </g>
            );
          })}

          {/* Influence edges with directional arrowheads */}
          {edges.map((edge) => {
            const p1 = pos[edge.from._id];
            const p2 = pos[edge.to._id];
            const x1 = (p1.x / 100) * dims.w;
            const y1 = (p1.y / 100) * dims.h;
            const x2 = (p2.x / 100) * dims.w;
            const y2 = (p2.y / 100) * dims.h;

            // Stop path just before target circle so arrowhead sits at its edge
            const targetRadius = circleSize(edge.to) / 2;
            const [ex, ey] = edgeEndpoint(x1, y1, x2, y2, targetRadius + 2);

            const active = hoveredId === edge.from._id || hoveredId === edge.to._id;
            const dimmed = hoveredId !== null && !active;

            return (
              <path
                key={`${edge.from._id}-${edge.to._id}`}
                d={curvePath(x1, y1, ex, ey)}
                fill="none"
                stroke={active ? "#845400" : "#1a1c19"}
                strokeWidth={active ? 1.8 : 1.2}
                opacity={dimmed ? 0.04 : active ? 0.68 : 0.22}
                markerEnd={active ? "url(#lc-arrow-active)" : "url(#lc-arrow)"}
                style={{ transition: "opacity 0.25s, stroke 0.25s" }}
              />
            );
          })}
        </svg>

        {/* Portrait nodes */}
        {nodes.map((n) => {
          const isHovered = hoveredId === n._id;
          const isDimmed  = hoveredId !== null && !isHovered;
          const size      = circleSize(n);
          const deg       = n.mentors.length + n.students.length;
          const borderPx  = deg >= 2 ? 4 : 2;
          const p         = pos[n._id];
          const cardOnLeft = p.x > 62;

          return (
            <div
              key={n._id}
              style={{
                position: "absolute",
                left: `${p.x}%`, top: `${p.y}%`,
                zIndex: isHovered ? 30 : 10,
                opacity: isDimmed ? 0.18 : 1,
                transition: "opacity 0.25s",
                cursor: "default",
              }}
              onMouseEnter={() => setHoveredId(n._id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Portrait ring */}
              <div style={{
                position: "absolute",
                top: -(size / 2), left: -(size / 2),
                width: size, height: size,
                borderRadius: "50%", overflow: "hidden",
                border: `${borderPx}px solid ${isHovered ? "#845400" : "#03192a"}`,
                boxShadow: isHovered
                  ? "0 0 0 6px rgba(132,84,0,0.14), 0 8px 32px rgba(26,28,25,0.16)"
                  : "0 4px 20px rgba(26,28,25,0.10)",
                transform: isHovered ? "scale(1.06)" : "scale(1)",
                transition: "transform 0.3s ease, border-color 0.25s, box-shadow 0.3s",
                background: "#f0ede8",
              }}>
                {n.avatarUrl && !imgErrors.has(n._id) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={n.avatarUrl}
                    alt={n.name}
                    onError={() => setImgErrors((prev) => new Set(prev).add(n._id))}
                    style={{
                      width: "100%", height: "100%", objectFit: "cover",
                      filter: isHovered
                        ? "sepia(6%) brightness(1.04) contrast(1.04)"
                        : "sepia(18%) brightness(0.96) contrast(1.05)",
                      transition: "filter 0.4s ease",
                    }}
                  />
                ) : (
                  <div style={{
                    width: "100%", height: "100%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: isHovered
                      ? "linear-gradient(135deg,#c8a97a 0%,#8a6640 100%)"
                      : "linear-gradient(135deg,#d4c4aa 0%,#a08060 100%)",
                    transition: "background 0.3s ease",
                  }}>
                    <span style={{
                      fontFamily: "var(--font-serif)", fontStyle: "italic",
                      fontSize: size * 0.42, fontWeight: 400,
                      color: "rgba(255,255,255,0.92)", userSelect: "none",
                    }}>
                      {n.name[0]}
                    </span>
                  </div>
                )}
              </div>

              {/* Name label */}
              <div style={{
                position: "absolute", top: size / 2 + 12, left: 0,
                transform: "translateX(-50%)", textAlign: "center",
                whiteSpace: "nowrap", pointerEvents: "none",
              }}>
                <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: deg >= 2 ? "1.12rem" : "0.98rem", fontWeight: 400, color: "#03192a", lineHeight: 1.2 }}>
                  {n.name}
                </div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: "8px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#43474c", opacity: 0.6, marginTop: 4 }}>
                  {n.coreBranch}
                </div>
              </div>

              {/* Hover card */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, x: cardOnLeft ? 8 : -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: cardOnLeft ? 8 : -8 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    style={{
                      position: "absolute",
                      top: -(size / 2),
                      ...(cardOnLeft ? { right: size / 2 + 24 } : { left: size / 2 + 24 }),
                      width: 296,
                      background: "rgba(252,249,244,0.98)",
                      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                      borderRadius: 14, padding: "22px 22px 18px 26px",
                      boxShadow: "0 12px 40px rgba(26,28,25,0.12), 0 2px 8px rgba(26,28,25,0.06)",
                      border: "1px solid rgba(26,28,25,0.07)",
                      pointerEvents: "auto", zIndex: 50, overflow: "hidden",
                    }}
                  >
                    <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 3, background: "#845400", borderRadius: "14px 0 0 14px" }} />
                    <div style={{ fontFamily: "var(--font-serif)", fontSize: "2.6rem", lineHeight: 0.75, color: "#845400", marginBottom: 10, userSelect: "none" }}>&ldquo;</div>
                    <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "0.9rem", lineHeight: 1.62, color: "#1c1c19", marginBottom: 10 }}>
                      {n.hookQuote}
                    </p>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", lineHeight: 1.7, color: "#43474c", marginBottom: 16 }}>
                      {n.shortSummary.slice(0, 115)}…
                    </p>
                    <Link
                      href={`/philosophers/${n.slug}`}
                      style={{ fontFamily: "var(--font-sans)", fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#845400", textDecoration: "none" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Deep Dive Into {n.name.split(" ").pop()} →
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Era context panel — fixed bottom-left */}
      <div style={{ position: "fixed", bottom: 0, left: 80, right: 0, padding: "36px 48px", pointerEvents: "none", zIndex: 20 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={contextNode?.eraId ?? "default"}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.28 }}
            style={{
              display: "inline-block", maxWidth: 420,
              background: "rgba(246,243,238,0.60)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
              borderRadius: 14, padding: "18px 24px",
              border: "1px solid rgba(26,28,25,0.07)", boxShadow: "0 4px 20px rgba(26,28,25,0.04)",
            }}
          >
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#845400", marginBottom: 7 }}>
              {hoveredNode ? "Viewing" : "Influence Map"}
            </div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "1.6rem", fontWeight: 400, color: "#03192a", lineHeight: 1.2, marginBottom: 7 }}>
              {contextNode?.eraTitle ?? "The Philosophical Lineage"}
            </h2>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", lineHeight: 1.72, color: "#43474c", opacity: 0.85 }}>
              {(contextNode?.eraDescription ?? "").slice(0, 155)}…
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Zoom controls — fixed bottom-right */}
      <div style={{ position: "fixed", bottom: 44, right: 44, display: "flex", flexDirection: "column", gap: 8, alignItems: "center", zIndex: 20 }}>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", color: "#43474c", opacity: 0.55 }}>
          {Math.round(zoom * 100)}%
        </div>
        <div style={{
          background: "rgba(252,249,244,0.92)", backdropFilter: "blur(8px)",
          borderRadius: 100, padding: "4px", display: "flex", flexDirection: "column",
          boxShadow: "0 2px 16px rgba(26,28,25,0.08)", border: "1px solid rgba(26,28,25,0.08)",
        }}>
          <button onClick={() => zoomAtCenter(1.3)} style={{ width: 40, height: 40, borderRadius: "50%", border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#1c1c19" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
          </button>
          <div style={{ width: 20, height: 1, background: "rgba(26,28,25,0.12)", margin: "0 auto" }} />
          <button onClick={() => zoomAtCenter(1 / 1.3)} style={{ width: 40, height: 40, borderRadius: "50%", border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#1c1c19" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /></svg>
          </button>
        </div>
        <button onClick={resetViewport} title="Reset view" style={{ width: 48, height: 48, borderRadius: "50%", background: "#03192a", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white", boxShadow: "0 4px 20px rgba(26,28,25,0.22)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
