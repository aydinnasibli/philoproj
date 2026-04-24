"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { SchoolWithPhilosophers } from "@/lib/mockData";

const SCHOOL_POS: Record<string, { x: number; y: number }> = {
  "sch-1": { x: 8,  y: 44 },   // Socratic — far left, mid height
  "sch-2": { x: 22, y: 18 },   // Platonic  — upper left
  "sch-3": { x: 38, y: 36 },   // Aristotle — left-centre
  "sch-4": { x: 55, y: 14 },   // Rationalism — upper centre
  "sch-5": { x: 51, y: 60 },   // Empiricism  — lower centre
  "sch-6": { x: 68, y: 28 },   // Critical    — right-centre
  "sch-7": { x: 76, y: 54 },   // Existentialism — lower right
  "sch-8": { x: 84, y: 74 },   // Analytic — far lower right
};

const TAGLINES: Record<string, string> = {
  "sch-1": "DIALECTIC ORIGIN",
  "sch-2": "THE REALM OF FORMS",
  "sch-3": "LOGIC & VIRTUE",
  "sch-4": "REASON SUPREME",
  "sch-5": "SENSATION & PROOF",
  "sch-6": "MIND'S FRONTIER",
  "sch-7": "BEING & VOID",
  "sch-8": "LANGUAGE AS LIMIT",
};

// Per-edge curvature — direction (+/-) and magnitude as fraction of path length
const EDGE_CURVES: Record<string, { dir: 1 | -1; mag: number }> = {
  "sch-1--sch-2": { dir:  1, mag: 0.36 },
  "sch-1--sch-3": { dir: -1, mag: 0.30 },
  "sch-2--sch-3": { dir:  1, mag: 0.34 },
  "sch-3--sch-4": { dir:  1, mag: 0.38 },
  "sch-3--sch-5": { dir: -1, mag: 0.36 },
  "sch-4--sch-6": { dir:  1, mag: 0.34 },
  "sch-5--sch-6": { dir: -1, mag: 0.32 },
  "sch-6--sch-7": { dir:  1, mag: 0.36 },
  "sch-7--sch-8": { dir:  1, mag: 0.30 },
};

const NODE_R = 6;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;

type Edge = { fromId: string; toId: string };

function buildEdges(schools: SchoolWithPhilosophers[]): Edge[] {
  const seen = new Set<string>();
  const edges: Edge[] = [];
  for (const s of schools) {
    for (const target of s.influencedTo) {
      const key = `${s._id}--${target._id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ fromId: s._id, toId: target._id });
    }
  }
  return edges;
}

function organicPath(
  x1: number, y1: number, x2: number, y2: number,
  dir: 1 | -1, mag: number,
): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const px = (-dy / len) * dir;
  const py = (dx  / len) * dir;
  const off = Math.min(len * mag, 200); // cap so short paths don't loop wildly
  const cp1x = x1 + dx * 0.35 + px * off;
  const cp1y = y1 + dy * 0.35 + py * off;
  const cp2x = x1 + dx * 0.65 + px * off * 0.80;
  const cp2y = y1 + dy * 0.65 + py * off * 0.80;
  return `M ${x1} ${y1} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${x2} ${y2}`;
}

// Returns the effective canvas-pixel position of a node including any drag offset
function getNodePx(
  id: string,
  offsets: Record<string, { dx: number; dy: number }>,
  dims: { w: number; h: number },
): { x: number; y: number } | null {
  const base = SCHOOL_POS[id];
  if (!base) return null;
  const off = offsets[id] ?? { dx: 0, dy: 0 };
  return { x: (base.x / 100) * dims.w + off.dx, y: (base.y / 100) * dims.h + off.dy };
}

type Props = { schools: SchoolWithPhilosophers[] };

export default function SchoolsCanvas({ schools }: Props) {
  const [hoveredId, setHoveredId]     = useState<string | null>(null);
  const [imgErrors, setImgErrors]     = useState<Set<string>>(new Set());
  const [viewport,  setViewport]      = useState({ zoom: 1, panX: 0, panY: 0 });
  const [isDragging, setIsDragging]   = useState(false);
  const [dims, setDims]               = useState({ w: 1440, h: 900 });
  const [nodeOffsets, setNodeOffsets] = useState<Record<string, { dx: number; dy: number }>>({});

  const containerRef  = useRef<HTMLDivElement>(null);
  const viewportRef   = useRef(viewport);
  viewportRef.current = viewport;
  const isDraggingRef = useRef(false);
  const dragStart     = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // Tracks which node is being dragged and its drag start context
  const nodeDragRef = useRef<{
    id: string; startMx: number; startMy: number; startDx: number; startDy: number;
  } | null>(null);

  const schoolMap = new Map(schools.map((s) => [s._id, s]));
  const edges     = buildEdges(schools);

  const totalPhilosophers = schools.reduce((n, s) => n + s.philosophers.length, 0);
  const maxPossible       = (schools.length * (schools.length - 1)) / 2;
  const threadDensity     = (edges.length / maxPossible).toFixed(2);

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
      const v    = viewportRef.current;
      const factor  = 1 - e.deltaY * 0.001;
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, v.zoom * factor));
      const ratio   = newZoom / v.zoom;
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      setViewport({ zoom: newZoom, panX: mx * (1 - ratio) + v.panX * ratio, panY: my * (1 - ratio) + v.panY * ratio });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("a, button, [data-node]")) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    const v = viewportRef.current;
    dragStart.current = { x: e.clientX, y: e.clientY, panX: v.panX, panY: v.panY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // Node drag takes priority over canvas pan
    if (nodeDragRef.current) {
      const { id, startMx, startMy, startDx, startDy } = nodeDragRef.current;
      const { zoom } = viewportRef.current;
      setNodeOffsets((prev) => ({
        ...prev,
        [id]: {
          dx: startDx + (e.clientX - startMx) / zoom,
          dy: startDy + (e.clientY - startMy) / zoom,
        },
      }));
      return;
    }
    if (!isDraggingRef.current) return;
    setViewport((prev) => ({
      ...prev,
      panX: dragStart.current.panX + (e.clientX - dragStart.current.x),
      panY: dragStart.current.panY + (e.clientY - dragStart.current.y),
    }));
  }, []);

  const handleMouseUp = useCallback(() => {
    nodeDragRef.current = null;
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

  // Called by individual node divs on mousedown
  const handleNodeMouseDown = useCallback((e: React.MouseEvent, id: string, currentOffset: { dx: number; dy: number }) => {
    if (e.button !== 0) return;
    e.stopPropagation(); // prevent canvas pan from starting
    nodeDragRef.current = {
      id,
      startMx: e.clientX,
      startMy: e.clientY,
      startDx: currentOffset.dx,
      startDy: currentOffset.dy,
    };
  }, []);

  const { zoom, panX, panY } = viewport;

  return (
    <div
      ref={containerRef}
      className="philosophy-grid"
      style={{
        position: "fixed", inset: 0, overflow: "hidden",
        background: "#fafaf5",
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Warm radial glow */}
      <div style={{
        position: "absolute", top: "45%", left: "50%",
        width: "60vw", height: "60vw",
        transform: "translate(-50%,-50%)",
        background: "radial-gradient(ellipse, rgba(196,112,41,0.055) 0%, transparent 62%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* ── Panned & zoomed canvas ── */}
      <div style={{
        position: "absolute", inset: 0,
        transform: `translate(${panX}px,${panY}px) scale(${zoom})`,
        transformOrigin: "0 0", willChange: "transform",
      }}>
        {/* SVG edges */}
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1, overflow: "visible" }}
          viewBox={`0 0 ${dims.w} ${dims.h}`}
        >
          {edges.map((edge) => {
            const fp = SCHOOL_POS[edge.fromId];
            const tp = SCHOOL_POS[edge.toId];
            if (!fp || !tp) return null;
            const x1 = (fp.x / 100) * dims.w;
            const y1 = (fp.y / 100) * dims.h;
            const x2 = (tp.x / 100) * dims.w;
            const y2 = (tp.y / 100) * dims.h;
            const key   = `${edge.fromId}--${edge.toId}`;
            const curve = EDGE_CURVES[key] ?? { dir: 1 as const, mag: 0.40 };
            const active = hoveredId === edge.fromId || hoveredId === edge.toId;
            const dimmed = hoveredId !== null && !active;
            return (
              <path
                key={key}
                d={organicPath(x1, y1, x2, y2, curve.dir, curve.mag)}
                fill="none"
                stroke={active ? "#c47029" : "#1a1c19"}
                strokeWidth={active ? 1.4 : 0.9}
                opacity={dimmed ? 0.03 : active ? 0.48 : 0.15}
                style={{ transition: "opacity 0.30s, stroke 0.30s, stroke-width 0.30s" }}
              />
            );
          })}
        </svg>

        {/* School nodes */}
        {schools.map((school) => {
          const pos = SCHOOL_POS[school._id];
          if (!pos) return null;
          const isHovered  = hoveredId === school._id;
          const isDimmed   = hoveredId !== null && !isHovered;
          const tagline    = TAGLINES[school._id] ?? "";
          const labelLeft  = pos.x > 70;   // flip label to left for right-edge nodes
          const cardAbove  = pos.y > 52;

          return (
            <div
              key={school._id}
              style={{
                position: "absolute",
                left: `${pos.x}%`, top: `${pos.y}%`,
                zIndex: isHovered ? 30 : 10,
                opacity: isDimmed ? 0.18 : 1,
                transition: "opacity 0.30s",
                cursor: "default",
              }}
              onMouseEnter={() => setHoveredId(school._id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Dot */}
              <div style={{
                position: "absolute",
                width: NODE_R * 2, height: NODE_R * 2,
                top: -NODE_R, left: -NODE_R,
                borderRadius: "50%",
                background: isHovered ? "#c47029" : "#11151a",
                transform: isHovered ? "scale(1.7)" : "scale(1)",
                transition: "transform 0.28s ease, background 0.25s",
                boxShadow: isHovered
                  ? "0 0 0 5px rgba(196,112,41,0.14), 0 0 0 10px rgba(196,112,41,0.06)"
                  : "none",
              }} />

              {/* Label — right of dot (or left for far-right nodes) */}
              <div style={{
                position: "absolute",
                ...(labelLeft ? { right: NODE_R + 16 } : { left: NODE_R + 16 }),
                top: "50%",
                transform: "translateY(-50%)",
                whiteSpace: "nowrap",
                pointerEvents: "none",
                textAlign: labelLeft ? "right" : "left",
              }}>
                <div style={{
                  fontFamily: "var(--font-serif)", fontStyle: "italic",
                  fontSize: "1.55rem", fontWeight: 400, lineHeight: 1.1,
                  letterSpacing: "-0.01em",
                  color: isHovered ? "#c47029" : "#11151a",
                  transition: "color 0.25s",
                }}>
                  {school.title}
                </div>
                <div style={{
                  fontFamily: "var(--font-sans)", fontSize: "8px", fontWeight: 700,
                  letterSpacing: "0.18em", textTransform: "uppercase",
                  color: "#5F6A78", marginTop: 5,
                }}>
                  {tagline}
                </div>
              </div>

              {/* Hover card */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: cardAbove ? 6 : -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: cardAbove ? 6 : -6, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    style={{
                      position: "absolute",
                      ...(cardAbove ? { bottom: NODE_R + 20 } : { top: 36 }),
                      ...(labelLeft ? { right: 0 } : { left: NODE_R + 16 }),
                      width: 300,
                      background: "rgba(252,251,249,0.98)",
                      backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)",
                      borderRadius: 14, padding: "18px 20px 16px 24px",
                      boxShadow: "0 14px 44px rgba(17,21,26,0.11), 0 2px 8px rgba(17,21,26,0.05)",
                      border: "1px solid rgba(17,21,26,0.07)",
                      pointerEvents: "auto", zIndex: 50, overflow: "hidden",
                    }}
                  >
                    <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 3, background: "#c47029", opacity: 0.65, borderRadius: "14px 0 0 14px" }} />

                    <div style={{ fontFamily: "var(--font-sans)", fontSize: "7.5px", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#c47029", marginBottom: 5 }}>
                      {school.eraRange}
                    </div>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.73rem", lineHeight: 1.76, color: "#43474c", marginBottom: 12 }}>
                      {school.description.slice(0, 155)}…
                    </p>

                    {school.coreIdeas.length > 0 && (
                      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
                        {school.coreIdeas.slice(0, 3).map((idea, i) => (
                          <li key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                            <span style={{ width: 3, height: 3, marginTop: 7, flexShrink: 0, borderRadius: "50%", background: "#c47029", opacity: 0.60 }} />
                            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.70rem", lineHeight: 1.62, color: "#43474c" }}>{idea}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {school.philosophers.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {school.philosophers.map((p) => (
                          <Link
                            key={p._id}
                            href={`/philosophers/${p.slug}`}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              display: "flex", alignItems: "center", gap: 5,
                              padding: "3px 9px 3px 4px",
                              border: "1px solid rgba(17,21,26,0.13)",
                              borderRadius: 100,
                              fontFamily: "var(--font-sans)", fontSize: "11px",
                              color: "#43474c", textDecoration: "none",
                            }}
                          >
                            {p.avatarUrl && !imgErrors.has(p._id) && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={p.avatarUrl} alt={p.name}
                                width={16} height={16}
                                style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                                onError={() => setImgErrors((prev) => new Set(prev).add(p._id))}
                              />
                            )}
                            {p.name}
                          </Link>
                        ))}
                      </div>
                    )}

                    {schoolMap.get(school._id)?.influencedTo && schoolMap.get(school._id)!.influencedTo.length > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(17,21,26,0.07)" }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#c47029" strokeWidth="2.5">
                          <path d="M5 12h14m-6-7 7 7-7 7" />
                        </svg>
                        <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.66rem", color: "#5F6A78" }}>
                          {schoolMap.get(school._id)!.influencedTo.map(t => t.title).join(" · ")}
                        </span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* ── MAP STATISTICS — fixed right panel ── */}
      <div style={{
        position: "fixed", right: 44, bottom: 96,
        width: 280, pointerEvents: "none", zIndex: 20,
      }}>
        <div style={{
          background: "rgba(250,250,245,0.88)",
          backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
          borderRadius: 16, padding: "20px 24px",
          border: "1px solid rgba(17,21,26,0.06)",
          boxShadow: "0 4px 24px rgba(17,21,26,0.05)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(17,21,26,0.14)" }} />
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "8px", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#11151a" }}>
              MAP STATISTICS
            </span>
          </div>

          {[
            { label: "Active Cognitions", value: String(totalPhilosophers) },
            { label: "Thread Density",    value: threadDensity },
            { label: "Atmospheric Sync",  value: "Active" },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 13 }}>
              <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "0.87rem", color: "#43474c" }}>
                {label}
              </span>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "1.08rem", fontWeight: 400, color: "#11151a", letterSpacing: "-0.01em" }}>
                {value}
              </span>
            </div>
          ))}

          <div style={{ height: 1, background: "rgba(17,21,26,0.08)", margin: "14px 0" }} />

          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.68rem", lineHeight: 1.80, color: "#5F6A78" }}>
            The map represents a living network of ideas. Connections expand and contract based on intellectual proximity within the lineage.
          </p>
        </div>
      </div>

      {/* ── Bottom instruction bar ── */}
      <div style={{
        position: "fixed", bottom: 0, left: 80, right: 0,
        padding: "16px 48px",
        display: "flex", gap: 52, alignItems: "flex-start",
        borderTop: "1px solid rgba(17,21,26,0.07)",
        background: "rgba(250,250,245,0.78)",
        backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
        zIndex: 19, pointerEvents: "none",
      }}>
        {[
          { action: "PAN & SCROLL",  label: "To explore the horizon" },
          { action: "HOVER NODE",    label: "To manifest a fragment" },
          { action: "CLICK THINKER", label: "To enter the archive" },
        ].map(({ action, label }) => (
          <div key={action}>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "7.5px", fontWeight: 700, letterSpacing: "0.20em", textTransform: "uppercase", color: "#5F6A78", marginBottom: 4 }}>
              {action}
            </div>
            <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "0.84rem", color: "#11151a" }}>
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
