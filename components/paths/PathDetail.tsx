"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import type { LearningPathFull } from "@/lib/types";
import { markStepComplete } from "@/app/progress/actions";

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner:     "bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 border-emerald-600/20",
  intermediate: "bg-amber-600/10 text-amber-700 dark:text-amber-400 border-amber-600/20",
  advanced:     "bg-rose-600/10 text-rose-700 dark:text-rose-400 border-rose-600/20",
};

export default function PathDetail({
  path,
  completedSteps = [],
  isAuthenticated = false,
}: {
  path: LearningPathFull;
  completedSteps?: number[];
  isAuthenticated?: boolean;
}) {
  const diffCls = DIFFICULTY_COLORS[path.difficulty] ?? DIFFICULTY_COLORS.beginner;

  const totalSteps = path.steps.length;
  const [completed, setCompleted] = useState<Set<number>>(() => new Set(completedSteps));
  const [, startTransition] = useTransition();

  const completedCount = completed.size;
  const progressPct = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  function handleToggle(stepIndex: number) {
    if (!isAuthenticated || completed.has(stepIndex)) return;

    setCompleted((prev) => {
      const next = new Set(prev);
      next.add(stepIndex);
      return next;
    });

    startTransition(async () => {
      try {
        await markStepComplete(path.slug, stepIndex, totalSteps);
      } catch {
        setCompleted((prev) => {
          const next = new Set(prev);
          next.delete(stepIndex);
          return next;
        });
      }
    });
  }

  return (
    <div className="max-w-[720px] mx-auto">
      {/* Header */}
      <div className="mb-10 animate-fade-up">
        <div className="flex items-center gap-3 mb-4">
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-sans font-medium tracking-wider uppercase border ${diffCls}`}>
            {path.difficulty}
          </span>
          <span className="text-[11px] font-sans tracking-wider text-slate-500 dark:text-stone-500">
            {path.stepCount} steps{path.estimatedMinutes > 0 && ` · ${path.estimatedMinutes} min`}
          </span>
        </div>
        <h1 className="font-serif italic font-medium text-zinc-950 dark:text-stone-100 tracking-[-0.02em] leading-[1.05] text-[clamp(2rem,5vw,3.5rem)] mb-4">
          {path.title}
        </h1>
        <p className="font-sans text-base leading-relaxed text-slate-500 dark:text-stone-400">
          {path.description}
        </p>
        {path.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {path.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-sans tracking-wider text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Progress bar */}
      {isAuthenticated && totalSteps > 0 && (
        <div className="mb-8 animate-fade-up" style={{ animationDelay: "0.05s" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-cinzel text-[10px] font-medium tracking-[0.18em] uppercase text-zinc-500 dark:text-zinc-400">
              {completedCount} of {totalSteps} steps completed
            </span>
            <span className="font-cinzel text-[10px] font-medium tracking-[0.18em] uppercase text-emerald-700 dark:text-emerald-500">
              {progressPct}%
            </span>
          </div>
          <div className="h-1 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Steps timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-zinc-200 dark:bg-zinc-800" />

        <div className="space-y-0">
          {path.steps.map((step, i) => {
            const isDone = completed.has(i);
            return (
            <div
              key={i}
              className="relative pl-10 pb-8 last:pb-0 animate-fade-up"
              style={{ animationDelay: `${0.1 + i * 0.08}s` }}
            >
              {/* Step dot */}
              {isDone ? (
                <div className="absolute left-[10px] top-1.5 w-[11px] h-[11px] rounded-full bg-emerald-600 dark:bg-emerald-500 border-2 border-emerald-600 dark:border-emerald-500 flex items-center justify-center">
                  <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
              ) : isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => handleToggle(i)}
                  aria-label={`Mark step ${i + 1} complete`}
                  className="absolute left-[10px] top-1.5 w-[11px] h-[11px] rounded-full border-2 border-zinc-400 dark:border-zinc-500 bg-stone-50 dark:bg-stone-900 hover:border-emerald-600 dark:hover:border-emerald-500 hover:bg-emerald-600/10 transition-colors cursor-pointer"
                />
              ) : (
                <div className="absolute left-[10px] top-1.5 w-[11px] h-[11px] rounded-full border-2 border-zinc-400 dark:border-zinc-500 bg-stone-50 dark:bg-stone-900" />
              )}

              {/* Step number */}
              <div className="font-sans text-[10px] font-medium tracking-widest text-zinc-400 dark:text-zinc-600 uppercase mb-1.5">
                Step {i + 1}
              </div>

              {/* Step content */}
              <h3 className="font-serif italic text-base font-medium text-zinc-950 dark:text-stone-100 mb-1.5">
                {step.title}
              </h3>
              {step.description && (
                <p className="font-sans text-sm leading-relaxed text-slate-500 dark:text-stone-400 mb-3">
                  {step.description}
                </p>
              )}

              {/* Link to philosopher */}
              {step.type === "philosopher" && step.philosopher && (
                <Link
                  href={`/philosophers/${step.philosopher.slug}`}
                  className="inline-flex items-center gap-2.5 px-3 py-2 rounded-md bg-zinc-950/4 dark:bg-stone-100/4 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors group"
                >
                  {step.philosopher.avatarUrl && (
                    <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0">
                      <Image src={step.philosopher.avatarUrl} alt={step.philosopher.name} fill sizes="28px" className="object-cover" />
                    </div>
                  )}
                  <span className="font-serif italic text-sm text-zinc-950 dark:text-stone-100 group-hover:text-[#c47029] transition-colors">
                    {step.philosopher.name}
                  </span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400 dark:text-zinc-600" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              )}

              {/* Link to school */}
              {step.type === "school" && step.school && (
                <Link
                  href={`/schools/${step.school.slug}`}
                  className="inline-flex items-center gap-2.5 px-3 py-2 rounded-md bg-zinc-950/4 dark:bg-stone-100/4 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors group"
                >
                  <span className="font-serif italic text-sm text-zinc-950 dark:text-stone-100 group-hover:text-[#c47029] transition-colors">
                    {step.school.title}
                  </span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400 dark:text-zinc-600" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              )}

              {/* Reading content */}
              {step.type === "reading" && step.readingContent && (
                <div className="font-sans text-sm leading-relaxed text-slate-500 dark:text-stone-400 bg-zinc-950/3 dark:bg-stone-100/3 rounded-md px-4 py-3 border-l-2 border-[#c47029]/40">
                  {step.readingContent}
                </div>
              )}
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
