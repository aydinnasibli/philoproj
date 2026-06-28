"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PhilosopherListItem } from "@/lib/types";

function formatYears(birth?: number, death?: number) {
  if (!birth && !death) return "";
  const b = birth ? (birth < 0 ? `${Math.abs(birth)} BC` : `${birth} AD`) : "?";
  const d = death ? (death < 0 ? `${Math.abs(death)} BC` : `${death} AD`) : "?";
  return `${b} — ${d}`;
}

type Props = { philosopher: PhilosopherListItem; priority?: boolean };

export default function DirectoryRow({ philosopher, priority = false }: Props) {
  const [show, setShow] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  const hasPreview = philosopher.hookQuote || philosopher.shortSummary;

  function handleEnter() {
    if (!hasPreview) return;
    timeout.current = setTimeout(() => setShow(true), 300);
  }

  function handleLeave() {
    if (timeout.current) clearTimeout(timeout.current);
    setShow(false);
  }

  return (
    <Link href={`/philosophers/${philosopher.slug}`} className="no-underline group">
      <div
        ref={rowRef}
        className="relative grid grid-cols-[1fr] sm:grid-cols-[1fr_160px] md:grid-cols-[1fr_200px_200px] items-center cursor-pointer border-b border-zinc-100 dark:border-zinc-800 bg-transparent transition-[background-color] duration-150 group-hover:bg-stone-100/70 dark:group-hover:bg-stone-800/50 py-3 md:py-3.5"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        {/* Name + avatar */}
        <div className="flex items-center gap-3 pl-2">
          {philosopher.avatarUrl ? (
            <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700">
              <Image
                src={philosopher.avatarUrl}
                alt={philosopher.name}
                width={44}
                height={44}
                priority={priority}
                className="object-cover w-full h-full"
              />
            </div>
          ) : (
            <div className="w-11 h-11 rounded-full bg-stone-100 dark:bg-stone-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 font-serif text-sm text-slate-500 dark:text-stone-400">
              {philosopher.name[0]}
            </div>
          )}

          <div className="translate-x-0 transition-transform duration-200 group-hover:translate-x-1">
            <span className="font-serif italic text-base text-zinc-950 dark:text-stone-100 block">
              {philosopher.name}
            </span>
            {(philosopher.birthYear || philosopher.deathYear) && (
              <span className="font-sans text-xs text-slate-500 dark:text-stone-400 block mt-px">
                {formatYears(philosopher.birthYear, philosopher.deathYear)}
              </span>
            )}
          </div>
        </div>

        <span className="hidden sm:inline font-sans text-xs text-slate-500 dark:text-stone-400">{philosopher.eraTitle}</span>
        <span className="hidden md:inline font-sans text-xs font-medium tracking-wider uppercase text-slate-500 dark:text-stone-400">
          {philosopher.coreBranch}
        </span>

        {/* Hover preview card */}
        {hasPreview && show && (
          <div className="absolute left-16 sm:left-20 bottom-full mb-2 z-30 w-72 sm:w-80 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-stone-900 shadow-xl shadow-black/8 dark:shadow-black/30 p-4 pointer-events-none animate-fade-up"
            style={{ animationDuration: "0.15s" }}
          >
            {philosopher.hookQuote && (
              <p className="font-serif italic text-sm leading-relaxed text-zinc-700 dark:text-stone-300 mb-2">
                &ldquo;{philosopher.hookQuote}&rdquo;
              </p>
            )}
            {philosopher.shortSummary && (
              <p className="font-sans text-xs leading-relaxed text-slate-500 dark:text-stone-400 line-clamp-3">
                {philosopher.shortSummary}
              </p>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
