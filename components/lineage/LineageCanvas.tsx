"use client";

import "./LineageCanvas.css";
import { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import type { SchoolWithPhilosophers } from "@/lib/types";
import SchoolChapterPanel from "./SchoolChapterPanel";
import QuizOverlay from "./QuizOverlay";
import ComparisonPanel from "./ComparisonPanel";

const CANVAS_W_SCALE = 2.8;
const MIN_ZOOM        = 0.25;
const MAX_ZOOM        = 4;

// labelLeft threshold: equivalent to original (nodePx.x / dims.w > 0.68) → base.x * CANVAS_W_SCALE / 100 > 0.68
const LABEL_LEFT_THRESHOLD = 0.68 * 100 / CANVAS_W_SCALE; // ≈ 24.3

// Node circle size — full class strings so Tailwind JIT scanner picks them up
const NODE_CIRCLE_CLS: Record<number, string> = {
  5:  "w-[12px] h-[12px] -top-[6px]  -left-[6px]",
  6:  "w-[14px] h-[14px] -top-[7px]  -left-[7px]",
  7:  "w-[17px] h-[17px] -top-[9px]  -left-[9px]",
  8:  "w-[19px] h-[19px] -top-[10px] -left-[10px]",
  9:  "w-[22px] h-[22px] -top-[11px] -left-[11px]",
  10: "w-[24px] h-[24px] -top-[12px] -left-[12px]",
};

// Label horizontal offset = R + 14 px from node center
const LABEL_RIGHT_CLS: Record<number, string> = {
  5: "right-[20px]", 6: "right-[21px]", 7: "right-[23px]",
  8: "right-[24px]", 9: "right-[25px]", 10: "right-[26px]",
};
const LABEL_LEFT_CLS: Record<number, string> = {
  5: "left-[20px]", 6: "left-[21px]", 7: "left-[23px]",
  8: "left-[24px]", 9: "left-[25px]", 10: "left-[26px]",
};




const CURRENT_YEAR = new Date().getFullYear();

function formatHistoryYear(y: number, circa = false): string {
  if (y < 0) return `${circa ? "c. " : ""}${Math.abs(y)} BC`;
  return circa ? `c. ${y} AD` : `AD ${y}`;
}
function formatSchoolYear(startYear: number | undefined): string {
  return startYear == null ? "" : formatHistoryYear(startYear, true);
}

function computeCurve(fp: { x: number; y: number }, tp: { x: number; y: number }): { dir: 1 | -1; mag: number } {
  return { dir: tp.y < fp.y ? 1 : -1, mag: 0.32 };
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

function getNodePx(school: SchoolWithPhilosophers | undefined, pos: Record<string, { x: number; y: number }>, dims: { w: number; h: number }): { x: number; y: number } | null {
  if (!school) return null;
  const p = pos[school._id] ?? { x: school.networkX, y: school.networkY };
  if (p.x == null || p.y == null) return null;
  return { x: (p.x / 100) * dims.w * CANVAS_W_SCALE, y: (p.y / 100) * dims.h };
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
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  const [hoveredSchool,  setHoveredSchool]  = useState<SchoolWithPhilosophers | null>(null);
  const [selectedId,     setSelectedId]     = useState<string | null>(null);
  const [viewport,       setViewport]       = useState({ zoom: 1, panX: 0, panY: 0 });
  const [isDragging,     setIsDragging]     = useState(false);
  const [dims,           setDims]           = useState({ w: 1440, h: 900 });
  const [nodePos,        setNodePos]        = useState<Record<string, { x: number; y: number }>>(() =>
    Object.fromEntries(
      schools
        .filter(s => s.networkX != null && s.networkY != null)
        .map(s => [s._id, { x: s.networkX!, y: s.networkY! }])
    )
  );
  const [mode,           setMode]           = useState<Mode>("explore");
  const [pathA,          setPathA]          = useState<string | null>(null);
  const [pathB,          setPathB]          = useState<string | null>(null);
  const [pathResult,     setPathResult]     = useState<string[] | null>(null);
  const [pathNoRoute,    setPathNoRoute]    = useState(false);
  const [compareA,       setCompareA]       = useState<string | null>(null);
  const [compareB,       setCompareB]       = useState<string | null>(null);
  const [showQuiz,       setShowQuiz]       = useState(false);
  const [timelineOn,     setTimelineOn]     = useState(false);
  const [scrubYear,      setScrubYear]      = useState(CURRENT_YEAR);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  const containerRef   = useRef<HTMLDivElement>(null);
  const transformRef   = useRef<HTMLDivElement>(null);
  const nodeElsRef     = useRef<Map<string, HTMLDivElement>>(new Map());
  const nodePosRef     = useRef<Record<string, { x: number; y: number }>>(nodePos);
  const lGlowElsRef    = useRef<Map<string, SVGPathElement>>(new Map());
  const lMainElsRef    = useRef<Map<string, SVGPathElement>>(new Map());
  const lEdgeAdjRef    = useRef<Map<string, string[]>>(new Map());
  const lEdgeMapRef    = useRef<Map<string, { fromId: string; toId: string }>>(new Map());
  const ringElsRef     = useRef<Array<HTMLDivElement | null>>([null, null]);
  const pathGlowRef    = useRef<HTMLDivElement | null>(null);
  const pathDestGlowRef = useRef<HTMLDivElement | null>(null);
  const viewportRef    = useRef(viewport);
  const isDraggingRef  = useRef(false);
  const didDragRef     = useRef(false);
  const dragStart      = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const nodeDragRef    = useRef<{ id: string; startMx: number; startMy: number; startDx: number; startDy: number } | null>(null);
  const activePointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef       = useRef<{ dist: number } | null>(null);
  const timelineOnRef       = useRef(false);
  const hoveredIdRef        = useRef<string | null>(null);
  const hoveredConnectedRef = useRef<Set<string>>(new Set());
  const willChangeTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDarkRef           = useRef(false);
  // Latest-ref pattern: stable [] deps on pointer handlers, always calls current applyHoverLC
  const applyHoverLCRef     = useRef<(id: string | null) => void>(() => {});

  useEffect(() => { viewportRef.current = viewport; }, [viewport]);
  useEffect(() => { timelineOnRef.current = timelineOn; }, [timelineOn]);
  useEffect(() => { isDarkRef.current = isDark; }, [isDark]);

  useEffect(() => {
    if (mode !== "path") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPathA(null); setPathB(null); setPathResult(null); setPathNoRoute(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mode]);

  const schoolMap = useMemo(() => new Map(schools.map((s) => [s._id, s])), [schools]);

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
      const px = getNodePx(schoolMap.get(id), nodePos, dims);
      if (!px) continue;
      el.style.setProperty("--nx", `${px.x}px`);
      el.style.setProperty("--ny", `${px.y}px`);
    }
  }, [nodePos, dims, schoolMap]);

  // Push compare ring positions to DOM before paint
  useLayoutEffect(() => {
    [compareA, compareB].forEach((id, ci) => {
      const el = ringElsRef.current[ci];
      if (!el || !id) return;
      const px = getNodePx(schoolMap.get(id), nodePos, dims);
      if (!px) return;
      el.style.setProperty("--nx", `${px.x}px`);
      el.style.setProperty("--ny", `${px.y}px`);
    });
  }, [compareA, compareB, nodePos, dims, schoolMap]);

  // Push path source glow position to DOM before paint
  useLayoutEffect(() => {
    const el = pathGlowRef.current;
    if (!el || !pathA || mode !== "path") return;
    const px = getNodePx(schoolMap.get(pathA), nodePos, dims);
    if (!px) return;
    el.style.setProperty("--nx", `${px.x}px`);
    el.style.setProperty("--ny", `${px.y}px`);
  }, [pathA, mode, nodePos, dims, schoolMap]);

  useLayoutEffect(() => {
    const el = pathDestGlowRef.current;
    if (!el || !pathB || !pathResult || mode !== "path") return;
    const px = getNodePx(schoolMap.get(pathB), nodePos, dims);
    if (!px) return;
    el.style.setProperty("--nx", `${px.x}px`);
    el.style.setProperty("--ny", `${px.y}px`);
  }, [pathB, pathResult, mode, nodePos, dims, schoolMap]);

  const edges     = useMemo(() => buildEdges(schools), [schools]);

  useEffect(() => { nodePosRef.current = nodePos; }, [nodePos]);
  useEffect(() => {
    const adj = new Map<string, string[]>();
    const map = new Map<string, { fromId: string; toId: string }>();
    for (const edge of edges) {
      const key = `${edge.fromId}--${edge.toId}`;
      map.set(key, { fromId: edge.fromId, toId: edge.toId });
      for (const id of [edge.fromId, edge.toId]) {
        if (!adj.has(id)) adj.set(id, []);
        adj.get(id)!.push(key);
      }
    }
    lEdgeAdjRef.current = adj;
    lEdgeMapRef.current = map;
  }, [edges]);
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
    const visible = schools.filter(s => (s.startYear ?? -9999) <= scrubYear).sort((a, b) => (b.startYear ?? -9999) - (a.startYear ?? -9999));
    if (visible.length === 0) return;
    const px = getNodePx(visible[0], nodePos, dims);
    if (!px) return;
    setViewport(prev => ({ zoom: prev.zoom, panX: dims.w / 2 - px.x * prev.zoom, panY: dims.h / 2 - px.y * prev.zoom }));
  }, [scrubYear, timelineOn, nodePos, dims]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement).closest("[data-panel]")) return;
      e.preventDefault();
      activateWillChange();
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
      activateWillChange();
      const pts = [...activePointers.current.values()];
      pinchRef.current = { dist: Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y) };
      nodeDragRef.current = null; isDraggingRef.current = false; setIsDragging(false); setDraggingNodeId(null);
      return;
    }
    didDragRef.current = false;
    applyHoverLCRef.current(null);
    activateWillChange();
    const nodeEl = (e.target as HTMLElement).closest("[data-node]") as HTMLElement | null;
    if (nodeEl) {
      const id = nodeEl.dataset.node!;
      const pos = nodePosRef.current[id] ?? { x: 0, y: 0 };
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
      const newX = startDx + (rawDx / zoom / (dims.w * CANVAS_W_SCALE)) * 100;
      const newY = startDy + (rawDy / zoom / dims.h) * 100;
      nodePosRef.current = { ...nodePosRef.current, [id]: { x: newX, y: newY } };
      // Imperatively move node — no React re-render
      const nodeEl = nodeElsRef.current.get(id);
      if (nodeEl) {
        nodeEl.style.setProperty('--nx', `${(newX / 100) * dims.w * CANVAS_W_SCALE}px`);
        nodeEl.style.setProperty('--ny', `${(newY / 100) * dims.h}px`);
      }
      // Imperatively update only connected SVG paths — skips full SVG reconciliation
      for (const edgeKey of lEdgeAdjRef.current.get(id) ?? []) {
        const edgeMeta = lEdgeMapRef.current.get(edgeKey);
        if (!edgeMeta) continue;
        const fp = (() => { const p = nodePosRef.current[edgeMeta.fromId]; return p ? { x: (p.x / 100) * dims.w * CANVAS_W_SCALE, y: (p.y / 100) * dims.h } : null; })();
        const tp = (() => { const p = nodePosRef.current[edgeMeta.toId];   return p ? { x: (p.x / 100) * dims.w * CANVAS_W_SCALE, y: (p.y / 100) * dims.h } : null; })();
        if (!fp || !tp) continue;
        const curve = computeCurve(fp, tp);
        const d = organicPath(fp.x, fp.y, tp.x, tp.y, curve.dir, curve.mag);
        lGlowElsRef.current.get(edgeKey)?.setAttribute('d', d);
        lMainElsRef.current.get(edgeKey)?.setAttribute('d', d);
      }
      return;
    }
    if (isDraggingRef.current) {
      didDragRef.current = true;
      setViewport((prev) => ({ ...prev, panX: dragStart.current.panX + (e.clientX - dragStart.current.x), panY: dragStart.current.panY + (e.clientY - dragStart.current.y) }));
    }
  }, [dims]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    activePointers.current.delete(e.pointerId);
    if (activePointers.current.size < 2) pinchRef.current = null;
    if (activePointers.current.size === 0) {
      // Flush final drag position to React state once — triggers one re-render instead of 60+
      if (nodeDragRef.current && didDragRef.current) setNodePos({ ...nodePosRef.current });
      nodeDragRef.current = null; isDraggingRef.current = false; setIsDragging(false); setDraggingNodeId(null);
      if (transformRef.current) transformRef.current.style.willChange = "auto";
    }
  }, []);

  const handlePointerLeave = useCallback(() => {
    applyHoverLCRef.current(null);
    if (transformRef.current) transformRef.current.style.willChange = "auto";
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
    setSelectedId(null);
    // Clear hover imperatively (applyHoverLC declared later — inline to avoid TDZ)
    const prevId = hoveredIdRef.current;
    if (prevId) {
      nodeElsRef.current.get(prevId)?.removeAttribute("data-hovered");
      for (const cid of hoveredConnectedRef.current) nodeElsRef.current.get(cid)?.removeAttribute("data-connected");
      for (const [key] of lEdgeMapRef.current) {
        const g = lGlowElsRef.current.get(key); const mn = lMainElsRef.current.get(key);
        if (g) { g.style.opacity = ""; g.style.strokeWidth = ""; }
        if (mn) { mn.style.opacity = ""; mn.style.strokeWidth = ""; mn.style.stroke = ""; }
      }
      hoveredIdRef.current = null; hoveredConnectedRef.current = new Set();
      transformRef.current?.removeAttribute("data-has-hover");
      setHoveredSchool(null);
    }
    setMode(m);
  }, []);

  const animateViewportTo = useCallback((target: { zoom: number; panX: number; panY: number }) => {
    const el = transformRef.current;
    if (!el) return;
    el.style.transition = "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)";
    setViewport(target);
    setTimeout(() => { if (transformRef.current) transformRef.current.style.transition = ""; }, 750);
  }, []);

  const activateWillChange = useCallback(() => {
    const el = transformRef.current;
    if (!el) return;
    el.style.willChange = "transform";
    if (willChangeTimerRef.current) clearTimeout(willChangeTimerRef.current);
    willChangeTimerRef.current = setTimeout(() => {
      if (transformRef.current) transformRef.current.style.willChange = "auto";
      willChangeTimerRef.current = null;
    }, 300);
  }, []);

  const applyHoverLC = useCallback((id: string | null) => {
    const canvasEl = transformRef.current;
    if (!canvasEl) return;
    const prevId = hoveredIdRef.current;
    if (prevId) {
      const prevEl = nodeElsRef.current.get(prevId);
      if (prevEl) { prevEl.removeAttribute("data-hovered"); prevEl.style.zIndex = ""; }
      for (const connId of hoveredConnectedRef.current) nodeElsRef.current.get(connId)?.removeAttribute("data-connected");
      for (const [key] of lEdgeMapRef.current) {
        const g = lGlowElsRef.current.get(key); const m = lMainElsRef.current.get(key);
        if (g) { g.style.opacity = ""; g.style.strokeWidth = ""; }
        if (m) { m.style.opacity = ""; m.style.strokeWidth = ""; m.style.stroke = ""; }
      }
    }
    hoveredIdRef.current = id;
    if (!id) {
      hoveredConnectedRef.current = new Set();
      canvasEl.removeAttribute("data-has-hover");
      setHoveredSchool(null);
      return;
    }
    canvasEl.setAttribute("data-has-hover", "");
    const hovEl = nodeElsRef.current.get(id);
    if (hovEl) { hovEl.setAttribute("data-hovered", ""); hovEl.style.zIndex = "30"; }
    const connected = new Set<string>();
    const activeKeys = new Set(lEdgeAdjRef.current.get(id) ?? []);
    for (const edgeKey of activeKeys) {
      const meta = lEdgeMapRef.current.get(edgeKey); if (!meta) continue;
      const connId = meta.fromId === id ? meta.toId : meta.fromId;
      nodeElsRef.current.get(connId)?.setAttribute("data-connected", "");
      connected.add(connId);
      const dark = isDarkRef.current;
      const g = lGlowElsRef.current.get(edgeKey); const m = lMainElsRef.current.get(edgeKey);
      if (g) { g.style.opacity = "0.12"; g.style.strokeWidth = "4"; }
      if (m) { m.style.opacity = "0.55"; m.style.strokeWidth = "1.1"; m.style.stroke = dark ? "#ede8df" : "#1a1008"; }
    }
    for (const [key] of lEdgeMapRef.current) {
      if (activeKeys.has(key)) continue;
      const g = lGlowElsRef.current.get(key); const m = lMainElsRef.current.get(key);
      if (g) { g.style.opacity = "0.0"; }
      if (m) { m.style.opacity = "0.04"; }
    }
    hoveredConnectedRef.current = connected;
    setHoveredSchool(schoolMap.get(id) ?? null);
  }, [schoolMap]);

  // Keep applyHoverLCRef current so pointer handlers with [] deps always call the latest version
  useEffect(() => { applyHoverLCRef.current = applyHoverLC; }, [applyHoverLC]);

  // Cleanup will-change timer on unmount
  useEffect(() => () => { if (willChangeTimerRef.current) clearTimeout(willChangeTimerRef.current); }, []);

  useEffect(() => {
    for (const [id, el] of nodeElsRef.current) {
      if (id === selectedId) el.setAttribute("data-selected", "");
      else el.removeAttribute("data-selected");
    }
  }, [selectedId]);

  const centerOnNode = useCallback((schoolId: string) => {
    const px = getNodePx(schoolMap.get(schoolId), nodePos, dims);
    if (!px) return;
    animateViewportTo({ zoom: 1.0, panX: dims.w / 2 - px.x, panY: dims.h / 2 - px.y });
    setMode("explore");
    setCompareA(null); setCompareB(null);
    setTimeout(() => setSelectedId(schoolId), 80);
  }, [nodePos, dims, schoolMap, animateViewportTo]);

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
      // Explore hover dimming handled via CSS data-attrs (no React re-render on hover)
      isHighlighted = selectedId === schoolId;
    } else if (mode === "path") {
      if (pathResult) { isHighlighted = pathIds.has(schoolId); isDimmed = !isHighlighted; }
      else            { isHighlighted = pathA === schoolId; isDimmed = pathA !== null && pathA !== schoolId; }
    } else if (mode === "compare") {
      isHighlighted = compareA === schoolId || compareB === schoolId;
      isDimmed      = (compareA !== null || compareB !== null) && !isHighlighted;
    }
    const timelineFade = timelineOn && (schoolMap.get(schoolId)?.startYear ?? -500) > scrubYear;
    return { isDimmed, isHighlighted, timelineFade };
  }, [mode, selectedId, pathResult, pathIds, pathA, timelineOn, scrubYear, compareA, compareB, schoolMap]);

  const getEdgeVisual = useCallback((_fromId: string, _toId: string, key: string) => {
    // Explore mode edge hover handled imperatively by applyHoverLC — no React state needed
    if (mode === "path" && pathResult) {
      const active = pathEdgeKeys.has(key);
      return { active, dimmed: !active };
    }
    return { active: false, dimmed: false };
  }, [mode, pathResult, pathEdgeKeys]);

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
  const pathSourceNode  = mode === "path" && pathA ? getNodePx(schoolMap.get(pathA), nodePos, dims) : null;
  const pathDestNode    = mode === "path" && pathB && pathResult ? getNodePx(schoolMap.get(pathB), nodePos, dims) : null;

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label="Philosophy school lineage canvas"
      className={`parchment-bg fixed inset-0 overflow-hidden select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
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
      {/* Mode toolbar */}
      <div className="fixed top-16 md:top-5 left-4 md:left-[104px] flex items-center flex-wrap gap-1.5 z-25 pointer-events-auto">
        {(["explore", "path", "compare"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`px-3 py-1 rounded-full border cursor-pointer backdrop-blur-[12px] transition-[color,background-color,border-color] duration-200 font-sans text-xs md:text-[10px] font-medium tracking-widest ${
              mode === m
                ? "bg-amber-600 dark:bg-amber-400 text-white border-amber-600 dark:border-amber-400 shadow-[0_2px_12px_rgba(196,112,41,0.28)]"
                : "bg-stone-50/96 dark:bg-stone-900/96 text-slate-500 dark:text-stone-400 border-zinc-200 dark:border-zinc-700 shadow-[0_1px_4px_rgba(17,21,26,0.06)]"
            }`}
          >
            {MODE_LABELS[m]}
          </button>
        ))}

        <div className="w-px h-[18px] bg-zinc-200 dark:bg-zinc-700 mx-[3px]" />

        <button
          onClick={() => setShowQuiz(true)}
          className="px-3 py-1 rounded-full border border-amber-800/25 dark:border-amber-600/25 cursor-pointer backdrop-blur-[12px] transition-[color,background-color] duration-200 font-sans text-xs md:text-[10px] font-medium tracking-widest bg-stone-50/96 dark:bg-stone-900/96 text-amber-600 dark:text-amber-400 shadow-[0_1px_4px_rgba(17,21,26,0.06)] hover:bg-amber-600 dark:hover:bg-amber-400 hover:text-white"
        >
          Find My School
        </button>

        <div className="w-px h-[18px] bg-zinc-200 dark:bg-zinc-700 mx-[3px]" />

        <button
          onClick={() => { const next = !timelineOn; setTimelineOn(next); if (next) setScrubYear(-500); }}
          className={`px-3 py-1 rounded-full border cursor-pointer backdrop-blur-[12px] transition-[color,background-color,border-color] duration-200 font-sans text-xs font-medium tracking-widest shadow-[0_1px_4px_rgba(17,21,26,0.06)] ${
            timelineOn
              ? "bg-slate-500/12 text-slate-500 border-slate-500"
              : "bg-stone-50/96 dark:bg-stone-900/96 text-slate-500 dark:text-stone-400 border-zinc-200 dark:border-zinc-700"
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
            className={`fixed top-[122px] md:top-[70px] left-1/2 -translate-x-1/2 backdrop-blur-[20px] rounded-md z-[25] max-w-[80vw] shadow-[0_8px_40px_rgba(17,21,26,0.10)] border ${
              pathNoRoute
                ? "bg-stone-50/98 dark:bg-stone-900/98 border-red-800/20 border-t-[3px] border-t-red-800"
                : "bg-stone-50/98 dark:bg-stone-900/98 border-zinc-200 dark:border-zinc-700 border-t-[3px] border-t-ink"
            }`}
          >
            {pathNoRoute ? (
              <div className="px-5 py-3 font-sans text-xs text-red-600">
                No connection found between those two schools.
              </div>
            ) : pathResult && (
              <>
                <div className="px-5 pt-2.5 pb-2 border-b border-amber-800/8 dark:border-amber-600/8 flex items-center gap-2.5">
                  <span className="font-sans text-xs font-medium tracking-widest text-amber-800/60 dark:text-amber-600/60">Influence Path</span>
                  <span className="font-sans text-xs text-zinc-950/35 dark:text-stone-100/35 tracking-[0.1em]">
                    {pathResult.length - 1} {pathResult.length - 1 === 1 ? "step" : "steps"}
                  </span>
                </div>
                <div className="px-5 py-3 flex items-stretch">
                  {pathResult.map((id, i) => {
                    const school = schoolMap.get(id);
                    const year   = school?.startYear;
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
                          className="bg-transparent border-none cursor-pointer px-2.5 py-1.5 rounded-sm text-left transition-[background] duration-150 hover:bg-zinc-950/5 dark:hover:bg-stone-100/5"
                        >
                          <div className="flex items-center gap-1.5 mb-[3px]">
                            <div className="w-[6px] h-[6px] rounded-full shrink-0 bg-zinc-950/40 dark:bg-stone-100/40" />
                            <span className="font-serif italic text-sm text-zinc-950 dark:text-stone-100 whitespace-nowrap">{school?.title}</span>
                          </div>
                          {year !== undefined && (
                            <div className="font-sans text-xs tracking-widest pl-3 text-slate-500 dark:text-stone-400">
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
      <div className="hidden md:block absolute top-6 right-9 pointer-events-none z-5 text-right">
        <div className="font-serif italic text-2xl font-medium text-zinc-950/25 dark:text-stone-100/25 tracking-[-0.015em] leading-none">
          The Living Manuscript
        </div>
      </div>

      {/* Main transform layer — CSS vars set via useLayoutEffect */}
      <div
        ref={transformRef}
        className={`absolute inset-0 origin-top-left transform-[translate(var(--tx),var(--ty))_scale(var(--s))] ${
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
            const fp = getNodePx(schoolMap.get(edge.fromId), nodePos, dims);
            const tp = getNodePx(schoolMap.get(edge.toId),   nodePos, dims);
            if (!fp || !tp) return null;
            const key   = `${edge.fromId}--${edge.toId}`;
            const curve = computeCurve(fp, tp);
            const { active, dimmed } = getEdgeVisual(edge.fromId, edge.toId, key);
            const d = organicPath(fp.x, fp.y, tp.x, tp.y, curve.dir, curve.mag);
            const timelineDim = (timelineOn && (schoolMap.get(edge.fromId)?.startYear ?? -500) > scrubYear)
                             || (timelineOn && (schoolMap.get(edge.toId)?.startYear   ?? -500) > scrubYear);
            return (
              <g key={key} className={`transition-opacity duration-500 ${timelineDim ? "opacity-[0.04]" : "opacity-100"}`}>
                <path d={d} fill="none" stroke={isDark ? "#c4a060" : "#3d2a10"} strokeWidth={active ? 4 : 2.5}
                  opacity={dimmed ? 0.0 : active ? 0.12 : 0.05}
                  ref={(el) => { if (el) lGlowElsRef.current.set(key, el); }}
                  filter="url(#constellation-glow)" className="transition-opacity duration-[350ms]" />
                <path d={d} fill="none" stroke={isDark ? (active ? "#ede8df" : "#9a8a70") : (active ? "#1a1008" : "#3d3020")}
                  strokeWidth={active ? 1.1 : 0.55}
                  opacity={dimmed ? 0.04 : active ? 0.55 : 0.20}
                  ref={(el) => { if (el) lMainElsRef.current.set(key, el); }}
                  className="transition-[opacity,stroke-width] duration-[350ms]" />
              </g>
            );
          })}
        </svg>

        {/* Compare selection rings */}
        {[compareA, compareB].map((id, ci) => {
          if (!id) return null;
          const px = getNodePx(schoolMap.get(id), nodePos, dims);
          if (!px) return null;
          return (
            <motion.div
              key={`compare-ring-${id}-${ci}`}
              ref={(el: HTMLDivElement | null) => { ringElsRef.current[ci] = el; }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`absolute left-(--nx) top-(--ny) w-[70px] h-[70px] -ml-[35px] -mt-[35px] rounded-full pointer-events-none z-4 ${
                ci === 0
                  ? "border-2 border-zinc-950 dark:border-stone-100 shadow-[0_0_20px_rgba(17,21,26,0.18)]"
                  : "border-2 border-zinc-950/50 dark:border-stone-100/50 shadow-[0_0_20px_rgba(17,21,26,0.09)]"
              }`}
            />
          );
        })}

        {/* Path source pulse ring */}
        {pathSourceNode && pathA && (
          <motion.div
            key={`path-source-${pathA}`}
            ref={(el: HTMLDivElement | null) => { pathGlowRef.current = el; }}
            className="absolute left-(--nx) top-(--ny) w-[80px] h-[80px] -ml-[40px] -mt-[40px] rounded-full border-2 border-zinc-950 dark:border-stone-100 opacity-40 pointer-events-none z-4"
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.25, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {/* Path destination ring */}
        {pathDestNode && pathB && (
          <motion.div
            key={`path-dest-${pathB}`}
            ref={(el: HTMLDivElement | null) => { pathDestGlowRef.current = el; }}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.45 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-(--nx) top-(--ny) w-[80px] h-[80px] ml-[-40px] mt-[-40px] rounded-full border-2 border-zinc-950 dark:border-stone-100 pointer-events-none z-4"
          />
        )}

        {/* School nodes — hover visuals driven by CSS data-* attrs set in applyHoverLC */}
        {schools.map((school) => {
          const { isDimmed, isHighlighted, timelineFade } = getNodeVisual(school._id);
          const isSelected     = mode === "explore" && selectedId === school._id;
          const tagline        = school.tagline ?? "";
          const isBeingDragged = draggingNodeId === school._id;
          const labelLeft      = (school.networkX ?? 50) > LABEL_LEFT_THRESHOLD;

          const connections   = school.influencedBy.length + school.influencedTo.length;
          const influenceMult = 0.88 + Math.min((connections - 1) / 3, 1) * 0.28;
          const R             = Math.min(10, Math.max(5, Math.round(6 * influenceMult)));
          const schoolYear    = formatSchoolYear(school.startYear);

          return (
            <div
              key={school._id}
              ref={(el) => { if (el) nodeElsRef.current.set(school._id, el); else nodeElsRef.current.delete(school._id); }}
              data-node={school._id}
              role="button"
              tabIndex={0}
              aria-label={school.title}
              aria-pressed={mode === "explore" ? isSelected : undefined}
              className={`group absolute left-(--nx) top-(--ny) w-0 h-0 select-none focus-visible:outline-none opacity-100 ${
                isBeingDragged ? "cursor-grabbing" : "cursor-grab"
              } ${isHighlighted || isBeingDragged ? "z-30" : "z-10"} ${
                timelineFade ? "opacity-[0.05]" : isDimmed ? "opacity-[0.14]" : ""
              }`}
              onPointerEnter={() => { if (!nodeDragRef.current && mode === "explore") applyHoverLC(school._id); }}
              onPointerLeave={() => { if (!nodeDragRef.current) applyHoverLC(null); }}
              onClick={(e) => handleNodeClick(school._id, e)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.currentTarget.click(); } }}
            >
              {/* Node dot — all states (hover/selected) driven by CSS data-* attrs, no React conditionals */}
              <div data-lc-dot
                className={`absolute rounded-full z-1 border group-focus-visible:ring-2 group-focus-visible:ring-amber-800 dark:group-focus-visible:ring-amber-600 group-focus-visible:ring-offset-1 ${NODE_CIRCLE_CLS[R]} bg-stone-950 border-stone-950/28 shadow-[0_1px_6px_rgba(17,21,26,0.14)]`}
              />

              {/* Label — all states (hover/selected) driven by CSS data-* attrs */}
              <div className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap pointer-events-none ${
                labelLeft ? `text-right ${LABEL_RIGHT_CLS[R]}` : `text-left ${LABEL_LEFT_CLS[R]}`
              }`}>
                <div data-lc-label-title className="font-serif italic leading-tight tracking-[-0.01em] [transition:color_0.25s,font-size_0.25s] text-xl font-normal text-zinc-950/80 dark:text-stone-100/80">
                  {school.title}
                </div>
                {tagline && (
                  <div data-lc-label-tag className="font-sans font-bold tracking-widest uppercase mt-[3px] text-xs text-slate-500 dark:text-stone-400 opacity-60 [transition:opacity_0.25s,color_0.25s]">
                    {tagline}
                  </div>
                )}
                {schoolYear && (
                  <div data-lc-label-year className="font-serif italic mt-0.5 text-xs text-zinc-950/55 dark:text-stone-100/55 opacity-0 [transition:opacity_0.25s]">
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
            className="fixed bottom-[154px] md:bottom-[90px] left-0 md:left-20 right-0 px-6 md:px-12 py-3 bg-stone-50/96 dark:bg-stone-900/96 backdrop-blur-[14px] border-t border-zinc-100 dark:border-zinc-800 z-19 flex items-center gap-5 pointer-events-auto"
          >
            <div className="font-sans text-xs md:text-[10px] font-medium tracking-widest text-slate-500 dark:text-stone-400 whitespace-nowrap">Timeline</div>
            <div className="font-serif italic text-xs text-amber-800 dark:text-amber-600 whitespace-nowrap min-w-[72px]">
              {formatHistoryYear(scrubYear)}
            </div>
            <div className="flex-1 relative">
              <input
                type="range" min={-500} max={CURRENT_YEAR} step={1} value={scrubYear}
                aria-label="Timeline year selector"
                onChange={(e) => setScrubYear(Number(e.target.value))}
                className="w-full accent-amber-600 dark:accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between mt-[3px] pointer-events-none">
                {[-500, 0, 500, 1000, 1500, CURRENT_YEAR].map((y) => (
                  <span key={y} className="font-sans text-xs text-slate-500/60 dark:text-stone-400/60">
                    {y < 0 ? `${Math.abs(y)} BC` : y === 0 ? "AD 1" : y === CURRENT_YEAR ? "Now" : y}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => setScrubYear(CURRENT_YEAR)}
              className="px-2.5 py-1 bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-sm cursor-pointer font-sans text-xs md:text-[10px] font-medium tracking-widest text-slate-500 dark:text-stone-400"
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
            className="fixed bottom-[120px] md:bottom-[88px] left-4 right-4 md:left-auto md:right-4 md:w-[290px] bg-stone-50/98 dark:bg-stone-900/98 backdrop-blur-[28px] rounded-md px-5 pt-4 pb-4 shadow-[0_4px_6px_rgba(26,28,25,0.04),0_16px_48px_rgba(26,28,25,0.13)] border border-zinc-200 dark:border-zinc-700 border-t-2 border-t-zinc-950 dark:border-t-stone-100 pointer-events-none z-50"
          >
            <div className="inline-block font-sans text-xs md:text-[10px] font-medium tracking-widest text-slate-500 dark:text-stone-400 bg-zinc-950/5 dark:bg-stone-100/5 border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 rounded-xs mb-2">
              {hoveredSchool.eraRange}
            </div>
            <div className="font-serif text-base font-medium text-zinc-950 dark:text-stone-100 leading-tight mb-1.5">
              {hoveredSchool.title}
            </div>
            <div className="flex items-center gap-1.5 mb-2">
              <div className="flex-1 h-px bg-linear-to-r from-[rgba(17,21,26,0.12)] to-transparent" />
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <circle cx="5" cy="5" r="1.5" fill="rgba(17,21,26,0.3)" />
                <circle cx="5" cy="5" r="4" stroke="rgba(17,21,26,0.15)" strokeWidth="0.75" fill="none" />
              </svg>
              <div className="flex-1 h-px bg-linear-to-l from-[rgba(17,21,26,0.12)] to-transparent" />
            </div>
            <p className="font-sans text-xs leading-relaxed text-slate-500 dark:text-stone-400 mb-3 line-clamp-3">
              {hoveredSchool.description}
            </p>
            {(hoveredSchool.influencedBy.length > 0 || hoveredSchool.influencedTo.length > 0) && (
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-1.5">
                {hoveredSchool.influencedBy.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(17,21,26,0.35)" strokeWidth="2.5" aria-hidden="true">
                      <path d="M19 12H5m6 7-7-7 7-7" />
                    </svg>
                    <span className="font-sans text-xs text-slate-500 dark:text-stone-400 tracking-[0.04em]">
                      {hoveredSchool.influencedBy.map(t => t.title).join(" · ")}
                    </span>
                  </div>
                )}
                {hoveredSchool.influencedTo.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(17,21,26,0.35)" strokeWidth="2.5" aria-hidden="true">
                      <path d="M5 12h14m-6-7 7 7-7 7" />
                    </svg>
                    <span className="font-sans text-xs text-slate-500 dark:text-stone-400 tracking-[0.04em]">
                      {hoveredSchool.influencedTo.map(t => t.title).join(" · ")}
                    </span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom instruction bar */}
      <div className="fixed bottom-[64px] md:bottom-0 left-0 md:left-20 right-0 px-6 md:px-12 py-3 md:py-4 flex gap-7 md:gap-13 items-center border-t border-zinc-100 dark:border-zinc-800 bg-stone-50/96 dark:bg-stone-900/96 backdrop-blur-[14px] z-19 pointer-events-none">
        {modeHints[mode].map(({ action, label }) => (
          <div key={action}>
            <div className="font-sans text-xs md:text-[10px] font-medium tracking-widest text-slate-500 dark:text-stone-400 mb-1">{action}</div>
            <div className="font-serif italic text-sm text-zinc-950 dark:text-stone-100">{label}</div>
          </div>
        ))}
        <div className="ml-auto font-sans text-xs md:text-[10px] font-medium tracking-widest text-slate-500 dark:text-stone-400 opacity-40">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Chapter panel */}
      {mode === "explore" && (
        <SchoolChapterPanel
          school={selectedId ? (schools.find((s) => s._id === selectedId) ?? null) : null}
          allSchools={schools}
          onClose={() => setSelectedId(null)}
          onNavigate={centerOnNode}
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
