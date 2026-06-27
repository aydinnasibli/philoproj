"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import type { SchoolWithPhilosophers } from "@/lib/types";

interface Props {
  schoolA: SchoolWithPhilosophers | null;
  schoolB: SchoolWithPhilosophers | null;
  onClose: () => void;
}

type ColumnColors = {
  acText:    string;
  acBg:      string;
  a14Bg:     string;
  a18Bg:     string;
  a30Border: string;
  a40Border: string;
};

const COMPARISON_COLORS: Record<"left" | "right", ColumnColors> = {
  left: {
    acText:    "text-zinc-700 dark:text-zinc-400",
    acBg:      "bg-zinc-700 dark:bg-zinc-400",
    a14Bg:     "bg-zinc-700/8 dark:bg-zinc-400/8",
    a18Bg:     "bg-zinc-700/9 dark:bg-zinc-400/9",
    a30Border: "border-zinc-700/19 dark:border-zinc-400/19",
    a40Border: "border-zinc-700/25 dark:border-zinc-400/25",
  },
  right: {
    acText:    "text-zinc-500",
    acBg:      "bg-zinc-500",
    a14Bg:     "bg-zinc-500/8",
    a18Bg:     "bg-zinc-500/9",
    a30Border: "border-zinc-500/19",
    a40Border: "border-zinc-500/25",
  },
};

function formatYear(y: number): string {
  if (y < 0) return `${Math.abs(y)} BC`;
  return `AD ${y}`;
}

function EmptyColumn({ label }: { label: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-2.5 px-8 py-6">
      <div className="w-10 h-10 rounded-full border-[1.5px] border-dashed border-zinc-700/25 dark:border-zinc-500/25 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-zinc-700/20 dark:bg-zinc-500/20" />
      </div>
      <span className="font-serif italic text-sm text-zinc-950/30 dark:text-stone-100/30">{label}</span>
    </div>
  );
}

function SchoolColumn({
  school,
  side,
  comparison,
}: {
  school: SchoolWithPhilosophers | null;
  side: "left" | "right";
  comparison: "left" | "right";
}) {
  const c = COMPARISON_COLORS[comparison];

  if (!school) {
    return (
      <div className="flex-1">
        <EmptyColumn label={side === "left" ? "Select first school on map" : "Select second school on map"} />
      </div>
    );
  }

  return (
    <div className={`flex-1 overflow-y-auto px-7 py-5 ${side === "left" ? "border-r border-r-zinc-950/7 dark:border-r-stone-100/7" : ""}`}>

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-3">
          <div className={`inline-block font-cinzel text-[0.6rem] tracking-widest uppercase ${c.acText} ${c.a14Bg} border ${c.a30Border} px-2 py-0.5 rounded-xs mb-2`}>
            {school.eraRange}
          </div>
          <Link
            href={`/schools/${school.slug}`}
            className="block font-serif text-2xl italic text-zinc-950 dark:text-stone-100 leading-tight font-normal m-0 hover:text-zinc-700 dark:hover:text-zinc-400 transition-colors duration-150"
          >
            {school.title}
          </Link>
          {school.tagline && (
            <p className={`font-sans text-xs font-medium tracking-widest mt-1.5 ${c.acText} opacity-70`}>
              {school.tagline}
            </p>
          )}
        </div>
        <div className={`w-7 h-7 rounded-full ${c.a18Bg} border ${c.a40Border} flex items-center justify-center shrink-0 mt-1`}>
          <div className={`w-[7px] h-[7px] rounded-full ${c.acBg} opacity-70`} />
        </div>
      </div>

      {/* Founding year */}
      {school.startYear != null && (
        <div className="flex items-center gap-1.5 mb-3">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-950/30 dark:text-stone-100/30 shrink-0">
            <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          <span className="font-sans text-xs text-slate-500 dark:text-stone-400">
            Founded <span className={`font-semibold ${c.acText}`}>{formatYear(school.startYear)}</span>
          </span>
        </div>
      )}

      <div className="h-px bg-linear-to-r from-zinc-950/8 dark:from-stone-100/8 mb-3" />

      {/* Description */}
      <p className="font-serif text-[0.9375rem] leading-loose text-slate-500 dark:text-stone-400 mb-4">
        {school.description}
      </p>

      {/* Core ideas */}
      {school.coreIdeas.length > 0 && (
        <div className="mb-4">
          <div className="font-sans text-xs font-medium tracking-widest text-slate-500 dark:text-stone-400 mb-2.5">Core Ideas</div>
          <div className="flex flex-col gap-1.5">
            {school.coreIdeas.map((idea, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className={`w-[3px] h-[3px] rounded-full ${c.acBg} opacity-60 mt-1.5 shrink-0`} />
                <span className="font-serif text-[0.9375rem] leading-[1.65] text-slate-500 dark:text-stone-400">{idea}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key thinkers */}
      {school.philosophers.length > 0 && (
        <div className="mb-4">
          <div className="font-sans text-xs font-medium tracking-widest text-slate-500 dark:text-stone-400 mb-2.5">
            Key Thinkers <span className="font-normal normal-case tracking-normal opacity-60">({school.philosophers.length})</span>
          </div>
          <div className="flex flex-col gap-2">
            {school.philosophers.map(p => (
              <Link
                key={p._id}
                href={`/philosophers/${p.slug}`}
                className="flex items-center gap-2.5 bg-zinc-950/3 dark:bg-stone-100/3 border border-zinc-950/8 dark:border-stone-100/8 rounded-md px-3 py-2 hover:bg-zinc-950/7 dark:hover:bg-stone-100/7 transition-colors duration-150 group/phil"
              >
                <div className={`w-7 h-7 rounded-full ${c.a18Bg} border ${c.a30Border} overflow-hidden shrink-0 flex items-center justify-center`}>
                  {p.avatarUrl ? (
                    <Image src={p.avatarUrl} alt={p.name} width={28} height={28} className="w-full h-full object-cover" />
                  ) : (
                    <span className={`font-serif text-xs font-medium ${c.acText}`}>{p.name.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-sans text-xs font-medium text-zinc-950 dark:text-stone-100 group-hover/phil:text-zinc-700 dark:group-hover/phil:text-zinc-400 transition-colors duration-150 truncate">
                    {p.name}
                  </div>
                  {p.coreBranch && (
                    <div className="font-sans text-xs text-slate-500/70 dark:text-stone-400/70 mt-[1px] truncate">{p.coreBranch}</div>
                  )}
                </div>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-zinc-950/20 dark:text-stone-100/20 shrink-0 group-hover/phil:text-zinc-700 dark:group-hover/phil:text-zinc-400 transition-colors duration-150">
                  <path d="M5 12h14m-6-7 7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Influence connections */}
      {(school.influencedBy.length > 0 || school.influencedTo.length > 0) && (
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-3">
          {school.influencedBy.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-zinc-950/30 dark:text-stone-100/30">
                  <path d="M19 12H5m6 7-7-7 7-7" />
                </svg>
                <div className="font-sans text-xs font-medium tracking-widest text-slate-500 dark:text-stone-400">
                  Influenced By <span className="font-normal normal-case tracking-normal opacity-60">({school.influencedBy.length})</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {school.influencedBy.map(s => (
                  <Link
                    key={s._id}
                    href={`/schools/${s.slug}`}
                    className="font-sans text-xs text-slate-500 dark:text-stone-400 bg-zinc-950/3 dark:bg-stone-100/3 border border-zinc-950/8 dark:border-stone-100/8 rounded-sm px-2 py-0.5 hover:bg-zinc-950/7 dark:hover:bg-stone-100/7 transition-colors duration-150"
                  >
                    {s.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
          {school.influencedTo.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-zinc-950/30 dark:text-stone-100/30">
                  <path d="M5 12h14m-6-7 7 7-7 7" />
                </svg>
                <div className="font-sans text-xs font-medium tracking-widest text-slate-500 dark:text-stone-400">
                  Influenced <span className="font-normal normal-case tracking-normal opacity-60">({school.influencedTo.length})</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {school.influencedTo.map(s => (
                  <Link
                    key={s._id}
                    href={`/schools/${s.slug}`}
                    className="font-sans text-xs text-slate-500 dark:text-stone-400 bg-zinc-950/3 dark:bg-stone-100/3 border border-zinc-950/8 dark:border-stone-100/8 rounded-sm px-2 py-0.5 hover:bg-zinc-950/7 dark:hover:bg-stone-100/7 transition-colors duration-150"
                  >
                    {s.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ComparisonPanel({ schoolA, schoolB, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      data-panel="true"
      role="dialog"
      aria-modal="false"
      aria-label="Dialectical comparison of two schools"
      onPointerDown={(e) => e.stopPropagation()}
      className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] md:bottom-0 left-0 md:left-20 right-0 h-[min(460px,calc(100dvh-140px))] z-70 flex flex-col bg-stone-50/98 dark:bg-stone-900/98 backdrop-blur-[28px] border-t border-t-zinc-700/14 dark:border-t-zinc-500/14 shadow-[0_-16px_64px_rgba(17,21,26,0.12)] animate-fade-up"
    >
      <div className="h-[2px] bg-linear-to-r from-zinc-700/90 via-zinc-700/38 to-transparent" />
      <div className="px-7 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-stone-50/96 dark:bg-stone-900/96 shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="font-sans text-xs font-medium tracking-widest text-zinc-950 dark:text-stone-100">Dialectical Comparison</div>
          <div className="h-3 w-px bg-zinc-200 dark:bg-zinc-700" />
          <div className="font-serif italic text-xs text-zinc-950/40 dark:text-stone-100/40">
            {schoolA && schoolB
              ? `${schoolA.title} · ${schoolB.title}`
              : schoolA
              ? `${schoolA.title} · select second`
              : "Select two schools on the map"}
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close comparison"
          className="touch-target w-7 h-7 rounded-full bg-zinc-950/5 dark:bg-stone-100/5 border border-zinc-950/10 dark:border-stone-100/10 cursor-pointer flex items-center justify-center text-xs text-zinc-950/40 dark:text-stone-100/40 transition-[color,background-color] duration-200 hover:bg-zinc-950/10 dark:hover:bg-stone-100/10 hover:text-zinc-950 dark:hover:text-stone-100"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <SchoolColumn school={schoolA} side="left"  comparison="left"  />
        <SchoolColumn school={schoolB} side="right" comparison="right" />
      </div>
    </div>
  );
}
