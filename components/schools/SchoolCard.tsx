"use client";

import Link from "next/link";
import type { SchoolListItem } from "@/lib/types";

export default function SchoolCard({ school }: { school: SchoolListItem }) {
  return (
    <div className="animate-fade-up hover:-translate-y-1 transition-transform duration-200">
      <Link href={`/schools/${school.slug}`} className="no-underline block">
        <div className="pt-5 px-5 pb-4 sm:pt-7 sm:px-7 sm:pb-6 cursor-pointer bg-stone-50/70 dark:bg-stone-900/70 border border-zinc-950/[0.07] dark:border-stone-100/[0.07] shadow-[0_2px_12px_rgba(17,21,26,0.04)] transition-[background,border-color,box-shadow] duration-200 hover:bg-stone-50 dark:hover:bg-stone-900 hover:border-zinc-700/12 dark:hover:border-zinc-500/12 hover:shadow-[0_8px_28px_rgba(17,21,26,0.08)]">
          <div className="font-cinzel text-[0.6rem] tracking-widest uppercase text-slate-500 dark:text-stone-400 mb-3">{school.eraRange}</div>
          <div className="font-serif italic text-xl font-normal text-zinc-950 dark:text-stone-100 leading-snug mb-3">{school.title}</div>
          <p className="font-serif text-sm leading-[1.72] text-slate-500 dark:text-stone-400 m-0 mb-4 overflow-hidden [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
            {school.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5 flex-wrap">
              {school.philosopherPreview.map(p => (
                <span key={p._id} className="font-cinzel text-[0.6rem] uppercase tracking-widest bg-stone-100 dark:bg-stone-800 text-slate-500 dark:text-stone-400 px-2.5 py-0.5 rounded-full">
                  {p.name}
                </span>
              ))}
              {school.philosopherCount > 3 && (
                <span className="font-sans text-xs text-slate-500 dark:text-stone-400 opacity-60 px-1 py-0.5">+{school.philosopherCount - 3}</span>
              )}
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-zinc-500/40 dark:text-zinc-400/40 shrink-0" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    </div>
  );
}
