"use client";

import Image from "next/image";
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SchoolWithPhilosophers } from "@/lib/types";
import SchoolChapterPanel from "./SchoolChapterPanel";

type Props = { schools: SchoolWithPhilosophers[] };

const ease = [0.22, 1, 0.36, 1] as const;

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.065, delayChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.32, ease } },
};

export default function LineageMobileView({ schools }: Props) {
  const sorted = [...schools].sort(
    (a, b) => (a.startYear ?? Infinity) - (b.startYear ?? Infinity)
  );

  const [selected, setSelected] = useState<SchoolWithPhilosophers | null>(null);

  // Lock body scroll while panel is open
  useEffect(() => {
    document.body.style.overflow = selected ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selected]);

  const onNavigate = useCallback(
    (id: string) => setSelected(schools.find(s => s._id === id) ?? null),
    [schools, setSelected]
  );

  return (
    <div className="min-h-screen parchment-bg pt-14 pb-24">
      {/* Page header */}
      <div className="pt-7 pb-6 text-center px-6">
        <div className="font-cinzel text-[0.6rem] tracking-widest uppercase text-slate-500 dark:text-stone-400 mb-2">
          Western Philosophy
        </div>
        <h1 className="font-serif text-[1.6rem] font-medium text-zinc-950 dark:text-stone-100 tracking-[-0.02em] leading-snug">
          The Living Lineage
        </h1>
        <p className="font-serif italic text-sm text-slate-500 dark:text-stone-400 mt-2.5 max-w-[260px] mx-auto leading-relaxed">
          Tap a tradition to explore its thinkers, ideas, and influence.
        </p>
      </div>

      {/* Timeline */}
      <motion.div
        className="relative px-4 max-w-sm mx-auto"
        variants={listVariants}
        initial="hidden"
        animate="show"
      >
        {/* Vertical connector */}
        <div className="absolute left-[35px] top-3 bottom-3 w-px bg-zinc-950/8 dark:bg-stone-100/8" />

        <div className="flex flex-col gap-3">
          {sorted.map((school) => (
            <motion.div key={school._id} variants={itemVariants}>
              <button
                onClick={() => setSelected(school)}
                aria-label={`Explore ${school.title}`}
                className="w-full text-left flex items-start gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-700 dark:focus-visible:ring-zinc-500 focus-visible:ring-offset-2 rounded-xl"
              >
                {/* Timeline node */}
                <div className="shrink-0 flex flex-col items-center pt-[18px] w-8">
                  <div className="w-2 h-2 rounded-full border-[1.5px] border-zinc-950/25 dark:border-stone-100/25 bg-stone-100 dark:bg-stone-900 group-active:border-zinc-950/70 dark:group-active:border-stone-100/70 transition-colors duration-150" />
                </div>

                {/* Card */}
                <div className="flex-1 min-w-0 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-stone-50/90 dark:bg-stone-900/90 px-4 py-3.5 shadow-[0_1px_4px_rgba(17,21,26,0.04)] transition-[border-color,background,box-shadow] duration-200 group-active:border-zinc-300 dark:group-active:border-zinc-700 group-active:shadow-[0_2px_8px_rgba(17,21,26,0.08)]">

                  {/* Era badge + arrow */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-cinzel text-[0.55rem] tracking-widest uppercase text-slate-500 dark:text-stone-400 bg-zinc-950/[0.045] dark:bg-stone-100/[0.045] border border-zinc-200 dark:border-zinc-700 px-2 py-[3px] rounded-[3px]">
                      {school.eraRange}
                    </div>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-950/20 dark:text-stone-100/20 shrink-0">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>

                  {/* Title */}
                  <div className="font-serif text-[1rem] font-medium text-zinc-950 dark:text-stone-100 leading-snug mb-1.5">
                    {school.title}
                  </div>

                  {/* Description teaser */}
                  {school.description && (
                    <p className="font-serif text-xs text-slate-500 dark:text-stone-400 leading-relaxed line-clamp-2 mb-3">
                      {school.tagline ?? school.description}
                    </p>
                  )}

                  {/* Key thinker avatars + names */}
                  {school.keyThinkers.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1.5">
                        {school.keyThinkers.slice(0, 4).map(p => (
                          <div
                            key={p._id}
                            className="relative w-[22px] h-[22px] rounded-full overflow-hidden border border-stone-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 shrink-0"
                          >
                            {p.avatarUrl ? (
                              <Image
                                src={p.avatarUrl}
                                alt={p.name}
                                fill
                                sizes="22px"
                                className="object-cover filter-[grayscale(0.55)]"
                              />
                            ) : (
                              <span className="absolute inset-0 flex items-center justify-center font-serif text-[9px] text-slate-500 dark:text-stone-400">
                                {p.name[0]}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                      <span className="font-sans text-[10px] text-slate-500 dark:text-stone-400 truncate">
                        {school.keyThinkers
                          .slice(0, 3)
                          .map(p => p.name.split(" ").at(-1))
                          .join(", ")}
                        {school.keyThinkers.length > 3
                          ? ` +${school.keyThinkers.length - 3}`
                          : ""}
                      </span>
                    </div>
                  )}
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Backdrop */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-[55] bg-zinc-950/25 dark:bg-zinc-950/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease }}
            onClick={() => setSelected(null)}
          />
        )}
      </AnimatePresence>

      {/* Panel — has its own AnimatePresence internally */}
      <SchoolChapterPanel
        school={selected}
        onClose={() => setSelected(null)}
        onNavigate={onNavigate}
      />
    </div>
  );
}
