import { useState, useEffect, useRef } from "react";
import type { Note, Edge, Position } from "@/components/my-notes/types";

const MAX_ITER  = 120;
const SETTLE_SQ = 0.09;
const THETA     = 0.9; // Barnes-Hut: treat cluster as point when s/d < THETA

type QBody = { id: string; x: number; y: number };
type QNode = {
  minX: number; minY: number; size: number;
  cmX: number; cmY: number; mass: number;
  leaf: QBody | null;
  nw: QNode | null; ne: QNode | null; sw: QNode | null; se: QNode | null;
};

function makeNode(minX: number, minY: number, size: number): QNode {
  return { minX, minY, size, cmX: 0, cmY: 0, mass: 0, leaf: null, nw: null, ne: null, sw: null, se: null };
}

function insertBody(node: QNode, id: string, x: number, y: number): void {
  if (node.mass === 0) {
    node.leaf = { id, x, y };
    node.cmX = x; node.cmY = y; node.mass = 1;
    return;
  }
  node.cmX = (node.cmX * node.mass + x) / (node.mass + 1);
  node.cmY = (node.cmY * node.mass + y) / (node.mass + 1);
  node.mass++;
  if (node.leaf !== null) {
    const ex = node.leaf; node.leaf = null;
    placeInChild(node, ex.id, ex.x, ex.y);
  }
  placeInChild(node, id, x, y);
}

function placeInChild(node: QNode, id: string, x: number, y: number): void {
  const half = node.size / 2;
  const midX = node.minX + half, midY = node.minY + half;
  if (x < midX) {
    if (y < midY) { if (!node.nw) node.nw = makeNode(node.minX, node.minY, half); insertBody(node.nw, id, x, y); }
    else          { if (!node.sw) node.sw = makeNode(node.minX, midY, half);       insertBody(node.sw, id, x, y); }
  } else {
    if (y < midY) { if (!node.ne) node.ne = makeNode(midX, node.minY, half); insertBody(node.ne, id, x, y); }
    else          { if (!node.se) node.se = makeNode(midX, midY, half);      insertBody(node.se, id, x, y); }
  }
}

function bhForce(node: QNode, id: string, x: number, y: number, rep: number, out: { fx: number; fy: number }): void {
  if (node.mass === 0) return;
  const dx = x - node.cmX, dy = y - node.cmY;
  const d2 = dx * dx + dy * dy + 1, d = Math.sqrt(d2);
  if (node.leaf !== null) {
    if (node.leaf.id === id) return;
    const f = rep / d2; out.fx += dx / d * f; out.fy += dy / d * f;
    return;
  }
  if (node.size / d < THETA) {
    const f = rep * node.mass / d2; out.fx += dx / d * f; out.fy += dy / d * f;
    return;
  }
  if (node.nw) bhForce(node.nw, id, x, y, rep, out);
  if (node.ne) bhForce(node.ne, id, x, y, rep, out);
  if (node.sw) bhForce(node.sw, id, x, y, rep, out);
  if (node.se) bhForce(node.se, id, x, y, rep, out);
}

export function useForce(nodes: Note[], edges: Edge[]) {
  const pos   = useRef<Record<string, Position>>({});
  const vel   = useRef<Record<string, Position>>({});
  const [positions, setPositions] = useState<Record<string, Position>>({});
  const iter  = useRef(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    nodes.forEach(n => {
      if (!pos.current[n.id]) {
        const a = Math.random() * Math.PI * 2, r = 60 + Math.random() * 140;
        pos.current[n.id] = { x: Math.cos(a) * r, y: Math.sin(a) * r };
        vel.current[n.id] = { x: 0, y: 0 };
      }
    });
    iter.current = 0;
    const run = () => {
      if (iter.current++ > MAX_ITER) { if (frame.current) cancelAnimationFrame(frame.current); return; }
      const P = pos.current, V = vel.current;

      let hi = 0;
      nodes.forEach(n => { const p = P[n.id]; if (p) hi = Math.max(hi, Math.abs(p.x), Math.abs(p.y)); });
      const origin = hi + 1;
      const root = makeNode(-origin, -origin, origin * 2);
      nodes.forEach(n => { const p = P[n.id]; if (p) insertBody(root, n.id, p.x, p.y); });

      let maxVelSq = 0;
      const out = { fx: 0, fy: 0 };
      nodes.forEach(a => {
        const pa = P[a.id]; if (!pa) return;
        out.fx = 0; out.fy = 0;
        bhForce(root, a.id, pa.x, pa.y, 5000, out);
        let fx = out.fx, fy = out.fy;
        edges.forEach(e => {
          const oid = e.from === a.id ? e.to : e.to === a.id ? e.from : null;
          if (!oid || !P[oid]) return;
          const dx = P[oid].x - pa.x, dy = P[oid].y - pa.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          const f = (d - 160) * 0.02; fx += dx / d * f; fy += dy / d * f;
        });
        fx -= pa.x * 0.035; fy -= pa.y * 0.035;
        if (!V[a.id]) V[a.id] = { x: 0, y: 0 };
        V[a.id].x = (V[a.id].x + fx) * 0.55; V[a.id].y = (V[a.id].y + fy) * 0.55;
        P[a.id].x += V[a.id].x; P[a.id].y += V[a.id].y;
        const vSq = V[a.id].x ** 2 + V[a.id].y ** 2;
        if (vSq > maxVelSq) maxVelSq = vSq;
      });
      setPositions({ ...pos.current });
      if (maxVelSq < SETTLE_SQ) return;
      frame.current = requestAnimationFrame(run);
    };
    frame.current = requestAnimationFrame(run);
    return () => { if (frame.current) cancelAnimationFrame(frame.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.map(n => n.id).join(","), edges.length]);

  return positions;
}
