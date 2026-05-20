"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { SchoolWithPhilosophers } from "@/lib/types";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

function HoverLink({ href, children, dir }: { href: string; children: React.ReactNode; dir?: "left" | "right" }) {
  return (
    <Link href={href} className="font-sans text-xs text-slate-500 dark:text-stone-400 no-underline px-3 py-1 border border-zinc-950/[0.1] dark:border-stone-100/[0.1] rounded-sm transition-[border-color,color] duration-200 hover:border-zinc-700/30 dark:hover:border-zinc-500/30 hover:text-zinc-700 dark:hover:text-zinc-500 inline-block">
      {dir === "left" && "← "}{children}{dir === "right" && " →"}
    </Link>
  );
}

export default function SchoolDetail({ school }: { school: SchoolWithPhilosophers }) {
  return (
    <div className="min-h-screen pl-0 md:pl-20">
      <motion.div
        className="max-w-[820px] mx-auto px-4 md:px-12 pt-16 md:pt-16 pb-24 md:pb-24"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeUp}>
          <Link href="/schools" className="flex items-center gap-1.5 w-fit font-sans text-xs font-semibold tracking-widest uppercase text-slate-500 dark:text-stone-400 no-underline mb-11 opacity-60 transition-[color,opacity] duration-200 hover:text-zinc-700 dark:hover:text-zinc-500 hover:opacity-100">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Schools
          </Link>
        </motion.div>

        <motion.div variants={fadeUp}>
          <div className="inline-block font-sans text-xs font-bold tracking-widest uppercase text-zinc-700 dark:text-zinc-400 bg-zinc-700/8 dark:bg-zinc-500/8 border border-zinc-700/20 dark:border-zinc-500/20 px-2.5 py-1 rounded-sm mb-4">
            {school.eraRange}
          </div>

          <h1 className="font-serif italic font-normal text-zinc-950 dark:text-stone-100 leading-[1.08] tracking-[-0.01em] m-0 mb-7 text-[clamp(2.4rem,5vw,3.6rem)]">
            {school.title}
          </h1>

          <div className="flex items-center gap-3 mb-9">
            <div className="flex-1 h-px bg-linear-to-r from-zinc-700/20 to-transparent" />
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <circle cx="4" cy="4" r="1.5" fill="currentColor" className="text-zinc-700/50 dark:text-zinc-500/50" />
              <circle cx="4" cy="4" r="3.5" stroke="currentColor" className="text-zinc-700/20 dark:text-zinc-500/20" strokeWidth="0.75" fill="none" />
            </svg>
            <div className="flex-1 h-px bg-linear-to-l from-zinc-700/20 to-transparent" />
          </div>
        </motion.div>

        <motion.p variants={fadeUp} className="font-sans text-sm leading-[1.85] text-slate-500 dark:text-stone-400 mb-12">
          {school.description}
        </motion.p>

        {school.coreIdeas.length > 0 && (
          <motion.div variants={fadeUp} className="mb-12">
            <div className="font-sans text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-stone-400 mb-4.5 pb-2.5 border-b border-zinc-950/[0.07] dark:border-stone-100/[0.07]">Core Ideas</div>
            <div className="flex flex-col gap-3">
              {school.coreIdeas.map((idea, i) => (
                <div key={i} className="flex gap-3.5 items-start">
                  <div className="w-1 h-1 rounded-full bg-zinc-700 dark:bg-zinc-500 shrink-0 mt-2 opacity-55" />
                  <span className="font-sans text-sm leading-[1.72] text-slate-500 dark:text-stone-400">{idea}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {(school.influencedBy.length > 0 || school.influencedTo.length > 0) && (
          <motion.div variants={fadeUp} className="flex flex-col md:flex-row gap-6 md:gap-8 mb-12">
            {school.influencedBy.length > 0 && (
              <div className="flex-1">
                <div className="font-sans text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-stone-400 mb-3 pb-2.5 border-b border-zinc-950/[0.07] dark:border-stone-100/[0.07]">Received From</div>
                <div className="flex flex-wrap gap-1.5">{school.influencedBy.map(s => <HoverLink key={s._id} href={`/schools/${s.slug}`} dir="left">{s.title}</HoverLink>)}</div>
              </div>
            )}
            {school.influencedTo.length > 0 && (
              <div className="flex-1">
                <div className="font-sans text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-stone-400 mb-3 pb-2.5 border-b border-zinc-950/[0.07] dark:border-stone-100/[0.07]">Passed Forward</div>
                <div className="flex flex-wrap gap-1.5">{school.influencedTo.map(s => <HoverLink key={s._id} href={`/schools/${s.slug}`} dir="right">{s.title}</HoverLink>)}</div>
              </div>
            )}
          </motion.div>
        )}

        {school.philosophers.length > 0 && (
          <motion.div variants={fadeUp}>
            <div className="font-sans text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-stone-400 mb-4.5 pb-2.5 border-b border-zinc-950/[0.07] dark:border-stone-100/[0.07]">Philosophers</div>
            <div className="flex flex-col gap-0.5">
              {school.philosophers.map(p => (
                <Link key={p._id} href={`/philosophers/${p.slug}`}
                  className="flex items-center gap-3 md:gap-3.5 px-3 py-3 md:px-4 md:py-3.5 no-underline bg-stone-50/60 dark:bg-stone-900/60 border border-zinc-100 dark:border-zinc-800 transition-[background,border-color] duration-200 hover:bg-stone-50 dark:hover:bg-stone-900 hover:border-zinc-700/15 dark:hover:border-zinc-500/15"
                >
                  <div className="relative w-[42px] h-[42px] rounded-full shrink-0 overflow-hidden bg-zinc-700/10 dark:bg-zinc-500/10 border border-zinc-700/20 dark:border-zinc-500/20">
                    {p.avatarUrl ? (
                      <Image src={p.avatarUrl} alt={p.name} fill sizes="42px" className="object-cover filter-[grayscale(0.6)]" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-serif italic text-lg text-zinc-700 dark:text-zinc-400">{p.name[0]}</div>
                    )}
                  </div>
                  <div>
                    <div className="font-serif text-base text-zinc-950 dark:text-stone-100 font-medium mb-0.5">{p.name}</div>
                    <div className="font-sans text-xs text-slate-500 dark:text-stone-400">{p.coreBranch}</div>
                  </div>
                  <div className="ml-auto font-sans text-xs text-zinc-700/50 dark:text-zinc-500/50">View →</div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
