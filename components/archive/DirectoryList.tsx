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
      <div className="min-h-screen pl-[80px]">
        <div className="max-w-[1100px] mx-auto px-12 pt-16 pb-24 text-ink-muted font-serif italic">
          No philosophers found. Run <code>npm run seed</code>.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pl-[80px]">
      <div className="max-w-[1100px] mx-auto px-12 pt-16 pb-24">
        <div className="mb-14">
          <h1 className="font-serif italic text-[clamp(2.2rem,4vw,3.2rem)] font-normal text-ink leading-[1.1] tracking-[-0.01em] m-0">
            Thinkers
          </h1>
          <div className="h-px bg-[linear-gradient(to_right,rgba(132,84,0,0.2),transparent)] mt-6" />
        </div>

        <div className="pt-3 pb-4 border-b-2 border-ink flex items-baseline gap-4">
          <span className="font-serif italic text-[2rem] font-normal leading-none">{philosophers.length}</span>
          <span className="font-sans text-[11px] tracking-[0.15em] uppercase text-ink-muted font-semibold">Thinkers</span>
        </div>

        <div className="grid grid-cols-[1fr_200px_200px] py-2 border-b border-border bg-canvas-warm">
          {["Name", "Era", "Branch"].map((h) => (
            <span key={h} className="font-sans text-[10px] font-semibold tracking-[0.15em] uppercase text-ink-muted">{h}</span>
          ))}
        </div>

        {presentLetters.map((letter) => (
          <div key={letter} ref={(el) => { letterRefs.current[letter] = el; }}>
            <div className="sticky top-0 z-10 bg-canvas-warm border-b border-t border-border flex items-center gap-4 overflow-hidden h-14">
              <span aria-hidden="true" className="font-serif text-[5rem] font-bold text-ink opacity-[0.06] leading-none tracking-[-0.04em] select-none shrink-0 mt-1">
                {letter}
              </span>
              <span className="font-serif text-[1.1rem] italic text-accent font-normal">{letter}</span>
              <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-ink-muted font-semibold">
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
