"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
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
    acText:    "text-accent-bright",
    acBg:      "bg-[#C47029]",
    a14Bg:     "bg-[rgba(196,112,41,0.08)]",
    a18Bg:     "bg-[rgba(196,112,41,0.09)]",
    a30Border: "border-[rgba(196,112,41,0.19)]",
    a40Border: "border-[rgba(196,112,41,0.25)]",
  },
  right: {
    acText:    "text-[#5A6999]",
    acBg:      "bg-[#5A6999]",
    a14Bg:     "bg-[rgba(90,105,153,0.08)]",
    a18Bg:     "bg-[rgba(90,105,153,0.09)]",
    a30Border: "border-[rgba(90,105,153,0.19)]",
    a40Border: "border-[rgba(90,105,153,0.25)]",
  },
};

function formatYear(y: number): string {
  if (y < 0) return `${Math.abs(y)} BC`;
  return `AD ${y}`;
}

function EmptyColumn({ label }: { label: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-2.5 px-8 py-6">
      <div className="w-10 h-10 rounded-full border-[1.5px] border-dashed border-accent/25 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-accent/20" />
      </div>
      <span className="font-serif italic text-[0.82rem] text-ink/30">{label}</span>
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
    <div className={`flex-1 overflow-y-auto px-7 py-5 ${side === "left" ? "border-r border-r-ink/[0.07]" : ""}`}>

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-3">
          <div className={`inline-block font-sans text-[7px] font-bold tracking-[0.22em] uppercase ${c.acText} ${c.a14Bg} border ${c.a30Border} px-[9px] py-[3px] rounded-[2px] mb-2`}>
            {school.eraRange}
          </div>
          <Link
            href={`/schools/${school.slug}`}
            className="block font-serif text-[1.45rem] italic text-ink leading-[1.1] font-normal m-0 hover:text-accent-bright transition-colors duration-150"
          >
            {school.title}
          </Link>
          {school.tagline && (
            <p className={`font-sans text-[0.68rem] font-semibold tracking-[0.12em] uppercase mt-1.5 ${c.acText} opacity-70`}>
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
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink/30 shrink-0">
            <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          <span className="font-sans text-[0.68rem] text-ink-muted">
            Founded <span className={`font-semibold ${c.acText}`}>{formatYear(school.startYear)}</span>
          </span>
        </div>
      )}

      <div className="h-px bg-[linear-gradient(to_right,rgba(17,21,26,0.08),transparent)] dark:bg-[linear-gradient(to_right,rgba(237,232,223,0.08),transparent)] mb-3" />

      {/* Description */}
      <p className="font-sans text-[0.73rem] leading-[1.75] text-ink-muted mb-4">
        {school.description}
      </p>

      {/* Core ideas */}
      {school.coreIdeas.length > 0 && (
        <div className="mb-4">
          <div className="font-sans text-[7px] font-bold tracking-[0.18em] uppercase text-ink-muted mb-2.5">Core Ideas</div>
          <div className="flex flex-col gap-1.5">
            {school.coreIdeas.map((idea, i) => (
              <div key={i} className="flex gap-[9px] items-start">
                <div className={`w-[3px] h-[3px] rounded-full ${c.acBg} opacity-60 mt-1.5 shrink-0`} />
                <span className="font-sans text-[0.71rem] leading-[1.65] text-ink-muted">{idea}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key thinkers */}
      {school.philosophers.length > 0 && (
        <div className="mb-4">
          <div className="font-sans text-[7px] font-bold tracking-[0.18em] uppercase text-ink-muted mb-2.5">
            Key Thinkers <span className="font-normal normal-case tracking-normal opacity-60">({school.philosophers.length})</span>
          </div>
          <div className="flex flex-col gap-2">
            {school.philosophers.map(p => (
              <Link
                key={p._id}
                href={`/philosophers/${p.slug}`}
                className="flex items-center gap-2.5 bg-ink/3 border border-ink/8 rounded-[4px] px-3 py-2 hover:bg-ink/7 transition-colors duration-150 group/phil"
              >
                <div className={`w-7 h-7 rounded-full ${c.a18Bg} border ${c.a30Border} overflow-hidden shrink-0 flex items-center justify-center`}>
                  {p.avatarUrl ? (
                    <Image src={p.avatarUrl} alt={p.name} width={28} height={28} className="w-full h-full object-cover" />
                  ) : (
                    <span className={`font-serif text-[0.7rem] font-medium ${c.acText}`}>{p.name.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-sans text-[0.72rem] font-medium text-ink group-hover/phil:text-accent-bright transition-colors duration-150 truncate">
                    {p.name}
                  </div>
                  {p.coreBranch && (
                    <div className="font-sans text-[0.62rem] text-ink-muted/70 mt-[1px] truncate">{p.coreBranch}</div>
                  )}
                </div>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-ink/20 shrink-0 group-hover/phil:text-accent-bright transition-colors duration-150">
                  <path d="M5 12h14m-6-7 7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Influence connections */}
      {(school.influencedBy.length > 0 || school.influencedTo.length > 0) && (
        <div className="pt-3 border-t border-border-pale flex flex-col gap-3">
          {school.influencedBy.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-ink/30">
                  <path d="M19 12H5m6 7-7-7 7-7" />
                </svg>
                <div className="font-sans text-[7px] font-bold tracking-[0.18em] uppercase text-ink-muted">
                  Influenced By <span className="font-normal normal-case tracking-normal opacity-60">({school.influencedBy.length})</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {school.influencedBy.map(s => (
                  <Link
                    key={s._id}
                    href={`/schools/${s.slug}`}
                    className="font-sans text-[0.68rem] text-ink-muted bg-ink/3 border border-ink/8 rounded-[3px] px-2 py-[3px] hover:bg-ink/7 transition-colors duration-150"
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
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-ink/30">
                  <path d="M5 12h14m-6-7 7 7-7 7" />
                </svg>
                <div className="font-sans text-[7px] font-bold tracking-[0.18em] uppercase text-ink-muted">
                  Influenced <span className="font-normal normal-case tracking-normal opacity-60">({school.influencedTo.length})</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {school.influencedTo.map(s => (
                  <Link
                    key={s._id}
                    href={`/schools/${s.slug}`}
                    className="font-sans text-[0.68rem] text-ink-muted bg-ink/3 border border-ink/8 rounded-[3px] px-2 py-[3px] hover:bg-ink/7 transition-colors duration-150"
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
  return (
    <motion.div
      initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      data-panel="true"
      onPointerDown={(e) => e.stopPropagation()}
      className="fixed bottom-[64px] md:bottom-0 left-0 md:left-20 right-0 h-[460px] z-70 flex flex-col bg-(--panel-bg) backdrop-blur-[28px] border-t border-t-accent/[0.14] shadow-[0_-16px_64px_rgba(17,21,26,0.12)]"
    >
      <div className="h-[2px] bg-[linear-gradient(to_right,#c47029_0%,rgba(196,112,41,0.38)_40%,transparent_100%)]" />
      <div className="px-7 py-3 border-b border-border-pale flex items-center justify-between bg-(--panel-bg-header) shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="font-sans text-[8px] font-bold tracking-[0.22em] uppercase text-ink">Dialectical Comparison</div>
          <div className="h-3 w-px bg-border" />
          <div className="font-serif italic text-[0.75rem] text-ink/40">
            {schoolA && schoolB
              ? `${schoolA.title} · ${schoolB.title}`
              : schoolA
              ? `${schoolA.title} · select second`
              : "Select two schools on the map"}
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-ink/5 border border-ink/10 cursor-pointer flex items-center justify-center text-[0.7rem] text-ink/40 transition-all duration-200 hover:bg-ink/10 hover:text-ink"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <SchoolColumn school={schoolA} side="left"  comparison="left"  />
        <SchoolColumn school={schoolB} side="right" comparison="right" />
      </div>
    </motion.div>
  );
}
