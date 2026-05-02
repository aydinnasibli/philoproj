"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { LineageNode, InfluenceLink } from "@/lib/types";
import PhilosopherPanel from "@/components/network/PhilosopherPanel";

type Props = { nodes: LineageNode[] };
type Edge = { from: LineageNode; to: LineageNode; strength: number; kind: "lineage" | "influence" };
type Pos = { x: number; y: number }; // percentage 0-100

const LINEAGE_STRENGTH: Record<string, number> = {
  "p-1--p-2":  1.00, // Socrates → Plato
  "p-2--p-3":  1.00, // Plato → Aristotle
  "p-4--p-5":  0.85, // Descartes → Spinoza
  "p-6--p-7":  0.90, // Locke → Hume
  "p-7--p-8":  0.90, // Hume → Kant
  "p-8--p-9":  0.70, // Kant → Nietzsche
  "p-9--p-10": 0.50, // Nietzsche → Wittgenstein
};

const INFLUENCE_STRENGTH: Record<InfluenceLink["strength"], number> = {
  strong: 0.9,
  medium: 0.6,
  weak:   0.3,
};

function buildEdges(nodes: LineageNode[]): Edge[] {
  const map = new Map(nodes.map((n) => [n._id, n]));
  const seen = new Set<string>();
  const edges: Edge[] = [];

  for (const n of nodes) {
    // Direct mentor → student lineage
    for (const sid of n.students) {
      const s = map.get(sid);
      if (!s) continue;
      const key = [n._id, sid].sort().join("--");
      if (seen.has(key)) continue;
      seen.add(key);
      const strength = LINEAGE_STRENGTH[key] ?? 0.6;
      edges.push({ from: n, to: s, strength, kind: "lineage" });
    }
    // Cross-era intellectual influences
    for (const link of n.influences) {
      const influencer = map.get(link.id);
      if (!influencer) continue;
      const key = [influencer._id, n._id].sort().join("~~");
      if (seen.has(key)) continue;
      seen.add(key);
      const strength = INFLUENCE_STRENGTH[link.strength];
      edges.push({ from: influencer, to: n, strength, kind: "influence" });
    }
  }

  return edges;
}

// Quadratic bezier curve — slight perpendicular bow for organic feel
function curvePath(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1 + x2) / 2 + (y1 - y2) * 0.12;
  const my = (y1 + y2) / 2 + (x2 - x1) * 0.12;
  return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
}

// High-arc bow for cross-era influence — same style, dramatically deeper sweep
function influencePath(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1 + x2) / 2 + (y1 - y2) * 0.48;
  const my = (y1 + y2) / 2 + (x2 - x1) * 0.48;
  return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
}

// Builds a vortex-distorted grid path — grid lines collapse toward the cursor
const GRID_STEP = 80;
const VORTEX_RADIUS = 210;
const VORTEX_STRENGTH = 52;

function vortexPt(gx: number, gy: number, cx: number, cy: number): string {
  const dx = gx - cx;
  const dy = gy - cy;
  const distSq = dx * dx + dy * dy;
  if (distSq >= VORTEX_RADIUS * VORTEX_RADIUS || distSq < 0.01) {
    return `${gx.toFixed(1)},${gy.toFixed(1)}`;
  }
  const dist = Math.sqrt(distSq);
  const pull = Math.pow(1 - dist / VORTEX_RADIUS, 2) * VORTEX_STRENGTH;
  return `${(gx - (dx / dist) * pull).toFixed(1)},${(gy - (dy / dist) * pull).toFixed(1)}`;
}

function buildVortexGrid(w: number, h: number, cx: number, cy: number): string {
  const SEG = GRID_STEP / 8; // 10px segments for smooth bend
  let d = "";
  for (let y = 0; y <= h + GRID_STEP; y += GRID_STEP) {
    let first = true;
    for (let x = 0; x <= w + SEG; x += SEG) {
      d += (first ? "M" : "L") + vortexPt(x, y, cx, cy) + " ";
      first = false;
    }
  }
  for (let x = 0; x <= w + GRID_STEP; x += GRID_STEP) {
    let first = true;
    for (let y = 0; y <= h + SEG; y += SEG) {
      d += (first ? "M" : "L") + vortexPt(x, y, cx, cy) + " ";
      first = false;
    }
  }
  return d;
}


function circleSize(n: LineageNode): number {
  const deg = n.mentors.length + n.students.length;
  if (deg >= 2) return 54;
  if (deg === 1) return 46;
  return 38;
}

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 4;

export default function NetworkCanvas({ nodes }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());
  const [viewport, setViewport] = useState({ zoom: 1, panX: 0, panY: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dims, setDims] = useState({ w: 1440, h: 900 });

  const [nodePos, setNodePos] = useState<Record<string, Pos>>(
    () => Object.fromEntries(nodes.map((n) => [n._id, { x: n.networkX, y: n.networkY }]))
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const nodeDragStart = useRef({ mx: 0, my: 0, nx: 0, ny: 0 });
  // Cursor repulsion: track mouse position in container-pixel space
  const [cursorPos, setCursorPos] = useState({ x: -9999, y: -9999 });

  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef(viewport);
  useEffect(() => { viewportRef.current = viewport; }, [viewport]);
  const isDraggingRef = useRef(false);
  const didDragRef = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const edges = buildEdges(nodes);

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
      if ((e.target as HTMLElement).closest("[data-panel]")) return;
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
    didDragRef.current = false;
    setIsDragging(true);
    const v = viewportRef.current;
    dragStart.current = { x: e.clientX, y: e.clientY, panX: v.panX, panY: v.panY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // Track cursor for repulsion effect
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });

    if (draggingNodeId) {
      const v = viewportRef.current;
      const dx = (e.clientX - nodeDragStart.current.mx) / v.zoom;
      const dy = (e.clientY - nodeDragStart.current.my) / v.zoom;
      const dxPct = (dx / dims.w) * 100;
      const dyPct = (dy / dims.h) * 100;
      setNodePos((prev) => ({
        ...prev,
        [draggingNodeId]: {
          x: nodeDragStart.current.nx + dxPct,
          y: nodeDragStart.current.ny + dyPct,
        },
      }));
    } else if (isDraggingRef.current) {
      didDragRef.current = true;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setViewport((prev) => ({ ...prev, panX: dragStart.current.panX + dx, panY: dragStart.current.panY + dy }));
    }
  }, [draggingNodeId, dims]);

  const handleMouseLeaveContainer = useCallback(() => {
    setCursorPos({ x: -9999, y: -9999 });
    setDraggingNodeId(null);
    isDraggingRef.current = false;
    setIsDragging(false);
    setHoveredId(null);
  }, []);

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

  // Map: connected node id → how it's connected to the hovered node
  const connectedMap = new Map<string, "lineage" | "influence">();
  if (hoveredId) {
    for (const e of edges) {
      if (e.from._id === hoveredId) connectedMap.set(e.to._id, e.kind);
      else if (e.to._id === hoveredId) connectedMap.set(e.from._id, e.kind);
    }
  }

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
      style={{ position: "fixed", inset: 0, overflow: "hidden",
        background: "radial-gradient(ellipse at 38% 48%, #FDFAF5 0%, #F8F3E8 50%, #F0E9D6 100%)",
        cursor }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeaveContainer}
      onClick={() => { if (!didDragRef.current) setSelectedId(null); }}
    >
      {/* Vortex grid — collapses toward cursor position */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}
      >
        <path
          d={buildVortexGrid(dims.w, dims.h, cursorPos.x, cursorPos.y)}
          fill="none"
          stroke="rgba(17,21,26,0.038)"
          strokeWidth="0.75"
        />
        {/* Intersection dots — also distorted */}
        {Array.from({ length: Math.ceil(dims.h / GRID_STEP) + 1 }, (_, r) => r).flatMap((r) =>
          Array.from({ length: Math.ceil(dims.w / GRID_STEP) + 1 }, (_, c) => {
            const raw = vortexPt(c * GRID_STEP, r * GRID_STEP, cursorPos.x, cursorPos.y);
            const [px, py] = raw.split(",").map(Number);
            return <circle key={`${r}-${c}`} cx={px} cy={py} r={1.2} fill="rgba(132,84,0,0.09)" />;
          })
        )}
      </svg>

      {/* Warm radial glow */}
      <div style={{
        position: "absolute", top: "45%", left: "55%", width: "65vw", height: "65vw",
        transform: "translate(-50%, -50%)",
        background: "radial-gradient(ellipse, rgba(196,112,41,0.13) 0%, transparent 62%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* Parchment noise grain */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.032'/%3E%3C/svg%3E")`,
      }} />

      {/* Sacred geometry — faint astrolabe rings in the background */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 1 }}>
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
          {/* Cluster 1: top-right */}
          <circle cx="72%" cy="22%" r="180" stroke="rgba(132,84,0,0.04)" strokeWidth="1" fill="none" />
          <circle cx="72%" cy="22%" r="110" stroke="rgba(132,84,0,0.035)" strokeWidth="0.75" fill="none" />
          <circle cx="72%" cy="22%" r="50"  stroke="rgba(132,84,0,0.05)" strokeWidth="0.5" fill="none" />
          {/* Cluster 2: bottom-left */}
          <circle cx="24%" cy="72%" r="150" stroke="rgba(132,84,0,0.035)" strokeWidth="0.75" fill="none" />
          <circle cx="24%" cy="72%" r="80"  stroke="rgba(132,84,0,0.04)" strokeWidth="0.5" fill="none" />
          {/* Structural cross-lines */}
          <line x1="72%" y1="0" x2="72%" y2="100%" stroke="rgba(132,84,0,0.018)" strokeWidth="0.5" />
          <line x1="0" y1="22%" x2="100%" y2="22%" stroke="rgba(132,84,0,0.018)" strokeWidth="0.5" />
        </svg>
      </div>

      <div style={{
        position: "absolute", top: 28, right: 36, pointerEvents: "none", zIndex: 5,
        textAlign: "right",
      }}>
        <div style={{
          fontFamily: "var(--font-serif)", fontStyle: "italic",
          fontSize: "1.15rem", fontWeight: 500, color: "rgba(17,21,26,0.18)",
          letterSpacing: "-0.01em", lineHeight: 1.1,
        }}>
          The Living Manuscript
        </div>
        <div style={{
          fontFamily: "var(--font-sans)", fontSize: "7px", fontWeight: 600,
          letterSpacing: "0.20em", textTransform: "uppercase",
          color: "rgba(132,84,0,0.3)", marginTop: 4,
        }}>
          Western Philosophy · Network View
        </div>
      </div>

      {/* Transformed canvas layer */}
      <div style={{
        position: "absolute", inset: 0,
        transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
        transformOrigin: "0 0",
        willChange: "transform",
      }}>
        {/* SVG edges — pixel-coordinate viewBox */}
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1, overflow: "visible" }}
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
            const d = curvePath(x1, y1, x2, y2);
            const { strength, kind } = edge;
            const isInfluence = kind === "influence";

            if (isInfluence) {
              return (
                <path
                  key={`${edge.from._id}-${edge.to._id}`}
                  d={influencePath(x1, y1, x2, y2)}
                  fill="none"
                  stroke="#1a1c19"
                  strokeWidth={active ? 0.6 + strength * 1.1 : 0.3 + strength * 0.4}
                  opacity={dimmed ? 0.02 : active ? strength * 0.82 : strength * 0.2}
                  style={{ transition: "opacity 0.25s, stroke-width 0.25s" }}
                />
              );
            }

            return (
              <path
                key={`${edge.from._id}-${edge.to._id}`}
                d={d}
                fill="none"
                stroke="#1a1c19"
                strokeWidth={active ? 1.6 : 0.9}
                opacity={dimmed ? 0.03 : active ? strength * 0.88 : strength * 0.38}
                style={{ transition: "opacity 0.25s, stroke-width 0.25s" }}
              />
            );
          })}
        </svg>

        {/* Portrait nodes */}
        {nodes.map((n) => {
          const isHovered      = hoveredId === n._id;
          const isSelected     = selectedId === n._id;
          const connectionKind = connectedMap.get(n._id);
          const isConnected    = !isHovered && connectionKind !== undefined;
          const isInfluenced   = connectionKind === "influence";
          const isDimmed       = hoveredId !== null && !isHovered && !isConnected;
          const isBeingDragged = draggingNodeId === n._id;
          const size = circleSize(n);
          const pos = nodePos[n._id];
          const cardOnLeft = pos.x > 62;


          return (
            <div
              key={n._id}
              style={{
                position: "absolute",
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                zIndex: isBeingDragged ? 40 : isHovered || isSelected ? 30 : 10,
                opacity: isDimmed ? 0.07 : 1,
                transition: isBeingDragged ? "none" : "opacity 0.25s",
                cursor: isBeingDragged ? "grabbing" : "grab",
              }}
              onMouseEnter={() => { if (!draggingNodeId) setHoveredId(n._id); }}
              onMouseLeave={() => setHoveredId(null)}
              onMouseDown={(e) => handleNodeMouseDown(e, n._id)}
              onClick={(e) => { e.stopPropagation(); if (!didDragRef.current) setSelectedId((id: string | null) => id === n._id ? null : n._id); }}
            >
              {/* Portrait */}
              <div style={{
                position: "absolute",
                top: -(size / 2), left: -(size / 2),
                width: size, height: size,
                borderRadius: "50%", overflow: "hidden",
                border: `${isSelected ? "2px" : "1px"} solid ${isSelected ? "rgba(17,21,26,0.9)" : isHovered ? "rgba(132,84,0,0.45)" : isInfluenced ? "rgba(107,130,196,0.45)" : isConnected ? "rgba(132,84,0,0.22)" : "rgba(26,28,25,0.14)"}`,
                boxShadow: isSelected
                  ? "0 0 0 5px rgba(17,21,26,0.18), 0 0 0 9px rgba(17,21,26,0.07), 0 8px 36px rgba(17,21,26,0.35)"
                  : isHovered
                  ? "0 4px 24px rgba(26,28,25,0.18)"
                  : isInfluenced
                  ? "0 0 0 3px rgba(107,130,196,0.2), 0 2px 16px rgba(107,130,196,0.18)"
                  : isConnected
                  ? "0 2px 12px rgba(26,28,25,0.10)"
                  : "0 1px 8px rgba(26,28,25,0.07)",
                transform: isHovered && !isBeingDragged ? "scale(1.12)" : isSelected && !isBeingDragged ? "scale(1.18)" : isConnected && !isBeingDragged ? "scale(1.05)" : "scale(1)",
                transition: isBeingDragged ? "none" : "transform 0.28s ease, border-color 0.25s, box-shadow 0.28s",
                background: "#1a140e",
              }}>
                {n.avatarUrl && !imgErrors.has(n._id) ? (
                  <Image
                    src={n.avatarUrl}
                    alt={n.name}
                    fill
                    sizes={`${size}px`}
                    onError={() => setImgErrors((prev) => new Set(prev).add(n._id))}
                    style={{
                      objectFit: "cover",
                      filter: isSelected
                        ? "sepia(0%) brightness(1.05) contrast(1.08) grayscale(0)"
                        : isHovered
                        ? "sepia(20%) brightness(0.98) contrast(1.05)"
                        : isInfluenced
                        ? "sepia(10%) brightness(0.92) contrast(1.06) hue-rotate(180deg) saturate(0.4)"
                        : isConnected
                        ? "sepia(35%) brightness(0.90) contrast(1.08) grayscale(0.1)"
                        : "sepia(45%) brightness(0.82) contrast(1.12) grayscale(0.2)",
                      transition: "filter 0.4s ease",
                    }}
                  />
                ) : (
                  <div style={{
                    width: "100%", height: "100%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "radial-gradient(ellipse at 40% 35%, #3a2a18, #1a140e)",
                  }}>
                    <span style={{
                      fontFamily: "var(--font-serif)", fontStyle: "italic",
                      fontSize: size * 0.4, color: "rgba(212,180,115,0.75)",
                      lineHeight: 1, userSelect: "none",
                    }}>
                      {n.name[0]}
                    </span>
                  </div>
                )}
              </div>

              {/* Name + branch + years */}
              <div style={{
                position: "absolute", top: size / 2 + 10, left: 0,
                transform: `translateX(-50%) translateY(${isHovered ? "-2px" : "0"})`,
                textAlign: "center", whiteSpace: "nowrap", pointerEvents: "none",
                transition: "transform 0.28s ease, opacity 0.25s",
                opacity: isDimmed ? 0.12 : isHovered ? 1 : isConnected ? 0.8 : 0.5,
              }}>
                <div style={{
                  fontFamily: "var(--font-serif)", fontStyle: "italic",
                  fontSize: isHovered ? "0.9rem" : "0.78rem",
                  fontWeight: isHovered ? 500 : 400,
                  color: isHovered ? "#845400" : "#1e1a14", lineHeight: 1.2,
                  transition: "color 0.25s, font-size 0.25s",
                }}>
                  {n.name}
                </div>
                <div style={{
                  fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "0.65rem",
                  color: "#7a7060", letterSpacing: "0.03em",
                  maxWidth: "160px", whiteSpace: "normal", lineHeight: 1.3,
                  marginTop: 3,
                  opacity: isHovered ? 1 : 0,
                  maxHeight: isHovered ? "40px" : "0px",
                  overflow: "hidden",
                  transition: "opacity 0.25s, max-height 0.3s",
                }}>
                  {n.coreBranch}
                </div>
                <div style={{
                  fontFamily: "var(--font-sans)", fontSize: "7px",
                  color: "#a09880", letterSpacing: "0.08em", marginTop: 2,
                  opacity: isHovered ? 1 : 0,
                  maxHeight: isHovered ? "20px" : "0px",
                  overflow: "hidden",
                  transition: "opacity 0.25s, max-height 0.3s",
                }}>
                  {n.birthYear < 0 ? `${Math.abs(n.birthYear)} BC` : n.birthYear}
                  {" – "}
                  {n.deathYear < 0 ? `${Math.abs(n.deathYear)} BC` : n.deathYear}
                </div>
              </div>

              {/* Hover card — archival index-card style */}
              <AnimatePresence>
                {isHovered && !isBeingDragged && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      position: "absolute",
                      top: -(size / 2),
                      ...(cardOnLeft ? { right: size / 2 + 20 } : { left: size / 2 + 20 }),
                      width: 308,
                      background: "rgba(253,250,245,0.97)",
                      backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
                      borderRadius: 4,
                      padding: "20px 22px 18px 22px",
                      boxShadow: "0 4px 6px rgba(26,28,25,0.04), 0 16px 48px rgba(26,28,25,0.13), 0 2px 0 rgba(132,84,0,0.06) inset",
                      border: "1px solid rgba(132,84,0,0.14)",
                      borderTop: "3px solid #845400",
                      pointerEvents: "auto", zIndex: 50, overflow: "hidden",
                    }}
                  >
                    {/* Branch badge */}
                    <div style={{
                      display: "inline-block",
                      fontFamily: "var(--font-sans)", fontSize: "7px", fontWeight: 700,
                      letterSpacing: "0.20em", textTransform: "uppercase",
                      color: "#845400", background: "rgba(132,84,0,0.08)",
                      border: "1px solid rgba(132,84,0,0.18)",
                      padding: "3px 8px", borderRadius: 2, marginBottom: 12,
                    }}>
                      {n.coreBranch}
                    </div>

                    {/* Name */}
                    <div style={{
                      fontFamily: "var(--font-serif)", fontSize: "1.35rem",
                      fontWeight: 500, color: "#11151a", lineHeight: 1.1, marginBottom: 10,
                    }}>
                      {n.name}
                    </div>

                    {/* Ornamental flourish divider */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, rgba(132,84,0,0.25), transparent)" }} />
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <circle cx="5" cy="5" r="1.5" fill="rgba(132,84,0,0.5)" />
                        <circle cx="5" cy="5" r="4" stroke="rgba(132,84,0,0.2)" strokeWidth="0.75" fill="none" />
                      </svg>
                      <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, rgba(132,84,0,0.25), transparent)" }} />
                    </div>

                    {/* Quote */}
                    <p style={{
                      fontFamily: "var(--font-serif)", fontStyle: "italic",
                      fontSize: "0.875rem", lineHeight: 1.65, color: "#2a2218", marginBottom: 11,
                    }}>
                      &ldquo;{n.hookQuote}&rdquo;
                    </p>

                    {/* Summary */}
                    <p style={{
                      fontFamily: "var(--font-sans)", fontSize: "0.72rem",
                      lineHeight: 1.72, color: "#5F6A78", marginBottom: 16,
                    }}>
                      {n.shortSummary.slice(0, 110)}…
                    </p>

                    {/* Footer: years + link */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{
                        fontFamily: "var(--font-sans)", fontSize: "7.5px",
                        color: "#5F6A78", opacity: 0.65, letterSpacing: "0.06em",
                      }}>
                        {n.birthYear < 0 ? `${Math.abs(n.birthYear)} BC` : n.birthYear}
                        {" – "}
                        {n.deathYear < 0 ? `${Math.abs(n.deathYear)} BC` : n.deathYear}
                      </div>
                      <Link
                        href={`/philosophers/${n.slug}`}
                        style={{
                          fontFamily: "var(--font-sans)", fontSize: "8.5px", fontWeight: 700,
                          letterSpacing: "0.18em", textTransform: "uppercase",
                          color: "#845400", textDecoration: "none",
                          display: "flex", alignItems: "center", gap: 5,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Read Entry
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Bottom instruction bar */}
      <div style={{
        position: "fixed", bottom: 0, left: 80, right: 0,
        padding: "16px 48px",
        display: "flex", gap: 52, alignItems: "flex-start",
        borderTop: "1px solid rgba(26,28,25,0.07)",
        background: "rgba(252,249,244,0.82)",
        backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
        zIndex: 20, pointerEvents: "none",
      }}>
        {[
          { action: "DRAG NODE",      label: "To reposition thinkers" },
          { action: "HOVER PORTRAIT", label: "To surface ideas"        },
          { action: "CLICK NAME",     label: "To read the full entry"  },
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

      {/* Philosopher side panel */}
      <AnimatePresence>
        {selectedId && (() => {
          const node = nodes.find(n => n._id === selectedId);
          return node ? (
            <PhilosopherPanel
              key={selectedId}
              node={node}
              allNodes={nodes}
              onClose={() => setSelectedId(null)}
              onNavigate={(id) => setSelectedId(id)}
            />
          ) : null;
        })()}
      </AnimatePresence>
    </div>
  );
}
