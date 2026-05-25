"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

const bodyContainer = {
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } },
};

const bodyItem = {
  hidden: { opacity: 0, y: 8 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3, ease } },
};
import type { SchoolWithPhilosophers } from "@/lib/types";

type Props = {
  school: SchoolWithPhilosophers | null;
  onClose: () => void;
  onNavigate: (id: string) => void;
};

function Divider() {
  return (
    <div className="flex items-center gap-2.5 my-[22px]">
      <div className="flex-1 h-px bg-linear-to-r from-zinc-200 dark:from-zinc-700 to-transparent" />
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
        <circle cx="4" cy="4" r="1.5" fill="currentColor" className="text-zinc-950/30 dark:text-stone-100/30" />
        <circle cx="4" cy="4" r="3.5" stroke="currentColor" className="text-zinc-950/15 dark:text-stone-100/15" strokeWidth="0.6" fill="none" />
      </svg>
      <div className="flex-1 h-px bg-linear-to-l from-zinc-200 dark:from-zinc-700 to-transparent" />
    </div>
  );
}

export default function SchoolChapterPanel({ school, onClose, onNavigate }: Props) {
  const [isMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);

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
          initial={isMobile ? { y: "100%" } : { x: 440, opacity: 0 }}
          animate={isMobile ? { y: 0 } : { x: 0, opacity: 1 }}
          exit={isMobile ? { y: "100%" } : { x: 440, opacity: 0 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className={`fixed z-60 overflow-y-auto overflow-x-hidden flex flex-col bg-stone-50/98 dark:bg-stone-900/98 backdrop-blur-[28px] ${
            isMobile
              ? "inset-x-0 bottom-0 max-h-[88vh] rounded-t-2xl border-t-2 border-t-zinc-950/80 dark:border-t-stone-100/80 shadow-[0_-12px_60px_rgba(17,21,26,0.18)]"
              : "right-0 top-0 bottom-0 w-[420px] border-l border-l-zinc-200 dark:border-l-zinc-700 border-t-2 border-t-zinc-950/80 dark:border-t-stone-100/80 shadow-[-24px_0_72px_rgba(17,21,26,0.13)]"
          }`}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 px-6 pt-4.5 pb-[14px] flex items-start justify-between bg-stone-50/96 dark:bg-stone-900/96 backdrop-blur-[20px] border-b border-zinc-200 dark:border-zinc-700">
            <div>
              <div className="inline-block font-cinzel text-[0.6rem] tracking-widest uppercase text-slate-500 dark:text-stone-400 bg-zinc-950/[0.05] dark:bg-stone-100/[0.05] border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 rounded-xs mb-[9px]">
                {school.eraRange}
              </div>
              <div className="font-serif text-2xl font-medium text-zinc-950 dark:text-stone-100 leading-snug tracking-[-0.01em]">
                {school.title}
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close panel"
              className="touch-target cursor-pointer bg-transparent border-none text-zinc-950/35 dark:text-stone-100/35 p-3 md:px-1.5 md:py-1 mt-1 -mr-1.5 md:mr-0 transition-colors duration-200 hover:text-zinc-950 dark:hover:text-stone-100 flex items-center justify-center"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <motion.div
            className="px-6 pt-6 pb-10 flex-1"
            variants={bodyContainer}
            initial="hidden"
            animate="show"
          >
            {(school.keyThinkers[0] ?? school.philosophers[0]) && (
              <motion.div variants={bodyItem} className="mb-5.5 px-4 py-3 bg-zinc-950/4 dark:bg-stone-100/4 rounded-sm">
                <div className="font-serif italic text-sm text-slate-500 dark:text-stone-400 leading-relaxed">
                  &ldquo;{(school.keyThinkers[0] ?? school.philosophers[0]).coreBranch}&rdquo;
                </div>
                <div className="font-sans text-xs font-semibold tracking-widest uppercase text-slate-500 dark:text-stone-400 mt-[7px]">
                  — {(school.keyThinkers[0] ?? school.philosophers[0]).name}
                </div>
              </motion.div>
            )}

            <motion.div variants={bodyItem}>
              <div className="font-sans text-xs font-medium tracking-widest uppercase text-slate-500 dark:text-stone-400 mb-3">The Story</div>
              <p className="font-serif text-[0.9375rem] leading-[1.7] text-slate-500 dark:text-stone-400">{school.description}</p>
            </motion.div>

            <Divider />

            <motion.div variants={bodyItem}>
              <div className="font-sans text-xs font-medium tracking-widest uppercase text-slate-500 dark:text-stone-400 mb-3">Core Ideas</div>
              <ul className="list-none flex flex-col gap-2 mb-1">
                {school.coreIdeas.map((idea, i) => (
                  <li key={i} className="flex gap-2.5 items-start">
                    <div className="w-[5px] h-[5px] rounded-full bg-zinc-950 dark:bg-stone-100 opacity-30 mt-1.5 shrink-0" />
                    <span className="font-serif text-[0.9375rem] leading-[1.7] text-slate-500 dark:text-stone-400">{idea}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <Divider />

            {school.influencedBy.length > 0 && (
              <motion.div variants={bodyItem}>
                <div className="font-sans text-xs font-medium tracking-widest uppercase text-slate-500 dark:text-stone-400 mb-3">Received From</div>
                <div className="flex flex-wrap gap-1.5 mb-4.5">
                  {school.influencedBy.map(s => (
                    <button
                      key={s._id}
                      onClick={() => onNavigate(s._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm cursor-pointer font-sans text-xs text-slate-500 dark:text-stone-400 transition-[color,background-color,opacity] duration-200 bg-zinc-950/[0.04] dark:bg-stone-100/[0.04] border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-950/[0.08] dark:hover:bg-stone-100/[0.08] hover:text-zinc-950 dark:hover:text-stone-100"
                    >
                      <span className="text-xs opacity-50">←</span>{s.title}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {school.influencedTo.length > 0 && (
              <motion.div variants={bodyItem}>
                <div className="font-sans text-xs font-medium tracking-widest uppercase text-slate-500 dark:text-stone-400 mb-3">Passed Forward</div>
                <div className="flex flex-wrap gap-1.5 mb-[22px]">
                  {school.influencedTo.map(s => (
                    <button
                      key={s._id}
                      onClick={() => onNavigate(s._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm cursor-pointer font-sans text-xs text-slate-500 dark:text-stone-400 transition-[color,background-color,opacity] duration-200 bg-zinc-950/[0.04] dark:bg-stone-100/[0.04] border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-950/[0.08] dark:hover:bg-stone-100/[0.08] hover:text-zinc-950 dark:hover:text-stone-100"
                    >
                      {s.title}<span className="text-xs opacity-50">→</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <Divider />

            {school.keyThinkers.length > 0 && (
              <motion.div variants={bodyItem}>
                <div className="font-sans text-xs font-medium tracking-widest uppercase text-slate-500 dark:text-stone-400 mb-3">Key Thinkers</div>
                <div className="flex flex-col gap-2.5">
                  {school.keyThinkers.map(p => (
                    <Link
                      key={p._id}
                      href={`/philosophers/${p.slug}`}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-md no-underline transition-[background,border-color] duration-200 border border-zinc-100 dark:border-zinc-800 bg-zinc-950/[0.02] dark:bg-stone-100/[0.02] hover:bg-zinc-950/[0.05] dark:hover:bg-stone-100/[0.05] hover:border-zinc-200 dark:hover:border-zinc-700"
                    >
                      <div className="relative w-10 h-10 rounded-full shrink-0 overflow-hidden flex items-center justify-center border border-zinc-200 dark:border-zinc-700 bg-zinc-950/[0.04] dark:bg-stone-100/[0.04]">
                        {p.avatarUrl ? (
                          <Image src={p.avatarUrl} alt={p.name} fill sizes="40px" className="object-cover filter-[grayscale(0.5)_sepia(0.1)]" />
                        ) : (
                          <span className="font-serif italic text-base text-slate-500 dark:text-stone-400">{p.name.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-serif text-sm text-zinc-950 dark:text-stone-100 font-medium">{p.name}</div>
                        <div className="font-sans text-xs text-slate-500 dark:text-stone-400 mt-0.5">{p.coreBranch}</div>
                      </div>
                      <div className="ml-auto font-sans text-xs text-slate-500 dark:text-stone-400 opacity-50">View →</div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}

            <Divider />

            <motion.div variants={bodyItem}>
              <Link
                href={`/schools/${school.slug}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xs font-sans text-xs font-bold tracking-widest uppercase text-zinc-950 dark:text-stone-100 no-underline border border-zinc-200 dark:border-zinc-700 transition-[background] duration-200 hover:bg-zinc-950/[0.05] dark:hover:bg-stone-100/[0.05]"
              >
                View full tradition
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          </motion.div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
