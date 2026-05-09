"use client";

import Image from "next/image";
import { useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { SchoolWithPhilosophers } from "@/lib/types";

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

type Props = { school: SchoolWithPhilosophers | null; allSchools: SchoolWithPhilosophers[]; onClose: () => void; onNavigate: (id: string) => void; };

function Divider({ accent }: { accent: string }) {
  return (
    <div className="flex items-center gap-[10px] my-[22px]" style={{ '--a': accent } as React.CSSProperties}>
      <div className="flex-1 h-px bg-[linear-gradient(to_right,color-mix(in_srgb,var(--a)_25%,transparent),transparent)]" style={{ background: `linear-gradient(to right, ${accent}40, transparent)` }} />
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
        <circle cx="4" cy="4" r="1.5" fill={accent} opacity={0.5} />
        <circle cx="4" cy="4" r="3.5" stroke={accent} strokeWidth="0.6" fill="none" opacity={0.3} />
      </svg>
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, ${accent}40, transparent)` }} />
    </div>
  );
}

export default function SchoolChapterPanel({ school, onClose, onNavigate }: Props) {
  const accent = school ? (ERA_ACCENT[school._id] ?? "#C47029") : "#C47029";

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {school && (
        <motion.aside
          key={school._id}
          data-panel="true"
          initial={{ x: 440, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 440, opacity: 0 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="fixed right-0 top-0 bottom-0 w-[420px] z-60 overflow-y-auto overflow-x-hidden flex flex-col backdrop-blur-[28px] bg-[rgba(253,250,245,0.98)] shadow-[-24px_0_72px_rgba(17,21,26,0.13)]"
          style={{ borderLeft: `3px solid ${accent}`, '--a': accent, '--a14': `${accent}14`, '--a20': `${accent}20`, '--a30': `${accent}30`, '--a40': `${accent}40`, '--a0d': `${accent}0D`, '--a1f': `${accent}1F`, '--a10': `${accent}10` } as React.CSSProperties}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 px-6 pt-[18px] pb-[14px] flex items-start justify-between bg-[rgba(253,250,245,0.96)] backdrop-blur-[20px] border-b border-b-(--a20)">
            <div>
              <div className="inline-block font-sans text-[7px] font-bold tracking-[0.22em] uppercase text-(--a) bg-(--a14) border border-(--a30) px-[9px] py-[3px] rounded-[2px] mb-[9px]">
                {school.eraRange}
              </div>
              <div className="font-serif text-[1.45rem] font-medium text-[#11151a] leading-[1.2] tracking-[-0.01em]">{school.title}</div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close panel"
              className="cursor-pointer bg-transparent border-none text-[rgba(17,21,26,0.35)] text-[1.1rem] px-[6px] py-1 mt-1 leading-none transition-colors duration-200 hover:text-[#11151a]"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="px-6 pt-6 pb-10 flex-1">
            {school.philosophers[0] && (
              <div className="pl-[14px] mb-[22px] border-l-2 border-l-(--a)">
                <div className="font-serif italic text-[0.88rem] text-[#43474c] leading-[1.7]">
                  &ldquo;{school.philosophers[0].coreBranch}&rdquo;
                </div>
                <div className="font-sans text-[7.5px] font-semibold tracking-[0.14em] uppercase text-(--a) mt-[7px]">
                  — {school.philosophers[0].name}
                </div>
              </div>
            )}

            <div className="font-sans text-[7.5px] font-bold tracking-[0.22em] uppercase text-(--a) mb-3">The Story</div>
            <p className="font-sans text-[0.78rem] leading-[1.82] text-[#43474c]">{school.description}</p>

            <Divider accent={accent} />

            <div className="font-sans text-[7.5px] font-bold tracking-[0.22em] uppercase text-(--a) mb-3">Core Ideas</div>
            <ul className="list-none flex flex-col gap-[9px] mb-1">
              {school.coreIdeas.map((idea, i) => (
                <li key={i} className="flex gap-[10px] items-start">
                  <div className="w-[5px] h-[5px] rounded-full bg-(--a) opacity-55 mt-[6px] shrink-0" />
                  <span className="font-sans text-[0.745rem] leading-[1.72] text-[#43474c]">{idea}</span>
                </li>
              ))}
            </ul>

            <Divider accent={accent} />

            {school.influencedBy.length > 0 && (
              <>
                <div className="font-sans text-[7.5px] font-bold tracking-[0.22em] uppercase text-(--a) mb-3">Received From</div>
                <div className="flex flex-wrap gap-[7px] mb-[18px]">
                  {school.influencedBy.map(s => (
                    <button key={s._id} onClick={() => onNavigate(s._id)}
                      className="flex items-center gap-[6px] px-3 py-[6px] rounded-[3px] cursor-pointer font-sans text-[0.72rem] text-[#43474c] transition-all duration-200 hover:text-(--a)"
                      style={{ background: `${accent}0D`, border: `1px solid ${accent}30` }}
                      onMouseEnter={e => { e.currentTarget.style.background = `${accent}1F`; e.currentTarget.style.color = accent; }}
                      onMouseLeave={e => { e.currentTarget.style.background = `${accent}0D`; e.currentTarget.style.color = "#43474c"; }}
                    >
                      <span className="text-[0.6rem] opacity-60">←</span>{s.title}
                    </button>
                  ))}
                </div>
              </>
            )}

            {school.influencedTo.length > 0 && (
              <>
                <div className="font-sans text-[7.5px] font-bold tracking-[0.22em] uppercase text-(--a) mb-3">Passed Forward</div>
                <div className="flex flex-wrap gap-[7px] mb-[22px]">
                  {school.influencedTo.map(s => (
                    <button key={s._id} onClick={() => onNavigate(s._id)}
                      className="flex items-center gap-[6px] px-3 py-[6px] rounded-[3px] cursor-pointer font-sans text-[0.72rem] text-[#43474c] transition-all duration-200"
                      style={{ background: `${accent}0D`, border: `1px solid ${accent}30` }}
                      onMouseEnter={e => { e.currentTarget.style.background = `${accent}1F`; e.currentTarget.style.color = accent; }}
                      onMouseLeave={e => { e.currentTarget.style.background = `${accent}0D`; e.currentTarget.style.color = "#43474c"; }}
                    >
                      {s.title}<span className="text-[0.6rem] opacity-60">→</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            <Divider accent={accent} />

            {school.philosophers.length > 0 && (
              <>
                <div className="font-sans text-[7.5px] font-bold tracking-[0.22em] uppercase text-(--a) mb-3">Thinkers of This Era</div>
                <div className="flex flex-col gap-[10px]">
                  {school.philosophers.map(p => (
                    <Link key={p._id} href={`/philosophers/${p.slug}`}
                      className="flex items-center gap-3 px-3 py-[10px] rounded-[4px] no-underline transition-all duration-200 border"
                      style={{ background: "rgba(17,21,26,0.025)", borderColor: "rgba(17,21,26,0.07)" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${accent}10`; (e.currentTarget as HTMLElement).style.borderColor = `${accent}30`; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(17,21,26,0.025)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(17,21,26,0.07)"; }}
                    >
                      <div className="relative w-10 h-10 rounded-full shrink-0 overflow-hidden flex items-center justify-center border-[1.5px] border-(--a40) bg-(--a18)" style={{ '--a18': `${accent}18`, '--a40': `${accent}40` } as React.CSSProperties}>
                        {p.avatarUrl ? (
                          <Image src={p.avatarUrl} alt={p.name} fill sizes="40px" style={{ objectFit: "cover", filter: "grayscale(0.5) sepia(0.25)" }} />
                        ) : (
                          <span className="font-serif italic text-base text-(--a)">{p.name.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-serif text-[0.9rem] text-[#11151a] font-medium">{p.name}</div>
                        <div className="font-sans text-[0.68rem] text-[#5F6A78] mt-[2px]">{p.coreBranch}</div>
                      </div>
                      <div className="ml-auto font-sans text-[10px] text-(--a) opacity-60">View →</div>
                    </Link>
                  ))}
                </div>
              </>
            )}

            <Divider accent={accent} />

            <Link href={`/schools/${school.slug}`}
              className="inline-flex items-center gap-2 px-[18px] py-[10px] rounded-[2px] font-sans text-[0.7rem] font-bold tracking-[0.16em] uppercase text-(--a) no-underline transition-[background] duration-200 hover:bg-(--a10)"
              style={{ border: `1px solid ${accent}40`, '--a10': `${accent}10` } as React.CSSProperties}
            >
              View full tradition
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
