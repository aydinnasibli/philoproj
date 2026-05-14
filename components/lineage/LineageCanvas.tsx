"use client";
// Enhanced: gradient edges, depth fog, portrait vignette, starmap mode

import { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SchoolWithPhilosophers } from "@/lib/types";
import SchoolChapterPanel from "./SchoolChapterPanel";
import QuizOverlay from "./QuizOverlay";
import ComparisonPanel from "./ComparisonPanel";

const CANVAS_W_SCALE = 2.8;
const GRID_STEP       = 80;
const VORTEX_RADIUS   = 210;
const VORTEX_STRENGTH = 52;
const MIN_ZOOM        = 0.25;
const MAX_ZOOM        = 4;

// labelLeft threshold: equivalent to original (nodePx.x / dims.w > 0.68) → base.x * CANVAS_W_SCALE / 100 > 0.68
const LABEL_LEFT_THRESHOLD = 0.68 * 100 / CANVAS_W_SCALE; // ≈ 24.3

// Node circle size — full class strings so Tailwind JIT scanner picks them up
const NODE_CIRCLE_CLS: Record<number, string> = {
  5:  "w-[10px] h-[10px] -top-[5px]  -left-[5px]",
  6:  "w-[12px] h-[12px] -top-[6px]  -left-[6px]",
  7:  "w-[14px] h-[14px] -top-[7px]  -left-[7px]",
  8:  "w-[16px] h-[16px] -top-[8px]  -left-[8px]",
  9:  "w-[18px] h-[18px] -top-[9px]  -left-[9px]",
  10: "w-[20px] h-[20px] -top-[10px] -left-[10px]",
};

// Label horizontal offset = R + 14 px from node center
const LABEL_RIGHT_CLS: Record<number, string> = {
  5: "right-[19px]", 6: "right-[20px]", 7: "right-[21px]",
  8: "right-[22px]", 9: "right-[23px]", 10: "right-[24px]",
};
const LABEL_LEFT_CLS: Record<number, string> = {
  5: "left-[19px]", 6: "left-[20px]", 7: "left-[21px]",
  8: "left-[22px]", 9: "left-[23px]", 10: "left-[24px]",
};

function vortexPt(gx: number, gy: number, cx: number, cy: number): string {
  const dx = gx - cx, dy = gy - cy;
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
    for (let x = 0; x <= w + SEG; x += SEG) { d += (first ? "M" : "L") + vortexPt(x, y, cx, cy) + " "; first = false; }
  }
  for (let x = 0; x <= w + GRID_STEP; x += GRID_STEP) {
    let first = true;
    for (let y = 0; y <= h + SEG; y += SEG) { d += (first ? "M" : "L") + vortexPt(x, y, cx, cy) + " "; first = false; }
  }
  return d;
}

function buildDotPath(w: number, h: number, cx: number, cy: number): string {
  let d = "";
  for (let r = 0; r < Math.ceil(h / GRID_STEP) + 1; r++)
    for (let c = 0; c < Math.ceil(w / GRID_STEP) + 1; c++)
      d += "M" + vortexPt(c * GRID_STEP, r * GRID_STEP, cx, cy) + "h0 ";
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


const CURRENT_YEAR = new Date().getFullYear();

function formatHistoryYear(y: number, circa = false): string {
  if (y < 0) return `${circa ? "c. " : ""}${Math.abs(y)} BC`;
  return circa ? `c. ${y} AD` : `AD ${y}`;
}
function formatSchoolYear(id: string): string {
  const y = SCHOOL_START_YEAR[id];
  return y === undefined ? "" : formatHistoryYear(y, true);
}

type Mode = "explore" | "path" | "compare";
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

function organicPath(x1: number, y1: number, x2: number, y2: number, dir: 1 | -1, mag: number): string {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const px = (-dy / len) * dir, py = (dx / len) * dir;
  const off = Math.min(len * mag, 200);
  return `M ${x1} ${y1} C ${x1 + dx * 0.35 + px * off} ${y1 + dy * 0.35 + py * off} ${x1 + dx * 0.65 + px * off * 0.80} ${y1 + dy * 0.65 + py * off * 0.80} ${x2} ${y2}`;
}

function getNodePx(id: string, offsets: Record<string, { dx: number; dy: number }>, dims: { w: number; h: number }): { x: number; y: number } | null {
  const base = SCHOOL_POS[id];
  if (!base) return null;
  const off = offsets[id] ?? { dx: 0, dy: 0 };
  return { x: (base.x / 100) * dims.w * CANVAS_W_SCALE + off.dx, y: (base.y / 100) * dims.h + off.dy };
}

function bfsPath(from: string, to: string, adj: Map<string, string[]>): string[] | null {
  if (from === to) return [from];
  const parent = new Map<string, string>();
  const visited = new Set([from]);
  const queue = [from];
  while (queue.length) {
    const cur = queue.shift()!;
    if (cur === to) {
      const path: string[] = [];
      let node: string | undefined = to;
      while (node !== undefined) { path.unshift(node); node = parent.get(node); }
      return path;
    }
    for (const nb of adj.get(cur) ?? []) {
      if (!visited.has(nb)) { visited.add(nb); parent.set(nb, cur); queue.push(nb); }
    }
  }
  return null;
}

type Props = { schools: SchoolWithPhilosophers[] };

export default function LineageCanvas({ schools }: Props) {
  const [hoveredId,      setHoveredId]      = useState<string | null>(null);
  const [selectedId,     setSelectedId]     = useState<string | null>(null);
  const [viewport,       setViewport]       = useState({ zoom: 1, panX: 0, panY: 0 });
  const [isDragging,     setIsDragging]     = useState(false);
  const [dims,           setDims]           = useState({ w: 1440, h: 900 });
  const [nodeOffsets,    setNodeOffsets]    = useState<Record<string, { dx: number; dy: number }>>({});
  const [mode,           setMode]           = useState<Mode>("explore");
  const [pathA,          setPathA]          = useState<string | null>(null);
  const [pathB,          setPathB]          = useState<string | null>(null);
  const [pathResult,     setPathResult]     = useState<string[] | null>(null);
  const [pathNoRoute,    setPathNoRoute]    = useState(false);
  const [compareA,       setCompareA]       = useState<string | null>(null);
  const [compareB,       setCompareB]       = useState<string | null>(null);
  const [showQuiz,       setShowQuiz]       = useState(false);
  const [cursorPx,       setCursorPx]       = useState({ x: -9999, y: -9999 });
  const [timelineOn,     setTimelineOn]     = useState(false);
  const [scrubYear,      setScrubYear]      = useState(CURRENT_YEAR);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  const containerRef   = useRef<HTMLDivElement>(null);
  const transformRef   = useRef<HTMLDivElement>(null);
  const nodeElsRef     = useRef<Map<string, HTMLDivElement>>(new Map());
  const ringElsRef     = useRef<Array<HTMLDivElement | null>>([null, null]);
  const pathGlowRef    = useRef<HTMLDivElement | null>(null);
  const viewportRef    = useRef(viewport);
  const isDraggingRef  = useRef(false);
  const didDragRef     = useRef(false);
  const dragStart      = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const nodeDragRef    = useRef<{ id: string; startMx: number; startMy: number; startDx: number; startDy: number } | null>(null);
  const cursorRafRef   = useRef<number | null>(null);
  const activePointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef       = useRef<{ dist: number } | null>(null);
  const timelineOnRef  = useRef(false);

  useEffect(() => { viewportRef.current = viewport; }, [viewport]);
  useEffect(() => { timelineOnRef.current = timelineOn; }, [timelineOn]);

  // Push transform to DOM before paint — avoids FOUC on pan/zoom
  useLayoutEffect(() => {
    const el = transformRef.current;
    if (!el) return;
    el.style.setProperty("--tx", `${viewport.panX}px`);
    el.style.setProperty("--ty", `${viewport.panY}px`);
    el.style.setProperty("--s",  String(viewport.zoom));
  }, [viewport]);

  // Push node pixel positions + SVG canvas dimensions to DOM before paint
  useLayoutEffect(() => {
    const root = transformRef.current;
    if (root) {
      root.style.setProperty("--canvas-w", `${dims.w * CANVAS_W_SCALE}px`);
      root.style.setProperty("--canvas-h", `${dims.h}px`);
    }
    for (const [id, el] of nodeElsRef.current) {
      const px = getNodePx(id, nodeOffsets, dims);
      if (!px) continue;
      el.style.setProperty("--nx", `${px.x}px`);
      el.style.setProperty("--ny", `${px.y}px`);
    }
  }, [nodeOffsets, dims]);

  // Push compare ring positions to DOM before paint
  useLayoutEffect(() => {
    [compareA, compareB].forEach((id, ci) => {
      const el = ringElsRef.current[ci];
      if (!el || !id) return;
      const px = getNodePx(id, nodeOffsets, dims);
      if (!px) return;
      el.style.setProperty("--nx", `${px.x}px`);
      el.style.setProperty("--ny", `${px.y}px`);
    });
  }, [compareA, compareB, nodeOffsets, dims]);

  // Push path source glow position to DOM before paint
  useLayoutEffect(() => {
    const el = pathGlowRef.current;
    if (!el || !pathA || mode !== "path") return;
    const px = getNodePx(pathA, nodeOffsets, dims);
    if (!px) return;
    el.style.setProperty("--nx", `${px.x}px`);
    el.style.setProperty("--ny", `${px.y}px`);
  }, [pathA, mode, nodeOffsets, dims]);

  const schoolMap = useMemo(() => new Map(schools.map((s) => [s._id, s])), [schools]);
  const edges     = useMemo(() => buildEdges(schools), [schools]);
  const schoolAdj = useMemo(() => {
    const adj = new Map<string, string[]>();
    for (const s of schools) {
      if (!adj.has(s._id)) adj.set(s._id, []);
      for (const t of s.influencedTo) {
        adj.get(s._id)!.push(t._id);
        if (!adj.has(t._id)) adj.set(t._id, []);
        adj.get(t._id)!.push(s._id);
      }
    }
    return adj;
  }, [schools]);


  const pathIds = useMemo(() => pathResult ? new Set(pathResult) : new Set<string>(), [pathResult]);
  const pathEdgeKeys = useMemo(() => {
    if (!pathResult || pathResult.length < 2) return new Set<string>();
    const set = new Set<string>();
    for (let i = 0; i < pathResult.length - 1; i++) {
      set.add(`${pathResult[i]}--${pathResult[i + 1]}`);
      set.add(`${pathResult[i + 1]}--${pathResult[i]}`);
    }
    return set;
  }, [pathResult]);

  useEffect(() => { return () => { if (cursorRafRef.current) cancelAnimationFrame(cursorRafRef.current); }; }, []);

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

  // Timeline auto-pan
  useEffect(() => {
    if (!timelineOn) return;
    const visible = Object.entries(SCHOOL_START_YEAR).filter(([, y]) => y <= scrubYear).sort(([, a], [, b]) => b - a);
    if (visible.length === 0) return;
    const px = getNodePx(visible[0][0], nodeOffsets, dims);
    if (!px) return;
    setViewport(prev => ({ zoom: prev.zoom, panX: dims.w / 2 - px.x * prev.zoom, panY: dims.h / 2 - px.y * prev.zoom }));
  }, [scrubYear, timelineOn, nodeOffsets, dims]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement).closest("[data-panel]")) return;
      e.preventDefault();
      if (timelineOnRef.current) {
        setScrubYear((prev) => Math.max(-500, Math.min(CURRENT_YEAR, prev + e.deltaY * 0.8)));
        return;
      }
      const rect = el.getBoundingClientRect();
      const v = viewportRef.current;
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, v.zoom * (1 - e.deltaY * 0.001)));
      const ratio = newZoom / v.zoom;
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      setViewport({ zoom: newZoom, panX: mx * (1 - ratio) + v.panX * ratio, panY: my * (1 - ratio) + v.panY * ratio });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("a, button, input")) return;
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (activePointers.current.size === 2) {
      const pts = [...activePointers.current.values()];
      pinchRef.current = { dist: Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y) };
      nodeDragRef.current = null; isDraggingRef.current = false; setIsDragging(false); setDraggingNodeId(null);
      return;
    }
    didDragRef.current = false;
    setHoveredId(null);
    const nodeEl = (e.target as HTMLElement).closest("[data-node]") as HTMLElement | null;
    if (nodeEl) {
      const id = nodeEl.dataset.node!;
      const off = nodeOffsets[id] ?? { dx: 0, dy: 0 };
      nodeDragRef.current = { id, startMx: e.clientX, startMy: e.clientY, startDx: off.dx, startDy: off.dy };
      setDraggingNodeId(id);
    } else {
      isDraggingRef.current = true; setIsDragging(true);
      const v = viewportRef.current;
      dragStart.current = { x: e.clientX, y: e.clientY, panX: v.panX, panY: v.panY };
    }
  }, [nodeOffsets]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!cursorRafRef.current) {
      const cx = e.clientX, cy = e.clientY;
      cursorRafRef.current = requestAnimationFrame(() => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) setCursorPx({ x: cx - rect.left, y: cy - rect.top });
        cursorRafRef.current = null;
      });
    }
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (activePointers.current.size === 2 && pinchRef.current) {
      const pts = [...activePointers.current.values()];
      const newDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mx = (pts[0].x + pts[1].x) / 2 - rect.left, my = (pts[0].y + pts[1].y) / 2 - rect.top;
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
      setNodeOffsets((prev) => ({ ...prev, [id]: { dx: startDx + rawDx / zoom, dy: startDy + rawDy / zoom } }));
      return;
    }
    if (isDraggingRef.current) {
      didDragRef.current = true;
      setViewport((prev) => ({ ...prev, panX: dragStart.current.panX + (e.clientX - dragStart.current.x), panY: dragStart.current.panY + (e.clientY - dragStart.current.y) }));
    }
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    activePointers.current.delete(e.pointerId);
    if (activePointers.current.size < 2) pinchRef.current = null;
    if (activePointers.current.size === 0) {
      nodeDragRef.current = null; isDraggingRef.current = false; setIsDragging(false); setDraggingNodeId(null);
    }
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (cursorRafRef.current) { cancelAnimationFrame(cursorRafRef.current); cursorRafRef.current = null; }
    setCursorPx({ x: -9999, y: -9999 });
    setHoveredId(null);
    activePointers.current.clear();
    pinchRef.current = null;
    didDragRef.current = false;
    nodeDragRef.current = null;
    isDraggingRef.current = false;
    setIsDragging(false);
    setDraggingNodeId(null);
  }, []);

  const switchMode = useCallback((m: Mode) => {
    setPathA(null); setPathB(null); setPathResult(null); setPathNoRoute(false);
    setCompareA(null); setCompareB(null);
    setSelectedId(null); setHoveredId(null);
    setMode(m);
  }, []);

  const centerOnNode = useCallback((schoolId: string) => {
    const px = getNodePx(schoolId, nodeOffsets, dims);
    if (!px) return;
    setViewport({ zoom: 1.0, panX: dims.w / 2 - px.x, panY: dims.h / 2 - px.y });
    setMode("explore");
    setCompareA(null); setCompareB(null);
    setTimeout(() => setSelectedId(schoolId), 80);
  }, [nodeOffsets, dims]);

  const handleNodeClick = useCallback((schoolId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (didDragRef.current) return;
    if (mode === "explore") {
      setSelectedId((prev) => (prev === schoolId ? null : schoolId));
    } else if (mode === "path") {
      if (!pathA || pathB !== null) {
        setPathA(schoolId); setPathB(null); setPathResult(null); setPathNoRoute(false);
      } else if (pathA === schoolId) {
        setPathA(null);
      } else {
        setPathB(schoolId);
        const result = bfsPath(pathA, schoolId, schoolAdj);
        if (result) { setPathResult(result); setPathNoRoute(false); }
        else        { setPathResult(null);   setPathNoRoute(true);  }
      }
    } else if (mode === "compare") {
      if (!compareA || (compareA && compareB)) { setCompareA(schoolId); setCompareB(null); }
      else if (compareA === schoolId)          { setCompareA(null); }
      else                                     { setCompareB(schoolId); }
    }
  }, [mode, pathA, pathB, compareA, compareB, schoolAdj]);

  const getNodeVisual = useCallback((schoolId: string) => {
    let isDimmed = false, isHighlighted = false;
    if (mode === "explore") {
      const isHov = hoveredId === schoolId, isSel = selectedId === schoolId;
      isDimmed      = (hoveredId !== null && !isHov) || (selectedId !== null && !isSel);
      isHighlighted = isHov || isSel;
    } else if (mode === "path") {
      if (pathResult) { isHighlighted = pathIds.has(schoolId); isDimmed = !isHighlighted; }
      else            { isHighlighted = pathA === schoolId; isDimmed = pathA !== null && pathA !== schoolId; }
    } else if (mode === "compare") {
      isHighlighted = compareA === schoolId || compareB === schoolId;
      isDimmed      = (compareA !== null || compareB !== null) && !isHighlighted;
    }
    const timelineFade = timelineOn && (SCHOOL_START_YEAR[schoolId] ?? -500) > scrubYear;
    return { isDimmed, isHighlighted, timelineFade };
  }, [mode, hoveredId, selectedId, pathResult, pathIds, pathA, timelineOn, scrubYear, compareA, compareB]);

  const getEdgeVisual = useCallback((fromId: string, toId: string, key: string) => {
    if (mode === "explore") {
      const active = hoveredId === fromId || hoveredId === toId;
      return { active, dimmed: hoveredId !== null && !active };
    }
    if (mode === "path" && pathResult) {
      const active = pathEdgeKeys.has(key);
      return { active, dimmed: !active };
    }
    return { active: false, dimmed: false };
  }, [mode, hoveredId, pathResult, pathEdgeKeys]);

  const { zoom } = viewport;

  const modeHints: Record<Mode, { action: string; label: string }[]> = {
    explore: [
      { action: "PAN & SCROLL", label: "To explore the horizon" },
      { action: "CLICK NODE",   label: "To open a chapter"      },
      { action: "HOVER NODE",   label: "To manifest a fragment" },
    ],
    path: [
      { action: "CLICK SOURCE",      label: pathA ? "Source set — click destination" : "Select a starting school" },
      { action: "CLICK DESTINATION", label: pathA ? "Click any other school"         : "Then a destination"      },
      { action: "ESC / RE-CLICK",    label: "To reset the path"                                                   },
    ],
    compare: [
      { action: "SELECT TWO", label: "To compare their essence" },
      { action: "NODE A",     label: compareA ? (schoolMap.get(compareA)?.title || "...") : "Select first school"  },
      { action: "NODE B",     label: compareB ? (schoolMap.get(compareB)?.title || "...") : "Select second school" },
    ],
  };

  const MODE_LABELS: Record<Mode, string> = { explore: "Explore", path: "Trace Path", compare: "Compare" };
  const pathSourceNode  = mode === "path" && pathA ? getNodePx(pathA, nodeOffsets, dims) : null;
  const hoveredSchool   = hoveredId ? (schoolMap.get(hoveredId) ?? null) : null;

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label="Philosophy school lineage canvas"
      className={`fixed inset-0 overflow-hidden select-none bg-[radial-gradient(ellipse_at_38%_48%,#FDFAF5_0%,#F8F3E8_50%,#F0E9D6_100%)] ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onClick={(e) => {
        // Don't reset selection when clicking inside the side panel
        if ((e.target as HTMLElement).closest("[data-panel]")) return;
        if (!didDragRef.current && mode === "explore") setSelectedId(null);
      }}
    >
      {/* Vortex grid */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-1" aria-hidden="true">
        <path d={buildVortexGrid(dims.w, dims.h, cursorPx.x, cursorPx.y)} fill="none" stroke="rgba(17,21,26,0.038)" strokeWidth="0.75" />
        <path d={buildDotPath(dims.w, dims.h, cursorPx.x, cursorPx.y)} fill="none" stroke="rgba(132,84,0,0.09)" strokeWidth="2.4" strokeLinecap="round" />
      </svg>

      {/* Mode toolbar */}
      <div className="fixed top-5 left-[104px] flex items-center gap-[5px] z-[25] pointer-events-auto">
        {(["explore", "path", "compare"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`px-[13px] py-[5px] rounded-full border cursor-pointer backdrop-blur-[12px] transition-all duration-200 font-sans text-[7.5px] font-bold tracking-[0.15em] uppercase ${
              mode === m
                ? "bg-accent-bright text-white border-accent-bright shadow-[0_2px_12px_rgba(196,112,41,0.28)]"
                : "bg-[rgba(253,250,245,0.92)] text-[#43474c] border-border shadow-[0_1px_4px_rgba(17,21,26,0.06)]"
            }`}
          >
            {MODE_LABELS[m]}
          </button>
        ))}

        <div className="w-px h-[18px] bg-border mx-[3px]" />

        <button
          onClick={() => setShowQuiz(true)}
          className="px-[13px] py-[5px] rounded-full border border-[rgba(196,112,41,0.25)] cursor-pointer backdrop-blur-[12px] transition-all duration-200 font-sans text-[7.5px] font-bold tracking-[0.15em] uppercase bg-[rgba(253,250,245,0.92)] text-accent-bright shadow-[0_1px_4px_rgba(17,21,26,0.06)] hover:bg-accent-bright hover:text-white"
        >
          Find My School
        </button>

        <div className="w-px h-[18px] bg-border mx-[3px]" />

        <button
          onClick={() => { const next = !timelineOn; setTimelineOn(next); if (next) setScrubYear(-500); }}
          className={`px-[13px] py-[5px] rounded-full border cursor-pointer backdrop-blur-[12px] transition-all duration-200 font-sans text-[7.5px] font-bold tracking-[0.15em] uppercase shadow-[0_1px_4px_rgba(17,21,26,0.06)] ${
            timelineOn
              ? "bg-[rgba(90,105,153,0.12)] text-[#5A6999] border-[#5A6999]"
              : "bg-[rgba(253,250,245,0.92)] text-[#43474c] border-border"
          }`}
        >
          Timeline
        </button>
      </div>

      {/* Path result panel */}
      <AnimatePresence>
        {(pathResult || pathNoRoute) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className={`fixed top-[70px] left-1/2 -translate-x-1/2 backdrop-blur-[20px] rounded-[4px] z-[25] max-w-[80vw] shadow-[0_8px_40px_rgba(17,21,26,0.10)] border ${
              pathNoRoute
                ? "bg-[rgba(253,250,245,0.98)] border-[rgba(180,60,60,0.2)] border-t-[3px] border-t-[#B44040]"
                : "bg-[rgba(253,250,245,0.98)] border-border border-t-[3px] border-t-ink"
            }`}
          >
            {pathNoRoute ? (
              <div className="px-[22px] py-3 font-sans text-[0.74rem] text-[#B44040]">
                No connection found between those two schools.
              </div>
            ) : pathResult && (
              <>
                <div className="px-5 pt-[10px] pb-2 border-b border-[rgba(132,84,0,0.08)] flex items-center gap-[10px]">
                  <span className="font-sans text-[7.5px] font-bold tracking-[0.18em] uppercase text-[rgba(132,84,0,0.6)]">Influence Path</span>
                  <span className="font-sans text-[7.5px] text-[rgba(17,21,26,0.35)] tracking-[0.1em]">
                    {pathResult.length - 1} {pathResult.length - 1 === 1 ? "step" : "steps"}
                  </span>
                </div>
                <div className="px-5 py-3 flex items-stretch">
                  {pathResult.map((id, i) => {
                    const school = schoolMap.get(id);
                    const year   = SCHOOL_START_YEAR[id];
                    return (
                      <div key={id} className="flex items-center">
                        {i > 0 && (
                          <div className="mx-[10px] flex items-center">
                            <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                              <path d="M1 5h14M10 1l5 4-5 4" stroke="rgba(17,21,26,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        )}
                        <button
                          onClick={() => centerOnNode(id)}
                          className="bg-transparent border-none cursor-pointer px-[10px] py-[6px] rounded-[3px] text-left transition-[background] duration-150 hover:bg-[rgba(17,21,26,0.05)]"
                        >
                          <div className="flex items-center gap-[6px] mb-[3px]">
                            <div className="w-[6px] h-[6px] rounded-full shrink-0 bg-ink/40" />
                            <span className="font-serif italic text-[0.9rem] text-ink whitespace-nowrap">{school?.title}</span>
                          </div>
                          {year !== undefined && (
                            <div className="font-sans text-[7px] tracking-[0.12em] pl-3 text-ink-muted">
                              {formatHistoryYear(year)}
                            </div>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating title */}
      <div className="absolute top-6 right-9 pointer-events-none z-5 text-right">
        <div className="font-serif italic text-[1.65rem] font-medium text-[rgba(17,21,26,0.25)] tracking-[-0.015em] leading-none">
          The Living Manuscript
        </div>
      </div>

      {/* Main transform layer — CSS vars set via useLayoutEffect */}
      <div
        ref={transformRef}
        className={`absolute inset-0 origin-top-left will-change-transform transform-[translate(var(--tx),var(--ty))_scale(var(--s))] ${
          timelineOn && !isDragging ? "transition-transform duration-[650ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]" : ""
        }`}
      >
        {/* SVG edges — dimensions pulled from CSS vars set on the parent transform div */}
        <svg
          className="absolute top-0 left-0 pointer-events-none z-1 overflow-visible w-(--canvas-w) h-(--canvas-h)"
          aria-hidden="true"
        >
          <defs>
            <filter id="constellation-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
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
            const timelineDim = (timelineOn && (SCHOOL_START_YEAR[edge.fromId] ?? -500) > scrubYear)
                             || (timelineOn && (SCHOOL_START_YEAR[edge.toId]   ?? -500) > scrubYear);
            return (
              <g key={key} className={`transition-opacity duration-500 ${timelineDim ? "opacity-[0.04]" : "opacity-100"}`}>
                <path d={d} fill="none" stroke="#3d2a10" strokeWidth={active ? 4 : 2.5}
                  opacity={dimmed ? 0.0 : active ? 0.12 : 0.05}
                  filter="url(#constellation-glow)" className="transition-opacity duration-[350ms]" />
                <path d={d} fill="none" stroke={active ? "#1a1008" : "#3d3020"}
                  strokeWidth={active ? 1.1 : 0.55}
                  opacity={dimmed ? 0.04 : active ? 0.55 : 0.20}
                  className="transition-[opacity,stroke-width] duration-[350ms]" />
              </g>
            );
          })}
        </svg>

        {/* Compare selection rings */}
        {[compareA, compareB].map((id, ci) => {
          if (!id) return null;
          const px = getNodePx(id, nodeOffsets, dims);
          if (!px) return null;
          return (
            <motion.div
              key={`compare-ring-${id}-${ci}`}
              ref={(el: HTMLDivElement | null) => { ringElsRef.current[ci] = el; }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`absolute left-(--nx) top-(--ny) w-[70px] h-[70px] -ml-[35px] -mt-[35px] rounded-full pointer-events-none z-4 ${
                ci === 0
                  ? "border-2 border-ink shadow-[0_0_20px_rgba(17,21,26,0.18)]"
                  : "border-2 border-ink/50 shadow-[0_0_20px_rgba(17,21,26,0.09)]"
              }`}
            />
          );
        })}

        {/* Path source pulse ring */}
        {pathSourceNode && pathA && (
          <motion.div
            key={`path-source-${pathA}`}
            ref={(el: HTMLDivElement | null) => { pathGlowRef.current = el; }}
            className="absolute left-(--nx) top-(--ny) w-[80px] h-[80px] -ml-[40px] -mt-[40px] rounded-full border-2 border-ink opacity-40 pointer-events-none z-4"
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.25, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {/* School nodes */}
        {schools.map((school) => {
          const { isHighlighted, timelineFade } = getNodeVisual(school._id);
          const isHovered      = mode === "explore" && hoveredId === school._id;
          const isSelected     = mode === "explore" && selectedId === school._id;
          const tagline        = TAGLINES[school._id] ?? "";
          const isBeingDragged = draggingNodeId === school._id;
          const labelLeft      = (SCHOOL_POS[school._id]?.x ?? 50) > LABEL_LEFT_THRESHOLD;

          const connections   = school.influencedBy.length + school.influencedTo.length;
          const influenceMult = 0.88 + Math.min((connections - 1) / 3, 1) * 0.28;
          const baseR         = isSelected ? 9 : 6;
          const R             = Math.min(10, Math.max(5, Math.round(baseR * influenceMult)));
          const schoolYear    = formatSchoolYear(school._id);

          return (
            <div
              key={school._id}
              ref={(el) => { if (el) nodeElsRef.current.set(school._id, el); else nodeElsRef.current.delete(school._id); }}
              data-node={school._id}
              className={`absolute left-(--nx) top-(--ny) w-0 h-0 select-none transition-opacity duration-[350ms] ${
                isBeingDragged ? "cursor-grabbing" : "cursor-grab"
              } ${isHighlighted || isBeingDragged ? "z-30" : "z-10"} ${timelineFade ? "opacity-[0.06]" : "opacity-100"}`}
              onPointerEnter={() => { if (!nodeDragRef.current && mode === "explore") setHoveredId(school._id); }}
              onPointerLeave={() => { if (!nodeDragRef.current) setHoveredId(null); }}
              onClick={(e) => handleNodeClick(school._id, e)}
            >
              {/* Node circle */}
              <div
                className={`absolute rounded-full z-1 border-[1.5px] [transition:transform_0.22s_cubic-bezier(0.22,1,0.36,1),box-shadow_0.25s,border-color_0.25s] ${NODE_CIRCLE_CLS[R]} ${
                  isHovered
                    ? "bg-black scale-150 border-black/80 shadow-[0_2px_16px_rgba(0,0,0,0.45)]"
                    : isSelected
                    ? "bg-ink scale-[1.12] border-ink shadow-[0_0_0_3px_rgba(17,21,26,0.13),0_4px_20px_rgba(17,21,26,0.21)]"
                    : "bg-ink scale-100 border-ink/31 shadow-none"
                }`}
              />

              {/* Label */}
              <div className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap pointer-events-none ${
                labelLeft ? `text-right ${LABEL_RIGHT_CLS[R]}` : `text-left ${LABEL_LEFT_CLS[R]}`
              }`}>
                <div className="font-serif italic text-[1.35rem] font-normal leading-[1.1] tracking-[-0.01em] text-ink">
                  {school.title}
                </div>
                <div className="font-sans text-[7.5px] font-bold tracking-[0.18em] uppercase text-[#8a7a6a] mt-1">
                  {tagline}
                </div>
                {schoolYear && (
                  <div className="font-serif italic text-[9px] mt-[3px] text-ink/60">
                    {schoolYear}
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Timeline scrubber */}
      <AnimatePresence>
        {timelineOn && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            onPointerDown={(e) => e.stopPropagation()}
            className="fixed bottom-[90px] left-[80px] right-0 px-[48px] py-3 bg-[rgba(253,250,245,0.92)] backdrop-blur-[14px] border-t border-[rgba(17,21,26,0.06)] z-19 flex items-center gap-5 pointer-events-auto"
          >
            <div className="font-sans text-[7.5px] font-bold tracking-[0.18em] uppercase text-ink-muted whitespace-nowrap">Timeline</div>
            <div className="font-serif italic text-[0.78rem] text-accent whitespace-nowrap min-w-[72px]">
              {formatHistoryYear(scrubYear)}
            </div>
            <div className="flex-1 relative">
              <input
                type="range" min={-500} max={CURRENT_YEAR} step={1} value={scrubYear}
                onChange={(e) => setScrubYear(Number(e.target.value))}
                className="w-full accent-accent-bright cursor-pointer"
              />
              <div className="flex justify-between mt-[3px] pointer-events-none">
                {[-500, 0, 500, 1000, 1500, CURRENT_YEAR].map((y) => (
                  <span key={y} className="font-sans text-[6.5px] text-[rgba(95,106,120,0.6)]">
                    {y < 0 ? `${Math.abs(y)} BC` : y === 0 ? "AD 1" : y === CURRENT_YEAR ? "Now" : y}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => setScrubYear(CURRENT_YEAR)}
              className="px-[10px] py-1 bg-transparent border border-border rounded-[3px] cursor-pointer font-sans text-[7px] font-semibold tracking-[0.12em] uppercase text-ink-muted"
            >
              Reset
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover card — fixed bottom-right, same pattern as NetworkCanvas */}
      <AnimatePresence>
        {hoveredSchool && (
          <motion.div
            key={hoveredSchool._id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-[88px] right-4 w-[290px] bg-[rgba(253,250,245,0.97)] backdrop-blur-[28px] rounded-[4px] px-5 pt-4 pb-4 shadow-[0_4px_6px_rgba(26,28,25,0.04),0_16px_48px_rgba(26,28,25,0.13)] border border-border border-t-[3px] border-t-ink pointer-events-none z-50"
          >
            <div className="inline-block font-sans text-[6.5px] font-bold tracking-[0.18em] uppercase text-ink-muted bg-[rgba(17,21,26,0.05)] border border-border px-[6px] py-[2px] rounded-[2px] mb-2">
              {hoveredSchool.eraRange}
            </div>
            <div className="font-serif text-[1.15rem] font-medium text-ink leading-[1.1] mb-2">
              {hoveredSchool.title}
            </div>
            <div className="flex items-center gap-[6px] mb-2">
              <div className="flex-1 h-px bg-linear-to-r from-[rgba(17,21,26,0.12)] to-transparent" />
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <circle cx="5" cy="5" r="1.5" fill="rgba(17,21,26,0.3)" />
                <circle cx="5" cy="5" r="4" stroke="rgba(17,21,26,0.15)" strokeWidth="0.75" fill="none" />
              </svg>
              <div className="flex-1 h-px bg-linear-to-l from-[rgba(17,21,26,0.12)] to-transparent" />
            </div>
            <p className="font-sans text-[0.68rem] leading-[1.65] text-ink-muted mb-3 line-clamp-3">
              {hoveredSchool.description}
            </p>
            {hoveredSchool.influencedTo.length > 0 && (
              <div className="flex items-center gap-[6px] pt-3 border-t border-border-pale">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(17,21,26,0.35)" strokeWidth="2.5" aria-hidden="true">
                  <path d="M5 12h14m-6-7 7 7-7 7" />
                </svg>
                <span className="font-sans text-[7px] text-ink-muted tracking-[0.04em]">
                  {hoveredSchool.influencedTo.map(t => t.title).join(" · ")}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom instruction bar */}
      <div className="fixed bottom-0 left-[80px] right-0 px-[48px] py-4 flex gap-[52px] items-center border-t border-[rgba(17,21,26,0.07)] bg-[rgba(250,250,245,0.78)] backdrop-blur-[14px] z-19 pointer-events-none">
        {modeHints[mode].map(({ action, label }) => (
          <div key={action}>
            <div className="font-sans text-[7.5px] font-bold tracking-[0.20em] uppercase text-ink-muted mb-1">{action}</div>
            <div className="font-serif italic text-[0.84rem] text-ink">{label}</div>
          </div>
        ))}
        <div className="ml-auto font-sans text-[12px] font-semibold tracking-[0.06em] text-[#43474c] opacity-40">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Chapter panel */}
      {mode === "explore" && (
        <SchoolChapterPanel
          school={selectedId ? (schools.find((s) => s._id === selectedId) ?? null) : null}
          allSchools={schools}
          onClose={() => setSelectedId(null)}
          onNavigate={(id) => setSelectedId(id)}
        />
      )}

      {/* Comparison panel */}
      <AnimatePresence>
        {mode === "compare" && (compareA || compareB) && (
          <ComparisonPanel
            schoolA={compareA ? (schools.find(s => s._id === compareA) ?? null) : null}
            schoolB={compareB ? (schools.find(s => s._id === compareB) ?? null) : null}
            onClose={() => switchMode("explore")}
          />
        )}
      </AnimatePresence>

      {/* Quiz overlay */}
      <AnimatePresence>
        {showQuiz && (
          <QuizOverlay
            onClose={() => setShowQuiz(false)}
            onResult={(id) => { setShowQuiz(false); centerOnNode(id); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
