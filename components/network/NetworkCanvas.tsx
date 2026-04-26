"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { LineageNode } from "@/lib/mockData";

type Props = { philosophers: LineageNode[] };
type Edge = { from: LineageNode; to: LineageNode; kind: "lineage" | "influence" };
type Pos = { x: number; y: number }; // percentage 0-100

function buildEdges(philosophers: LineageNode[]): Edge[] {
  const map = new Map(philosophers.map((p) => [p._id, p]));
  const seen = new Set<string>();
  const edges: Edge[] = [];

  for (const p of philosophers) {
    // Direct mentor → student lineage
    for (const sid of p.students) {
      const s = map.get(sid);
      if (!s) continue;
      const key = [p._id, sid].sort().join("--");
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ from: p, to: s, kind: "lineage" });
    }
    // Cross-era intellectual influences
    for (const link of p.influences) {
      const influencer = map.get(link.id);
      if (!influencer) continue;
      const key = [influencer._id, p._id].sort().join("--");
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ from: influencer, to: p, kind: "influence" });
    }
  }

  return edges;
}

// Curves computed in real pixels so aspect ratio is respected
function sweepPath(x1: number, y1: number, x2: number, y2: number, idx: number): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const px = -dy / len;
  const py = dx / len;
  const sign = idx % 2 === 0 ? 1 : -1;
  const off = len * (0.42 + (idx % 3) * 0.14);
  const c1x = x1 + dx * 0.28 + px * off * sign;
  const c1y = y1 + dy * 0.28 + py * off * sign;
  const c2x = x1 + dx * 0.72 + px * off * sign;
  const c2y = y1 + dy * 0.72 + py * off * sign;
  return `M ${x1} ${y1} C ${c1x} ${c1y} ${c2x} ${c2y} ${x2} ${y2}`;
}

function dotRadius(p: { mentors: string[]; students: string[] }): number {
  const deg = p.mentors.length + p.students.length;
  if (deg >= 2) return 8;
  if (deg === 1) return 6;
  return 5;
}

type EraBlob = { eraId: string; eraTitle: string; cx: number; cy: number; rx: number; ry: number; fill: string; label: string };

const ERA_PALETTE: Record<string, { fill: string; label: string }> = {
  "era-1": { fill: "rgba(215,170,50,0.13)",  label: "#7a5e00" },
  "era-2": { fill: "rgba(80,148,80,0.13)",   label: "#2e5c28" },
  "era-3": { fill: "rgba(195,100,55,0.13)",  label: "#7a3c15" },
  "era-4": { fill: "rgba(90,105,175,0.13)",  label: "#38407a" },
};

function computeEraBlobs(
  philosophers: LineageNode[],
  nodePos: Record<string, Pos>,
  dims: { w: number; h: number }
): EraBlob[] {
  const groups: Record<string, { eraId: string; eraTitle: string; xs: number[]; ys: number[] }> = {};
  for (const p of philosophers) {
    const pos = nodePos[p._id];
    if (!pos) continue;
    if (!groups[p.eraId]) groups[p.eraId] = { eraId: p.eraId, eraTitle: p.eraTitle, xs: [], ys: [] };
    groups[p.eraId].xs.push((pos.x / 100) * dims.w);
    groups[p.eraId].ys.push((pos.y / 100) * dims.h);
  }
  return Object.values(groups)
    .filter(g => g.xs.length > 0)
    .map(({ eraId, eraTitle, xs, ys }) => {
      const minX = Math.min(...xs), maxX = Math.max(...xs);
      const minY = Math.min(...ys), maxY = Math.max(...ys);
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      const rx = Math.max(70, (maxX - minX) / 2 + 80);
      const ry = Math.max(55, (maxY - minY) / 2 + 65);
      const palette = ERA_PALETTE[eraId] ?? { fill: "rgba(100,100,100,0.1)", label: "#555" };
      return { eraId, eraTitle, cx, cy, rx, ry, ...palette };
    });
}

function formatYear(y: number): string {
  return y < 0 ? `${Math.abs(y)} BC` : `AD ${y}`;
}

const MIN_YEAR = -500;
const MAX_YEAR = 1960;
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 4;

export default function NetworkCanvas({ philosophers }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [viewport, setViewport] = useState({ zoom: 1, panX: 0, panY: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dims, setDims] = useState({ w: 1440, h: 900 });

  // Per-node positions in % (starts from mock data, user can drag)
  const [nodePos, setNodePos] = useState<Record<string, Pos>>(
    () => Object.fromEntries(philosophers.map((p) => [p._id, { x: p.networkX, y: p.networkY }]))
  );
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [activeYear, setActiveYear] = useState(MAX_YEAR);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const nodeDragStart = useRef({ mx: 0, my: 0, nx: 0, ny: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef(viewport);
  viewportRef.current = viewport;
  const isDraggingRef = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const touchesRef = useRef<{ id: number; x: number; y: number }[]>([]);
  const lastPinchDistRef = useRef<number | null>(null);

  const edges = useMemo(() => buildEdges(philosophers), [philosophers]);

  // For hovered node: map every directly connected node id → connection kind
  const connectedMap = useMemo(() => {
    if (!hoveredId) return new Map<string, "lineage" | "influence">();
    const map = new Map<string, "lineage" | "influence">();
    for (const edge of edges) {
      if (edge.from._id === hoveredId) map.set(edge.to._id, edge.kind);
      if (edge.to._id === hoveredId) map.set(edge.from._id, edge.kind);
    }
    return map;
  }, [hoveredId, edges]);

  const eraBlobs = useMemo(
    () => (dims.w > 0 && dims.h > 0 ? computeEraBlobs(philosophers, nodePos, dims) : []),
    [philosophers, nodePos, dims]
  );

  const searchMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;
    return new Set(
      philosophers
        .filter((p) => p.name.toLowerCase().includes(q) || p.coreBranch.toLowerCase().includes(q))
        .map((p) => p._id)
    );
  }, [searchQuery, philosophers]);

  // Track container pixel size for correct SVG coordinates
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

  // Search keyboard shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !(e.target instanceof HTMLInputElement) && !searchOpen) {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [searchOpen]);

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

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const ts = Array.from(e.touches).map((t) => ({ id: t.identifier, x: t.clientX, y: t.clientY }));
    touchesRef.current = ts;
    lastPinchDistRef.current = null;
    if (ts.length === 1) {
      isDraggingRef.current = true;
      setIsDragging(true);
      const v = viewportRef.current;
      dragStart.current = { x: ts[0].x, y: ts[0].y, panX: v.panX, panY: v.panY };
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const ts = Array.from(e.touches).map((t) => ({ id: t.identifier, x: t.clientX, y: t.clientY }));
    if (ts.length === 2) {
      const dist = Math.hypot(ts[0].x - ts[1].x, ts[0].y - ts[1].y);
      if (lastPinchDistRef.current !== null) {
        const factor = dist / lastPinchDistRef.current;
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const mx = (ts[0].x + ts[1].x) / 2 - rect.left;
          const my = (ts[0].y + ts[1].y) / 2 - rect.top;
          const v = viewportRef.current;
          const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, v.zoom * factor));
          const ratio = newZoom / v.zoom;
          setViewport({ zoom: newZoom, panX: mx * (1 - ratio) + v.panX * ratio, panY: my * (1 - ratio) + v.panY * ratio });
        }
      }
      lastPinchDistRef.current = dist;
      isDraggingRef.current = false;
    } else if (ts.length === 1 && isDraggingRef.current) {
      const dx = ts[0].x - dragStart.current.x;
      const dy = ts[0].y - dragStart.current.y;
      setViewport((prev) => ({ ...prev, panX: dragStart.current.panX + dx, panY: dragStart.current.panY + dy }));
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
    lastPinchDistRef.current = null;
    setDraggingNodeId(null);
  }, []);

  if (philosophers.length === 0) {
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
      className="philosophy-grid"
      style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#fafaf5", cursor }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Radial glow — fixed */}
      <div style={{
        position: "absolute", top: "45%", left: "50%", width: "60vw", height: "60vw",
        transform: "translate(-50%, -50%)",
        background: "radial-gradient(ellipse, rgba(196,112,41,0.07) 0%, transparent 62%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* Transformed canvas layer */}
      <div style={{
        position: "absolute", inset: 0,
        transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
        transformOrigin: "0 0",
        willChange: "transform",
      }}>
        {/* SVG edges — pixel-coordinate viewBox so aspect ratio is preserved */}
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1, overflow: "visible" }}
          viewBox={`0 0 ${dims.w} ${dims.h}`}
        >
          <defs>
            <filter id="era-blob-blur" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="28" />
            </filter>
            {/* Hidden paths for animateMotion particle references */}
            {edges.map((edge, idx) => {
              const p1 = nodePos[edge.from._id];
              const p2 = nodePos[edge.to._id];
              if (!p1 || !p2) return null;
              const prefix = edge.kind === "influence" ? "inf" : "pth";
              return (
                <path
                  key={`def-${edge.from._id}-${edge.to._id}`}
                  id={`${prefix}-${edge.from._id}-${edge.to._id}`}
                  d={sweepPath((p1.x / 100) * dims.w, (p1.y / 100) * dims.h, (p2.x / 100) * dims.w, (p2.y / 100) * dims.h, idx)}
                />
              );
            })}
          </defs>

          {/* Era background blobs */}
          {eraBlobs.map((blob) => (
            <g key={blob.eraId}>
              <ellipse
                cx={blob.cx} cy={blob.cy}
                rx={blob.rx} ry={blob.ry}
                fill={blob.fill}
                filter="url(#era-blob-blur)"
              />
              <text
                x={blob.cx}
                y={blob.cy - blob.ry + 22}
                textAnchor="middle"
                fontFamily="var(--font-sans)"
                fontSize="9"
                fontWeight="700"
                letterSpacing="0.2em"
                fill={blob.label}
                opacity="0.5"
              >
                {blob.eraTitle.toUpperCase()}
              </text>
            </g>
          ))}

          {edges.map((edge, idx) => {
            const p1 = nodePos[edge.from._id];
            const p2 = nodePos[edge.to._id];
            const x1 = (p1.x / 100) * dims.w;
            const y1 = (p1.y / 100) * dims.h;
            const x2 = (p2.x / 100) * dims.w;
            const y2 = (p2.y / 100) * dims.h;
            const active = hoveredId === edge.from._id || hoveredId === edge.to._id;
            const dimmed = hoveredId !== null && !active;
            const timelineFaded = edge.from.birthYear > activeYear || edge.to.birthYear > activeYear;
            const searchFaded = searchMatches !== null && !searchMatches.has(edge.from._id) && !searchMatches.has(edge.to._id);
            const isInfluence = edge.kind === "influence";
            return (
              <path
                key={`${edge.from._id}-${edge.to._id}`}
                d={sweepPath(x1, y1, x2, y2, idx)}
                fill="none"
                stroke={active ? (isInfluence ? "#6b82c4" : "#c47029") : (isInfluence ? "#4a5a8a" : "#1a1c19")}
                strokeWidth={active ? 1.5 : isInfluence ? 0.75 : 1}
                strokeDasharray={isInfluence ? "5 8" : undefined}
                opacity={timelineFaded || searchFaded ? 0.03 : dimmed ? 0.04 : active ? 0.6 : isInfluence ? 0.14 : 0.18}
                style={{ transition: "opacity 0.3s, stroke 0.3s" }}
              />
            );
          })}

          {/* Flow particles — amber for lineage, blue for influence */}
          {edges.map((edge) => {
            const active = hoveredId === edge.from._id || hoveredId === edge.to._id;
            const timelineFaded = edge.from.birthYear > activeYear || edge.to.birthYear > activeYear;
            if (!active || timelineFaded) return null;
            const isInfluence = edge.kind === "influence";
            const prefix = isInfluence ? "inf" : "pth";
            const href = `#${prefix}-${edge.from._id}-${edge.to._id}`;
            const color = isInfluence ? "#6b82c4" : "#c47029";
            const dur = isInfluence ? "2.4s" : "1.8s";
            const r1 = isInfluence ? 2 : 2.5;
            const r2 = isInfluence ? 1 : 1.5;
            return (
              <g key={`ptcl-${edge.from._id}-${edge.to._id}`}>
                <circle r={r1} fill={color} opacity="0.9">
                  <animateMotion dur={dur} repeatCount="indefinite" calcMode="linear">
                    <mpath href={href} />
                  </animateMotion>
                </circle>
                <circle r={r2} fill={color} opacity="0.45">
                  <animateMotion dur={dur} begin={isInfluence ? "1.2s" : "0.9s"} repeatCount="indefinite" calcMode="linear">
                    <mpath href={href} />
                  </animateMotion>
                </circle>
              </g>
            );
          })}
        </svg>

        {/* Dot nodes */}
        {philosophers.map((p) => {
          const isHovered = hoveredId === p._id;
          const connectionKind = connectedMap.get(p._id);
          const isConnected = connectionKind !== undefined;
          const timelineHidden = p.birthYear > activeYear;
          const searchDimmed = searchMatches !== null && !searchMatches.has(p._id);
          const isDimmed = (hoveredId !== null && !isHovered && !isConnected) || timelineHidden || searchDimmed;
          const isBeingDragged = draggingNodeId === p._id;
          const r = dotRadius(p);
          const size = r * 2;
          const glowSize = r * 8;
          const pos = nodePos[p._id];
          const cardAbove = pos.y > 58;
          const cardOnLeft = pos.x > 68;

          const dotColor = isBeingDragged || isHovered
            ? "#c47029"
            : connectionKind === "influence"
            ? "#6b82c4"
            : connectionKind === "lineage"
            ? "#c47029"
            : "#11151a";

          const glowColor = isHovered
            ? "rgba(196,112,41,0.22)"
            : connectionKind === "influence"
            ? "rgba(107,130,196,0.28)"
            : connectionKind === "lineage"
            ? "rgba(196,112,41,0.18)"
            : "rgba(17,21,26,0.07)";

          const ringColor = connectionKind === "influence"
            ? "rgba(107,130,196,0.35)"
            : "rgba(196,112,41,0.2)";

          return (
            <div
              key={p._id}
              style={{
                position: "absolute",
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                zIndex: isBeingDragged ? 40 : isHovered ? 30 : isConnected ? 20 : 10,
                opacity: timelineHidden ? 0.07 : searchDimmed ? 0.05 : isDimmed ? 0.12 : 1,
                transition: isDragging || isBeingDragged ? "none" : "opacity 0.3s",
                cursor: isBeingDragged ? "grabbing" : "grab",
              }}
              onMouseEnter={() => !draggingNodeId && setHoveredId(p._id)}
              onMouseLeave={() => setHoveredId(null)}
              onMouseDown={(e) => handleNodeMouseDown(e, p._id)}
            >
              {/* Pulsing glow */}
              {!isBeingDragged && (
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.12, 0.3] }}
                  transition={{ duration: 3 + (p.networkX % 4) * 0.4, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    position: "absolute", width: glowSize, height: glowSize,
                    top: -(glowSize / 2), left: -(glowSize / 2),
                    borderRadius: "50%",
                    background: glowColor,
                    filter: "blur(10px)", pointerEvents: "none",
                  }}
                />
              )}

              {/* Dot */}
              <div style={{
                position: "absolute", width: size, height: size,
                top: -(size / 2), left: -(size / 2),
                borderRadius: "50%",
                background: dotColor,
                border: "2px solid #fafaf5",
                boxShadow: isHovered || isBeingDragged || isConnected
                  ? `0 0 0 4px ${ringColor}`
                  : "0 1px 6px rgba(17,21,26,0.14)",
                transform: isHovered || isBeingDragged ? "scale(1.6)" : isConnected ? "scale(1.25)" : "scale(1)",
                transition: isBeingDragged ? "none" : "transform 0.25s ease, background 0.25s, box-shadow 0.25s",
              }} />

              {/* Name + branch */}
              <div style={{
                position: "absolute", top: size / 2 + 10, left: 0,
                transform: "translateX(-50%)", textAlign: "center",
                whiteSpace: "nowrap", pointerEvents: "none",
              }}>
                <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "0.9rem", fontWeight: 400, color: "#11151a", lineHeight: 1.2 }}>
                  {p.name}
                </div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: "8px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#43474c", opacity: 0.6, marginTop: 3 }}>
                  {p.coreBranch}
                </div>
              </div>

              {/* Hover card */}
              <AnimatePresence>
                {isHovered && !isBeingDragged && (
                  <motion.div
                    initial={{ opacity: 0, y: cardAbove ? 6 : -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: cardAbove ? 6 : -6 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    style={{
                      position: "absolute",
                      ...(cardAbove ? { bottom: size / 2 + 10 } : { top: size / 2 + 54 }),
                      ...(cardOnLeft ? { right: 16 } : { left: 16 }),
                      width: 256,
                      background: "rgba(252,251,249,0.97)",
                      backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
                      borderRadius: 14, padding: "20px 20px 16px 22px",
                      boxShadow: "0 10px 36px rgba(17,21,26,0.10), 0 2px 8px rgba(17,21,26,0.05)",
                      border: "1px solid rgba(17,21,26,0.07)",
                      pointerEvents: "auto", zIndex: 50, overflow: "hidden",
                    }}
                  >
                    <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 3, background: "#c47029", borderRadius: "14px 0 0 14px" }} />
                    <div style={{ fontFamily: "var(--font-serif)", fontSize: "2.4rem", lineHeight: 0.75, color: "#c47029", marginBottom: 8, userSelect: "none" }}>&ldquo;</div>
                    <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "0.85rem", lineHeight: 1.65, color: "#11151a", marginBottom: 10 }}>{p.hookQuote}</p>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "8.5px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#43474c", marginBottom: 14 }}>
                      {p.name} · {p.coreBranch}
                    </p>
                    <Link
                      href={`/philosophers/${p.slug}`}
                      style={{ fontFamily: "var(--font-sans)", fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c47029", textDecoration: "none" }}
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
      </div>

      {/* Search overlay — press / to open */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{
              position: "fixed", top: 72, left: "50%", transform: "translateX(-50%)",
              width: 420, padding: "16px 20px",
              background: "rgba(252,251,249,0.97)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
              borderRadius: 14, border: "1px solid rgba(17,21,26,0.10)",
              boxShadow: "0 8px 40px rgba(17,21,26,0.12)", zIndex: 100,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#43474c" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search philosophers or branches…"
                style={{
                  flex: 1, border: "none", outline: "none", background: "transparent",
                  fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "0.95rem", color: "#11151a",
                }}
              />
              <button
                onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                style={{
                  border: "none", background: "none", cursor: "pointer", padding: "2px 8px",
                  fontFamily: "var(--font-sans)", fontSize: "8px", fontWeight: 700,
                  letterSpacing: "0.15em", color: "#43474c", opacity: 0.5,
                }}
              >ESC</button>
            </div>
            {searchQuery.trim() && (
              <div style={{
                marginTop: 10, borderTop: "1px solid rgba(17,21,26,0.07)", paddingTop: 9,
                fontFamily: "var(--font-sans)", fontSize: "8.5px", fontWeight: 700,
                letterSpacing: "0.15em", color: "#c47029",
              }}>
                {searchMatches?.size ?? 0} MATCH{(searchMatches?.size ?? 0) !== 1 ? "ES" : ""}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline scrubber — fixed bottom center */}
      <div style={{
        position: "fixed", bottom: 40, left: "50%", transform: "translateX(-50%)",
        width: 400, padding: "14px 22px 16px",
        background: "rgba(252,251,249,0.92)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        borderRadius: 14, border: "1px solid rgba(17,21,26,0.07)",
        boxShadow: "0 4px 24px rgba(17,21,26,0.05)", zIndex: 20,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ height: 1, width: 18, background: "#11151a" }} />
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#11151a" }}>Timeline</span>
          </div>
          <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "0.9rem", color: "#c47029" }}>
            {activeYear >= MAX_YEAR ? "All eras" : formatYear(activeYear)}
          </span>
        </div>
        <input
          type="range" min={MIN_YEAR} max={MAX_YEAR} step={10} value={activeYear}
          onChange={(e) => setActiveYear(Number(e.target.value))}
          style={{ width: "100%", accentColor: "#c47029", cursor: "pointer", display: "block" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7 }}>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "8px", fontWeight: 600, letterSpacing: "0.1em", color: "#43474c", opacity: 0.5 }}>500 BC</span>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "8px", fontWeight: 600, letterSpacing: "0.1em", color: "#43474c", opacity: 0.5 }}>AD 1960</span>
        </div>
      </div>

      {/* Map Statistics — fixed */}
      <div style={{
        position: "fixed", bottom: 40, right: 40, width: 272,
        padding: "22px 26px",
        background: "rgba(252,251,249,0.80)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        borderRadius: 14, border: "1px solid rgba(17,21,26,0.07)",
        boxShadow: "0 4px 24px rgba(17,21,26,0.05)", zIndex: 20,
      }}>
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

      {/* Navigation hints — fixed */}
      <div style={{ position: "fixed", bottom: 40, left: "calc(80px + 32px)", display: "flex", gap: 36, zIndex: 20 }}>
        {[
          { hint: "/", desc: "Search" },
          { hint: "Scroll", desc: "Zoom in / out" },
          { hint: "Drag Canvas", desc: "Pan the map" },
          { hint: "Drag Node", desc: "Reposition" },
        ].map(({ hint, desc }) => (
          <div key={hint}>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "8px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#43474c", opacity: 0.5, marginBottom: 4 }}>
              {hint}
            </div>
            <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "0.78rem", color: "#11151a" }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* Zoom controls — fixed */}
      <div style={{ position: "fixed", bottom: 148, right: 40, display: "flex", flexDirection: "column", gap: 8, alignItems: "center", zIndex: 20 }}>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", color: "#43474c", opacity: 0.6 }}>
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
