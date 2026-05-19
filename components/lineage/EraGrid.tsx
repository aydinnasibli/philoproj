"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import type { EraWithPhilosophers } from "@/lib/types";

function formatYear(y: number) {
  if (y < 0) return `${Math.abs(y)} BC`;
  return `${y} AD`;
}

type Props = { eras: EraWithPhilosophers[] };

export default function EraGrid({ eras }: Props) {
  if (eras.length === 0) {
    return (
      <div className="px-4 md:px-10 py-10 md:py-16 text-slate-500 dark:text-stone-400 font-serif italic">
        No eras found. Run <code>npm run seed</code>.
      </div>
    );
  }

  return (
    <div className="pt-[72px] md:pt-24 pb-12 px-0 md:px-10 grid grid-cols-[repeat(auto-fill,minmax(min(340px,100%),1fr))] gap-[1.5px] bg-zinc-200 dark:bg-zinc-700">
      {eras.map((era, idx) => (
        <motion.div key={era._id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08, duration: 0.5, ease: "easeOut" }} className="bg-stone-50 dark:bg-stone-900">
          <DashboardCard era={era} />
        </motion.div>
      ))}
    </div>
  );
}

function DashboardCard({ era }: { era: EraWithPhilosophers }) {
  return (
    <div className="p-10 h-full flex flex-col gap-5 relative overflow-hidden min-h-[300px] group">
      <div className="absolute top-0 left-0 right-0 h-[2px] opacity-60 bg-[linear-gradient(90deg,var(--accent),transparent)]" />
      <span className="font-sans text-xs font-semibold tracking-widest uppercase text-amber-800 dark:text-amber-600">
        {formatYear(era.startYear)} — {formatYear(era.endYear)}
      </span>
      <h2 className="font-serif text-3xl font-medium leading-[1.15] text-zinc-950 dark:text-stone-100">{era.title}</h2>
      <p className="font-sans text-sm leading-loose text-slate-500 dark:text-stone-400 flex-1">{era.description}</p>

      {era.philosophers.length > 0 && (
        <div>
          <p className="font-sans text-xs tracking-widest uppercase text-slate-500 dark:text-stone-400 mb-2.5 font-semibold">Notable Thinkers</p>
          <div className="flex flex-wrap gap-1.5">
            {era.philosophers.map((p) => (
              <Link
                key={p._id}
                href={`/philosophers/${p.slug}`}
                className="flex items-center gap-1.5 px-2.5 py-1 border border-zinc-200 dark:border-zinc-700 text-xs font-sans text-zinc-950 dark:text-stone-100 no-underline bg-transparent transition-[border-color,color] duration-200 hover:border-amber-800 dark:hover:border-amber-600 hover:text-amber-800 dark:hover:text-amber-600"
              >
                {p.avatarUrl && (
                  <Image src={p.avatarUrl} alt={p.name} width={18} height={18} className="rounded-full object-cover shrink-0" />
                )}
                {p.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
