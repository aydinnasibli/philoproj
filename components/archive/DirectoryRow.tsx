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
  "era-1": "bg-[rgba(215,170,50,0.9)]",
  "era-2": "bg-[rgba(215,170,50,0.9)]",
  "era-3": "bg-[rgba(195,100,55,0.9)]",
  "era-4": "bg-[rgba(90,105,175,0.9)]",
};

const ERA_HOVER_SHADOW: Record<string, string> = {
  "era-1": "group-hover:shadow-[inset_3px_0_0_rgba(215,170,50,0.9)]",
  "era-2": "group-hover:shadow-[inset_3px_0_0_rgba(215,170,50,0.9)]",
  "era-3": "group-hover:shadow-[inset_3px_0_0_rgba(195,100,55,0.9)]",
  "era-4": "group-hover:shadow-[inset_3px_0_0_rgba(90,105,175,0.9)]",
};

export default function DirectoryRow({ philosopher }: { philosopher: PhilosopherListItem }) {
  const dotBg      = ERA_DOT_BG[philosopher.eraId]      ?? "bg-[rgba(196,112,41,0.9)]";
  const hoverShadow = ERA_HOVER_SHADOW[philosopher.eraId] ?? "group-hover:shadow-[inset_3px_0_0_rgba(196,112,41,0.9)]";

  return (
    <Link href={`/philosophers/${philosopher.slug}`} className="no-underline group">
      <div className={`grid grid-cols-[1fr_200px_200px] items-center cursor-pointer border-b border-border-pale bg-transparent transition-[background-color,box-shadow] duration-150 group-hover:bg-[rgba(139,115,85,0.04)] ${hoverShadow} px-10 py-[14px]`}>

        {/* Name + avatar */}
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full shrink-0 ${dotBg} opacity-[0.65] transition-opacity duration-150 group-hover:opacity-100`} />

          {philosopher.avatarUrl ? (
            <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border border-border">
              <Image src={philosopher.avatarUrl} alt={philosopher.name} width={44} height={44} className="object-cover w-full h-full" />
            </div>
          ) : (
            <div className="w-11 h-11 rounded-full bg-canvas-warm border border-border flex items-center justify-center shrink-0 font-serif text-[13px] text-ink-muted">
              {philosopher.name[0]}
            </div>
          )}

          <div className="translate-x-0 transition-transform duration-180 group-hover:translate-x-1">
            <span className="font-serif italic text-base text-ink block transition-colors duration-150 group-hover:text-accent">
              {philosopher.name}
            </span>
            {(philosopher.birthYear || philosopher.deathYear) && (
              <span className="font-sans text-[11px] text-ink-muted block mt-px">
                {formatYears(philosopher.birthYear, philosopher.deathYear)}
              </span>
            )}
          </div>
        </div>

        <span className="font-sans text-xs text-ink-muted">{philosopher.eraTitle}</span>
        <span className="font-sans text-[11px] font-semibold tracking-[0.08em] uppercase text-ink-muted transition-colors duration-150 group-hover:text-accent">
          {philosopher.coreBranch}
        </span>
      </div>
    </Link>
  );
}
