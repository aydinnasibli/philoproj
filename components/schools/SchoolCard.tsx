"use client";

import Link from "next/link";
import type { SchoolWithPhilosophers } from "@/lib/types";

export default function SchoolCard({ school }: { school: SchoolWithPhilosophers }) {
  return (
    <Link href={`/schools/${school.slug}`} className="no-underline block">
      <div className="pt-7 px-7 pb-6 cursor-pointer bg-stone-50/70 dark:bg-stone-900/70 border border-zinc-100 dark:border-zinc-800 transition-[background,border-color,transform,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-stone-50 dark:hover:bg-stone-900 hover:border-zinc-700/18 dark:hover:border-zinc-500/18 hover:translate-y-[-3px] hover:shadow-[0_8px_28px_rgba(17,21,26,0.08)]">
        <div className="font-sans text-xs font-bold tracking-widest uppercase text-zinc-700 dark:text-zinc-400 mb-3">{school.eraRange}</div>
        <div className="font-serif italic text-xl font-normal text-zinc-950 dark:text-stone-100 leading-snug mb-3">{school.title}</div>
        <p className="font-sans text-xs leading-[1.72] text-slate-500 dark:text-stone-400 m-0 mb-4 overflow-hidden [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
          {school.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5 flex-wrap">
            {school.philosophers.slice(0, 3).map(p => (
              <span key={p._id} className="font-sans text-xs text-slate-500 dark:text-stone-400 bg-zinc-950/[0.04] dark:bg-stone-100/[0.04] border border-zinc-950/[0.07] dark:border-stone-100/[0.07] px-2 py-0.5 rounded-sm">
                {p.name}
              </span>
            ))}
            {school.philosophers.length > 3 && (
              <span className="font-sans text-xs text-slate-500 dark:text-stone-400 opacity-60 px-1 py-0.5">+{school.philosophers.length - 3}</span>
            )}
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-zinc-700/50 dark:text-zinc-500/50" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
