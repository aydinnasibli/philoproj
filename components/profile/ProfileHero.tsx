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
    heroBg:  "bg-[rgba(196,150,40,0.05)]",
    borderT: "border-t-[rgba(196,150,40,0.9)]",
    text:    "text-[rgba(196,150,40,0.9)]",
    border:  "border-[rgba(196,150,40,0.9)]",
    shadow:  "shadow-[0_0_0_8px_rgba(196,150,40,0.14),0_12px_40px_rgba(0,0,0,0.14)]",
    borderB: "border-b-[rgba(196,150,40,0.9)]",
    solidBg: "bg-[rgba(196,150,40,0.9)]",
    borderL: "border-l-[rgba(196,150,40,0.9)]",
  },
  "classical-antiquity": {
    heroBg:  "bg-[rgba(215,170,50,0.05)]",
    borderT: "border-t-[rgba(215,170,50,0.9)]",
    text:    "text-[rgba(215,170,50,0.9)]",
    border:  "border-[rgba(215,170,50,0.9)]",
    shadow:  "shadow-[0_0_0_8px_rgba(215,170,50,0.14),0_12px_40px_rgba(0,0,0,0.14)]",
    borderB: "border-b-[rgba(215,170,50,0.9)]",
    solidBg: "bg-[rgba(215,170,50,0.9)]",
    borderL: "border-l-[rgba(215,170,50,0.9)]",
  },
  "hellenistic-roman": {
    heroBg:  "bg-[rgba(200,145,55,0.05)]",
    borderT: "border-t-[rgba(200,145,55,0.9)]",
    text:    "text-[rgba(200,145,55,0.9)]",
    border:  "border-[rgba(200,145,55,0.9)]",
    shadow:  "shadow-[0_0_0_8px_rgba(200,145,55,0.14),0_12px_40px_rgba(0,0,0,0.14)]",
    borderB: "border-b-[rgba(200,145,55,0.9)]",
    solidBg: "bg-[rgba(200,145,55,0.9)]",
    borderL: "border-l-[rgba(200,145,55,0.9)]",
  },
  "late-antique": {
    heroBg:  "bg-[rgba(180,110,50,0.05)]",
    borderT: "border-t-[rgba(180,110,50,0.9)]",
    text:    "text-[rgba(180,110,50,0.9)]",
    border:  "border-[rgba(180,110,50,0.9)]",
    shadow:  "shadow-[0_0_0_8px_rgba(180,110,50,0.14),0_12px_40px_rgba(0,0,0,0.14)]",
    borderB: "border-b-[rgba(180,110,50,0.9)]",
    solidBg: "bg-[rgba(180,110,50,0.9)]",
    borderL: "border-l-[rgba(180,110,50,0.9)]",
  },
  "medieval": {
    heroBg:  "bg-[rgba(107,130,85,0.05)]",
    borderT: "border-t-[rgba(107,130,85,0.9)]",
    text:    "text-[rgba(107,130,85,0.9)]",
    border:  "border-[rgba(107,130,85,0.9)]",
    shadow:  "shadow-[0_0_0_8px_rgba(107,130,85,0.14),0_12px_40px_rgba(0,0,0,0.14)]",
    borderB: "border-b-[rgba(107,130,85,0.9)]",
    solidBg: "bg-[rgba(107,130,85,0.9)]",
    borderL: "border-l-[rgba(107,130,85,0.9)]",
  },
  "early-modern": {
    heroBg:  "bg-[rgba(195,100,55,0.05)]",
    borderT: "border-t-[rgba(195,100,55,0.9)]",
    text:    "text-[rgba(195,100,55,0.9)]",
    border:  "border-[rgba(195,100,55,0.9)]",
    shadow:  "shadow-[0_0_0_8px_rgba(195,100,55,0.14),0_12px_40px_rgba(0,0,0,0.14)]",
    borderB: "border-b-[rgba(195,100,55,0.9)]",
    solidBg: "bg-[rgba(195,100,55,0.9)]",
    borderL: "border-l-[rgba(195,100,55,0.9)]",
  },
  "critical-era": {
    heroBg:  "bg-[rgba(90,105,175,0.05)]",
    borderT: "border-t-[rgba(90,105,175,0.9)]",
    text:    "text-[rgba(90,105,175,0.9)]",
    border:  "border-[rgba(90,105,175,0.9)]",
    shadow:  "shadow-[0_0_0_8px_rgba(90,105,175,0.14),0_12px_40px_rgba(0,0,0,0.14)]",
    borderB: "border-b-[rgba(90,105,175,0.9)]",
    solidBg: "bg-[rgba(90,105,175,0.9)]",
    borderL: "border-l-[rgba(90,105,175,0.9)]",
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
      <div className={`-mx-10 px-10 pt-8 pb-10 mb-8 ${c.heroBg} border-t-4 ${c.borderT}`}>
        {/* Breadcrumb */}
        <div className="flex gap-2 items-center mb-10 font-sans text-[11px] text-ink-muted tracking-widest uppercase font-semibold">
          <Link href="/" className="text-ink-muted no-underline">Network</Link>
          <span>→</span>
          {philosopher.eraTitle && (
            <>
              <Link href="/lineage" className="text-ink-muted no-underline">{philosopher.eraTitle}</Link>
              <span>→</span>
            </>
          )}
          <span className={c.text}>{philosopher.name}</span>
        </div>

        {/* Avatar + Title */}
        <div className="flex gap-10 items-start">
          {philosopher.avatarUrl && (
            <div className={`relative w-[200px] h-[200px] rounded-full overflow-hidden shrink-0 border-[3px] ${c.border} ${c.shadow}`}>
              <Image src={philosopher.avatarUrl} alt={philosopher.name} fill sizes="200px" className="object-cover" priority />
            </div>
          )}

          <div className="pt-2">
            <span className={`inline-block font-sans text-[10px] font-semibold tracking-[0.18em] uppercase ${c.text} mb-3 border-b ${c.borderB} pb-[2px]`}>
              {philosopher.coreBranch}
            </span>
            <h1 className="font-serif font-medium text-ink tracking-[-0.02em] leading-[0.95] text-[clamp(3rem,7vw,5rem)]">
              {philosopher.name}
            </h1>
            <div className={`w-14 h-[2px] ${c.solidBg} mt-4 mb-[10px] opacity-75`} />
            {(philosopher.birthYear || philosopher.deathYear) && (
              <p className="font-sans text-[13px] text-ink-muted tracking-wider">
                {formatYears(philosopher.birthYear, philosopher.deathYear)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Hook Quote */}
      {philosopher.hookQuote && (
        <blockquote className={`pl-6 mb-8 font-serif italic text-[1.35rem] leading-normal text-ink max-w-[64ch] border-l-[3px] ${c.borderL} m-0`}>
          &ldquo;{philosopher.hookQuote}&rdquo;
        </blockquote>
      )}

      {/* Short summary */}
      {philosopher.shortSummary && (
        <p className="font-sans text-base leading-[1.8] text-ink-muted max-w-[68ch] border-t border-border pt-6">
          {philosopher.shortSummary}
        </p>
      )}
    </motion.div>
  );
}
