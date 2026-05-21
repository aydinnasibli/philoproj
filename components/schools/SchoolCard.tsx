"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { SchoolListItem } from "@/lib/types";

export default function SchoolCard({ school }: { school: SchoolListItem }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
      whileHover={{ y: -3, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }}
      viewport={{ once: true, margin: "-30px" }}
    >
      <Link href={`/schools/${school.slug}`} className="no-underline block">
        <div className="pt-7 px-7 pb-6 cursor-pointer bg-stone-50/70 dark:bg-stone-900/70 border border-zinc-950/[0.07] dark:border-stone-100/[0.07] shadow-[0_2px_12px_rgba(17,21,26,0.04)] transition-[background,border-color,box-shadow] duration-200 hover:bg-stone-50 dark:hover:bg-stone-900 hover:border-zinc-700/12 dark:hover:border-zinc-500/12 hover:shadow-[0_8px_28px_rgba(17,21,26,0.08)]">
          <div className="font-cinzel text-[0.6rem] tracking-widest uppercase text-[#845400] dark:text-[#C47029] mb-3">{school.eraRange}</div>
          <div className="font-serif italic text-xl font-normal text-zinc-950 dark:text-stone-100 leading-snug mb-3">{school.title}</div>
          <p className="font-serif text-xs leading-[1.72] text-slate-500 dark:text-stone-400 m-0 mb-4 overflow-hidden [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
            {school.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5 flex-wrap">
              {school.philosopherPreview.map(p => (
                <span key={p._id} className="font-cinzel text-[0.6rem] uppercase tracking-wide text-[#845400] dark:text-[#C47029] bg-[#F5EEE3] dark:bg-[rgba(132,84,0,0.14)] border border-[rgba(132,84,0,0.18)] dark:border-[rgba(196,112,41,0.25)] px-2 py-0.5 rounded-full">
                  {p.name}
                </span>
              ))}
              {school.philosopherCount > 3 && (
                <span className="font-sans text-xs text-slate-500 dark:text-stone-400 opacity-60 px-1 py-0.5">+{school.philosopherCount - 3}</span>
              )}
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[#845400]/50 dark:text-[#C47029]/50 shrink-0" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
