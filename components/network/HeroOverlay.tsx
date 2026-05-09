"use client";

import { motion } from "framer-motion";

interface Props { onEnter: () => void; }

export default function HeroOverlay({ onEnter }: Props) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center cursor-default bg-[radial-gradient(ellipse_at_40%_50%,#FDFAF4_0%,#F5EFE1_55%,#EDE4CF_100%)]"
    >
      {/* Noise grain */}
      <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%27250%27%20height=%27250%27%3E%3Cfilter%20id=%27n%27%3E%3CfeTurbulence%20type=%27fractalNoise%27%20baseFrequency=%270.72%27%20numOctaves=%274%27%20stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect%20width=%27250%27%20height=%27250%27%20filter=%27url(%23n)%27%20opacity=%270.045%27/%3E%3C/svg%3E')]" />

      {/* Cartographic grid */}
      <div className="absolute inset-0 pointer-events-none cartographic-grid" />

      {/* Golden radial glow */}
      <div className="absolute pointer-events-none top-[45%] left-1/2 w-[70vw] h-[70vw] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse,rgba(196,112,41,0.12)_0%,transparent_65%)]" />

      {/* Content */}
      <div className="text-center relative z-[2] max-w-[680px] px-[40px]">

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="font-sans text-[9px] font-bold tracking-[0.30em] uppercase text-accent-bright mb-7"
        >
          A Living Map of Western Thought
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif font-medium italic leading-none text-ink tracking-[-0.02em] mb-7"
          style={{ fontSize: "clamp(3rem,7vw,5.5rem)" }}
        >
          The Living<br />Manuscript
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.7, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center gap-4 mb-7"
        >
          <div className="flex-1 max-w-[80px] h-px bg-[linear-gradient(to_right,transparent,rgba(132,84,0,0.35))]" />
          <div className="w-[6px] h-[6px] rounded-full bg-accent-bright opacity-70" />
          <div className="flex-1 max-w-[80px] h-px bg-[linear-gradient(to_left,transparent,rgba(132,84,0,0.35))]" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif italic text-[1.15rem] leading-[1.75] text-ink-muted mx-auto mb-[52px] max-w-[480px]"
        >
          Trace the lineage, ideas, and connections of history&rsquo;s greatest thinkers — from Socrates to Wittgenstein.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          onClick={onEnter}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="font-sans text-[10px] font-bold tracking-[0.25em] uppercase text-canvas bg-accent border-none rounded-[2px] px-[40px] py-4 cursor-pointer inline-flex items-center gap-3 shadow-[0_8px_32px_rgba(132,84,0,0.25),0_2px_8px_rgba(132,84,0,0.15)] transition-[box-shadow] duration-300"
        >
          Enter the Network
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="font-sans text-[8.5px] font-medium tracking-[0.15em] uppercase text-ink-muted opacity-50 mt-7"
        >
          10 Thinkers · 4 Eras · Centuries of Thought
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="absolute bottom-10 font-serif italic text-[0.78rem] text-ink-muted opacity-40 tracking-[0.05em]"
      >
        &ldquo;The unexamined life is not worth living.&rdquo; — Socrates
      </motion.div>
    </motion.div>
  );
}
