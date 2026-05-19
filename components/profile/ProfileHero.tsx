"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { FullPhilosopher } from "@/lib/types";
import Link from "next/link";

function formatYears(birth?: number, death?: number) {
  if (!birth && !death) return "";
  const b = birth ? (birth < 0 ? `${Math.abs(birth)} BC` : `${birth}`) : "?";
  const d = death ? (death < 0 ? `${Math.abs(death)} BC` : `${death}`) : "present";
  return `${b} – ${d}`;
}

type EraColors = {
  heroBg:      string;
  borderT:     string;
  text:        string;
  border:      string;
  shadow:      string;
  borderB:     string;
  solidBg:     string;
  borderL:     string;
};

const ERA_SLUG_COLORS: Record<string, EraColors> = {
  "pre-socratic": {
    heroBg:  "bg-yellow-600/5",
    borderT: "border-t-yellow-600/90",
    text:    "text-yellow-600/90",
    border:  "border-yellow-600/90",
    shadow:  "shadow-[0_0_0_8px_rgba(196,150,40,0.14),0_12px_40px_rgba(0,0,0,0.14)]",
    borderB: "border-b-yellow-600/90",
    solidBg: "bg-yellow-600/90",
    borderL: "border-l-yellow-600/90",
  },
  "classical-antiquity": {
    heroBg:  "bg-yellow-500/5",
    borderT: "border-t-yellow-500/90",
    text:    "text-yellow-500/90",
    border:  "border-yellow-500/90",
    shadow:  "shadow-[0_0_0_8px_rgba(215,170,50,0.14),0_12px_40px_rgba(0,0,0,0.14)]",
    borderB: "border-b-yellow-500/90",
    solidBg: "bg-yellow-500/90",
    borderL: "border-l-yellow-500/90",
  },
  "hellenistic-roman": {
    heroBg:  "bg-amber-600/5",
    borderT: "border-t-amber-600/90",
    text:    "text-amber-600/90",
    border:  "border-amber-600/90",
    shadow:  "shadow-[0_0_0_8px_rgba(200,145,55,0.14),0_12px_40px_rgba(0,0,0,0.14)]",
    borderB: "border-b-amber-600/90",
    solidBg: "bg-amber-600/90",
    borderL: "border-l-amber-600/90",
  },
  "late-antique": {
    heroBg:  "bg-amber-700/5",
    borderT: "border-t-amber-700/90",
    text:    "text-amber-700/90",
    border:  "border-amber-700/90",
    shadow:  "shadow-[0_0_0_8px_rgba(180,110,50,0.14),0_12px_40px_rgba(0,0,0,0.14)]",
    borderB: "border-b-amber-700/90",
    solidBg: "bg-amber-700/90",
    borderL: "border-l-amber-700/90",
  },
  "medieval": {
    heroBg:  "bg-lime-700/5",
    borderT: "border-t-lime-700/90",
    text:    "text-lime-700/90",
    border:  "border-lime-700/90",
    shadow:  "shadow-[0_0_0_8px_rgba(107,130,85,0.14),0_12px_40px_rgba(0,0,0,0.14)]",
    borderB: "border-b-lime-700/90",
    solidBg: "bg-lime-700/90",
    borderL: "border-l-lime-700/90",
  },
  "early-modern": {
    heroBg:  "bg-orange-700/5",
    borderT: "border-t-orange-700/90",
    text:    "text-orange-700/90",
    border:  "border-orange-700/90",
    shadow:  "shadow-[0_0_0_8px_rgba(195,100,55,0.14),0_12px_40px_rgba(0,0,0,0.14)]",
    borderB: "border-b-orange-700/90",
    solidBg: "bg-orange-700/90",
    borderL: "border-l-orange-700/90",
  },
  "critical-era": {
    heroBg:  "bg-slate-500/5",
    borderT: "border-t-slate-500/90",
    text:    "text-slate-500/90",
    border:  "border-slate-500/90",
    shadow:  "shadow-[0_0_0_8px_rgba(90,105,175,0.14),0_12px_40px_rgba(0,0,0,0.14)]",
    borderB: "border-b-slate-500/90",
    solidBg: "bg-slate-500/90",
    borderL: "border-l-slate-500/90",
  },
};

const FALLBACK_ERA_COLORS = ERA_SLUG_COLORS["classical-antiquity"];

export default function ProfileHero({ philosopher }: { philosopher: FullPhilosopher }) {
  const c = ERA_SLUG_COLORS[philosopher.eraSlug] ?? FALLBACK_ERA_COLORS;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Era-tinted hero banner */}
      <div className={`-mx-4 md:-mx-10 px-4 md:px-10 pt-8 pb-8 md:pb-10 mb-8 ${c.heroBg} border-t-4 ${c.borderT}`}>
        {/* Breadcrumb */}
        <div className="flex gap-2 items-center mb-10 font-sans text-xs text-slate-500 dark:text-stone-400 tracking-widest uppercase font-semibold">
          <Link href="/" className="text-slate-500 dark:text-stone-400 no-underline">Network</Link>
          <span>→</span>
          {philosopher.eraTitle && (
            <>
              <Link href="/lineage" className="text-slate-500 dark:text-stone-400 no-underline">{philosopher.eraTitle}</Link>
              <span>→</span>
            </>
          )}
          <span className={c.text}>{philosopher.name}</span>
        </div>

        {/* Avatar + Title */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
          {philosopher.avatarUrl && (
            <div className={`relative w-[120px] h-[120px] md:w-[200px] md:h-[200px] rounded-full overflow-hidden shrink-0 border-[3px] ${c.border} ${c.shadow}`}>
              <Image src={philosopher.avatarUrl} alt={philosopher.name} fill sizes="(max-width:768px) 120px, 200px" className="object-cover" priority />
            </div>
          )}

          <div className="pt-2">
            <span className={`inline-block font-sans text-xs font-semibold tracking-widest uppercase ${c.text} mb-3 border-b ${c.borderB} pb-0.5`}>
              {philosopher.coreBranch}
            </span>
            <h1 className="font-serif font-medium text-zinc-950 dark:text-stone-100 tracking-[-0.02em] leading-[0.95] text-[clamp(3rem,7vw,5rem)]">
              {philosopher.name}
            </h1>
            <div className={`w-14 h-[2px] ${c.solidBg} mt-4 mb-2.5 opacity-75`} />
            {(philosopher.birthYear || philosopher.deathYear) && (
              <p className="font-sans text-sm text-slate-500 dark:text-stone-400 tracking-wider">
                {formatYears(philosopher.birthYear, philosopher.deathYear)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Hook Quote */}
      {philosopher.hookQuote && (
        <blockquote className={`pl-6 mb-8 font-serif italic text-xl leading-normal text-zinc-950 dark:text-stone-100 max-w-[64ch] border-l-[3px] ${c.borderL} m-0`}>
          &ldquo;{philosopher.hookQuote}&rdquo;
        </blockquote>
      )}

      {/* Short summary */}
      {philosopher.shortSummary && (
        <p className="font-sans text-base leading-[1.8] text-slate-500 dark:text-stone-400 max-w-[68ch] border-t border-zinc-200 dark:border-zinc-700 pt-6">
          {philosopher.shortSummary}
        </p>
      )}
    </motion.div>
  );
}
