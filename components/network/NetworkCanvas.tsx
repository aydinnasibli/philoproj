"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import type { LineageNode, InfluenceLink } from "@/lib/types";
import PhilosopherPanel from "@/components/network/PhilosopherPanel";

type Props = { nodes: LineageNode[] };
type Edge = { from: LineageNode; to: LineageNode; strength: number; kind: "lineage" | "influence" };
type Pos = { x: number; y: number };

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
    for (const student of n.students) {
      const s = map.get(student.id);
      if (!s) continue;
      const key = [n._id, student.id].sort().join("--");
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ from: n, to: s, strength: INFLUENCE_STRENGTH[student.strength], kind: "lineage" });
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
  const [hoveredNode, setHoveredNode]  = useState<LineageNode | null>(null);
  const [imgErrors, setImgErrors]     = useState<Set<string>>(new Set());
  const [viewport, setViewport]       = useState({ zoom: 1, panX: 0, panY: 0 });
  const [isDragging, setIsDragging]   = useState(false);
  const [dims, setDims]               = useState({ w: 1440, h: 900 });
  const [nodePos, setNodePos]         = useState<Record<string, Pos>>(
    () => Object.fromEntries(nodes.map((n) => [n._id, { x: n.networkX, y: n.networkY }]))
  );
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  const [selectedId, setSelectedId]       = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const nodeDragRef    = useRef<{ id: string; startMx: number; startMy: number; startDx: number; startDy: number } | null>(null);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pulsingId, setPulsingId]     = useState<string | null>(null);
  const searchRef              = useRef<HTMLInputElement>(null);
  const searchOriginRef        = useRef<{ zoom: number; panX: number; panY: number } | null>(null);
  const prevSearchQueryRef     = useRef("");
  // Hover state stored in refs — no React re-render on hover, CSS data-attrs drive visuals
  const hoveredIdRef           = useRef<string | null>(null);
  const hoveredConnectedRef    = useRef<Map<string, "lineage" | "influence">>(new Map());
  const willChangeTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Latest-ref pattern: keeps stable [] deps on pointer handlers while always calling current applyHover
  const applyHoverRef          = useRef<(id: string | null) => void>(() => {});
  const containerRef   = useRef<HTMLDivElement>(null);
  const canvasLayerRef = useRef<HTMLDivElement>(null);
  const nodeElsRef     = useRef<Map<string, HTMLDivElement>>(new Map());
  const nodePosRef     = useRef<Record<string, Pos>>(nodePos);
  const pathElsRef     = useRef<Map<string, SVGPathElement>>(new Map());
  const nodeEdgeAdjRef = useRef<Map<string, Array<{ key: string; fromId: string; toId: string; kind: "lineage" | "influence" }>>>(new Map());
  const viewportRef    = useRef(viewport);
  useEffect(() => { viewportRef.current = viewport; }, [viewport]);
  const isDraggingRef  = useRef(false);
  const didDragRef     = useRef(false);
  const dragStart      = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const activePointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef       = useRef<{ dist: number } | null>(null);
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => { setIsTouch(window.matchMedia("(pointer: coarse)").matches); }, []);

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

  const edges = useMemo(() => buildEdges(nodes), [nodes]);

  useEffect(() => { nodePosRef.current = nodePos; }, [nodePos]);
  useEffect(() => {
    const adj = new Map<string, Array<{ key: string; fromId: string; toId: string; kind: "lineage" | "influence" }>>();
    for (const edge of edges) {
      const key = `${edge.from._id}-${edge.to._id}-${edge.kind}`;
      for (const id of [edge.from._id, edge.to._id]) {
        if (!adj.has(id)) adj.set(id, []);
        adj.get(id)!.push({ key, fromId: edge.from._id, toId: edge.to._id, kind: edge.kind });
      }
    }
    nodeEdgeAdjRef.current = adj;
  }, [edges]);

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
      activateWillChange();
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
      activateWillChange();
      const pts = [...activePointers.current.values()];
      pinchRef.current = { dist: Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y) };
      nodeDragRef.current = null; isDraggingRef.current = false; setIsDragging(false); setDraggingNodeId(null);
      return;
    }

    didDragRef.current = false;
    applyHoverRef.current(null);
    activateWillChange();
    const nodeEl = (e.target as HTMLElement).closest("[data-nodeid]") as HTMLElement | null;
    if (nodeEl) {
      const id = nodeEl.dataset.nodeid!;
      const pos = nodePosRef.current[id];
      nodeDragRef.current = { id, startMx: e.clientX, startMy: e.clientY, startDx: pos.x, startDy: pos.y };
      setDraggingNodeId(id);
    } else {
      isDraggingRef.current = true; setIsDragging(true);
      const v = viewportRef.current;
      dragStart.current = { x: e.clientX, y: e.clientY, panX: v.panX, panY: v.panY };
    }
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
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

    if (nodeDragRef.current) {
      const { id, startMx, startMy, startDx, startDy } = nodeDragRef.current;
      const rawDx = e.clientX - startMx, rawDy = e.clientY - startMy;
      if (!didDragRef.current && Math.hypot(rawDx, rawDy) < 5) return;
      didDragRef.current = true;
      const { zoom } = viewportRef.current;
      const newX = startDx + (rawDx / zoom / dims.w) * 100;
      const newY = startDy + (rawDy / zoom / dims.h) * 100;
      nodePosRef.current = { ...nodePosRef.current, [id]: { x: newX, y: newY } };
      // Imperatively move node — no React re-render
      const nodeEl = nodeElsRef.current.get(id);
      if (nodeEl) { nodeEl.style.setProperty('--nx', `${newX}%`); nodeEl.style.setProperty('--ny', `${newY}%`); }
      // Imperatively update only connected SVG paths — skips full SVG reconciliation
      for (const { key, fromId, toId, kind } of nodeEdgeAdjRef.current.get(id) ?? []) {
        const pathEl = pathElsRef.current.get(key);
        if (!pathEl) continue;
        const fp = nodePosRef.current[fromId], tp = nodePosRef.current[toId];
        if (!fp || !tp) continue;
        const x1 = (fp.x / 100) * dims.w, y1 = (fp.y / 100) * dims.h;
        const x2 = (tp.x / 100) * dims.w, y2 = (tp.y / 100) * dims.h;
        pathEl.setAttribute('d', kind === 'influence' ? influencePath(x1, y1, x2, y2) : curvePath(x1, y1, x2, y2));
      }
      return;
    }

    if (isDraggingRef.current) {
      didDragRef.current = true;
      setViewport((prev) => ({ ...prev, panX: dragStart.current.panX + e.clientX - dragStart.current.x, panY: dragStart.current.panY + e.clientY - dragStart.current.y }));
    }
  }, [dims]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    activePointers.current.delete(e.pointerId);
    if (activePointers.current.size < 2) pinchRef.current = null;
    if (activePointers.current.size === 0) {
      if (nodeDragRef.current && didDragRef.current) setNodePos({ ...nodePosRef.current });
      nodeDragRef.current = null; isDraggingRef.current = false; setIsDragging(false); setDraggingNodeId(null);
      if (canvasLayerRef.current) canvasLayerRef.current.style.willChange = "auto";
    }
  }, []);

  const handlePointerLeave = useCallback(() => {
    applyHoverRef.current(null);
    if (canvasLayerRef.current) canvasLayerRef.current.style.willChange = "auto";
    activePointers.current.clear();
    pinchRef.current = null;
    didDragRef.current = false;
    nodeDragRef.current = null;
    isDraggingRef.current = false;
    setIsDragging(false);
    setDraggingNodeId(null);
  }, []);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "/" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) { e.preventDefault(); setSearchOpen(true); }
      if (e.key === "Escape") { e.preventDefault(); setSearchOpen(false); setSearchQuery(""); setPulsingId(null); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);

  const animateViewportTo = useCallback((target: { zoom: number; panX: number; panY: number }) => {
    const el = canvasLayerRef.current;
    if (!el) return;
    el.style.transition = "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)";
    setViewport(target);
    const id = setTimeout(() => { if (canvasLayerRef.current) canvasLayerRef.current.style.transition = ""; }, 750);
    return id;
  }, []);

  // Add will-change only during active interaction, auto-remove after idle
  const activateWillChange = useCallback(() => {
    const el = canvasLayerRef.current;
    if (!el) return;
    el.style.willChange = "transform";
    if (willChangeTimerRef.current) clearTimeout(willChangeTimerRef.current);
    willChangeTimerRef.current = setTimeout(() => {
      if (canvasLayerRef.current) canvasLayerRef.current.style.willChange = "auto";
      willChangeTimerRef.current = null;
    }, 300);
  }, []);

  // Imperatively apply hover — zero React re-renders; CSS data-attrs drive all visuals
  const applyHover = useCallback((id: string | null) => {
    const canvasEl = canvasLayerRef.current;
    if (!canvasEl) return;
    const prevId = hoveredIdRef.current;
    if (prevId) {
      const prevEl = nodeElsRef.current.get(prevId);
      if (prevEl) { prevEl.removeAttribute("data-hovered"); prevEl.style.zIndex = ""; }
      for (const connId of hoveredConnectedRef.current.keys()) nodeElsRef.current.get(connId)?.removeAttribute("data-connected");
      for (const pathEl of pathElsRef.current.values()) { pathEl.style.opacity = ""; pathEl.style.strokeWidth = ""; }
    }
    hoveredIdRef.current = id;
    if (!id) {
      hoveredConnectedRef.current = new Map();
      canvasEl.removeAttribute("data-has-hover");
      setHoveredNode(null);
      return;
    }
    canvasEl.setAttribute("data-has-hover", "");
    const hovEl = nodeElsRef.current.get(id);
    if (hovEl) { hovEl.setAttribute("data-hovered", ""); hovEl.style.zIndex = "100"; }
    const connected = new Map<string, "lineage" | "influence">();
    for (const edge of edges) {
      const isActive = edge.from._id === id || edge.to._id === id;
      const key = `${edge.from._id}-${edge.to._id}-${edge.kind}`;
      const pathEl = pathElsRef.current.get(key);
      if (edge.from._id === id) { nodeElsRef.current.get(edge.to._id)?.setAttribute("data-connected", edge.kind); connected.set(edge.to._id, edge.kind); }
      else if (edge.to._id === id) { nodeElsRef.current.get(edge.from._id)?.setAttribute("data-connected", edge.kind); connected.set(edge.from._id, edge.kind); }
      if (pathEl) {
        pathEl.style.opacity = isActive ? (edge.kind === "influence" ? String(edge.strength * 0.82) : String(edge.strength * 0.88)) : "0.02";
        pathEl.style.strokeWidth = isActive ? (edge.kind === "influence" ? String(0.6 + edge.strength * 1.1) : "1.6") : (edge.kind === "influence" ? String(0.3 + edge.strength * 0.4) : "0.9");
      }
    }
    hoveredConnectedRef.current = connected;
    setHoveredNode(nodes.find(n => n._id === id) ?? null);
  }, [edges, nodes]);

  // Keep applyHoverRef current so pointer handlers with [] deps always call the latest version
  useEffect(() => { applyHoverRef.current = applyHover; }, [applyHover]);

  // Cleanup will-change timer on unmount
  useEffect(() => () => { if (willChangeTimerRef.current) clearTimeout(willChangeTimerRef.current); }, []);

  // Sync selectedId → data-selected attribute (drives CSS-only selected portrait styles)
  useEffect(() => {
    for (const [id, el] of nodeElsRef.current) {
      if (id === selectedId) el.setAttribute("data-selected", "");
      else el.removeAttribute("data-selected");
    }
  }, [selectedId]);

  const navigateToNode = useCallback((id: string) => {
    const pos = nodePosRef.current[id];
    if (pos) {
      const { zoom } = viewportRef.current;
      const nodeX = (pos.x / 100) * dims.w;
      const nodeY = (pos.y / 100) * dims.h;
      animateViewportTo({ zoom, panX: dims.w / 2 - nodeX * zoom, panY: dims.h / 2 - nodeY * zoom });
    }
    setTimeout(() => setSelectedId(id), 80);
  }, [animateViewportTo, dims.w, dims.h]);

  // Debounced search navigation — skip intermediate matches while backspacing
  useEffect(() => {
    const prevQuery = prevSearchQueryRef.current;
    prevSearchQueryRef.current = searchQuery;

    if (!searchQuery.trim()) {
      setPulsingId(null);
      if (searchOriginRef.current) {
        const origin = searchOriginRef.current;
        searchOriginRef.current = null;
        animateViewportTo(origin);
      }
      return;
    }

    // User is deleting — don't hop through intermediate matches
    if (searchQuery.length < prevQuery.length) return;

    const timer = setTimeout(() => {
      const match = nodes.find(n => n.name.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!match) { setPulsingId(null); return; }
      if (!searchOriginRef.current) searchOriginRef.current = { ...viewportRef.current };
      const pos = nodePos[match._id];
      const targetZoom = 1.3;
      const nodeX = (pos.x / 100) * dims.w;
      const nodeY = (pos.y / 100) * dims.h;
      animateViewportTo({ zoom: targetZoom, panX: dims.w / 2 - nodeX * targetZoom, panY: dims.h / 2 - nodeY * targetZoom });
      setPulsingId(match._id);
    }, 450);
    return () => clearTimeout(timer);
  }, [searchQuery, nodes, nodePos, dims.w, dims.h, animateViewportTo]);

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
      className={`parchment-bg fixed inset-0 overflow-hidden select-none ${draggingNodeId || isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onClick={() => { if (!didDragRef.current) setSelectedId(null); }}
    >

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
      <div className="hidden md:block absolute top-6 right-9 pointer-events-none z-5">
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
            className="absolute top-[60px] md:top-6 left-4 md:left-[100px] z-200"
          >
            <div className="flex items-center gap-2 bg-(--panel-bg) backdrop-blur-xl border border-accent/20 border-t-2 border-t-accent rounded-[4px] px-[14px] py-2 w-[280px] shadow-[0_8px_32px_rgba(26,28,25,0.14)]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 text-accent" aria-hidden="true">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === "Escape") { e.preventDefault(); setSearchOpen(false); setSearchQuery(""); setPulsingId(null); } }}
                placeholder="Search philosophers…"
                aria-label="Search philosophers"
                className="flex-1 border-none bg-transparent outline-none font-serif italic text-[0.88rem] text-ink"
              />
              <span className="font-sans text-4xs text-ink-muted tracking-widest shrink-0" aria-hidden="true">ESC</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canvas layer — CSS vars initialised inline to avoid FOUC on first paint */}
      <div
        ref={canvasLayerRef}
        className="absolute inset-0 origin-top-left transform-[translate(var(--tx),var(--ty))_scale(var(--s))]"
      >
        {/* SVG edges — base opacity set via React; hover opacity overridden imperatively by applyHover */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-1 overflow-visible" viewBox={`0 0 ${dims.w} ${dims.h}`} aria-hidden="true">
          {edges.map((edge) => {
            const p1 = nodePos[edge.from._id]; const p2 = nodePos[edge.to._id];
            const x1 = (p1.x / 100) * dims.w; const y1 = (p1.y / 100) * dims.h;
            const x2 = (p2.x / 100) * dims.w; const y2 = (p2.y / 100) * dims.h;
            const { strength, kind } = edge;
            const edgeKey = `${edge.from._id}-${edge.to._id}-${kind}`;
            return kind === "influence" ? (
              <path key={edgeKey} ref={(el) => { if (el) pathElsRef.current.set(edgeKey, el); }}
                d={influencePath(x1, y1, x2, y2)} fill="none" stroke={isDark ? "#ede8df" : "#1a1c19"}
                strokeWidth={0.3 + strength * 0.4} opacity={strength * 0.2}
                className="[transition:opacity_0.25s,stroke-width_0.25s]" />
            ) : (
              <path key={edgeKey} ref={(el) => { if (el) pathElsRef.current.set(edgeKey, el); }}
                d={curvePath(x1, y1, x2, y2)} fill="none" stroke={isDark ? "#ede8df" : "#1a1c19"}
                strokeWidth={0.9} opacity={strength * 0.38}
                className="[transition:opacity_0.25s,stroke-width_0.25s]" />
            );
          })}
        </svg>

        {/* Portrait nodes — hover/connected/selected visuals driven by CSS data-* attrs, no React re-render */}
        {nodes.map((n) => {
          const isSelected     = selectedId === n._id;
          const isBeingDragged = draggingNodeId === n._id;
          const size           = circleSize(n);

          return (
            <div
              key={n._id}
              ref={(el) => { if (el) nodeElsRef.current.set(n._id, el); else nodeElsRef.current.delete(n._id); }}
              role="button"
              tabIndex={0}
              aria-label={n.name}
              aria-pressed={isSelected}
              className={`group absolute left-(--nx) top-(--ny) focus-visible:outline-none opacity-100 ${
                isBeingDragged ? "z-40 cursor-grabbing" :
                isSelected     ? "z-30 cursor-grab"     : "z-10 cursor-grab"
              }`}
              data-nodeid={n._id}
              onPointerEnter={() => { if (!draggingNodeId) applyHover(n._id); }}
              onPointerLeave={() => applyHover(null)}
              onClick={(e) => { e.stopPropagation(); if (!didDragRef.current) setSelectedId((id) => id === n._id ? null : n._id); }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.currentTarget.click(); } }}
            >
              {/* Search highlight ring */}
              {pulsingId === n._id && (
                <motion.div
                  className={`absolute rounded-full border-[1.5px] border-[rgba(196,112,41,0.55)] shadow-[0_0_12px_rgba(196,112,41,0.2)] pointer-events-none ${RING_CLS[size]}`}
                  animate={{ opacity: [0.9, 0.35, 0.9] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
              )}

              {/* Portrait — CSS transitions in globals.css; no framer-motion scale on hover */}
              <div
                data-portrait
                className={`absolute rounded-full overflow-hidden bg-[#1a140e] group-focus-visible:ring-2 group-focus-visible:ring-[#845400] group-focus-visible:ring-offset-1 ${PORTRAIT_CLS[size]} border border-[rgba(26,28,25,0.14)] shadow-[0_1px_8px_rgba(26,28,25,0.07)]`}
                style={pulsingId === n._id ? { transition: "none" } : undefined}
              >
                {n.avatarUrl && !imgErrors.has(n._id) ? (
                  <Image
                    src={n.avatarUrl} alt={n.name} fill sizes={`${size}px`}
                    onError={() => setImgErrors((prev) => new Set(prev).add(n._id))}
                    className="object-cover filter-[sepia(45%)_brightness(0.82)_contrast(1.12)_grayscale(0.2)] [transition:filter_0.4s_ease]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[radial-gradient(ellipse_at_40%_35%,#3a2a18,#1a140e)]">
                    <span className={`font-serif italic text-[rgba(212,180,115,0.75)] leading-none select-none ${INITIALS_CLS[size]}`}>
                      {n.name[0]}
                    </span>
                  </div>
                )}
              </div>

              {/* Name + branch + years label — opacity/transform driven by CSS data-* attrs */}
              <div data-label className={`absolute left-0 -translate-x-1/2 text-center whitespace-nowrap pointer-events-none ${LABEL_TOP_CLS[size]}`}
              >
                <div data-label-name
                  className="font-serif italic leading-[1.2] text-[0.78rem] font-normal text-ink"
                  style={{ textShadow: isDark ? "0 0 8px rgba(20,17,14,1),0 0 14px rgba(20,17,14,1),0 0 20px rgba(20,17,14,0.9)" : "0 0 8px rgba(253,250,245,1),0 0 14px rgba(253,250,245,1),0 0 20px rgba(253,250,245,0.9)" }}
                >
                  {n.name}
                </div>
                <div data-label-branch
                  className="font-serif italic text-[0.65rem] text-ink-muted tracking-[0.03em] max-w-[160px] whitespace-normal leading-[1.3] mt-[3px]"
                  style={{ textShadow: isDark ? "0 0 6px rgba(20,17,14,1),0 0 10px rgba(20,17,14,0.95)" : "0 0 6px rgba(253,250,245,1),0 0 10px rgba(253,250,245,0.95)" }}
                >
                  {n.coreBranch}
                </div>
                <div data-label-years
                  className="font-sans text-[7px] text-ink-muted tracking-[0.08em] mt-0.5"
                  style={{ textShadow: isDark ? "0 0 6px rgba(20,17,14,1),0 0 10px rgba(20,17,14,0.95)" : "0 0 6px rgba(253,250,245,1),0 0 10px rgba(253,250,245,0.95)" }}
                >
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
            className="absolute bottom-[120px] md:bottom-[88px] left-4 right-4 md:left-auto md:right-4 md:w-[290px] bg-(--panel-bg) backdrop-blur-[28px] rounded-[4px] px-5 pt-4 pb-4 shadow-[0_4px_6px_rgba(26,28,25,0.04),0_16px_48px_rgba(26,28,25,0.13)] border border-accent/14 border-t-[3px] border-t-accent pointer-events-none z-50"
          >
            <div className="inline-block font-sans text-[6.5px] font-bold tracking-[0.18em] uppercase text-accent bg-accent/8 border border-accent/18 px-1.5 py-0.5 rounded-[2px] mb-2">
              {hoveredNode.coreBranch}
            </div>
            <div className="font-serif text-[1.15rem] font-medium text-ink leading-[1.1] mb-2">{hoveredNode.name}</div>
            <div className="flex items-center gap-1.5 mb-2">
              <div className="flex-1 h-px bg-[linear-gradient(to_right,rgba(132,84,0,0.25),transparent)]" />
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <circle cx="5" cy="5" r="1.5" fill="rgba(132,84,0,0.5)" />
                <circle cx="5" cy="5" r="4" stroke="rgba(132,84,0,0.2)" strokeWidth="0.75" fill="none" />
              </svg>
              <div className="flex-1 h-px bg-[linear-gradient(to_left,rgba(132,84,0,0.25),transparent)]" />
            </div>
            <p className="font-serif italic text-[0.8rem] leading-[1.6] text-ink mb-2">&ldquo;{hoveredNode.hookQuote}&rdquo;</p>
            <p className="font-sans text-[0.68rem] leading-[1.65] text-ink-muted mb-3 line-clamp-3">{hoveredNode.shortSummary}</p>
            <div className="font-sans text-5xs text-ink-muted opacity-[0.65] tracking-[0.06em]">
              {hoveredNode.birthYear < 0 ? `${Math.abs(hoveredNode.birthYear)} BC` : hoveredNode.birthYear}{" – "}{hoveredNode.deathYear < 0 ? `${Math.abs(hoveredNode.deathYear)} BC` : hoveredNode.deathYear}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom instruction bar */}
      <div
        className="fixed bottom-[64px] md:bottom-0 left-0 md:left-20 right-0 px-6 md:px-12 flex gap-[28px] md:gap-[52px] items-center border-t border-border-pale bg-(--panel-bg-header) backdrop-blur-[14px] z-20"
        style={{ paddingTop: "0.75rem", paddingBottom: "0.75rem" }}
      >
        {(isTouch ? [
          { action: "DRAG CANVAS",   label: "To navigate the network" },
          { action: "TAP NODE",      label: "To read the full entry"  },
          { action: "PINCH TO ZOOM", label: "To adjust the scale"     },
        ] : [
          { action: "DRAG NODE",      label: "To reposition thinkers" },
          { action: "HOVER PORTRAIT", label: "To surface ideas"        },
          { action: "CLICK NODE",     label: "To read the full entry"  },
        ]).map(({ action, label }) => (
          <div key={action} className="pointer-events-none">
            <div className="font-sans text-5xs font-bold tracking-[0.2em] uppercase text-ink-muted mb-1">{action}</div>
            <div className="font-serif italic text-[0.84rem] text-ink">{label}</div>
          </div>
        ))}
        {!isTouch && (
          <div className="pointer-events-none">
            <div className="font-sans text-5xs font-bold tracking-[0.2em] uppercase text-accent mb-1">/ TO SEARCH</div>
            <div className="font-serif italic text-[0.84rem] text-ink">Focus the search bar</div>
          </div>
        )}
        <div className="ml-auto pointer-events-none font-sans text-xs font-semibold tracking-[0.06em] text-ink-muted opacity-40">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Philosopher side panel */}
      <AnimatePresence>
        {selectedNode && (
          <PhilosopherPanel key={selectedNode._id} node={selectedNode} allNodes={nodes} onClose={() => setSelectedId(null)} onNavigate={navigateToNode} />
        )}
      </AnimatePresence>
    </div>
  );
}
