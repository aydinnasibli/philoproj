"use client";

import Image from "next/image";
import Link from "next/link";
import type { PhilosopherListItem } from "@/lib/types";

function formatYears(birth?: number, death?: number) {
  if (!birth && !death) return "";
  const b = birth ? (birth < 0 ? `${Math.abs(birth)} BC` : `${birth} AD`) : "?";
  const d = death ? (death < 0 ? `${Math.abs(death)} BC` : `${death} AD`) : "?";
  return `${b} — ${d}`;
}

const ERA_DOT_BG: Record<string, string> = {
  "era-1": "bg-yellow-500/90",
  "era-2": "bg-yellow-500/90",
  "era-3": "bg-orange-700/90",
  "era-4": "bg-slate-500/90",
};

const ERA_HOVER_SHADOW: Record<string, string> = {
  "era-1": "group-hover:shadow-[inset_3px_0_0_rgba(215,170,50,0.9)]",
  "era-2": "group-hover:shadow-[inset_3px_0_0_rgba(215,170,50,0.9)]",
  "era-3": "group-hover:shadow-[inset_3px_0_0_rgba(195,100,55,0.9)]",
  "era-4": "group-hover:shadow-[inset_3px_0_0_rgba(90,105,175,0.9)]",
};

export default function DirectoryRow({ philosopher }: { philosopher: PhilosopherListItem }) {
  const dotBg      = ERA_DOT_BG[philosopher.eraId]      ?? "bg-amber-600/90 dark:bg-amber-400/90";
  const hoverShadow = ERA_HOVER_SHADOW[philosopher.eraId] ?? "group-hover:shadow-[inset_3px_0_0_rgba(196,112,41,0.9)]";

  return (
    <Link href={`/philosophers/${philosopher.slug}`} className="no-underline group">
      <div className={`grid grid-cols-[1fr] sm:grid-cols-[1fr_160px] md:grid-cols-[1fr_200px_200px] items-center cursor-pointer border-b border-zinc-100 dark:border-zinc-800 bg-transparent transition-[background-color,box-shadow] duration-150 group-hover:bg-zinc-950/3 dark:group-hover:bg-stone-100/3 ${hoverShadow} py-3 md:py-3.5`}>

        {/* Name + avatar */}
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full shrink-0 ${dotBg} opacity-[0.65] transition-opacity duration-150 group-hover:opacity-100`} />

          {philosopher.avatarUrl ? (
            <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700">
              <Image src={philosopher.avatarUrl} alt={philosopher.name} width={44} height={44} className="object-cover w-full h-full" />
            </div>
          ) : (
            <div className="w-11 h-11 rounded-full bg-stone-100 dark:bg-stone-950 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 font-serif text-sm text-slate-500 dark:text-stone-400">
              {philosopher.name[0]}
            </div>
          )}

          <div className="translate-x-0 transition-transform duration-200 group-hover:translate-x-1">
            <span className="font-serif italic text-base text-zinc-950 dark:text-stone-100 block transition-colors duration-150 group-hover:text-amber-800 dark:group-hover:text-amber-600">
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
        <span className="hidden md:inline font-sans text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-stone-400 transition-colors duration-150 group-hover:text-amber-800 dark:group-hover:text-amber-600">
          {philosopher.coreBranch}
        </span>
      </div>
    </Link>
  );
}
