"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { SchoolWithPhilosophers } from "@/lib/types";

export default function SchoolCard({ school }: { school: SchoolWithPhilosophers }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
      whileHover={{ y: -3, boxShadow: "0 8px 28px rgba(17,21,26,0.08)", transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }}
      viewport={{ once: true, margin: "-30px" }}
    >
      <Link href={`/schools/${school.slug}`} className="no-underline block">
        <div className="pt-7 px-7 pb-6 cursor-pointer bg-stone-50/70 dark:bg-stone-900/70 border border-zinc-100 dark:border-zinc-800 transition-[background,border-color] duration-200 hover:bg-stone-50 dark:hover:bg-stone-900 hover:border-zinc-700/18 dark:hover:border-zinc-500/18">
          <div className="font-sans text-xs font-bold tracking-widest uppercase text-zinc-700 dark:text-zinc-400 mb-3">{school.eraRange}</div>
          <div className="font-serif italic text-xl font-normal text-zinc-950 dark:text-stone-100 leading-snug mb-3">{school.title}</div>
          <p className="font-sans text-xs leading-[1.72] text-slate-500 dark:text-stone-400 m-0 mb-4 overflow-hidden [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
            {school.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5 flex-wrap">
              {school.philosophers.slice(0, 3).map(p => (
                <span key={p._id} className="font-sans text-xs text-slate-500 dark:text-stone-400 bg-zinc-950/4 dark:bg-stone-100/4 border border-zinc-950/[0.07] dark:border-stone-100/[0.07] px-2 py-0.5 rounded-sm">
                  {p.name}
                </span>
              ))}
              {school.philosophers.length > 3 && (
                <span className="font-sans text-xs text-slate-500 dark:text-stone-400 opacity-60 px-1 py-0.5">+{school.philosophers.length - 3}</span>
              )}
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-zinc-700/50 dark:text-zinc-500/50" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
