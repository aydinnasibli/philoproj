"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { FullPhilosopher } from "@/lib/types";
import Link from "next/link";

const ERA_COLOUR: Record<string, string> = {
  "pre-socratic":       "rgba(196,150,40,0.90)",
  "classical-antiquity":"rgba(215,170,50,0.90)",
  "hellenistic-roman":  "rgba(200,145,55,0.90)",
  "late-antique":       "rgba(180,110,50,0.90)",
  "medieval":           "rgba(107,130,85,0.90)",
  "early-modern":       "rgba(195,100,55,0.90)",
  "critical-era":       "rgba(90,105,175,0.90)",
};

const ERA_BG: Record<string, string> = {
  "pre-socratic":       "rgba(196,150,40,0.05)",
  "classical-antiquity":"rgba(215,170,50,0.05)",
  "hellenistic-roman":  "rgba(200,145,55,0.05)",
  "late-antique":       "rgba(180,110,50,0.05)",
  "medieval":           "rgba(107,130,85,0.05)",
  "early-modern":       "rgba(195,100,55,0.05)",
  "critical-era":       "rgba(90,105,175,0.05)",
};

const ERA_GLOW: Record<string, string> = {
  "pre-socratic":       "rgba(196,150,40,0.14)",
  "classical-antiquity":"rgba(215,170,50,0.14)",
  "hellenistic-roman":  "rgba(200,145,55,0.14)",
  "late-antique":       "rgba(180,110,50,0.14)",
  "medieval":           "rgba(107,130,85,0.14)",
  "early-modern":       "rgba(195,100,55,0.14)",
  "critical-era":       "rgba(90,105,175,0.14)",
};

function formatYears(birth?: number, death?: number) {
  if (!birth && !death) return "";
  const b = birth ? (birth < 0 ? `${Math.abs(birth)} BC` : `${birth}`) : "?";
  const d = death ? (death < 0 ? `${Math.abs(death)} BC` : `${death}`) : "present";
  return `${b} – ${d}`;
}

export default function ProfileHero({ philosopher }: { philosopher: FullPhilosopher }) {
  const eraColour = ERA_COLOUR[philosopher.eraSlug] ?? "var(--accent)";
  const eraBg     = ERA_BG[philosopher.eraSlug]     ?? "transparent";
  const eraGlow   = ERA_GLOW[philosopher.eraSlug]   ?? "transparent";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{ '--ec': eraColour, '--eb': eraBg, '--eg': eraGlow } as React.CSSProperties}
    >
      {/* Era-tinted hero banner */}
      <div className="-mx-10 px-10 pt-8 pb-10 mb-8 bg-(--eb) border-t-[4px] border-t-(--ec)">
        {/* Breadcrumb */}
        <div className="flex gap-2 items-center mb-10 font-sans text-[11px] text-ink-muted tracking-[0.1em] uppercase font-semibold">
          <Link href="/" className="text-ink-muted no-underline">Network</Link>
          <span>→</span>
          {philosopher.eraTitle && (
            <>
              <Link href="/lineage" className="text-ink-muted no-underline">{philosopher.eraTitle}</Link>
              <span>→</span>
            </>
          )}
          <span className="text-(--ec)">{philosopher.name}</span>
        </div>

        {/* Avatar + Title */}
        <div className="flex gap-10 items-start">
          {philosopher.avatarUrl && (
            <div
              className="relative w-[200px] h-[200px] rounded-full overflow-hidden shrink-0 border-[3px] border-(--ec)"
              style={{ boxShadow: `0 0 0 8px var(--eg), 0 12px 40px rgba(0,0,0,0.14)` }}
            >
              <Image src={philosopher.avatarUrl} alt={philosopher.name} fill sizes="200px" style={{ objectFit: "cover" }} priority />
            </div>
          )}

          <div className="pt-2">
            <span className="inline-block font-sans text-[10px] font-semibold tracking-[0.18em] uppercase text-(--ec) mb-3 border-b border-b-(--ec) pb-[2px]">
              {philosopher.coreBranch}
            </span>
            <h1 className="font-serif font-medium text-ink tracking-[-0.02em] leading-[0.95]" style={{ fontSize: "clamp(3rem,7vw,5rem)" }}>
              {philosopher.name}
            </h1>
            <div className="w-14 h-[2px] bg-(--ec) mt-4 mb-[10px] opacity-75" />
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
        <blockquote className="pl-6 mb-8 font-serif italic text-[1.35rem] leading-normal text-ink max-w-[64ch] border-l-[3px] border-l-(--ec) m-0">
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
