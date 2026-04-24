"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { LineageNode } from "@/lib/mockData";

type Props = { nodes: LineageNode[] };
type Edge = { from: LineageNode; to: LineageNode };
type Pos = { x: number; y: number }; // percentage 0-100

function buildEdges(nodes: LineageNode[]): Edge[] {
  const map = new Map(nodes.map((n) => [n._id, n]));
  const seen = new Set<string>();
  const edges: Edge[] = [];
  for (const n of nodes) {
    for (const sid of n.students) {
      const s = map.get(sid);
      if (!s) continue;
      const key = [n._id, sid].sort().join("--");
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ from: n, to: s });
    }
  }
  return edges;
}

// Gentle quadratic bezier in real pixel space
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

function circleSize(n: LineageNode): number {
  const deg = n.mentors.length + n.students.length;
  if (deg >= 2) return 120;
  if (deg === 1) return 96;
  return 76;
}

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 4;

export default function LineageCanvas({ nodes }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());
  const [viewport, setViewport] = useState({ zoom: 1, panX: 0, panY: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dims, setDims] = useState({ w: 1440, h: 900 });

  const [nodePos, setNodePos] = useState<Record<string, Pos>>(
    () => Object.fromEntries(nodes.map((n) => [n._id, { x: n.networkX, y: n.networkY }]))
  );
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const nodeDragStart = useRef({ mx: 0, my: 0, nx: 0, ny: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef(viewport);
  viewportRef.current = viewport;
  const isDraggingRef = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const edges = buildEdges(nodes);
  const hoveredNode = nodes.find((n) => n._id === hoveredId) ?? null;
  const contextNode = hoveredNode ?? nodes[0] ?? null;

  // Load persisted node positions on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("philosopher-node-positions");
      if (saved) {
        const parsed = JSON.parse(saved) as Record<string, Pos>;
        setNodePos((prev) =>
          Object.fromEntries(Object.keys(prev).map((id) => [id, parsed[id] ?? prev[id]]))
        );
      }
    } catch {}
  }, []);

  // Persist node positions on change
  useEffect(() => {
    try { localStorage.setItem("philosopher-node-positions", JSON.stringify(nodePos)); } catch {}
  }, [nodePos]);

  // Track container pixel dimensions for correct SVG coordinates
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

  // Wheel zoom at cursor
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

  const handleNodeMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDraggingNodeId(id);
    const pos = nodePos[id];
    nodeDragStart.current = { mx: e.clientX, my: e.clientY, nx: pos.x, ny: pos.y };
  }, [nodePos]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("a, button")) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    const v = viewportRef.current;
    dragStart.current = { x: e.clientX, y: e.clientY, panX: v.panX, panY: v.panY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggingNodeId) {
      const v = viewportRef.current;
      const dx = (e.clientX - nodeDragStart.current.mx) / v.zoom;
      const dy = (e.clientY - nodeDragStart.current.my) / v.zoom;
      const dxPct = (dx / dims.w) * 100;
      const dyPct = (dy / dims.h) * 100;
      setNodePos((prev) => ({
        ...prev,
        [draggingNodeId]: {
          x: Math.max(2, Math.min(98, nodeDragStart.current.nx + dxPct)),
          y: Math.max(2, Math.min(98, nodeDragStart.current.ny + dyPct)),
        },
      }));
    } else if (isDraggingRef.current) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setViewport((prev) => ({ ...prev, panX: dragStart.current.panX + dx, panY: dragStart.current.panY + dy }));
    }
  }, [draggingNodeId, dims]);

  const handleMouseUp = useCallback(() => {
    setDraggingNodeId(null);
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
      return {
        zoom: newZoom,
        panX: cx * (1 - ratio) + prev.panX * ratio,
        panY: cy * (1 - ratio) + prev.panY * ratio,
      };
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
  const cursor = draggingNodeId ? "grabbing" : isDragging ? "grabbing" : "grab";

  return (
    <div
      ref={containerRef}
      style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#fcf9f4", cursor }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Warm radial glow */}
      <div style={{
        position: "absolute", top: "50%", left: "60%", width: "60vw", height: "60vw",
        transform: "translate(-50%, -50%)",
        background: "radial-gradient(ellipse, rgba(212,176,140,0.22) 0%, transparent 65%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* Canvas texture */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E")`,
      }} />

      {/* Transformed canvas layer */}
      <div style={{
        position: "absolute", inset: 0,
        transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
        transformOrigin: "0 0",
        willChange: "transform",
      }}>
        {/* SVG edges — pixel-coordinate viewBox */}
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }}
          viewBox={`0 0 ${dims.w} ${dims.h}`}
        >
          {edges.map((edge) => {
            const p1 = nodePos[edge.from._id];
            const p2 = nodePos[edge.to._id];
            const x1 = (p1.x / 100) * dims.w;
            const y1 = (p1.y / 100) * dims.h;
            const x2 = (p2.x / 100) * dims.w;
            const y2 = (p2.y / 100) * dims.h;
            const active = hoveredId === edge.from._id || hoveredId === edge.to._id;
            const dimmed = hoveredId !== null && !active;
            return (
              <path
                key={`${edge.from._id}-${edge.to._id}`}
                d={curvePath(x1, y1, x2, y2)}
                fill="none"
                stroke={active ? "#845400" : "#1a1c19"}
                strokeWidth={active ? 1.8 : 1.2}
                opacity={dimmed ? 0.04 : active ? 0.7 : 0.25}
                style={{ transition: "opacity 0.25s, stroke 0.25s" }}
              />
            );
          })}
        </svg>

        {/* Portrait nodes */}
        {nodes.map((n) => {
          const isHovered = hoveredId === n._id;
          const isDimmed = hoveredId !== null && !isHovered;
          const isBeingDragged = draggingNodeId === n._id;
          const size = circleSize(n);
          const deg = n.mentors.length + n.students.length;
          const borderPx = deg >= 2 ? 4 : 2;
          const pos = nodePos[n._id];
          const cardOnLeft = pos.x > 62;

          return (
            <div
              key={n._id}
              style={{
                position: "absolute",
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                zIndex: isBeingDragged ? 40 : isHovered ? 30 : 10,
                opacity: isDimmed ? 0.22 : 1,
                transition: isBeingDragged ? "none" : "opacity 0.25s",
                cursor: isBeingDragged ? "grabbing" : "grab",
              }}
              onMouseEnter={() => !draggingNodeId && setHoveredId(n._id)}
              onMouseLeave={() => setHoveredId(null)}
              onMouseDown={(e) => handleNodeMouseDown(e, n._id)}
            >
              {/* Portrait ring */}
              <div style={{
                position: "absolute",
                top: -(size / 2), left: -(size / 2),
                width: size, height: size,
                borderRadius: "50%", overflow: "hidden",
                border: `${borderPx}px solid ${isHovered || isBeingDragged ? "#845400" : "#03192a"}`,
                boxShadow: isHovered || isBeingDragged
                  ? "0 0 0 6px rgba(132,84,0,0.15), 0 8px 32px rgba(26,28,25,0.18)"
                  : "0 4px 20px rgba(26,28,25,0.12)",
                transform: isHovered && !isBeingDragged ? "scale(1.06)" : "scale(1)",
                transition: isBeingDragged ? "none" : "transform 0.3s ease, border-color 0.25s, box-shadow 0.3s",
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
                      filter: isHovered ? "sepia(8%) brightness(1.04) contrast(1.04)" : "sepia(18%) brightness(0.96) contrast(1.05)",
                      transition: "filter 0.4s ease",
                    }}
                  />
                ) : (
                  <div style={{
                    width: "100%", height: "100%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: isHovered
                      ? "linear-gradient(135deg, #c8a97a 0%, #8a6640 100%)"
                      : "linear-gradient(135deg, #d4c4aa 0%, #a08060 100%)",
                    transition: "background 0.3s ease",
                  }}>
                    <span style={{
                      fontFamily: "var(--font-serif)", fontStyle: "italic",
                      fontSize: size * 0.42, fontWeight: 400,
                      color: "rgba(255,255,255,0.92)", lineHeight: 1, userSelect: "none",
                    }}>
                      {n.name[0]}
                    </span>
                  </div>
                )}
              </div>

              {/* Name + branch */}
              <div style={{
                position: "absolute", top: size / 2 + 12, left: 0,
                transform: "translateX(-50%)", textAlign: "center",
                whiteSpace: "nowrap", pointerEvents: "none",
              }}>
                <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: deg >= 2 ? "1.15rem" : "1rem", fontWeight: 400, color: "#03192a", lineHeight: 1.2 }}>
                  {n.name}
                </div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: "8.5px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#43474c", opacity: 0.65, marginTop: 4 }}>
                  {n.coreBranch}
                </div>
              </div>

              {/* Hover card */}
              <AnimatePresence>
                {isHovered && !isBeingDragged && (
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
                    <div style={{ fontFamily: "var(--font-serif)", fontSize: "2.8rem", lineHeight: 0.75, color: "#845400", marginBottom: 10, userSelect: "none" }}>&ldquo;</div>
                    <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "0.92rem", lineHeight: 1.62, color: "#1c1c19", marginBottom: 12 }}>{n.hookQuote}</p>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.73rem", lineHeight: 1.7, color: "#43474c", marginBottom: 16 }}>{n.shortSummary.slice(0, 115)}…</p>
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

      {/* Era context panel — fixed */}
      <div style={{ position: "fixed", bottom: 0, left: 80, right: 0, padding: "40px 48px", pointerEvents: "none", zIndex: 20 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={contextNode?.eraId ?? "default"}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.28 }}
            style={{
              display: "inline-block", maxWidth: 440,
              background: "rgba(246,243,238,0.55)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
              borderRadius: 14, padding: "20px 26px",
              border: "1px solid rgba(26,28,25,0.07)", boxShadow: "0 4px 20px rgba(26,28,25,0.04)",
            }}
          >
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#845400", marginBottom: 8 }}>
              Current View
            </div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "1.8rem", fontWeight: 400, color: "#03192a", lineHeight: 1.2, marginBottom: 8 }}>
              {contextNode?.eraTitle ?? "The Philosophical Lineage"}
            </h2>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.74rem", lineHeight: 1.72, color: "#43474c", opacity: 0.85 }}>
              {(contextNode?.eraDescription ?? "").slice(0, 165)}…
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Zoom controls — fixed */}
      <div style={{ position: "fixed", bottom: 44, right: 44, display: "flex", flexDirection: "column", gap: 8, alignItems: "center", zIndex: 20 }}>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", color: "#43474c", opacity: 0.6 }}>
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
