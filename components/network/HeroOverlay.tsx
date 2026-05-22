"use client";

import { motion } from "framer-motion";

interface Props { onEnter: () => void; }

export default function HeroOverlay({ onEnter }: Props) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center cursor-default bg-[radial-gradient(ellipse_at_40%_50%,var(--color-stone-50)_0%,var(--color-stone-100)_55%,var(--color-stone-200)_100%)] dark:bg-[radial-gradient(ellipse_at_40%_50%,var(--color-stone-900)_0%,var(--color-stone-900)_55%,var(--color-stone-950)_100%)]"
    >
      {/* Subtle radial glow */}
      <div className="absolute pointer-events-none top-[45%] left-1/2 w-[70vw] h-[70vw] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse,color-mix(in_srgb,var(--color-zinc-950)_4%,transparent)_0%,transparent_65%)]" />

      {/* Content */}
      <div className="text-center relative z-2 max-w-170 px-5 md:px-10">

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="font-sans text-xs font-bold tracking-[0.30em] uppercase text-zinc-600 dark:text-zinc-400 mb-7"
        >
          A Living Map of Western Thought
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif font-medium italic leading-none text-zinc-950 dark:text-stone-100 tracking-[-0.02em] mb-7 text-[clamp(3rem,7vw,5.5rem)]"
        >
          The Living<br />Manuscript
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.7, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center gap-4 mb-7"
        >
          <div className="flex-1 max-w-20 h-px bg-linear-to-r from-transparent to-zinc-600/35" />
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 dark:bg-zinc-400 opacity-70" />
          <div className="flex-1 max-w-20 h-px bg-linear-to-l from-transparent to-zinc-600/35" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif italic text-lg leading-loose text-slate-500 dark:text-stone-400 mx-auto mb-13 max-w-full md:max-w-120"
        >
          Trace the lineage, ideas, and connections of history&rsquo;s greatest thinkers — from Socrates to Wittgenstein.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          onClick={onEnter}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="font-cinzel text-[0.7rem] tracking-[0.25em] uppercase text-stone-50 bg-zinc-950 border-none rounded-xs px-6 md:px-10 py-4 cursor-pointer inline-flex items-center gap-3 shadow-[0_8px_32px_rgba(9,9,11,0.2),0_2px_8px_rgba(9,9,11,0.1)] transition-colors duration-180 hover:bg-zinc-800"
        >
          Enter the Network
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="font-sans text-xs font-medium tracking-widest uppercase text-slate-500 dark:text-stone-400 opacity-50 mt-7"
        >
          10 Thinkers · 4 Eras · Centuries of Thought
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="absolute bottom-10 font-serif italic text-xs text-slate-500 dark:text-stone-400 opacity-40 tracking-wider"
      >
        &ldquo;The unexamined life is not worth living.&rdquo; — Socrates
      </motion.div>
    </motion.div>
  );
}
