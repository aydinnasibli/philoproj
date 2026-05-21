"use client";

import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

export default function DirectoryListHeader({ count }: { count: number }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease }}
        className="mb-10 md:mb-14"
      >
        <h1 className="font-display font-bold text-[clamp(2.2rem,4vw,3.2rem)] text-[#11151A] dark:text-stone-100 leading-tight tracking-[-0.01em] m-0">
          Thinkers
        </h1>
        <div className="h-px bg-[#11151A]/10 dark:bg-stone-100/10 mt-6" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.07, ease }}
        className="pt-3 pb-4 border-b-2 border-zinc-950 dark:border-stone-100 flex items-baseline gap-4"
      >
        <span className="font-serif italic text-[clamp(1.5rem,4vw,2rem)] font-normal leading-none">{count}</span>
        <span className="font-sans text-xs tracking-widest uppercase text-slate-500 dark:text-stone-400 font-semibold">Thinkers</span>
      </motion.div>
    </>
  );
}
