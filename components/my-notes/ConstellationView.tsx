"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import type { Note, Tag, Edge } from "./types";
import { useForce } from "@/lib/hooks/useForce";
import { tagStyle, wc, timeAgo } from "./utils";

const CONSTELLATION_LIMIT = 80;

export function ConstellationView({ notes, onOpen, tags }: { notes: Note[]; onOpen: (id: string) => void; tags: Tag[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dim, setDim] = useState({ w: 800, h: 600 });
  const [hov, setHov] = useState<string | null>(null);

  const visible = notes.length > CONSTELLATION_LIMIT ? notes.slice(0, CONSTELLATION_LIMIT) : notes;

  const edges = useMemo(() => {
    const e: Edge[] = [];
    visible.forEach(n => (n.links ?? []).forEach(lid => { if (visible.find(x => x.id === lid)) e.push({ from: n.id, to: lid }); }));
    return e;
  }, [visible]);
  const positions = useForce(visible, edges);

  useEffect(() => {
    const ob = new ResizeObserver(([e]) => setDim({ w: e.contentRect.width, h: e.contentRect.height }));
    if (svgRef.current?.parentElement) ob.observe(svgRef.current.parentElement);
    return () => ob.disconnect();
  }, []);

  const cx = dim.w / 2, cy = dim.h / 2;
  const hovNote = hov ? visible.find(n => n.id === hov) : null;

  return (
    <div className="flex-1 overflow-hidden bg-[#0f0d0a] relative">
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <circle key={i} cx={`${(i * 137.5) % 100}%`} cy={`${(i * 97.3) % 100}%`} r={i % 3 === 0 ? 1 : .5} fill={`rgba(255,255,240,${.04 + .08 * ((i * 7) % 10) / 10})`} />
        ))}
      </svg>
      {visible.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 text-center p-10">
          <div className="font-cormorant text-[20px] italic text-[rgba(255,255,220,.3)] leading-[1.6] max-w-[340px]">Write notes and link them to watch your constellation form</div>
        </div>
      )}
      <svg ref={svgRef} className="w-full h-full cursor-default" overflow="visible">
        <defs>
          <filter id="mn-glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        {edges.map((e, i) => { const a = positions[e.from], b = positions[e.to]; if (!a || !b) return null; return <line key={i} x1={cx+a.x} y1={cy+a.y} x2={cx+b.x} y2={cy+b.y} stroke="rgba(212,168,67,.22)" strokeWidth={1} strokeDasharray="4 6" />; })}
        {visible.map(n => {
          const p = positions[n.id]; if (!p) return null;
          const x = cx + p.x, y = cy + p.y, isHov = hov === n.id;
          const s = tagStyle(n.tags?.[0] ?? "", tags);
          return (
            <g key={n.id} transform={`translate(${x},${y})`} onClick={() => onOpen(n.id)} onMouseEnter={() => setHov(n.id)} onMouseLeave={() => setHov(null)} className="cursor-pointer">
              {isHov && <circle r={22} className={`${s.fill} opacity-10`} />}
              <circle r={isHov ? 9 : 5.5} className={`${isHov ? "fill-yellow-300" : s.fill} [transition:r_.2s]`} filter="url(#mn-glow)" />
              {(n.links ?? []).length > 0 && <circle r={3} className="fill-(--mn-link) opacity-70" />}
            </g>
          );
        })}
        {hovNote && (() => {
          const p = positions[hovNote.id]; if (!p) return null;
          const px = cx + p.x, py = cy + p.y;
          const x = (px + dim.w / 2 > dim.w * 0.7) ? px - 216 : px + 16;
          const y = Math.min(py - 10, dim.h - 130);
          const preview = (hovNote.body ?? "").replace(/[#>*[\]]/g, "").replace(/\n/g, " ").slice(0, 120);
          return (
            <foreignObject key="tooltip" x={x} y={y} width={200} height={140}>
              <div className="bg-[rgba(15,13,10,.92)] border border-[rgba(212,168,67,.25)] rounded-[4px] px-[14px] py-3 pointer-events-none shadow-[0_8px_28px_rgba(0,0,0,.4)]">
                {hovNote.title && <div className="font-cinzel text-[10px] text-[rgba(212,168,67,.9)] mb-[6px]">{hovNote.title}</div>}
                {preview && <div className="font-cormorant text-[13.5px] italic text-[rgba(255,255,220,.55)] leading-[1.6]">{preview}{(hovNote.body ?? "").length > 120 ? "…" : ""}</div>}
                <div className="mt-[6px] text-[9px] text-[rgba(212,168,67,.35)] font-cinzel">{wc(hovNote.body ?? "")} words · {timeAgo(hovNote.updatedAt)}</div>
              </div>
            </foreignObject>
          );
        })()}
      </svg>
      <div className="absolute bottom-4 left-0 right-0 flex gap-4 justify-center pointer-events-none">
        <div className="font-cinzel text-[8.5px] tracking-[.14em] text-[rgba(212,168,67,.35)]">
          {notes.length > CONSTELLATION_LIMIT
            ? `${CONSTELLATION_LIMIT} of ${notes.length} THOUGHTS · ${edges.length} CONNECTIONS`
            : `${notes.length} THOUGHTS · ${edges.length} CONNECTIONS`}
        </div>
      </div>
    </div>
  );
}
