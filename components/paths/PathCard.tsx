"use client";

import Link from "next/link";
import type { LearningPathListItem } from "@/lib/types";

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner:     "bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 border-emerald-600/20",
  intermediate: "bg-amber-600/10 text-amber-700 dark:text-amber-400 border-amber-600/20",
  advanced:     "bg-rose-600/10 text-rose-700 dark:text-rose-400 border-rose-600/20",
};

export default function PathCard({ path, index }: { path: LearningPathListItem; index: number }) {
  const diffCls = DIFFICULTY_COLORS[path.difficulty] ?? DIFFICULTY_COLORS.beginner;

  return (
    <div
      className="animate-fade-up"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <Link
        href={`/paths/${path.slug}`}
        className="group block p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-stone-50/60 dark:bg-stone-900/60 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors duration-200"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-serif italic text-lg font-medium text-zinc-950 dark:text-stone-100 group-hover:text-[#c47029] transition-colors leading-snug">
            {path.title}
          </h3>
          <span className={`shrink-0 inline-block px-2 py-0.5 rounded-full text-[10px] font-sans font-medium tracking-wider uppercase border ${diffCls}`}>
            {path.difficulty}
          </span>
        </div>

        {/* Description */}
        <p className="font-sans text-sm leading-relaxed text-slate-500 dark:text-stone-400 line-clamp-2 mb-4">
          {path.description}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-[11px] font-sans tracking-wider text-slate-500 dark:text-stone-500">
          <span>{path.stepCount} steps</span>
          {path.estimatedMinutes > 0 && <span>{path.estimatedMinutes} min</span>}
          {path.tags.length > 0 && (
            <span className="text-zinc-400 dark:text-zinc-600">{path.tags.slice(0, 2).join(" · ")}</span>
          )}
        </div>
      </Link>
    </div>
  );
}
