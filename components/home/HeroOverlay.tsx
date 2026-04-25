"use client";

import { motion } from "framer-motion";

interface Props {
  onEnter: () => void;
}

export default function HeroOverlay({ onEnter }: Props) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse at 40% 50%, #FDFAF4 0%, #F5EFE1 55%, #EDE4CF 100%)",
        cursor: "default",
      }}
    >
      {/* Noise grain layer */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='250' height='250' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E")`,
      }} />

      {/* Cartographic grid lines */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(17,21,26,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(17,21,26,0.04) 1px, transparent 1px)",
        backgroundSize: "80px 80px",
      }} />

      {/* Faint golden radial glow */}
      <div style={{
        position: "absolute", top: "45%", left: "50%",
        width: "70vw", height: "70vw",
        transform: "translate(-50%, -50%)",
        background: "radial-gradient(ellipse, rgba(196,112,41,0.12) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      {/* Content */}
      <div style={{ textAlign: "center", maxWidth: 680, padding: "0 40px", position: "relative", zIndex: 2 }}>

        {/* Overline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "var(--font-sans)", fontSize: "9px", fontWeight: 700,
            letterSpacing: "0.30em", textTransform: "uppercase",
            color: "var(--accent-bright)", marginBottom: 28,
          }}
        >
          A Living Map of Western Thought
        </motion.div>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "var(--font-serif)", fontSize: "clamp(3rem, 7vw, 5.5rem)",
            fontWeight: 500, fontStyle: "italic", lineHeight: 1.0,
            color: "var(--ink)", letterSpacing: "-0.02em", marginBottom: 28,
          }}
        >
          The Living<br />Manuscript
        </motion.h1>

        {/* Ornamental divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.7, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 28 }}
        >
          <div style={{ flex: 1, maxWidth: 80, height: 1, background: "linear-gradient(to right, transparent, rgba(132,84,0,0.35))" }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-bright)", opacity: 0.7 }} />
          <div style={{ flex: 1, maxWidth: 80, height: 1, background: "linear-gradient(to left, transparent, rgba(132,84,0,0.35))" }} />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "var(--font-serif)", fontSize: "1.15rem", fontStyle: "italic",
            lineHeight: 1.75, color: "var(--ink-muted)", marginBottom: 52, maxWidth: 480, margin: "0 auto 52px",
          }}
        >
          Trace the lineage, ideas, and connections of history&rsquo;s greatest thinkers
          — from Socrates to Wittgenstein.
        </motion.p>

        {/* Enter button */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          onClick={onEnter}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            fontFamily: "var(--font-sans)", fontSize: "10px", fontWeight: 700,
            letterSpacing: "0.25em", textTransform: "uppercase",
            color: "var(--canvas)", background: "var(--accent)",
            border: "none", borderRadius: 2, padding: "16px 40px",
            cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 12,
            boxShadow: "0 8px 32px rgba(132,84,0,0.25), 0 2px 8px rgba(132,84,0,0.15)",
            transition: "box-shadow 0.3s ease",
          }}
        >
          Enter the Network
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </motion.button>

        {/* Philosopher count hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          style={{
            fontFamily: "var(--font-sans)", fontSize: "8.5px", fontWeight: 500,
            letterSpacing: "0.15em", textTransform: "uppercase",
            color: "var(--ink-muted)", opacity: 0.5, marginTop: 28,
          }}
        >
          10 Thinkers · 4 Eras · Centuries of Thought
        </motion.div>
      </div>

      {/* Bottom ornamental text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        style={{
          position: "absolute", bottom: 40,
          fontFamily: "var(--font-serif)", fontSize: "0.78rem", fontStyle: "italic",
          color: "var(--ink-muted)", opacity: 0.4, letterSpacing: "0.05em",
        }}
      >
        &ldquo;The unexamined life is not worth living.&rdquo; — Socrates
      </motion.div>
    </motion.div>
  );
}
