"use client";

import { useRef } from "react";
import type { PhilosopherListItem } from "@/lib/types";
import DirectoryRow from "./DirectoryRow";

type Props = { philosophers: PhilosopherListItem[] };

export default function DirectoryList({ philosophers }: Props) {
  const letterRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const grouped = philosophers.reduce<Record<string, PhilosopherListItem[]>>((acc, p) => {
    const letter = p.name[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(p);
    return acc;
  }, {});

  const presentLetters = Object.keys(grouped).sort();

  if (philosophers.length === 0) {
    return (
      <div className="min-h-screen pl-0 md:pl-20">
        <div className="max-w-[1100px] mx-auto px-4 md:px-12 pt-16 md:pt-16 pb-24 md:pb-24 text-slate-500 dark:text-stone-400 font-serif italic">
          No philosophers found. Run <code>npm run seed</code>.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pl-0 md:pl-20">
      <div className="max-w-[1100px] mx-auto px-4 md:px-12 pt-16 md:pt-16 pb-24 md:pb-24">
        <div className="mb-10 md:mb-14">
          <h1 className="font-serif italic text-[clamp(2.2rem,4vw,3.2rem)] font-normal text-zinc-950 dark:text-stone-100 leading-tight tracking-[-0.01em] m-0">
            Thinkers
          </h1>
          <div className="h-px bg-linear-to-r from-amber-800/20 dark:from-amber-600/20 mt-6" />
        </div>

        <div className="pt-3 pb-4 border-b-2 border-zinc-950 dark:border-stone-100 flex items-baseline gap-4">
          <span className="font-serif italic text-[clamp(1.5rem,4vw,2rem)] font-normal leading-none">{philosophers.length}</span>
          <span className="font-sans text-xs tracking-widest uppercase text-slate-500 dark:text-stone-400 font-semibold">Thinkers</span>
        </div>

        <div className="grid grid-cols-[1fr] sm:grid-cols-[1fr_160px] md:grid-cols-[1fr_200px_200px] py-2 border-b border-zinc-200 dark:border-zinc-700 bg-stone-100 dark:bg-stone-950">
          {["Name", "Era", "Branch"].map((h, i) => (
            <span key={h} className={`font-sans text-xs font-semibold tracking-widest uppercase text-slate-500 dark:text-stone-400 ${i === 1 ? "hidden sm:inline" : i === 2 ? "hidden md:inline" : ""}`}>{h}</span>
          ))}
        </div>

        {presentLetters.map((letter) => (
          <div key={letter} ref={(el) => { letterRefs.current[letter] = el; }}>
            <div className="sticky top-0 z-10 bg-stone-100 dark:bg-stone-950 border-b border-t border-zinc-200 dark:border-zinc-700 flex items-center gap-4 overflow-hidden h-14">
              <span aria-hidden="true" className="font-serif text-[clamp(2.5rem,8vw,5rem)] font-bold text-zinc-950 dark:text-stone-100 opacity-[0.06] leading-none tracking-[-0.04em] select-none shrink-0 mt-1">
                {letter}
              </span>
              <span className="font-serif text-lg italic text-amber-800 dark:text-amber-600 font-normal">{letter}</span>
              <span className="font-sans text-xs tracking-widest uppercase text-slate-500 dark:text-stone-400 font-semibold">
                {grouped[letter].length} {grouped[letter].length === 1 ? "thinker" : "thinkers"}
              </span>
            </div>
            {grouped[letter].map((p) => <DirectoryRow key={p._id} philosopher={p} />)}
          </div>
        ))}
      </div>
    </div>
  );
}
