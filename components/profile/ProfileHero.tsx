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

export default function ProfileHero({ philosopher }: { philosopher: FullPhilosopher }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      data-era-slug={philosopher.eraSlug}
    >
      {/* Era-tinted hero banner */}
      <div className="-mx-10 px-10 pt-8 pb-10 mb-8 bg-(--era-bg) border-t-[4px] border-t-(--era-col)">
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
          <span className="text-(--era-col)">{philosopher.name}</span>
        </div>

        {/* Avatar + Title */}
        <div className="flex gap-10 items-start">
          {philosopher.avatarUrl && (
            <div
              className="relative w-[200px] h-[200px] rounded-full overflow-hidden shrink-0 border-[3px] border-(--era-col) shadow-[0_0_0_8px_var(--era-glow),0_12px_40px_rgba(0,0,0,0.14)]"
            >
              <Image src={philosopher.avatarUrl} alt={philosopher.name} fill sizes="200px" className="object-cover" priority />
            </div>
          )}

          <div className="pt-2">
            <span className="inline-block font-sans text-[10px] font-semibold tracking-[0.18em] uppercase text-(--era-col) mb-3 border-b border-b-(--era-col) pb-[2px]">
              {philosopher.coreBranch}
            </span>
            <h1 className="font-serif font-medium text-ink tracking-[-0.02em] leading-[0.95] text-[clamp(3rem,7vw,5rem)]">
              {philosopher.name}
            </h1>
            <div className="w-14 h-[2px] bg-(--era-col) mt-4 mb-[10px] opacity-75" />
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
        <blockquote className="pl-6 mb-8 font-serif italic text-[1.35rem] leading-normal text-ink max-w-[64ch] border-l-[3px] border-l-(--era-col) m-0">
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
