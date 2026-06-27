"use client";

import Image from "next/image";
import { useState } from "react";
import type { FullPhilosopher } from "@/lib/types";
import ShareButton from "./ShareButton";

function formatYears(birth?: number, death?: number) {
  if (!birth && !death) return "";
  const b = birth ? (birth < 0 ? `${Math.abs(birth)} BC` : `${birth}`) : "?";
  const d = death ? (death < 0 ? `${Math.abs(death)} BC` : `${death}`) : "present";
  return `${b} – ${d}`;
}

type EraColors = {
  heroBg:  string;
  borderT: string;
  text:    string;
  border:  string;
  shadow:  string;
  borderB: string;
  solidBg: string;
};

const MONO_ERA: EraColors = {
  heroBg:  "bg-zinc-600/5",
  borderT: "border-t-zinc-600/90",
  text:    "text-zinc-600/90",
  border:  "border-zinc-600/90",
  shadow:  "shadow-[0_0_0_8px_rgba(82,82,82,0.14),0_12px_40px_rgba(0,0,0,0.14)]",
  borderB: "border-b-zinc-600/90",
  solidBg: "bg-zinc-600/90",
};

const ERA_SLUG_COLORS: Record<string, EraColors> = {
  "pre-socratic":        MONO_ERA,
  "classical-antiquity": MONO_ERA,
  "hellenistic-roman":   MONO_ERA,
  "late-antique":        MONO_ERA,
  "medieval":            MONO_ERA,
  "early-modern":        MONO_ERA,
  "critical-era":        MONO_ERA,
};

const FALLBACK_ERA_COLORS = MONO_ERA;

export default function ProfileHero({ philosopher }: { philosopher: FullPhilosopher }) {
  const [imgError, setImgError] = useState(false);
  const c = ERA_SLUG_COLORS[philosopher.eraSlug] ?? FALLBACK_ERA_COLORS;

  return (
    <div>
      {/* Era-tinted hero banner */}
      <div className={`animate-fade-up -mx-4 md:-mx-10 px-4 md:px-10 pt-8 pb-8 md:pb-10 mb-8 ${c.heroBg} border-t-4 ${c.borderT}`} style={{ animationDelay: '0.05s' }}>
        {/* Avatar + Title */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
          <div className={`relative w-[120px] h-[120px] md:w-[200px] md:h-[200px] rounded-full overflow-hidden shrink-0 border-[3px] ${c.border} ${c.shadow}`}>
            {philosopher.avatarUrl && !imgError ? (
              <Image src={philosopher.avatarUrl} alt={philosopher.name} fill sizes="(max-width:768px) 120px, 200px" className="object-cover" priority onError={() => setImgError(true)} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                <span className="font-serif italic text-5xl md:text-7xl text-zinc-300/75 select-none">{philosopher.name[0]}</span>
              </div>
            )}
          </div>

          <div className="pt-2">
            <span className={`inline-block font-sans text-xs font-medium tracking-widest uppercase ${c.text} mb-3 border-b ${c.borderB} pb-0.5`}>
              {philosopher.coreBranch}
            </span>
            <h1 className="font-serif italic font-medium text-zinc-950 dark:text-stone-100 tracking-[-0.02em] leading-[0.95] text-[clamp(3rem,7vw,5rem)]">
              {philosopher.name}
            </h1>
            <div className={`w-14 h-[2px] ${c.solidBg} mt-4 mb-2.5 opacity-75`} />
            <div className="flex items-center gap-4">
              {(philosopher.birthYear || philosopher.deathYear) && (
                <p className="font-sans text-sm text-slate-500 dark:text-stone-400 tracking-wider">
                  {formatYears(philosopher.birthYear, philosopher.deathYear)}
                </p>
              )}
              <ShareButton slug={philosopher.slug} name={philosopher.name} />
            </div>
          </div>
        </div>
      </div>

      {/* Hook Quote */}
      {philosopher.hookQuote && (
        <blockquote className="animate-fade-up px-5 py-4 mb-8 font-serif italic text-xl leading-normal text-zinc-950 dark:text-stone-100 max-w-[64ch] m-0 bg-zinc-950/3 dark:bg-stone-100/3 rounded-xs" style={{ animationDelay: '0.14s' }}>
          &ldquo;{philosopher.hookQuote}&rdquo;
        </blockquote>
      )}

      {/* Short summary */}
      {philosopher.shortSummary && (
        <p className="animate-fade-up font-serif text-lg leading-[1.8] text-slate-500 dark:text-stone-400 border-t border-zinc-200 dark:border-zinc-700 pt-6 text-justify hyphens-auto" style={{ animationDelay: '0.23s' }}>
          {philosopher.shortSummary}
        </p>
      )}
    </div>
  );
}
