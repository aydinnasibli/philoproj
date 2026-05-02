"use client";
// Enhanced: gradient edges, depth fog, portrait vignette, starmap mode

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { SchoolWithPhilosophers } from "@/lib/types";
import SchoolChapterPanel from "./SchoolChapterPanel";
import QuizOverlay from "./QuizOverlay";
import ComparisonPanel from "./ComparisonPanel";

const CANVAS_W_SCALE = 2.8;

const GRID_STEP       = 80;
const VORTEX_RADIUS   = 210;
const VORTEX_STRENGTH = 52;

function vortexPt(gx: number, gy: number, cx: number, cy: number): string {
  const dx = gx - cx;
  const dy = gy - cy;
  const distSq = dx * dx + dy * dy;
  if (distSq >= VORTEX_RADIUS * VORTEX_RADIUS || distSq < 0.01)
    return `${gx.toFixed(1)},${gy.toFixed(1)}`;
  const dist = Math.sqrt(distSq);
  const pull = Math.pow(1 - dist / VORTEX_RADIUS, 2) * VORTEX_STRENGTH;
  return `${(gx - (dx / dist) * pull).toFixed(1)},${(gy - (dy / dist) * pull).toFixed(1)}`;
}

function buildVortexGrid(w: number, h: number, cx: number, cy: number): string {
  const SEG = GRID_STEP / 8;
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

const SCHOOL_POS: Record<string, { x: number; y: number }> = {
  "school-socratic-method":    { x: 4,  y: 45 },
  "school-platonism":          { x: 11, y: 28 },
  "school-aristotelianism":    { x: 18, y: 58 },
  "school-stoicism":           { x: 26, y: 38 },
  "school-neoplatonism":       { x: 33, y: 60 },
  "school-scholasticism":      { x: 40, y: 44 },
  "school-rationalism":        { x: 51, y: 24 },
  "school-empiricism":         { x: 51, y: 68 },
  "school-critical-philosophy":{ x: 62, y: 40 },
  "school-german-idealism":    { x: 70, y: 22 },
  "school-existentialism":     { x: 77, y: 60 },
  "school-analytic-philosophy":{ x: 88, y: 38 },
};

const TAGLINES: Record<string, string> = {
  "school-socratic-method":    "DIALECTIC ORIGIN",
  "school-platonism":          "THE REALM OF FORMS",
  "school-aristotelianism":    "LOGIC & VIRTUE",
  "school-rationalism":        "REASON SUPREME",
  "school-empiricism":         "SENSATION & PROOF",
  "school-critical-philosophy":"MIND'S FRONTIER",
  "school-existentialism":     "BEING & VOID",
  "school-analytic-philosophy":"LANGUAGE AS LIMIT",
};

const EDGE_CURVES: Record<string, { dir: 1 | -1; mag: number }> = {
  "school-socratic-method--school-platonism":          { dir:  1, mag: 0.36 },
  "school-socratic-method--school-aristotelianism":    { dir: -1, mag: 0.30 },
  "school-platonism--school-aristotelianism":          { dir:  1, mag: 0.34 },
  "school-aristotelianism--school-rationalism":        { dir:  1, mag: 0.38 },
  "school-aristotelianism--school-empiricism":         { dir: -1, mag: 0.36 },
  "school-rationalism--school-critical-philosophy":    { dir:  1, mag: 0.34 },
  "school-empiricism--school-critical-philosophy":     { dir: -1, mag: 0.32 },
  "school-critical-philosophy--school-existentialism": { dir:  1, mag: 0.36 },
  "school-existentialism--school-analytic-philosophy": { dir:  1, mag: 0.30 },
};

// Year each school was founded (for timeline scrubber)
const SCHOOL_START_YEAR: Record<string, number> = {
  "school-socratic-method":    -470,
  "school-platonism":          -428,
  "school-aristotelianism":    -384,
  "school-stoicism":           -300,
  "school-neoplatonism":        204,
  "school-scholasticism":      1000,
  "school-rationalism":        1596,
  "school-empiricism":         1632,
  "school-critical-philosophy":1724,
  "school-german-idealism":    1770,
  "school-existentialism":     1844,
  "school-analytic-philosophy":1889,
};

const ERA_ACCENT: Record<string, string> = {
  "school-socratic-method":    "#C47029",
  "school-platonism":          "#C47029",
  "school-aristotelianism":    "#C47029",
  "school-stoicism":           "#8B6229",
  "school-neoplatonism":       "#8B6229",
  "school-scholasticism":      "#6B7A47",
  "school-rationalism":        "#8B6914",
  "school-empiricism":         "#8B6914",
  "school-critical-philosophy":"#5A6999",
  "school-german-idealism":    "#5A6999",
  "school-existentialism":     "#7A5C6E",
  "school-analytic-philosophy":"#4A5568",
};

// Subtle vertical era band zones painted behind the canvas
const NODE_R = 6;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;

type Mode = "explore" | "path" | "ripple" | "compare";



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
  const off = Math.min(len * mag, 200);
  const cp1x = x1 + dx * 0.35 + px * off;
  const cp1y = y1 + dy * 0.35 + py * off;
  const cp2x = x1 + dx * 0.65 + px * off * 0.80;
  const cp2y = y1 + dy * 0.65 + py * off * 0.80;
  return `M ${x1} ${y1} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${x2} ${y2}`;
}

function getNodePx(
  id: string,
  offsets: Record<string, { dx: number; dy: number }>,
  dims: { w: number; h: number },
): { x: number; y: number } | null {
  const base = SCHOOL_POS[id];
  if (!base) return null;
  const off = offsets[id] ?? { dx: 0, dy: 0 };
  return {
    x: (base.x / 100) * dims.w * CANVAS_W_SCALE + off.dx,
    y: (base.y / 100) * dims.h + off.dy,
  };
}

// BFS shortest path — treats influence edges as undirected
function bfsPath(
  from: string,
  to: string,
  schools: SchoolWithPhilosophers[],
): string[] | null {
  if (from === to) return [from];
  const adj = new Map<string, string[]>();
  for (const s of schools) {
    if (!adj.has(s._id)) adj.set(s._id, []);
    for (const t of s.influencedTo) {
      adj.get(s._id)!.push(t._id);
      if (!adj.has(t._id)) adj.set(t._id, []);
      adj.get(t._id)!.push(s._id);
    }
  }
  const parent = new Map<string, string>();
  const visited = new Set([from]);
  const queue = [from];
  while (queue.length) {
    const cur = queue.shift()!;
    if (cur === to) {
      const path: string[] = [];
      let node: string | undefined = to;
      while (node !== undefined) {
        path.unshift(node);
        node = parent.get(node);
      }
      return path;
    }
    for (const nb of adj.get(cur) ?? []) {
      if (!visited.has(nb)) {
        visited.add(nb);
        parent.set(nb, cur);
        queue.push(nb);
      }
    }
  }
  return null;
}

// BFS from source, recording degree distance (max 3)
function computeRippleDegrees(
  sourceId: string,
  schools: SchoolWithPhilosophers[],
): Map<string, number> {
  const map = new Map<string, number>();
  map.set(sourceId, 0);
  const queue = [sourceId];
  while (queue.length) {
    const id = queue.shift()!;
    const deg = map.get(id)!;
    if (deg >= 3) continue;
    const school = schools.find((s) => s._id === id);
    if (!school) continue;
    const neighbors = [
      ...school.influencedTo.map((s) => s._id),
      ...school.influencedBy.map((s) => s._id),
    ];
    for (const nb of neighbors) {
      if (!map.has(nb)) {
        map.set(nb, deg + 1);
        queue.push(nb);
      }
    }
  }
  return map;
}

function formatYear(y: number) {
  return y < 0 ? `${Math.abs(y)} BC` : `AD ${y}`;
}

type Props = { schools: SchoolWithPhilosophers[] };

export default function LineageCanvas({ schools }: Props) {
  // ── Existing state ──────────────────────────────────────────────
  const [hoveredId,    setHoveredId]    = useState<string | null>(null);
  const [selectedId,   setSelectedId]   = useState<string | null>(null);
  const [imgErrors,    setImgErrors]    = useState<Set<string>>(new Set());
  const [viewport,     setViewport]     = useState({ zoom: 1, panX: 0, panY: 0 });
  const [isDragging,   setIsDragging]   = useState(false);
  const [dims,         setDims]         = useState({ w: 1440, h: 900 });
  const [nodeOffsets,  setNodeOffsets]  = useState<Record<string, { dx: number; dy: number }>>({});

  // ── New: mode ───────────────────────────────────────────────────
  const [mode,         setMode]         = useState<Mode>("explore");

  // ── New: path finder ────────────────────────────────────────────
  const [pathA,        setPathA]        = useState<string | null>(null);
  const [pathB,        setPathB]        = useState<string | null>(null);
  const [pathResult,   setPathResult]   = useState<string[] | null>(null);
  const [pathNoRoute,  setPathNoRoute]  = useState(false);

  // ── New: ripple ─────────────────────────────────────────────────
  const [rippleId,     setRippleId]     = useState<string | null>(null);
  const [rippleTick,   setRippleTick]   = useState(0);

  // ── New: compare ────────────────────────────────────────────────
  const [compareA,     setCompareA]     = useState<string | null>(null);
  const [compareB,     setCompareB]     = useState<string | null>(null);

  // ── New: quiz ───────────────────────────────────────────────────
  const [showQuiz,      setShowQuiz]     = useState(false);

  // ── Vortex cursor ───────────────────────────────────────────────
  const [cursorPx,     setCursorPx]     = useState({ x: -9999, y: -9999 });



  // ── New: timeline ───────────────────────────────────────────────
  const [timelineOn,   setTimelineOn]   = useState(false);
  const [scrubYear,    setScrubYear]    = useState(2026);

  // ── Refs ────────────────────────────────────────────────────────
  const containerRef   = useRef<HTMLDivElement>(null);
  const viewportRef    = useRef(viewport);
  useEffect(() => { viewportRef.current = viewport; }, [viewport]);
  const isDraggingRef  = useRef(false);
  const didDragRef     = useRef(false);
  const dragStart      = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const nodeDragRef    = useRef<{
    id: string; startMx: number; startMy: number; startDx: number; startDy: number;
  } | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  const schoolMap = useMemo(() => new Map(schools.map((s) => [s._id, s])), [schools]);
  const edges     = useMemo(() => buildEdges(schools), [schools]);

  const totalPhilosophers = schools.reduce((n, s) => n + s.philosophers.length, 0);
  const maxPossible       = (schools.length * (schools.length - 1)) / 2;
  const threadDensity     = (edges.length / maxPossible).toFixed(2);


  // ── Derived: path ───────────────────────────────────────────────
  const pathIds = useMemo(() =>
    pathResult ? new Set(pathResult) : new Set<string>(),
  [pathResult]);

  const pathEdgeKeys = useMemo(() => {
    if (!pathResult || pathResult.length < 2) return new Set<string>();
    const set = new Set<string>();
    for (let i = 0; i < pathResult.length - 1; i++) {
      set.add(`${pathResult[i]}--${pathResult[i + 1]}`);
      set.add(`${pathResult[i + 1]}--${pathResult[i]}`);
    }
    return set;
  }, [pathResult]);

  // ── Derived: ripple ─────────────────────────────────────────────
  const rippleDegrees = useMemo(() =>
    rippleId ? computeRippleDegrees(rippleId, schools) : new Map<string, number>(),
  [rippleId, schools]);

  // ── Mode switch (resets all mode state) ─────────────────────────
  const switchMode = useCallback((m: Mode) => {
    setPathA(null); setPathB(null); setPathResult(null); setPathNoRoute(false);
    setRippleId(null); setRippleTick(0);
    setCompareA(null); setCompareB(null);
    setSelectedId(null); setHoveredId(null);
    setMode(m);
  }, []);

  // ── Center canvas on a node ─────────────────────────────────────
  const centerOnNode = useCallback((schoolId: string) => {
    const nodePx = getNodePx(schoolId, nodeOffsets, dims);
    if (!nodePx) return;
    const z = 1.0;
    setViewport({ zoom: z, panX: dims.w / 2 - nodePx.x * z, panY: dims.h / 2 - nodePx.y * z });
    setMode("explore");
    setCompareA(null); setCompareB(null);
    setTimeout(() => setSelectedId(schoolId), 80);
  }, [nodeOffsets, dims]);

  // ── Resize ──────────────────────────────────────────────────────
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

  // ── Wheel zoom ──────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement).closest("[data-panel]")) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const v = viewportRef.current;
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

  // ── Canvas drag ─────────────────────────────────────────────────
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("a, button, input, [data-node]")) return;
    isDraggingRef.current = true;
    didDragRef.current    = false;
    setIsDragging(true);
    const v = viewportRef.current;
    dragStart.current = { x: e.clientX, y: e.clientY, panX: v.panX, panY: v.panY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) setCursorPx({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    if (nodeDragRef.current) {
      const { id, startMx, startMy, startDx, startDy } = nodeDragRef.current;
      const { zoom } = viewportRef.current;
      setNodeOffsets((prev) => ({
        ...prev,
        [id]: { dx: startDx + (e.clientX - startMx) / zoom, dy: startDy + (e.clientY - startMy) / zoom },
      }));
      return;
    }
    if (!isDraggingRef.current) return;
    didDragRef.current = true;
    setViewport((prev) => ({
      ...prev,
      panX: dragStart.current.panX + (e.clientX - dragStart.current.x),
      panY: dragStart.current.panY + (e.clientY - dragStart.current.y),
    }));
  }, []);

  const handleMouseUp = useCallback(() => {
    nodeDragRef.current    = null;
    isDraggingRef.current  = false;
    setIsDragging(false);
    setDraggingNodeId(null);
  }, []);

  const handleNodeMouseDown = useCallback((e: React.MouseEvent, id: string, currentOffset: { dx: number; dy: number }) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    nodeDragRef.current = { id, startMx: e.clientX, startMy: e.clientY, startDx: currentOffset.dx, startDy: currentOffset.dy };
    setDraggingNodeId(id);
  }, []);

  // ── Node click (mode-aware) ─────────────────────────────────────
  const handleNodeClick = useCallback((schoolId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (mode === "explore") {
      setSelectedId((prev) => (prev === schoolId ? null : schoolId));
    } else if (mode === "path") {
      if (!pathA || pathB !== null) {
        setPathA(schoolId); setPathB(null); setPathResult(null); setPathNoRoute(false);
      } else if (pathA === schoolId) {
        setPathA(null);
      } else {
        setPathB(schoolId);
        const result = bfsPath(pathA, schoolId, schools);
        if (result) { setPathResult(result); setPathNoRoute(false); }
        else        { setPathResult(null);   setPathNoRoute(true);  }
      }
    } else if (mode === "ripple") {
      setRippleId((prev) => (prev === schoolId ? null : schoolId));
      setRippleTick((t) => t + 1);
    } else if (mode === "compare") {
      if (!compareA || (compareA && compareB)) {
        setCompareA(schoolId); setCompareB(null);
      } else if (compareA === schoolId) {
        setCompareA(null);
      } else {
        setCompareB(schoolId);
      }
    }
  }, [mode, pathA, pathB, compareA, compareB, schools]);

  // ── Node visual state helper ────────────────────────────────────
  const getNodeVisual = useCallback((schoolId: string) => {
    let isDimmed     = false;
    let isHighlighted = false;

    if (mode === "explore") {
      const isHov = hoveredId === schoolId;
      const isSel = selectedId === schoolId;
      isDimmed      = (hoveredId !== null && !isHov) || (selectedId !== null && !isSel);
      isHighlighted = isHov || isSel;
    } else if (mode === "path") {
      if (pathResult) {
        isHighlighted = pathIds.has(schoolId);
        isDimmed      = !pathIds.has(schoolId);
      } else {
        isHighlighted = pathA === schoolId;
        isDimmed      = pathA !== null && pathA !== schoolId;
      }
    } else if (mode === "ripple") {
      if (rippleId) {
        const deg = rippleDegrees.get(schoolId);
        isDimmed      = deg === undefined;
        isHighlighted = deg === 0;
      }
    } else if (mode === "compare") {
      isHighlighted = compareA === schoolId || compareB === schoolId;
      isDimmed      = (compareA !== null || compareB !== null) && !isHighlighted;
    }

    const timelineFade = timelineOn && (SCHOOL_START_YEAR[schoolId] ?? -500) > scrubYear;

    return { isDimmed, isHighlighted, timelineFade };
  }, [mode, hoveredId, selectedId, pathResult, pathIds, pathA, rippleId, rippleDegrees, timelineOn, scrubYear, compareA, compareB]);

  // ── Edge visual state helper ────────────────────────────────────
  const getEdgeVisual = useCallback((fromId: string, toId: string, key: string) => {
    if (mode === "explore") {
      const active = hoveredId === fromId || hoveredId === toId;
      return { active, dimmed: hoveredId !== null && !active };
    }
    if (mode === "path" && pathResult) {
      const active = pathEdgeKeys.has(key);
      return { active, dimmed: !active };
    }
    if (mode === "ripple" && rippleId) {
      const a = rippleDegrees.get(fromId);
      const b = rippleDegrees.get(toId);
      const active = a !== undefined && b !== undefined;
      return { active, dimmed: !active };
    }
    return { active: false, dimmed: false };
  }, [mode, hoveredId, pathResult, pathEdgeKeys, rippleId, rippleDegrees]);

  const { zoom, panX, panY } = viewport;

  // ── Mode instruction hints ──────────────────────────────────────
  const modeHints: Record<Mode, { action: string; label: string }[]> = {
    explore: [
      { action: "PAN & SCROLL", label: "To explore the horizon" },
      { action: "CLICK NODE",   label: "To open a chapter"       },
      { action: "HOVER NODE",   label: "To manifest a fragment"  },
    ],
    path: [
      { action: "CLICK SOURCE",      label: pathA ? "Source set — click destination" : "Select a starting school" },
      { action: "CLICK DESTINATION", label: pathA ? "Click any other school"         : "Then a destination"      },
      { action: "ESC / RE-CLICK",    label: "To reset the path"                                                   },
    ],
    ripple: [
      { action: "CLICK NODE",   label: "To radiate its influence" },
      { action: "RINGS",        label: "Show 1st, 2nd, 3rd degree" },
      { action: "RE-CLICK",     label: "To dismiss"               },
    ],
    compare: [
      { action: "SELECT TWO",   label: "To compare their essence" },
      { action: "NODE A",       label: compareA ? (schoolMap.get(compareA)?.title || "...") : "Select first school" },
      { action: "NODE B",       label: compareB ? (schoolMap.get(compareB)?.title || "...") : "Select second school" },
    ],
  };

  const MODE_LABELS: Record<Mode, string> = {
    explore: "Explore",
    path:    "Trace Path",
    ripple:  "Ripple",
    compare: "Compare",
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed", inset: 0, overflow: "hidden",
        background: "radial-gradient(ellipse at 38% 48%, #FDFAF5 0%, #F8F3E8 50%, #F0E9D6 100%)",
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => { handleMouseUp(); setCursorPx({ x: -9999, y: -9999 }); }}
      onClick={() => {
        if (!didDragRef.current && mode === "explore") setSelectedId(null);
      }}
    >

      {/* Background click */}
      <div
        style={{ position: "absolute", inset: 0, zIndex: 0 }}
        onClick={() => {
          if (mode === "explore") setSelectedId(null);
        }}
      />

      {/* Vortex grid — warps toward cursor */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }}>
        <path
          d={buildVortexGrid(dims.w, dims.h, cursorPx.x, cursorPx.y)}
          fill="none"
          stroke="rgba(17,21,26,0.038)"
          strokeWidth="0.75"
        />
        {Array.from({ length: Math.ceil(dims.h / GRID_STEP) + 1 }, (_, r) => r).flatMap((r) =>
          Array.from({ length: Math.ceil(dims.w / GRID_STEP) + 1 }, (_, c) => {
            const raw = vortexPt(c * GRID_STEP, r * GRID_STEP, cursorPx.x, cursorPx.y);
            const [px, py] = raw.split(",").map(Number);
            return <circle key={`${r}-${c}`} cx={px} cy={py} r={1.2} fill="rgba(132,84,0,0.09)" />;
          })
        )}
      </svg>

      {/* ── Era index strip ── */}
      <div style={{
        position: "fixed", top: 0, left: 80, right: 0,
        padding: "10px 48px",
        display: "flex", gap: 0, alignItems: "stretch",
        borderBottom: "1px solid rgba(132,84,0,0.1)",
        background: "rgba(253,250,245,0.88)",
        backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
        zIndex: 20, pointerEvents: "none",
      }}>
        {[
          { label: "Socratic",       era: "c. 470–399 BC",    color: "#C47029" },
          { label: "Platonic",       era: "c. 428–30 BC",     color: "#C47029" },
          { label: "Aristotelian",   era: "c. 384 BC+",       color: "#C47029" },
          { label: "Stoicism",       era: "c. 300 BC–AD 200", color: "#8B6229" },
          { label: "Neoplatonism",   era: "c. AD 200–600",    color: "#8B6229" },
          { label: "Scholasticism",  era: "c. 1000–1400",     color: "#6B7A47" },
          { label: "Rationalism",    era: "c. 1596–1780",     color: "#8B6914" },
          { label: "Empiricism",     era: "c. 1632–1780",     color: "#8B6914" },
          { label: "Critical",       era: "c. 1781–1850",     color: "#5A6999" },
          { label: "Ger. Idealism",  era: "c. 1807–1850",     color: "#5A6999" },
          { label: "Existentialism", era: "c. 1844–1980",     color: "#7A5C6E" },
          { label: "Analytic",       era: "c. 1889–present",  color: "#4A5568" },
        ].map(({ label, era, color }, i, arr) => (
          <div key={label} style={{
            flex: 1, textAlign: "center",
            borderRight: i < arr.length - 1 ? "1px solid rgba(132,84,0,0.08)" : "none",
            padding: "0 8px",
          }}>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "7.5px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color }}>
              {label}
            </div>
            <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "9px", color: "rgba(95,106,120,0.75)", marginTop: 2 }}>
              {era}
            </div>
          </div>
        ))}
      </div>

      {/* ── Mode toolbar ── */}
      <div style={{
        position: "fixed", top: 50, left: 104,
        display: "flex", alignItems: "center", gap: 5,
        zIndex: 25, pointerEvents: "auto",
      }}>
        {(["explore", "path", "ripple", "compare"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            style={{
              padding: "5px 13px",
              background: mode === m ? "#c47029" : "rgba(253,250,245,0.92)",
              color: mode === m ? "#fff" : "#43474c",
              border: `1px solid ${mode === m ? "#c47029" : "rgba(17,21,26,0.12)"}`,
              borderRadius: 100,
              fontFamily: "var(--font-sans)", fontSize: "7.5px", fontWeight: 700,
              letterSpacing: "0.15em", textTransform: "uppercase",
              cursor: "pointer",
              backdropFilter: "blur(12px)",
              transition: "all 0.2s",
              boxShadow: mode === m ? "0 2px 12px rgba(196,112,41,0.28)" : "0 1px 4px rgba(17,21,26,0.06)",
            }}
          >
            {MODE_LABELS[m]}
          </button>
        ))}

        <div style={{ width: 1, height: 18, background: "rgba(17,21,26,0.12)", margin: "0 3px" }} />

        <button
          onClick={() => setShowQuiz(true)}
          style={{
            padding: "5px 13px",
            background: "rgba(253,250,245,0.92)",
            color: "#c47029",
            border: "1px solid rgba(196,112,41,0.25)",
            borderRadius: 100,
            fontFamily: "var(--font-sans)", fontSize: "7.5px", fontWeight: 700,
            letterSpacing: "0.15em", textTransform: "uppercase",
            cursor: "pointer",
            backdropFilter: "blur(12px)",
            transition: "all 0.2s",
            boxShadow: "0 1px 4px rgba(17,21,26,0.06)",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#c47029"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(253,250,245,0.92)"; e.currentTarget.style.color = "#c47029"; }}
        >
          Find My School
        </button>

        <div style={{ width: 1, height: 18, background: "rgba(17,21,26,0.12)", margin: "0 3px" }} />

        {/* Timeline toggle */}
        <button
          onClick={() => setTimelineOn((t) => !t)}
          style={{
            padding: "5px 13px",
            background: timelineOn ? "rgba(90,105,153,0.12)" : "rgba(253,250,245,0.92)",
            color: timelineOn ? "#5A6999" : "#43474c",
            border: `1px solid ${timelineOn ? "#5A6999" : "rgba(17,21,26,0.12)"}`,
            borderRadius: 100,
            fontFamily: "var(--font-sans)", fontSize: "7.5px", fontWeight: 700,
            letterSpacing: "0.15em", textTransform: "uppercase",
            cursor: "pointer",
            backdropFilter: "blur(12px)",
            transition: "all 0.2s",
            boxShadow: "0 1px 4px rgba(17,21,26,0.06)",
          }}
        >
          Timeline
        </button>
      </div>

      {/* ── Path result banner ── */}
      <AnimatePresence>
        {(pathResult || pathNoRoute) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            style={{
              position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)",
              background: "rgba(253,250,245,0.97)",
              backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
              border: `1px solid ${pathNoRoute ? "rgba(180,60,60,0.2)" : "rgba(196,112,41,0.22)"}`,
              borderTop: `3px solid ${pathNoRoute ? "#B44040" : "#c47029"}`,
              borderRadius: 4, padding: "10px 22px",
              zIndex: 25, pointerEvents: "none",
              display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
              maxWidth: "70vw",
            }}
          >
            {pathNoRoute ? (
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.74rem", color: "#B44040" }}>
                No connection found between those two schools.
              </span>
            ) : pathResult?.map((id, i) => (
              <span key={id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {i > 0 && (
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path d="M1 5h10M7 1l4 4-4 4" stroke="#c47029" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "0.85rem", color: "#11151a" }}>
                  {schoolMap.get(id)?.title}
                </span>
              </span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating title ── */}
      <div style={{ position: "absolute", top: 62, right: 36, pointerEvents: "none", zIndex: 5, textAlign: "right" }}>
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
          Western Philosophy · Lineage View
        </div>
      </div>

      {/* ── Main transform layer ── */}
      <div style={{
        position: "absolute", inset: 0,
        transform: `translate(${panX}px,${panY}px) scale(${zoom})`,
        transformOrigin: "0 0", willChange: "transform",
      }}>

        {/* SVG edges */}
        <svg style={{
          position: "absolute", top: 0, left: 0,
          width: dims.w * CANVAS_W_SCALE, height: dims.h,
          pointerEvents: "none", zIndex: 1, overflow: "visible",
        }}>
          <defs>
            <filter id="constellation-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {edges.map((edge) => {
            const fp = getNodePx(edge.fromId, nodeOffsets, dims);
            const tp = getNodePx(edge.toId,   nodeOffsets, dims);
            if (!fp || !tp) return null;
            const key   = `${edge.fromId}--${edge.toId}`;
            const curve = EDGE_CURVES[key] ?? { dir: 1 as const, mag: 0.32 };
            const { active, dimmed } = getEdgeVisual(edge.fromId, edge.toId, key);
            const d = organicPath(fp.x, fp.y, tp.x, tp.y, curve.dir, curve.mag);
            const timelineFadeA = timelineOn && (SCHOOL_START_YEAR[edge.fromId] ?? -500) > scrubYear;
            const timelineFadeB = timelineOn && (SCHOOL_START_YEAR[edge.toId]   ?? -500) > scrubYear;
            const timelineDim   = timelineFadeA || timelineFadeB;
            return (
              <g key={key} style={{ opacity: timelineDim ? 0.04 : 1, transition: "opacity 0.5s" }}>
                {/* Soft diffuse glow behind the line */}
                <path
                  d={d} fill="none"
                  stroke="#3d2a10"
                  strokeWidth={active ? 4 : 2.5}
                  opacity={dimmed ? 0.0 : active ? 0.12 : 0.05}
                  filter="url(#constellation-glow)"
                  style={{ transition: "opacity 0.35s" }}
                />
                {/* Precise constellation thread */}
                <path
                  d={d} fill="none"
                  stroke={active ? "#1a1008" : "#3d3020"}
                  strokeWidth={active ? 1.1 : 0.55}
                  opacity={dimmed ? 0.04 : active ? 0.55 : 0.20}
                  style={{ transition: "opacity 0.35s, stroke-width 0.35s" }}
                />
              </g>
            );
          })}
        </svg>

        {/* ── Ripple rings ── */}
        {rippleId && [...rippleDegrees.entries()].map(([id, degree]) => {
          const nodePx = getNodePx(id, nodeOffsets, dims);
          if (!nodePx || degree === 0) return null;
          const ringColor = degree === 1 ? "#c47029" : degree === 2 ? "#8B6229" : "#6B7A47";
          const baseSize  = degree === 1 ? 70 : degree === 2 ? 90 : 110;
          return [0, 1].map((pulse) => (
            <motion.div
              key={`${id}-d${degree}-p${pulse}-t${rippleTick}`}
              style={{
                position: "absolute",
                left: nodePx.x,
                top: nodePx.y,
                width: baseSize,
                height: baseSize,
                marginLeft: -baseSize / 2,
                marginTop: -baseSize / 2,
                borderRadius: "50%",
                border: `1.5px solid ${ringColor}`,
                pointerEvents: "none",
                zIndex: 4,
              }}
              initial={{ scale: 0.4, opacity: 0.7 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{
                duration: 2.0,
                repeat: Infinity,
                ease: "easeOut",
                delay: degree * 0.28 + pulse * 0.85,
              }}
            />
          ));
        })}

        {/* ── Compare selection rings ── */}
        {[compareA, compareB].map((id, ci) => {
          if (!id) return null;
          const nodePx = getNodePx(id, nodeOffsets, dims);
          if (!nodePx) return null;
          return (
            <motion.div
              key={`compare-ring-${id}-${ci}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                position: "absolute",
                left: nodePx.x, top: nodePx.y,
                width: 70, height: 70,
                marginLeft: -35, marginTop: -35,
                borderRadius: "50%",
                border: `2px solid ${ci === 0 ? "#c47029" : "#5A6999"}`,
                boxShadow: `0 0 20px ${ci === 0 ? "rgba(196,112,41,0.2)" : "rgba(90,105,153,0.2)"}`,
                pointerEvents: "none", zIndex: 4,
              }}
            />
          );
        })}



        {/* Path glow on source/target nodes */}
        {mode === "path" && pathA && (() => {
          const nodePx = getNodePx(pathA, nodeOffsets, dims);
          if (!nodePx) return null;
          return (
            <motion.div
              key={`path-source-${pathA}`}
              style={{
                position: "absolute",
                left: nodePx.x, top: nodePx.y,
                width: 80, height: 80,
                marginLeft: -40, marginTop: -40,
                borderRadius: "50%",
                border: "2px solid #c47029",
                opacity: 0.5,
                pointerEvents: "none",
                zIndex: 4,
              }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.25, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          );
        })()}

        {/* School nodes */}
        {schools.map((school) => {
          const nodePx = getNodePx(school._id, nodeOffsets, dims);
          if (!nodePx) return null;
          const { isHighlighted, timelineFade } = getNodeVisual(school._id);
          const isHovered      = mode === "explore" && hoveredId === school._id;
          const isSelected     = mode === "explore" && selectedId === school._id;
          const tagline        = TAGLINES[school._id] ?? "";
          const isBeingDragged = draggingNodeId === school._id;
          const labelLeft      = nodePx.x / dims.w > 0.68;
          const cardAbove      = nodePx.y / dims.h > 0.52;
          const accent         = ERA_ACCENT[school._id] ?? "#C47029";


          // Influence-weight radius: more connections → slightly larger node
          const connections   = school.influencedBy.length + school.influencedTo.length;
          const influenceMult = 0.88 + Math.min((connections - 1) / 3, 1) * 0.28;
          const baseR         = isSelected ? 9 : 6;
          const R             = Math.round(baseR * influenceMult);

          return (
            <div
              key={school._id}
              data-node={school._id}
              style={{
                position: "absolute",
                left: nodePx.x, top: nodePx.y,
                width: 0, height: 0,
                zIndex: isHighlighted || isBeingDragged ? 30 : 10,
                opacity: timelineFade ? 0.06 : 1,
                transition: "opacity 0.35s",
                cursor: isBeingDragged ? "grabbing" : "grab",
                userSelect: "none",
              }}
              onMouseDown={(e) => handleNodeMouseDown(e, school._id, nodeOffsets[school._id] ?? { dx: 0, dy: 0 })}
              onMouseEnter={() => { if (!nodeDragRef.current && mode === "explore") setHoveredId(school._id); }}
              onMouseLeave={() => { if (!nodeDragRef.current) setHoveredId(null); }}
              onClick={(e) => handleNodeClick(school._id, e)}
            >


              {/* Node circle */}
              <div style={{
                position: "absolute",
                width: R * 2, height: R * 2, top: -R, left: -R,
                borderRadius: "50%",
                background: isHovered ? "#000" : "#11151a",
                border: `1.5px solid ${isSelected ? accent : isHovered ? "rgba(0,0,0,0.8)" : accent + "50"}`,
                boxShadow: isSelected
                  ? `0 0 0 3px ${accent}28, 0 4px 20px ${accent}35`
                  : isHovered
                  ? "0 2px 16px rgba(0,0,0,0.45)"
                  : "none",
                transform: isHovered ? "scale(1.5)" : isSelected ? "scale(1.12)" : "scale(1)",
                transition: "transform 0.22s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s, border-color 0.25s",
                zIndex: 1,
              }} />

              {/* Label */}
              <div style={{
                position: "absolute",
                ...(labelLeft ? { right: R + 14 } : { left: R + 14 }),
                top: "50%",
                transform: "translateY(-50%)",
                whiteSpace: "nowrap",
                pointerEvents: "none",
                textAlign: labelLeft ? "right" : "left",
              }}>
                <div style={{
                  fontFamily: "var(--font-serif)", fontStyle: "italic",
                  fontSize: "1.35rem", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.01em",
                  color: "#11151a",
                }}>
                  {school.title}
                </div>
                <div style={{
                  fontFamily: "var(--font-sans)", fontSize: "7.5px", fontWeight: 700,
                  letterSpacing: "0.18em", textTransform: "uppercase",
                  color: "#8a7a6a", marginTop: 4,
                }}>
                  {tagline}
                </div>
              </div>

              {/* Hover card (explore mode only) */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: cardAbove ? 6 : -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: cardAbove ? 6 : -6, scale: 0.97 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      position: "absolute",
                      ...(cardAbove ? { bottom: NODE_R + 24 } : { top: 40 }),
                      ...(labelLeft ? { right: 0 } : { left: NODE_R + 16 }),
                      width: 316,
                      background: "rgba(253,250,245,0.97)",
                      backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
                      borderRadius: 4, padding: "20px 22px 18px 22px",
                      boxShadow: "0 4px 6px rgba(26,28,25,0.04), 0 16px 48px rgba(26,28,25,0.13)",
                      border: "1px solid rgba(132,84,0,0.14)",
                      borderTop: "3px solid #c47029",
                      pointerEvents: "auto", zIndex: 50, overflow: "hidden",
                    }}
                  >
                    <div style={{
                      display: "inline-block",
                      fontFamily: "var(--font-sans)", fontSize: "7px", fontWeight: 700,
                      letterSpacing: "0.20em", textTransform: "uppercase",
                      color: "#845400", background: "rgba(132,84,0,0.08)",
                      border: "1px solid rgba(132,84,0,0.18)",
                      padding: "3px 8px", borderRadius: 2, marginBottom: 12,
                    }}>
                      {school.eraRange}
                    </div>
                    <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.3rem", fontWeight: 500, color: "#11151a", lineHeight: 1.15, marginBottom: 10 }}>
                      {school.title}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, rgba(132,84,0,0.25), transparent)" }} />
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <circle cx="5" cy="5" r="1.5" fill="rgba(132,84,0,0.5)" />
                        <circle cx="5" cy="5" r="4" stroke="rgba(132,84,0,0.2)" strokeWidth="0.75" fill="none" />
                      </svg>
                      <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, rgba(132,84,0,0.25), transparent)" }} />
                    </div>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", lineHeight: 1.75, color: "#5F6A78", marginBottom: 12 }}>
                      {school.description.slice(0, 140)}…
                    </p>
                    {school.coreIdeas.length > 0 && (
                      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 5, marginBottom: 14 }}>
                        {school.coreIdeas.slice(0, 2).map((idea, i) => (
                          <li key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                            <span style={{ width: 3, height: 3, marginTop: 7, flexShrink: 0, borderRadius: "50%", background: "#c47029", opacity: 0.65 }} />
                            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.69rem", lineHeight: 1.65, color: "#43474c" }}>{idea}</span>
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
                              <img src={p.avatarUrl} alt={p.name} width={16} height={16}
                                style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                                onError={() => setImgErrors((prev) => new Set(prev).add(p._id))}
                              />
                            )}
                            {p.name}
                          </Link>
                        ))}
                      </div>
                    )}
                    {school.influencedTo.length > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(17,21,26,0.07)" }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#c47029" strokeWidth="2.5">
                          <path d="M5 12h14m-6-7 7 7-7 7" />
                        </svg>
                        <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.66rem", color: "#5F6A78" }}>
                          {school.influencedTo.map((t) => t.title).join(" · ")}
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

      {/* ── Timeline scrubber ── */}
      <AnimatePresence>
        {timelineOn && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              bottom: 90,
              left: 80, right: 0,
              padding: "12px 48px",
              background: "rgba(253,250,245,0.92)",
              backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
              borderTop: "1px solid rgba(17,21,26,0.06)",
              zIndex: 19,
              display: "flex", alignItems: "center", gap: 20,
              pointerEvents: "auto",
            }}
          >
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "7.5px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#5F6A78", whiteSpace: "nowrap" }}>
              Timeline
            </div>
            <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "0.78rem", color: "#845400", whiteSpace: "nowrap", minWidth: 72 }}>
              {formatYear(scrubYear)}
            </div>
            <div style={{ flex: 1, position: "relative" }}>
              <input
                type="range"
                min={-500}
                max={2026}
                step={1}
                value={scrubYear}
                onChange={(e) => setScrubYear(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#c47029", cursor: "pointer" }}
              />
              {/* Year labels */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3, pointerEvents: "none" }}>
                {[-500, 0, 500, 1000, 1500, 2026].map((y) => (
                  <span key={y} style={{ fontFamily: "var(--font-sans)", fontSize: "6.5px", color: "rgba(95,106,120,0.6)" }}>
                    {y < 0 ? `${Math.abs(y)} BC` : y === 0 ? "AD 1" : y === 2026 ? "Now" : y}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => setScrubYear(2026)}
              style={{
                padding: "4px 10px",
                background: "none",
                border: "1px solid rgba(17,21,26,0.12)",
                borderRadius: 3,
                cursor: "pointer",
                fontFamily: "var(--font-sans)", fontSize: "7px", fontWeight: 600,
                letterSpacing: "0.12em", textTransform: "uppercase",
                color: "#5F6A78",
              }}
            >
              Reset
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Map statistics panel ── */}
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
            { label: "Thread Density",    value: threadDensity             },
            { label: "Atmospheric Sync",  value: "Active"                  },
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
        {modeHints[mode].map(({ action, label }) => (
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

      {/* ── Chapter panel (explore mode only) ── */}
      {mode === "explore" && (
        <SchoolChapterPanel
          school={selectedId ? (schools.find((s) => s._id === selectedId) ?? null) : null}
          allSchools={schools}
          onClose={() => setSelectedId(null)}
          onNavigate={(id) => setSelectedId(id)}
        />
      )}

      {/* ── Comparison panel ── */}
      <AnimatePresence>
        {mode === "compare" && (compareA || compareB) && (
          <ComparisonPanel
            schoolA={compareA ? (schools.find(s => s._id === compareA) ?? null) : null}
            schoolB={compareB ? (schools.find(s => s._id === compareB) ?? null) : null}
            onClose={() => switchMode("explore")}
          />
        )}
      </AnimatePresence>

      {/* ── Quiz overlay ── */}
      <AnimatePresence>
        {showQuiz && (
          <QuizOverlay
            onClose={() => setShowQuiz(false)}
            onResult={(id) => {
              setShowQuiz(false);
              centerOnNode(id);
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
