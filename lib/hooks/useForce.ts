import { useState, useEffect, useRef } from "react";
import type { Note, Edge, Position } from "@/components/my-notes/types";

const MAX_ITER  = 120;
const SETTLE_SQ = 0.09; // stop when every node's velocity² < 0.09 (i.e. speed < 0.3 px/frame)

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
      let maxVelSq = 0;
      nodes.forEach(a => {
        let fx = 0, fy = 0;
        nodes.forEach(b => {
          if (a.id === b.id) return;
          const dx = (P[a.id]?.x ?? 0) - (P[b.id]?.x ?? 0);
          const dy = (P[a.id]?.y ?? 0) - (P[b.id]?.y ?? 0);
          const d2 = dx * dx + dy * dy + 1, d = Math.sqrt(d2);
          const f  = 5000 / d2; fx += dx / d * f; fy += dy / d * f;
        });
        edges.forEach(e => {
          const oid = e.from === a.id ? e.to : e.to === a.id ? e.from : null;
          if (!oid || !P[oid]) return;
          const dx = P[oid].x - (P[a.id]?.x ?? 0);
          const dy = P[oid].y - (P[a.id]?.y ?? 0);
          const d  = Math.sqrt(dx * dx + dy * dy) || 1, tgt = 160;
          const f  = (d - tgt) * 0.02; fx += dx / d * f; fy += dy / d * f;
        });
        fx -= (P[a.id]?.x ?? 0) * 0.035; fy -= (P[a.id]?.y ?? 0) * 0.035;
        if (!V[a.id]) V[a.id] = { x: 0, y: 0 };
        V[a.id].x = (V[a.id].x + fx) * 0.55; V[a.id].y = (V[a.id].y + fy) * 0.55;
        if (!P[a.id]) P[a.id] = { x: 0, y: 0 };
        P[a.id].x += V[a.id].x; P[a.id].y += V[a.id].y;
        const vSq = V[a.id].x * V[a.id].x + V[a.id].y * V[a.id].y;
        if (vSq > maxVelSq) maxVelSq = vSq;
      });
      setPositions({ ...pos.current });
      if (maxVelSq < SETTLE_SQ) return; // graph has settled — skip remaining budget
      frame.current = requestAnimationFrame(run);
    };
    frame.current = requestAnimationFrame(run);
    return () => { if (frame.current) cancelAnimationFrame(frame.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.map(n => n.id).join(","), edges.length]);

  return positions;
}
