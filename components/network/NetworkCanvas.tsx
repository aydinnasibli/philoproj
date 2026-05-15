"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LineageNode, InfluenceLink } from "@/lib/types";
import PhilosopherPanel from "@/components/network/PhilosopherPanel";

type Props = { nodes: LineageNode[] };
type Edge = { from: LineageNode; to: LineageNode; strength: number; kind: "lineage" | "influence" };
type Pos = { x: number; y: number };

const LINEAGE_STRENGTH: Record<string, number> = {
  "p-1--p-2":  1.00,
  "p-2--p-3":  1.00,
  "p-4--p-5":  0.85,
  "p-6--p-7":  0.90,
  "p-7--p-8":  0.90,
  "p-8--p-9":  0.70,
  "p-9--p-10": 0.50,
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
    for (const sid of n.students) {
      const s = map.get(sid);
      if (!s) continue;
      const key = [n._id, sid].sort().join("--");
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ from: n, to: s, strength: LINEAGE_STRENGTH[key] ?? 0.6, kind: "lineage" });
    }
    for (const link of n.influences) {
      const influencer = map.get(link.id);
      if (!influencer) continue;
      const key = [influencer._id, n._id].sort().join("~~");
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ from: influencer, to: n, strength: INFLUENCE_STRENGTH[link.strength], kind: "influence" });
    }
  }
  return edges;
}

function curvePath(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1 + x2) / 2 + (y1 - y2) * 0.12;
  const my = (y1 + y2) / 2 + (x2 - x1) * 0.12;
  return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
}

function influencePath(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1 + x2) / 2 + (y1 - y2) * 0.48;
  const my = (y1 + y2) / 2 + (x2 - x1) * 0.48;
  return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
}

const GRID_STEP = 80;
const VORTEX_RADIUS = 210;
const VORTEX_STRENGTH = 52;

function vortexPt(gx: number, gy: number, cx: number, cy: number): string {
  const dx = gx - cx; const dy = gy - cy;
  const distSq = dx * dx + dy * dy;
  if (distSq >= VORTEX_RADIUS * VORTEX_RADIUS || distSq < 0.01) return `${gx.toFixed(1)},${gy.toFixed(1)}`;
  const dist = Math.sqrt(distSq);
  const pull = Math.pow(1 - dist / VORTEX_RADIUS, 2) * VORTEX_STRENGTH;
  return `${(gx - (dx / dist) * pull).toFixed(1)},${(gy - (dy / dist) * pull).toFixed(1)}`;
}

function buildVortexGrid(w: number, h: number, cx: number, cy: number): string {
  const SEG = GRID_STEP / 8;
  let d = "";
  for (let y = 0; y <= h + GRID_STEP; y += GRID_STEP) {
    let first = true;
    for (let x = 0; x <= w + SEG; x += SEG) { d += (first ? "M" : "L") + vortexPt(x, y, cx, cy) + " "; first = false; }
  }
  for (let x = 0; x <= w + GRID_STEP; x += GRID_STEP) {
    let first = true;
    for (let y = 0; y <= h + SEG; y += SEG) { d += (first ? "M" : "L") + vortexPt(x, y, cx, cy) + " "; first = false; }
  }
  return d;
}

// Single <path> with strokeLinecap="round" instead of N individual <circle> elements
function buildDotPath(w: number, h: number, cx: number, cy: number): string {
  let d = "";
  for (let r = 0; r < Math.ceil(h / GRID_STEP) + 1; r++) {
    for (let c = 0; c < Math.ceil(w / GRID_STEP) + 1; c++) {
      d += "M" + vortexPt(c * GRID_STEP, r * GRID_STEP, cx, cy) + "h0 ";
    }
  }
  return d;
}

// circleSize only returns 3 values — precompute Tailwind classes for each
function circleSize(n: LineageNode): 38 | 46 | 54 {
  const deg = n.mentors.length + n.students.length;
  if (deg >= 2) return 54;
  if (deg === 1) return 46;
  return 38;
}

// Tailwind size class lookups — full strings so the scanner picks them up
const PORTRAIT_CLS: Record<38 | 46 | 54, string> = {
  54: "w-[54px] h-[54px] -top-[27px] -left-[27px]",
  46: "w-[46px] h-[46px] -top-[23px] -left-[23px]",
  38: "w-[38px] h-[38px] -top-[19px] -left-[19px]",
};
const RING_CLS: Record<38 | 46 | 54, string> = {
  54: "w-[66px] h-[66px] -top-[33px] -left-[33px]",
  46: "w-[58px] h-[58px] -top-[29px] -left-[29px]",
  38: "w-[50px] h-[50px] -top-[25px] -left-[25px]",
};
const LABEL_TOP_CLS: Record<38 | 46 | 54, string> = {
  54: "top-[37px]",
  46: "top-[33px]",
  38: "top-[29px]",
};
const INITIALS_CLS: Record<38 | 46 | 54, string> = {
  54: "text-[21px]",
  46: "text-[18px]",
  38: "text-[15px]",
};

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 4;

export default function NetworkCanvas({ nodes }: Props) {
  const [hoveredId, setHoveredId]     = useState<string | null>(null);
  const [imgErrors, setImgErrors]     = useState<Set<string>>(new Set());
  const [viewport, setViewport]       = useState({ zoom: 1, panX: 0, panY: 0 });
  const [isDragging, setIsDragging]   = useState(false);
  const [dims, setDims]               = useState({ w: 1440, h: 900 });
  const [nodePos, setNodePos]         = useState<Record<string, Pos>>(
    () => Object.fromEntries(nodes.map((n) => [n._id, { x: n.networkX, y: n.networkY }]))
  );
  const [selectedId, setSelectedId]       = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const nodeDragStart = useRef({ mx: 0, my: 0, nx: 0, ny: 0 });
  const [cursorPos, setCursorPos]     = useState({ x: -9999, y: -9999 });
  const [searchOpen, setSearchOpen]   = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pulsingId, setPulsingId]     = useState<string | null>(null);
  const searchRef      = useRef<HTMLInputElement>(null);
  const containerRef   = useRef<HTMLDivElement>(null);
  const canvasLayerRef = useRef<HTMLDivElement>(null);
  const nodeElsRef     = useRef<Map<string, HTMLDivElement>>(new Map());
  const viewportRef    = useRef(viewport);
  useEffect(() => { viewportRef.current = viewport; }, [viewport]);
  const isDraggingRef  = useRef(false);
  const didDragRef     = useRef(false);
  const dragStart      = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const cursorRafRef   = useRef<number | null>(null);
  const activePointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef       = useRef<{ dist: number } | null>(null);

  // useLayoutEffect fires before paint — CSS vars are set before first pixel, no FOUC
  useLayoutEffect(() => {
    const el = canvasLayerRef.current;
    if (!el) return;
    el.style.setProperty('--tx', `${viewport.panX}px`);
    el.style.setProperty('--ty', `${viewport.panY}px`);
    el.style.setProperty('--s', String(viewport.zoom));
  }, [viewport]);

  // Imperatively push node positions — avoids per-node style props
  useEffect(() => {
    for (const [id, el] of nodeElsRef.current) {
      const pos = nodePos[id];
      if (!pos) continue;
      el.style.setProperty('--nx', `${pos.x}%`);
      el.style.setProperty('--ny', `${pos.y}%`);
    }
  }, [nodePos]);

  // Cancel any pending RAF on unmount
  useEffect(() => {
    return () => { if (cursorRafRef.current) cancelAnimationFrame(cursorRafRef.current); };
  }, []);

  const edges = useMemo(() => buildEdges(nodes), [nodes]);

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
      if ((e.target as HTMLElement).closest("[data-panel]")) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const v = viewportRef.current;
      const factor = 1 - e.deltaY * 0.001;
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, v.zoom * factor));
      const ratio = newZoom / v.zoom;
      setViewport({ zoom: newZoom, panX: mouseX * (1 - ratio) + v.panX * ratio, panY: mouseY * (1 - ratio) + v.panY * ratio });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("a, button")) return;
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointers.current.size === 2) {
      const pts = [...activePointers.current.values()];
      pinchRef.current = { dist: Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y) };
      setDraggingNodeId(null); isDraggingRef.current = false; setIsDragging(false);
      return;
    }

    didDragRef.current = false;
    setHoveredId(null);
    const nodeEl = (e.target as HTMLElement).closest("[data-nodeid]") as HTMLElement | null;
    if (nodeEl) {
      const id = nodeEl.dataset.nodeid!;
      const pos = nodePos[id];
      setDraggingNodeId(id);
      nodeDragStart.current = { mx: e.clientX, my: e.clientY, nx: pos.x, ny: pos.y };
    } else {
      isDraggingRef.current = true; setIsDragging(true);
      const v = viewportRef.current;
      dragStart.current = { x: e.clientX, y: e.clientY, panX: v.panX, panY: v.panY };
    }
  }, [nodePos]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!cursorRafRef.current) {
      const cx = e.clientX; const cy = e.clientY;
      cursorRafRef.current = requestAnimationFrame(() => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) setCursorPos({ x: cx - rect.left, y: cy - rect.top });
        cursorRafRef.current = null;
      });
    }
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointers.current.size === 2 && pinchRef.current) {
      const pts = [...activePointers.current.values()];
      const newDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mx = (pts[0].x + pts[1].x) / 2 - rect.left;
      const my = (pts[0].y + pts[1].y) / 2 - rect.top;
      const v = viewportRef.current;
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, v.zoom * (newDist / pinchRef.current.dist)));
      const ratio = newZoom / v.zoom;
      setViewport({ zoom: newZoom, panX: mx * (1 - ratio) + v.panX * ratio, panY: my * (1 - ratio) + v.panY * ratio });
      pinchRef.current.dist = newDist;
      return;
    }

    if (draggingNodeId) {
      const rawDx = e.clientX - nodeDragStart.current.mx;
      const rawDy = e.clientY - nodeDragStart.current.my;
      if (!didDragRef.current && Math.hypot(rawDx, rawDy) < 5) return;
      didDragRef.current = true;
      const v = viewportRef.current;
      setNodePos((prev) => ({ ...prev, [draggingNodeId]: { x: nodeDragStart.current.nx + (rawDx / v.zoom / dims.w) * 100, y: nodeDragStart.current.ny + (rawDy / v.zoom / dims.h) * 100 } }));
      return;
    }

    if (isDraggingRef.current) {
      didDragRef.current = true;
      setViewport((prev) => ({ ...prev, panX: dragStart.current.panX + e.clientX - dragStart.current.x, panY: dragStart.current.panY + e.clientY - dragStart.current.y }));
    }
  }, [draggingNodeId, dims]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    activePointers.current.delete(e.pointerId);
    if (activePointers.current.size < 2) pinchRef.current = null;
    if (activePointers.current.size === 0) {
      setDraggingNodeId(null); isDraggingRef.current = false; setIsDragging(false);
    }
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (cursorRafRef.current) { cancelAnimationFrame(cursorRafRef.current); cursorRafRef.current = null; }
    setCursorPos({ x: -9999, y: -9999 });
    setHoveredId(null);
    activePointers.current.clear();
    pinchRef.current = null;
    didDragRef.current = false;
    setDraggingNodeId(null);
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "/" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) { e.preventDefault(); setSearchOpen(true); }
      if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); setPulsingId(null); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);

  // Debounced search navigation — 150 ms prevents viewport jumping on every keystroke
  useEffect(() => {
    if (!searchQuery.trim()) { setPulsingId(null); return; }
    const timer = setTimeout(() => {
      const match = nodes.find(n => n.name.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!match) { setPulsingId(null); return; }
      const pos = nodePos[match._id];
      const targetZoom = 1.3;
      const nodeX = (pos.x / 100) * dims.w;
      const nodeY = (pos.y / 100) * dims.h;
      setViewport({ zoom: targetZoom, panX: dims.w / 2 - nodeX * targetZoom, panY: dims.h / 2 - nodeY * targetZoom });
      setPulsingId(match._id);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery, nodes, nodePos, dims.w, dims.h]);

  const connectedMap = useMemo(() => {
    const map = new Map<string, "lineage" | "influence">();
    if (!hoveredId) return map;
    for (const e of edges) {
      if (e.from._id === hoveredId) map.set(e.to._id, e.kind);
      else if (e.to._id === hoveredId) map.set(e.from._id, e.kind);
    }
    return map;
  }, [hoveredId, edges]);

  const hoveredNode = hoveredId ? (nodes.find(n => n._id === hoveredId) ?? null) : null;
  const selectedNode = selectedId ? (nodes.find(n => n._id === selectedId) ?? null) : null;

  if (nodes.length === 0) {
    return <div className="flex items-center justify-center h-screen font-serif italic text-[#43474c]">No lineage data found.</div>;
  }

  const { zoom } = viewport;

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label="Philosopher lineage canvas"
      className={`fixed inset-0 overflow-hidden select-none bg-[radial-gradient(ellipse_at_38%_48%,#FDFAF5_0%,#F8F3E8_50%,#F0E9D6_100%)] ${draggingNodeId || isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onClick={() => { if (!didDragRef.current) setSelectedId(null); }}
    >
      {/* Vortex grid — single path for dots instead of N circle elements */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" aria-hidden="true">
        <path d={buildVortexGrid(dims.w, dims.h, cursorPos.x, cursorPos.y)} fill="none" stroke="rgba(17,21,26,0.038)" strokeWidth="0.75" />
        <path d={buildDotPath(dims.w, dims.h, cursorPos.x, cursorPos.y)} fill="none" stroke="rgba(132,84,0,0.09)" strokeWidth="2.4" strokeLinecap="round" />
      </svg>

      {/* Warm radial glow */}
      <div className="absolute top-[45%] left-[55%] w-[65vw] h-[65vw] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse,rgba(196,112,41,0.13)_0%,transparent_62%)] pointer-events-none z-0" aria-hidden="true" />

      {/* Parchment noise */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.032'/%3E%3C/svg%3E\")" }} aria-hidden="true" />

      {/* Sacred geometry rings */}
      <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
        <svg width="100%" height="100%" className="absolute inset-0">
          <circle cx="72%" cy="22%" r="180" stroke="rgba(132,84,0,0.04)" strokeWidth="1" fill="none" />
          <circle cx="72%" cy="22%" r="110" stroke="rgba(132,84,0,0.035)" strokeWidth="0.75" fill="none" />
          <circle cx="72%" cy="22%" r="50"  stroke="rgba(132,84,0,0.05)" strokeWidth="0.5" fill="none" />
          <circle cx="24%" cy="72%" r="150" stroke="rgba(132,84,0,0.035)" strokeWidth="0.75" fill="none" />
          <circle cx="24%" cy="72%" r="80"  stroke="rgba(132,84,0,0.04)" strokeWidth="0.5" fill="none" />
          <line x1="72%" y1="0" x2="72%" y2="100%" stroke="rgba(132,84,0,0.018)" strokeWidth="0.5" />
          <line x1="0" y1="22%" x2="100%" y2="22%" stroke="rgba(132,84,0,0.018)" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Title */}
      <div className="absolute top-6 right-9 pointer-events-none z-5">
        <div className="font-serif italic text-[1.65rem] font-medium text-[rgba(17,21,26,0.25)] tracking-[-0.015em] leading-none">
          The Living Manuscript
        </div>
      </div>

      {/* Search */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-6 left-[100px] z-200"
          >
            <div className="flex items-center gap-2 bg-[rgba(253,250,245,0.97)] backdrop-blur-xl border border-[rgba(132,84,0,0.2)] border-t-2 border-t-[#845400] rounded-[4px] px-[14px] py-2 w-[280px] shadow-[0_8px_32px_rgba(26,28,25,0.14)]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#845400" strokeWidth="2.5" className="shrink-0" aria-hidden="true">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search philosophers…"
                aria-label="Search philosophers"
                className="flex-1 border-none bg-transparent outline-none font-serif italic text-[0.88rem] text-[#11151a]"
              />
              <span className="font-sans text-[9px] text-[#a09880] tracking-widest shrink-0" aria-hidden="true">ESC</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canvas layer — CSS vars initialised inline to avoid FOUC on first paint */}
      <div
        ref={canvasLayerRef}
        className="absolute inset-0 origin-top-left will-change-transform transform-[translate(var(--tx),var(--ty))_scale(var(--s))]"
      >
        {/* SVG edges */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-1 overflow-visible" viewBox={`0 0 ${dims.w} ${dims.h}`} aria-hidden="true">
          {edges.map((edge) => {
            const p1 = nodePos[edge.from._id]; const p2 = nodePos[edge.to._id];
            const x1 = (p1.x / 100) * dims.w; const y1 = (p1.y / 100) * dims.h;
            const x2 = (p2.x / 100) * dims.w; const y2 = (p2.y / 100) * dims.h;
            const active = hoveredId === edge.from._id || hoveredId === edge.to._id;
            const dimmed = hoveredId !== null && !active;
            const { strength, kind } = edge;

            return kind === "influence" ? (
              <path
                key={`${edge.from._id}-${edge.to._id}-influence`}
                d={influencePath(x1, y1, x2, y2)} fill="none" stroke="#1a1c19"
                strokeWidth={active ? 0.6 + strength * 1.1 : 0.3 + strength * 0.4}
                opacity={dimmed ? 0.02 : active ? strength * 0.82 : strength * 0.2}
                className="[transition:opacity_0.25s,stroke-width_0.25s]"
              />
            ) : (
              <path
                key={`${edge.from._id}-${edge.to._id}-lineage`}
                d={curvePath(x1, y1, x2, y2)} fill="none" stroke="#1a1c19"
                strokeWidth={active ? 1.6 : 0.9}
                opacity={dimmed ? 0.03 : active ? strength * 0.88 : strength * 0.38}
                className="[transition:opacity_0.25s,stroke-width_0.25s]"
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
          const size           = circleSize(n);

          return (
            <div
              key={n._id}
              ref={(el) => { if (el) nodeElsRef.current.set(n._id, el); else nodeElsRef.current.delete(n._id); }}
              className={`absolute left-(--nx) top-(--ny) ${
                isBeingDragged ? "z-40 cursor-grabbing" :
                isHovered      ? "z-100 cursor-grab"   :
                isSelected     ? "z-30 cursor-grab"     : "z-10 cursor-grab"
              } ${isDimmed ? "opacity-[0.07]" : "opacity-100"} ${isBeingDragged ? "" : "[transition:opacity_0.25s]"}`}
              data-nodeid={n._id}
              onPointerEnter={() => { if (!draggingNodeId) setHoveredId(n._id); }}
              onPointerLeave={() => setHoveredId(null)}
              onClick={(e) => { e.stopPropagation(); if (!didDragRef.current) setSelectedId((id) => id === n._id ? null : n._id); }}
            >
              {/* Search highlight ring */}
              {pulsingId === n._id && (
                <motion.div
                  className={`absolute rounded-full border-[1.5px] border-[rgba(196,112,41,0.55)] shadow-[0_0_12px_rgba(196,112,41,0.2)] pointer-events-none ${RING_CLS[size]}`}
                  animate={{ opacity: [0.9, 0.35, 0.9] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
              )}

              {/* Portrait */}
              <motion.div
                animate={{ scale: pulsingId === n._id ? 1 : isHovered && !isBeingDragged ? 1.12 : isSelected && !isBeingDragged ? 1.18 : isConnected && !isBeingDragged ? 1.05 : 1 }}
                transition={pulsingId === n._id ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className={`absolute rounded-full overflow-hidden bg-[#1a140e] ${PORTRAIT_CLS[size]} ${
                  isSelected
                    ? "border-2 border-[rgba(17,21,26,0.9)] shadow-[0_0_0_5px_rgba(17,21,26,0.18),0_0_0_9px_rgba(17,21,26,0.07),0_8px_36px_rgba(17,21,26,0.35)]"
                    : isHovered
                    ? "border border-[rgba(132,84,0,0.45)] shadow-[0_4px_24px_rgba(26,28,25,0.18)]"
                    : isInfluenced
                    ? "border border-[rgba(107,130,196,0.45)] shadow-[0_0_0_3px_rgba(107,130,196,0.2),0_2px_16px_rgba(107,130,196,0.18)]"
                    : isConnected
                    ? "border border-[rgba(132,84,0,0.22)] shadow-[0_2px_12px_rgba(26,28,25,0.10)]"
                    : "border border-[rgba(26,28,25,0.14)] shadow-[0_1px_8px_rgba(26,28,25,0.07)]"
                }`}
              >
                {n.avatarUrl && !imgErrors.has(n._id) ? (
                  <Image
                    src={n.avatarUrl} alt={n.name} fill sizes={`${size}px`}
                    onError={() => setImgErrors((prev) => new Set(prev).add(n._id))}
                    className={`object-cover [transition:filter_0.4s_ease] ${
                      isSelected   ? "filter-[sepia(0%)_brightness(1.05)_contrast(1.08)_grayscale(0)]"
                      : isHovered  ? "filter-[sepia(20%)_brightness(0.98)_contrast(1.05)]"
                      : isInfluenced ? "filter-[sepia(10%)_brightness(0.92)_contrast(1.06)_hue-rotate(180deg)_saturate(0.4)]"
                      : isConnected  ? "filter-[sepia(35%)_brightness(0.90)_contrast(1.08)_grayscale(0.1)]"
                      :                "filter-[sepia(45%)_brightness(0.82)_contrast(1.12)_grayscale(0.2)]"
                    }`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[radial-gradient(ellipse_at_40%_35%,#3a2a18,#1a140e)]">
                    <span className={`font-serif italic text-[rgba(212,180,115,0.75)] leading-none select-none ${INITIALS_CLS[size]}`}>
                      {n.name[0]}
                    </span>
                  </div>
                )}
              </motion.div>

              {/* Name + branch + years label */}
              <div
                className={`absolute left-0 -translate-x-1/2 text-center whitespace-nowrap pointer-events-none [transition:transform_0.28s_ease,opacity_0.25s] ${LABEL_TOP_CLS[size]} ${isHovered ? "translate-y-[-2px]" : "translate-y-0"} ${isDimmed ? "opacity-[0.12]" : isHovered ? "opacity-100" : isConnected ? "opacity-80" : "opacity-50"}`}
              >
                <div className={`font-serif italic leading-[1.2] [transition:color_0.25s,font-size_0.25s] [text-shadow:0_0_8px_rgba(253,250,245,1),0_0_14px_rgba(253,250,245,1),0_0_20px_rgba(253,250,245,0.9)] ${isHovered ? "text-[0.9rem] font-medium text-[#845400]" : "text-[0.78rem] font-normal text-[#1e1a14]"}`}>
                  {n.name}
                </div>
                <div className={`font-serif italic text-[0.65rem] text-[#7a7060] tracking-[0.03em] max-w-[160px] whitespace-normal leading-[1.3] mt-[3px] overflow-hidden [transition:opacity_0.25s,max-height_0.3s] [text-shadow:0_0_6px_rgba(253,250,245,1),0_0_10px_rgba(253,250,245,0.95),0_0_16px_rgba(253,250,245,0.85)] ${isHovered ? "opacity-100 max-h-[40px]" : "opacity-0 max-h-0"}`}>
                  {n.coreBranch}
                </div>
                <div className={`font-sans text-[7px] text-[#a09880] tracking-[0.08em] mt-[2px] overflow-hidden [transition:opacity_0.25s,max-height_0.3s] [text-shadow:0_0_6px_rgba(253,250,245,1),0_0_10px_rgba(253,250,245,0.95),0_0_16px_rgba(253,250,245,0.85)] ${isHovered ? "opacity-100 max-h-[20px]" : "opacity-0 max-h-0"}`}>
                  {n.birthYear < 0 ? `${Math.abs(n.birthYear)} BC` : n.birthYear}{" – "}{n.deathYear < 0 ? `${Math.abs(n.deathYear)} BC` : n.deathYear}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hover card */}
      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            key={hoveredNode._id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-[88px] right-4 w-[290px] bg-[rgba(253,250,245,0.97)] backdrop-blur-[28px] rounded-[4px] px-5 pt-[16px] pb-4 shadow-[0_4px_6px_rgba(26,28,25,0.04),0_16px_48px_rgba(26,28,25,0.13)] border border-[rgba(132,84,0,0.14)] border-t-[3px] border-t-[#845400] pointer-events-none z-50"
          >
            <div className="inline-block font-sans text-[6.5px] font-bold tracking-[0.18em] uppercase text-[#845400] bg-[rgba(132,84,0,0.08)] border border-[rgba(132,84,0,0.18)] px-[6px] py-[2px] rounded-[2px] mb-2">
              {hoveredNode.coreBranch}
            </div>
            <div className="font-serif text-[1.15rem] font-medium text-[#11151a] leading-[1.1] mb-2">{hoveredNode.name}</div>
            <div className="flex items-center gap-[6px] mb-2">
              <div className="flex-1 h-px bg-[linear-gradient(to_right,rgba(132,84,0,0.25),transparent)]" />
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <circle cx="5" cy="5" r="1.5" fill="rgba(132,84,0,0.5)" />
                <circle cx="5" cy="5" r="4" stroke="rgba(132,84,0,0.2)" strokeWidth="0.75" fill="none" />
              </svg>
              <div className="flex-1 h-px bg-[linear-gradient(to_left,rgba(132,84,0,0.25),transparent)]" />
            </div>
            <p className="font-serif italic text-[0.8rem] leading-[1.6] text-[#2a2218] mb-2">&ldquo;{hoveredNode.hookQuote}&rdquo;</p>
            <p className="font-sans text-[0.68rem] leading-[1.65] text-ink-muted mb-3 line-clamp-3">{hoveredNode.shortSummary}</p>
            <div className="font-sans text-[7.5px] text-ink-muted opacity-[0.65] tracking-[0.06em]">
              {hoveredNode.birthYear < 0 ? `${Math.abs(hoveredNode.birthYear)} BC` : hoveredNode.birthYear}{" – "}{hoveredNode.deathYear < 0 ? `${Math.abs(hoveredNode.deathYear)} BC` : hoveredNode.deathYear}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom instruction bar */}
      <div className="fixed bottom-0 left-[80px] right-0 py-4 px-12 flex gap-[52px] items-center border-t border-t-[rgba(26,28,25,0.07)] bg-[rgba(252,249,244,0.82)] backdrop-blur-[14px] z-20">
        {[
          { action: "DRAG NODE",      label: "To reposition thinkers" },
          { action: "HOVER PORTRAIT", label: "To surface ideas"        },
          { action: "CLICK NODE",     label: "To read the full entry"  },
        ].map(({ action, label }) => (
          <div key={action} className="pointer-events-none">
            <div className="font-sans text-[7.5px] font-bold tracking-[0.2em] uppercase text-ink-muted mb-1">{action}</div>
            <div className="font-serif italic text-[0.84rem] text-ink">{label}</div>
          </div>
        ))}
        <div className="pointer-events-none">
          <div className="font-sans text-[7.5px] font-bold tracking-[0.2em] uppercase text-accent mb-1">/ TO SEARCH</div>
          <div className="font-serif italic text-[0.84rem] text-ink">Focus the search bar</div>
        </div>
        <div className="ml-auto pointer-events-none font-sans text-[12px] font-semibold tracking-[0.06em] text-[#43474c] opacity-40">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Philosopher side panel */}
      <AnimatePresence>
        {selectedNode && (
          <PhilosopherPanel key={selectedNode._id} node={selectedNode} allNodes={nodes} onClose={() => setSelectedId(null)} onNavigate={(id) => setSelectedId(id)} />
        )}
      </AnimatePresence>
    </div>
  );
}
