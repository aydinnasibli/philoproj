"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { SchoolWithPhilosophers } from "@/lib/mockData";

// ── Fixed canvas positions for each school (% of canvas) ──
const SCHOOL_POS: Record<string, { x: number; y: number }> = {
  "sch-1": { x: 12, y: 38 },   // Socratic Method — entry point
  "sch-2": { x: 26, y: 22 },   // Platonic Philosophy — upper
  "sch-3": { x: 40, y: 32 },   // Aristotelianism — centre-left
  "sch-4": { x: 56, y: 18 },   // Rationalism — upper centre
  "sch-5": { x: 56, y: 50 },   // Empiricism — lower centre
  "sch-6": { x: 71, y: 32 },   // Critical Philosophy — centre-right
  "sch-7": { x: 81, y: 48 },   // Existentialism & Nihilism — lower right
  "sch-8": { x: 89, y: 62 },   // Analytic Philosophy — far lower right
};

// ── Era colour groups (amber / terracotta / indigo) ────────
const ERA_STYLE: Record<string, { fill: string; stroke: string; hoverFill: string; hoverStroke: string; text: string }> = {
  "sch-1": { fill: "rgba(215,170,50,0.10)", stroke: "rgba(215,170,50,0.50)", hoverFill: "rgba(215,170,50,0.22)", hoverStroke: "rgba(215,170,50,0.85)", text: "#7a5e00" },
  "sch-2": { fill: "rgba(215,170,50,0.10)", stroke: "rgba(215,170,50,0.50)", hoverFill: "rgba(215,170,50,0.22)", hoverStroke: "rgba(215,170,50,0.85)", text: "#7a5e00" },
  "sch-3": { fill: "rgba(215,170,50,0.10)", stroke: "rgba(215,170,50,0.50)", hoverFill: "rgba(215,170,50,0.22)", hoverStroke: "rgba(215,170,50,0.85)", text: "#7a5e00" },
  "sch-4": { fill: "rgba(195,100,55,0.10)", stroke: "rgba(195,100,55,0.50)", hoverFill: "rgba(195,100,55,0.22)", hoverStroke: "rgba(195,100,55,0.85)", text: "#7a3c15" },
  "sch-5": { fill: "rgba(195,100,55,0.10)", stroke: "rgba(195,100,55,0.50)", hoverFill: "rgba(195,100,55,0.22)", hoverStroke: "rgba(195,100,55,0.85)", text: "#7a3c15" },
  "sch-6": { fill: "rgba(90,105,175,0.10)", stroke: "rgba(90,105,175,0.50)", hoverFill: "rgba(90,105,175,0.22)", hoverStroke: "rgba(90,105,175,0.85)", text: "#38407a" },
  "sch-7": { fill: "rgba(90,105,175,0.10)", stroke: "rgba(90,105,175,0.50)", hoverFill: "rgba(90,105,175,0.22)", hoverStroke: "rgba(90,105,175,0.85)", text: "#38407a" },
  "sch-8": { fill: "rgba(90,105,175,0.10)", stroke: "rgba(90,105,175,0.50)", hoverFill: "rgba(90,105,175,0.22)", hoverStroke: "rgba(90,105,175,0.85)", text: "#38407a" },
};

const NODE_R = 26;   // circle radius px
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

function curvePath(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const off = len * 0.22;
  const cx = mx - (dy / len) * off;
  const cy = my + (dx / len) * off;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

function arrowEnd(x1: number, y1: number, x2: number, y2: number): [number, number] {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const margin = NODE_R + 11;
  return [x2 - (dx / len) * margin, y2 - (dy / len) * margin];
}

type Props = { schools: SchoolWithPhilosophers[] };

export default function SchoolsCanvas({ schools }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());
  const [viewport, setViewport] = useState({ zoom: 1, panX: 0, panY: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dims, setDims] = useState({ w: 1440, h: 900 });

  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef(viewport);
  viewportRef.current = viewport;
  const isDraggingRef = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const schoolMap = new Map(schools.map((s) => [s._id, s]));
  const edges = buildEdges(schools);

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
      const v = viewportRef.current;
      const factor = 1 - e.deltaY * 0.001;
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, v.zoom * factor));
      const ratio = newZoom / v.zoom;
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      setViewport({ zoom: newZoom, panX: mx * (1 - ratio) + v.panX * ratio, panY: my * (1 - ratio) + v.panY * ratio });
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
    setViewport((prev) => ({
      ...prev,
      panX: dragStart.current.panX + (e.clientX - dragStart.current.x),
      panY: dragStart.current.panY + (e.clientY - dragStart.current.y),
    }));
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

  const { zoom, panX, panY } = viewport;

  return (
    <div
      ref={containerRef}
      className="philosophy-grid"
      style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#fafaf5", cursor: isDragging ? "grabbing" : "grab" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Warm glow */}
      <div style={{
        position: "absolute", top: "45%", left: "50%", width: "58vw", height: "58vw",
        transform: "translate(-50%,-50%)",
        background: "radial-gradient(ellipse, rgba(196,112,41,0.06) 0%, transparent 62%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* Transformed canvas */}
      <div style={{
        position: "absolute", inset: 0,
        transform: `translate(${panX}px,${panY}px) scale(${zoom})`,
        transformOrigin: "0 0", willChange: "transform",
      }}>
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1, overflow: "visible" }}
          viewBox={`0 0 ${dims.w} ${dims.h}`}
        >
          <defs>
            <marker id="sc-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0,10 3.5,0 7" fill="#1a1c19" opacity="0.30" />
            </marker>
            <marker id="sc-arrow-active" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0,10 3.5,0 7" fill="#c47029" opacity="0.88" />
            </marker>
          </defs>

          {edges.map((edge) => {
            const fp = SCHOOL_POS[edge.fromId];
            const tp = SCHOOL_POS[edge.toId];
            if (!fp || !tp) return null;
            const x1 = (fp.x / 100) * dims.w;
            const y1 = (fp.y / 100) * dims.h;
            const x2 = (tp.x / 100) * dims.w;
            const y2 = (tp.y / 100) * dims.h;
            const [ex, ey] = arrowEnd(x1, y1, x2, y2);
            const active = hoveredId === edge.fromId || hoveredId === edge.toId;
            const dimmed = hoveredId !== null && !active;
            return (
              <path
                key={`${edge.fromId}-${edge.toId}`}
                d={curvePath(x1, y1, ex, ey)}
                fill="none"
                stroke={active ? "#c47029" : "#1a1c19"}
                strokeWidth={active ? 1.6 : 1.1}
                opacity={dimmed ? 0.04 : active ? 0.62 : 0.20}
                markerEnd={active ? "url(#sc-arrow-active)" : "url(#sc-arrow)"}
                style={{ transition: "opacity 0.25s, stroke 0.25s" }}
              />
            );
          })}
        </svg>

        {/* School nodes */}
        {schools.map((school) => {
          const pos = SCHOOL_POS[school._id];
          if (!pos) return null;
          const style = ERA_STYLE[school._id] ?? ERA_STYLE["sch-6"];
          const isHovered = hoveredId === school._id;
          const isDimmed = hoveredId !== null && !isHovered;
          const cardOnLeft = pos.x > 60;
          const cardAbove = pos.y > 55;

          return (
            <div
              key={school._id}
              style={{
                position: "absolute",
                left: `${pos.x}%`, top: `${pos.y}%`,
                zIndex: isHovered ? 30 : 10,
                opacity: isDimmed ? 0.18 : 1,
                transition: "opacity 0.25s",
                cursor: "default",
              }}
              onMouseEnter={() => setHoveredId(school._id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Pulsing glow ring */}
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.28, 0.10, 0.28] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: "absolute",
                  width: NODE_R * 5, height: NODE_R * 5,
                  top: -(NODE_R * 5) / 2, left: -(NODE_R * 5) / 2,
                  borderRadius: "50%",
                  background: isHovered ? style.hoverFill : style.fill,
                  filter: "blur(14px)", pointerEvents: "none",
                }}
              />

              {/* Circle node */}
              <div style={{
                position: "absolute",
                width: NODE_R * 2, height: NODE_R * 2,
                top: -NODE_R, left: -NODE_R,
                borderRadius: "50%",
                background: isHovered ? style.hoverFill : style.fill,
                border: `2px solid ${isHovered ? style.hoverStroke : style.stroke}`,
                boxShadow: isHovered ? `0 0 0 5px ${style.fill}, 0 4px 20px rgba(17,21,26,0.10)` : "0 2px 8px rgba(17,21,26,0.08)",
                transform: isHovered ? "scale(1.18)" : "scale(1)",
                transition: "transform 0.3s ease, background 0.25s, border-color 0.25s, box-shadow 0.3s",
              }} />

              {/* Label below node */}
              <div style={{
                position: "absolute",
                top: NODE_R + 10, left: 0,
                transform: "translateX(-50%)",
                textAlign: "center", whiteSpace: "nowrap", pointerEvents: "none",
              }}>
                <div style={{
                  fontFamily: "var(--font-serif)", fontStyle: "italic",
                  fontSize: "0.92rem", fontWeight: 400,
                  color: isHovered ? style.text : "#11151a",
                  lineHeight: 1.2,
                  transition: "color 0.25s",
                }}>
                  {school.title}
                </div>
                <div style={{
                  fontFamily: "var(--font-sans)", fontSize: "8px", fontWeight: 600,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                  color: style.text, opacity: 0.65, marginTop: 4,
                }}>
                  {school.eraRange}
                </div>
              </div>

              {/* Hover card */}
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
                        ? { bottom: NODE_R + 14 }
                        : { top: NODE_R + 60 }),
                      ...(cardOnLeft ? { right: 10 } : { left: 10 }),
                      width: 340,
                      background: "rgba(252,251,249,0.97)",
                      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                      borderRadius: 14, padding: "22px 22px 18px 26px",
                      boxShadow: "0 12px 40px rgba(17,21,26,0.12), 0 2px 8px rgba(17,21,26,0.05)",
                      border: "1px solid rgba(17,21,26,0.07)",
                      pointerEvents: "auto", zIndex: 50, overflow: "hidden",
                    }}
                  >
                    {/* Coloured left strip */}
                    <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 3, background: style.hoverStroke, borderRadius: "14px 0 0 14px" }} />

                    {/* Header */}
                    <div style={{ fontFamily: "var(--font-sans)", fontSize: "8.5px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: style.text, marginBottom: 6 }}>
                      {school.eraRange}
                    </div>
                    <h3 style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "1.15rem", fontWeight: 400, color: "#11151a", lineHeight: 1.25, marginBottom: 10 }}>
                      {school.title}
                    </h3>

                    {/* Description */}
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.76rem", lineHeight: 1.72, color: "#43474c", marginBottom: 14 }}>
                      {school.description.slice(0, 180)}…
                    </p>

                    {/* Core ideas */}
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontFamily: "var(--font-sans)", fontSize: "8px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#43474c", opacity: 0.55, marginBottom: 8 }}>
                        Core Ideas
                      </div>
                      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 5 }}>
                        {school.coreIdeas.slice(0, 3).map((idea, i) => (
                          <li key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                            <span style={{ width: 4, height: 4, marginTop: 6, flexShrink: 0, borderRadius: "50%", background: style.text, opacity: 0.65 }} />
                            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", lineHeight: 1.62, color: "#43474c" }}>{idea}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Philosopher chips */}
                    {school.philosophers.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {school.philosophers.map((p) => (
                          <Link
                            key={p._id}
                            href={`/philosophers/${p.slug}`}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              display: "flex", alignItems: "center", gap: 5,
                              padding: "3px 9px 3px 4px",
                              border: `1px solid ${style.stroke}`,
                              borderRadius: 100,
                              fontFamily: "var(--font-sans)", fontSize: "11px",
                              color: style.text, textDecoration: "none",
                            }}
                          >
                            {p.avatarUrl && !imgErrors.has(p._id) && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={p.avatarUrl} alt={p.name}
                                width={18} height={18}
                                style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                                onError={() => setImgErrors((prev) => new Set(prev).add(p._id))}
                              />
                            )}
                            {p.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Context panel — fixed bottom-left */}
      <div style={{ position: "fixed", bottom: 0, left: 80, padding: "36px 48px", pointerEvents: "none", zIndex: 20 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={hoveredId ?? "default"}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.24 }}
            style={{
              display: "inline-block", maxWidth: 400,
              background: "rgba(250,250,245,0.60)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
              borderRadius: 14, padding: "18px 24px",
              border: "1px solid rgba(17,21,26,0.07)", boxShadow: "0 4px 20px rgba(17,21,26,0.04)",
            }}
          >
            {hoveredId && schoolMap.get(hoveredId) ? (() => {
              const s = schoolMap.get(hoveredId)!;
              const style = ERA_STYLE[hoveredId] ?? ERA_STYLE["sch-6"];
              return (
                <>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: style.text, marginBottom: 6 }}>
                    {s.eraRange}
                  </div>
                  <h2 style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "1.5rem", fontWeight: 400, color: "#11151a", lineHeight: 1.2, marginBottom: 6 }}>
                    {s.title}
                  </h2>
                  {s.influencedTo.length > 0 && (
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "#43474c", opacity: 0.7 }}>
                      Gave rise to: {s.influencedTo.map(t => t.title).join(" · ")}
                    </p>
                  )}
                </>
              );
            })() : (
              <>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c47029", marginBottom: 7 }}>
                  Schools of Thought
                </div>
                <h2 style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "1.5rem", fontWeight: 400, color: "#11151a", lineHeight: 1.2, marginBottom: 6 }}>
                  The Lineage of Ideas
                </h2>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", lineHeight: 1.72, color: "#43474c", opacity: 0.75 }}>
                  Hover any school to explore its ideas, thinkers, and influence.
                </p>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Zoom controls — fixed bottom-right */}
      <div style={{ position: "fixed", bottom: 44, right: 44, display: "flex", flexDirection: "column", gap: 8, alignItems: "center", zIndex: 20 }}>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", color: "#43474c", opacity: 0.55 }}>
          {Math.round(zoom * 100)}%
        </div>
        <div style={{
          background: "rgba(252,251,249,0.92)", backdropFilter: "blur(8px)",
          borderRadius: 100, padding: "4px", display: "flex", flexDirection: "column",
          boxShadow: "0 2px 16px rgba(17,21,26,0.08)", border: "1px solid rgba(17,21,26,0.08)",
        }}>
          <button onClick={() => zoomAtCenter(1.3)} style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#11151a" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
          </button>
          <div style={{ width: 18, height: 1, background: "rgba(17,21,26,0.12)", margin: "0 auto" }} />
          <button onClick={() => zoomAtCenter(1 / 1.3)} style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#11151a" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /></svg>
          </button>
        </div>
        <button onClick={resetViewport} title="Reset view" style={{ width: 44, height: 44, borderRadius: "50%", background: "#11151a", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white", boxShadow: "0 4px 20px rgba(17,21,26,0.22)" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
