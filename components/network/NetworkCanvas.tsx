"use client";

import "./NetworkCanvas.css";
import Image from "next/image";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { LazyMotion, m, AnimatePresence } from "framer-motion";
import type { LineageNode, InfluenceLink, SchoolWithPhilosophers } from "@/lib/types";
import PhilosopherPanel from "@/components/network/PhilosopherPanel";

type Props     = { nodes: LineageNode[]; schools: SchoolWithPhilosophers[] };
type Edge      = { from: LineageNode; to: LineageNode; strength: number; kind: "lineage" | "influence" };
type Pos       = { x: number; y: number };
type Viewport  = { zoom: number; panX: number; panY: number };

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
  54: "text-xl",
  46: "text-lg",
  38: "text-base",
};

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 4;

// Defined at module scope so the function reference is stable across renders
const loadMotionFeatures = () =>
  import("@/lib/motion-features").then((mod) => mod.default);

export default function NetworkCanvas({ nodes, schools }: Props) {
  const [hoveredNode, setHoveredNode]  = useState<LineageNode | null>(null);
  const [imgErrors, setImgErrors]     = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging]   = useState(false);
  const [dims, setDims]               = useState({ w: 1440, h: 900 });
  const dimsRef                       = useRef({ w: 1440, h: 900 });
  const [nodePos, setNodePos]         = useState<Record<string, Pos>>(
    () => Object.fromEntries(nodes.map((n) => [n._id, { x: n.networkX, y: n.networkY }]))
  );
  // Lazy init reads window once on mount — no extra re-render, safe because this component is ssr:false
  const [isTouch] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches
  );

  const [selectedId, setSelectedId]         = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const nodeDragRef    = useRef<{ id: string; startMx: number; startMy: number; startDx: number; startDy: number } | null>(null);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pulsingId, setPulsingId]     = useState<string | null>(null);
  const searchRef          = useRef<HTMLInputElement>(null);
  const searchOriginRef    = useRef<Viewport | null>(null);
  const prevSearchQueryRef = useRef("");

  // Hover state stored in refs — no React re-render on hover, CSS data-attrs drive visuals
  const hoveredIdRef          = useRef<string | null>(null);
  const hoveredConnectedRef   = useRef<Map<string, "lineage" | "influence">>(new Map());
  const willChangeTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Latest-ref pattern: keeps stable [] deps on pointer handlers while always calling current applyHover
  const applyHoverRef         = useRef<(id: string | null) => void>(() => {});
  const hoveredActiveEdgesRef = useRef<Set<string>>(new Set());

  const containerRef   = useRef<HTMLDivElement>(null);
  const canvasLayerRef = useRef<HTMLDivElement>(null);
  const nodeElsRef     = useRef<Map<string, HTMLDivElement>>(new Map());
  const nodePosRef     = useRef<Record<string, Pos>>(nodePos);
  const pathElsRef     = useRef<Map<string, SVGPathElement>>(new Map());
  const nodeEdgeAdjRef = useRef<Map<string, Array<{ key: string; fromId: string; toId: string; kind: "lineage" | "influence" }>>>(new Map());

  // Viewport is fully imperative: no React state, no re-renders during pan/zoom.
  // commitViewport is the single write path — updates ref, CSS vars, and zoom display atomically.
  const viewportRef    = useRef<Viewport>({ zoom: isTouch ? 0.72 : 1, panX: 0, panY: 0 });
  const zoomDisplayRef = useRef<HTMLSpanElement>(null);
  const isDraggingRef  = useRef(false);
  const didDragRef     = useRef(false);
  const dragStart      = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const activePointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef       = useRef<{ dist: number } | null>(null);

  const commitViewport = useCallback((v: Viewport) => {
    viewportRef.current = v;
    const el = canvasLayerRef.current;
    if (el) {
      el.style.setProperty("--tx", `${v.panX}px`);
      el.style.setProperty("--ty", `${v.panY}px`);
      el.style.setProperty("--s", String(v.zoom));
    }
    if (zoomDisplayRef.current) {
      zoomDisplayRef.current.textContent = `${Math.round(v.zoom * 100)}%`;
    }
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

  const edges   = useMemo(() => buildEdges(nodes), [nodes]);
  // Pre-built map for O(1) node lookup in applyHover and navigateToNode
  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n._id, n])), [nodes]);

  useEffect(() => { nodePosRef.current = nodePos; }, [nodePos]);

  useEffect(() => {
    if (zoomDisplayRef.current) {
      zoomDisplayRef.current.textContent = `${Math.round(viewportRef.current.zoom * 100)}%`;
    }
  }, []);

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

  // Imperatively push node positions — avoids per-node style props
  useEffect(() => {
    for (const [id, el] of nodeElsRef.current) {
      const pos = nodePos[id];
      if (!pos) continue;
      el.style.setProperty("--nx", `${pos.x}%`);
      el.style.setProperty("--ny", `${pos.y}%`);
    }
  }, [nodePos]);

  useEffect(() => {
    const update = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        dimsRef.current = { w: rect.width, h: rect.height };
        setDims({ w: rect.width, h: rect.height });
      }
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
      commitViewport({ zoom: newZoom, panX: mouseX * (1 - ratio) + v.panX * ratio, panY: mouseY * (1 - ratio) + v.panY * ratio });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [commitViewport, activateWillChange]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("a, button")) return;
    if ((e.target as HTMLElement).closest("[data-panel]")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
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
    const nodeEl = !isTouch ? (e.target as HTMLElement).closest("[data-nodeid]") as HTMLElement | null : null;
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
  }, [activateWillChange]);

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
      commitViewport({ zoom: newZoom, panX: mx * (1 - ratio) + v.panX * ratio, panY: my * (1 - ratio) + v.panY * ratio });
      pinchRef.current.dist = newDist;
      return;
    }

    if (nodeDragRef.current) {
      const { id, startMx, startMy, startDx, startDy } = nodeDragRef.current;
      const rawDx = e.clientX - startMx, rawDy = e.clientY - startMy;
      if (!didDragRef.current && Math.hypot(rawDx, rawDy) < 5) return;
      didDragRef.current = true;
      const { zoom } = viewportRef.current;
      const { w, h } = dimsRef.current;
      const newX = startDx + (rawDx / zoom / w) * 100;
      const newY = startDy + (rawDy / zoom / h) * 100;
      nodePosRef.current = { ...nodePosRef.current, [id]: { x: newX, y: newY } };
      // Imperatively move node — no React re-render
      const nodeEl = nodeElsRef.current.get(id);
      if (nodeEl) { nodeEl.style.setProperty("--nx", `${newX}%`); nodeEl.style.setProperty("--ny", `${newY}%`); }
      // Imperatively update only connected SVG paths — skips full SVG reconciliation
      for (const { key, fromId, toId, kind } of nodeEdgeAdjRef.current.get(id) ?? []) {
        const pathEl = pathElsRef.current.get(key);
        if (!pathEl) continue;
        const fp = nodePosRef.current[fromId], tp = nodePosRef.current[toId];
        if (!fp || !tp) continue;
        const x1 = (fp.x / 100) * dimsRef.current.w, y1 = (fp.y / 100) * dimsRef.current.h;
        const x2 = (tp.x / 100) * dimsRef.current.w, y2 = (tp.y / 100) * dimsRef.current.h;
        pathEl.setAttribute("d", kind === "influence" ? influencePath(x1, y1, x2, y2) : curvePath(x1, y1, x2, y2));
      }
      return;
    }

    if (isDraggingRef.current) {
      didDragRef.current = true;
      const v = viewportRef.current;
      commitViewport({
        zoom: v.zoom,
        panX: dragStart.current.panX + e.clientX - dragStart.current.x,
        panY: dragStart.current.panY + e.clientY - dragStart.current.y,
      });
    }
  }, [commitViewport]);

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
    // With pointer capture active, this only fires when no drag is in progress — safe to clean up
    if (isDraggingRef.current || nodeDragRef.current) return;
    applyHoverRef.current(null);
    if (canvasLayerRef.current) canvasLayerRef.current.style.willChange = "auto";
    activePointers.current.clear();
    pinchRef.current = null;
    didDragRef.current = false;
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

  const animateViewportTo = useCallback((target: Viewport) => {
    const el = canvasLayerRef.current;
    if (!el) return;
    el.style.transition = "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)";
    commitViewport(target);
    setTimeout(() => { if (canvasLayerRef.current) canvasLayerRef.current.style.transition = ""; }, 750);
  }, [commitViewport]);

  // Imperatively apply hover — zero React re-renders; CSS data-attrs drive all visuals.
  // Non-active edge opacity is handled by the [data-has-hover] svg path CSS rule;
  // only the O(active_edges) connected paths receive imperative inline style updates.
  const applyHover = useCallback((id: string | null) => {
    const canvasEl = canvasLayerRef.current;
    if (!canvasEl) return;
    const prevId = hoveredIdRef.current;
    if (prevId) {
      const prevEl = nodeElsRef.current.get(prevId);
      if (prevEl) { prevEl.removeAttribute("data-hovered"); prevEl.style.zIndex = ""; }
      for (const connId of hoveredConnectedRef.current.keys()) nodeElsRef.current.get(connId)?.removeAttribute("data-connected");
      // Clear inline styles only on previously-active edges (CSS dims the rest)
      for (const key of hoveredActiveEdgesRef.current) {
        const pathEl = pathElsRef.current.get(key);
        if (pathEl) { pathEl.style.opacity = ""; pathEl.style.strokeWidth = ""; }
      }
      hoveredActiveEdgesRef.current = new Set();
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
    const activeKeys = new Set<string>();
    for (const edge of edges) {
      const isActive = edge.from._id === id || edge.to._id === id;
      if (!isActive) continue;
      const key = `${edge.from._id}-${edge.to._id}-${edge.kind}`;
      if (edge.from._id === id) { nodeElsRef.current.get(edge.to._id)?.setAttribute("data-connected", edge.kind); connected.set(edge.to._id, edge.kind); }
      else { nodeElsRef.current.get(edge.from._id)?.setAttribute("data-connected", edge.kind); connected.set(edge.from._id, edge.kind); }
      const pathEl = pathElsRef.current.get(key);
      if (pathEl) {
        pathEl.style.opacity = edge.kind === "influence" ? String(edge.strength * 0.82) : String(edge.strength * 0.88);
        pathEl.style.strokeWidth = edge.kind === "influence" ? String(0.6 + edge.strength * 1.1) : "1.6";
        activeKeys.add(key);
      }
    }
    hoveredConnectedRef.current = connected;
    hoveredActiveEdgesRef.current = activeKeys;
    // O(1) lookup via pre-built map
    setHoveredNode(nodeMap.get(id) ?? null);
  }, [edges, nodeMap]);

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

  const selectedNode = selectedId ? (nodeMap.get(selectedId) ?? null) : null;

  if (nodes.length === 0) {
    return <div className="flex items-center justify-center h-screen font-serif italic text-slate-500 dark:text-stone-400">No lineage data found.</div>;
  }

  return (
    <LazyMotion features={loadMotionFeatures} strict={false}>
      <div
        ref={containerRef}
        role="application"
        aria-label="Philosopher lineage canvas"
        className={`parchment-bg fixed inset-0 overflow-hidden select-none touch-none ${draggingNodeId || isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onClick={() => { if (!didDragRef.current) setSelectedId(null); }}
      >

        {/* Sacred geometry rings */}
        <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
          <svg width="100%" height="100%" className="absolute inset-0">
            <circle cx="72%" cy="22%" r="180" className="stroke-zinc-600/4 fill-none" strokeWidth="1" />
            <circle cx="72%" cy="22%" r="110" className="stroke-zinc-600/4 fill-none" strokeWidth="0.75" />
            <circle cx="72%" cy="22%" r="50"  className="stroke-zinc-600/5 fill-none" strokeWidth="0.5" />
            <circle cx="24%" cy="72%" r="150" className="stroke-zinc-600/4 fill-none" strokeWidth="0.75" />
            <circle cx="24%" cy="72%" r="80"  className="stroke-zinc-600/4 fill-none" strokeWidth="0.5" />
            <line x1="72%" y1="0" x2="72%" y2="100%" className="stroke-zinc-600/2" strokeWidth="0.5" />
            <line x1="0" y1="22%" x2="100%" y2="22%" className="stroke-zinc-600/2" strokeWidth="0.5" />
          </svg>
        </div>

        {/* Title */}
        <div className="hidden md:block absolute top-6 right-9 pointer-events-none z-5">
          <div className="font-serif italic text-2xl font-medium text-zinc-950/25 dark:text-stone-100/25 tracking-[-0.015em] leading-none">
            The Living Manuscript
          </div>
        </div>

        {/* Search */}
        <AnimatePresence>
          {searchOpen && (
            <m.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-[60px] md:top-6 left-4 md:left-[100px] z-200"
            >
              <div className="flex items-center gap-2 bg-stone-50/98 dark:bg-stone-900/98 backdrop-blur-xl border border-zinc-700/20 dark:border-zinc-500/20 rounded-md px-3.5 py-2 w-70 shadow-[0_8px_32px_rgba(26,28,25,0.18)]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 text-zinc-700 dark:text-zinc-500" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === "Escape") { e.preventDefault(); setSearchOpen(false); setSearchQuery(""); setPulsingId(null); } }}
                  placeholder="Search philosophers…"
                  aria-label="Search philosophers"
                  className="flex-1 border-none bg-transparent outline-none font-serif italic text-base text-zinc-950 dark:text-stone-100"
                />
                <span className="hidden md:inline font-sans text-xs text-slate-500 dark:text-stone-400 tracking-widest shrink-0" aria-hidden="true">ESC</span>
              </div>
            </m.div>
          )}
        </AnimatePresence>

        {/* Canvas layer — initial CSS vars set via inline style to prevent FOUC on first paint */}
        <div
          ref={canvasLayerRef}
          style={{ "--tx": "0px", "--ty": "0px", "--s": isTouch ? "0.72" : "1" } as React.CSSProperties}
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
                  d={influencePath(x1, y1, x2, y2)} fill="none"
                  strokeWidth={0.3 + strength * 0.4} opacity={strength * 0.2}
                  className="stroke-zinc-950 dark:stroke-zinc-100 [transition:opacity_0.25s,stroke-width_0.25s]" />
              ) : (
                <path key={edgeKey} ref={(el) => { if (el) pathElsRef.current.set(edgeKey, el); }}
                  d={curvePath(x1, y1, x2, y2)} fill="none"
                  strokeWidth={0.9} opacity={strength * 0.38}
                  className="stroke-zinc-950 dark:stroke-zinc-100 [transition:opacity_0.25s,stroke-width_0.25s]" />
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
                className={`absolute left-(--nx) top-(--ny) focus-visible:outline-none ${
                  isBeingDragged ? "z-40 cursor-grabbing" :
                  isSelected     ? "z-30 cursor-grab"     : "z-10 cursor-grab"
                }`}
                data-nodeid={n._id}
                onPointerEnter={isTouch ? undefined : () => { if (!draggingNodeId) applyHover(n._id); }}
                onPointerLeave={isTouch ? undefined : () => applyHover(null)}
                onClick={(e) => { e.stopPropagation(); if (!didDragRef.current) setSelectedId((id) => id === n._id ? null : n._id); }}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.currentTarget.click(); } }}
              >
                {/* Search highlight ring */}
                {pulsingId === n._id && (
                  <m.div
                    className={`absolute rounded-full border-[1.5px] border-zinc-600/55 shadow-[0_0_12px_rgba(82,82,82,0.2)] pointer-events-none ${RING_CLS[size]}`}
                    animate={{ opacity: [0.9, 0.35, 0.9] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}

                {/* Portrait — hover/select states driven by NetworkCanvas.css data-attr selectors */}
                <div
                  data-portrait
                  className={`absolute rounded-full overflow-hidden bg-stone-950 focus-visible:ring-2 focus-visible:ring-zinc-700 dark:focus-visible:ring-zinc-500 focus-visible:ring-offset-1 ${PORTRAIT_CLS[size]} border border-zinc-950/14 dark:border-stone-100/14 shadow-[0_1px_8px_rgba(26,28,25,0.07)]`}
                  style={pulsingId === n._id ? { transition: "none" } : undefined}
                >
                  {n.avatarUrl && !imgErrors.has(n._id) ? (
                    <Image
                      src={n.avatarUrl} alt={n.name} fill sizes={`${size}px`}
                      draggable={false}
                      onError={() => setImgErrors((prev) => new Set(prev).add(n._id))}
                      className="object-cover filter-[grayscale(0.8)_brightness(0.82)_contrast(1.12)] [transition:filter_0.4s_ease]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                      <span className={`font-serif italic text-zinc-300/75 leading-none select-none ${INITIALS_CLS[size]}`}>
                        {n.name[0]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Labels — hover/dim states driven by NetworkCanvas.css data-attr selectors */}
                <div
                  data-label
                  className={`absolute left-0 -translate-x-1/2 text-center whitespace-nowrap pointer-events-none ${LABEL_TOP_CLS[size]}`}
                >
                  <div
                    data-label-name
                    className="font-serif italic leading-snug text-xs font-normal text-zinc-950 dark:text-stone-100 canvas-label-shadow"
                  >
                    {n.name}
                  </div>
                  <div
                    data-label-branch
                    className="hidden md:block font-serif italic text-xs text-slate-500 dark:text-stone-400 tracking-[0.03em] max-w-[160px] whitespace-normal leading-[1.3] mt-[3px] canvas-label-shadow-sm"
                  >
                    {n.coreBranch}
                  </div>
                  <div
                    data-label-years
                    className="hidden md:block font-sans text-xs text-slate-500 dark:text-stone-400 tracking-wider mt-0.5 canvas-label-shadow-sm"
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
            <m.div
              key={hoveredNode._id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-[120px] md:bottom-[88px] left-4 right-4 md:left-auto md:right-4 md:w-[290px] bg-stone-50/98 dark:bg-stone-900/98 backdrop-blur-[28px] rounded-md px-5 pt-4 pb-4 shadow-[0_4px_6px_rgba(26,28,25,0.05),0_16px_48px_rgba(26,28,25,0.16)] border border-zinc-700/18 dark:border-zinc-500/18 pointer-events-none z-50"
            >
              <div className="inline-block font-sans text-xs md:text-[10px] font-medium tracking-widest text-zinc-700 dark:text-zinc-400 bg-zinc-700/8 dark:bg-zinc-400/8 border border-zinc-700/18 dark:border-zinc-400/18 px-1.5 py-0.5 rounded-xs mb-2">
                {hoveredNode.coreBranch}
              </div>
              <div className="font-serif text-base font-medium text-zinc-950 dark:text-stone-100 leading-tight mb-1.5">{hoveredNode.name}</div>
              <div className="flex items-center gap-1.5 mb-2">
                <div className="flex-1 h-px bg-linear-to-r from-zinc-600/25 to-transparent" />
                <svg width="8" height="8" viewBox="0 0 10 10" aria-hidden="true">
                  <circle cx="5" cy="5" r="1.5" className="fill-zinc-600/50" />
                  <circle cx="5" cy="5" r="4" className="stroke-zinc-600/20 fill-none" strokeWidth="0.75" />
                </svg>
                <div className="flex-1 h-px bg-linear-to-l from-zinc-600/25 to-transparent" />
              </div>
              <p className="font-serif italic text-xs leading-snug text-zinc-950 dark:text-stone-100 mb-2">&ldquo;{hoveredNode.hookQuote}&rdquo;</p>
              <p className="font-sans text-xs leading-relaxed text-slate-500 dark:text-stone-400 mb-2 line-clamp-3">{hoveredNode.shortSummary}</p>
              <div className="font-sans text-xs md:text-[10px] font-medium tracking-widest text-slate-500 dark:text-stone-400 opacity-60">
                {hoveredNode.birthYear < 0 ? `${Math.abs(hoveredNode.birthYear)} BC` : hoveredNode.birthYear}{" – "}{hoveredNode.deathYear < 0 ? `${Math.abs(hoveredNode.deathYear)} BC` : hoveredNode.deathYear}
              </div>
            </m.div>
          )}
        </AnimatePresence>

        {/* Mobile: compact floating controls — replaces the heavy instruction bar */}
        {isTouch ? (
          <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4 z-20 flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search philosophers"
              className="flex items-center gap-1.5 h-8 px-3.5 rounded-full bg-stone-50/96 dark:bg-stone-900/96 backdrop-blur-[14px] border border-zinc-200 dark:border-zinc-700 shadow-[0_2px_12px_rgba(17,21,26,0.10)] font-sans text-[10px] font-medium tracking-widest text-zinc-700 dark:text-zinc-400 cursor-pointer transition-colors duration-200 hover:text-zinc-950 dark:hover:text-stone-100"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              Search
            </button>
            <span
              ref={zoomDisplayRef}
              className="h-8 flex items-center px-3.5 rounded-full bg-stone-50/96 dark:bg-stone-900/96 backdrop-blur-[14px] border border-zinc-200 dark:border-zinc-700 shadow-[0_2px_12px_rgba(17,21,26,0.10)] font-sans text-[10px] font-medium tracking-widest text-slate-500 dark:text-stone-400"
            >
              100%
            </span>
          </div>
        ) : (
          /* Desktop instruction bar */
          <div className="fixed bottom-0 left-20 right-0 px-12 py-3 flex gap-13 items-center border-t border-zinc-100 dark:border-zinc-800 bg-stone-50/96 dark:bg-stone-900/96 backdrop-blur-[14px] z-20">
            {[
              { action: "DRAG NODE",      label: "To reposition thinkers" },
              { action: "HOVER PORTRAIT", label: "To surface ideas"        },
              { action: "CLICK NODE",     label: "To read the full entry"  },
            ].map(({ action, label }, i) => (
              <div key={action} className={`pointer-events-none${i >= 2 ? " hidden md:block" : ""}`}>
                <div className="font-sans text-[10px] font-medium tracking-widest text-slate-500 dark:text-stone-400 mb-1">{action}</div>
                <div className="font-serif italic text-base text-zinc-950 dark:text-stone-100">{label}</div>
              </div>
            ))}
            <div className="pointer-events-none">
              <div className="font-sans text-[10px] font-medium tracking-widest text-zinc-700 dark:text-zinc-400 mb-1">/ to search</div>
              <div className="font-serif italic text-base text-zinc-950 dark:text-stone-100">Focus the search bar</div>
            </div>
            <span
              ref={zoomDisplayRef}
              className="ml-auto font-sans text-[10px] font-medium tracking-widest text-slate-500 dark:text-stone-400 opacity-40"
            >
              100%
            </span>
          </div>
        )}

        {/* Philosopher side panel */}
        <AnimatePresence>
          {selectedNode && (
            <PhilosopherPanel key={selectedNode._id} node={selectedNode} allNodes={nodes} schools={schools} onClose={() => setSelectedId(null)} onNavigate={navigateToNode} />
          )}
        </AnimatePresence>
      </div>
    </LazyMotion>
  );
}
