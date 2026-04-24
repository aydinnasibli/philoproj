"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { PhilosopherNode } from "@/lib/mockData";

type Props = {
  philosopher: PhilosopherNode;
};

export default function HoverCard({ philosopher }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      style={{
        position: "absolute",
        top: "calc(100% + 14px)",
        left: "50%",
        transform: "translateX(-50%)",
        width: "270px",
        zIndex: 100,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        background: "rgba(19, 22, 32, 0.95)",
        border: "1px solid rgba(236,232,223,0.10)",
        borderTop: "1px solid rgba(212,152,42,0.30)",
        padding: "18px",
        boxShadow: "0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.3)",
        pointerEvents: "none",
        borderRadius: "2px",
      }}
    >
      {/* Gold pip at top */}
      <div
        style={{
          position: "absolute",
          top: "-1px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "24px",
          height: "2px",
          background: "var(--accent)",
          borderRadius: "0 0 2px 2px",
          boxShadow: "0 0 10px var(--accent-glow)",
        }}
      />

      {/* Quote */}
      {philosopher.hookQuote && (
        <blockquote
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: "0.82rem",
            lineHeight: 1.6,
            color: "var(--ink)",
            borderLeft: "2px solid var(--accent)",
            paddingLeft: "10px",
            marginBottom: "12px",
            letterSpacing: "-0.005em",
          }}
        >
          &ldquo;{philosopher.hookQuote}&rdquo;
        </blockquote>
      )}

      {/* Summary */}
      {philosopher.shortSummary && (
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.74rem",
            lineHeight: 1.7,
            color: "var(--ink-muted)",
            marginBottom: "14px",
          }}
        >
          {philosopher.shortSummary.slice(0, 130)}
          {philosopher.shortSummary.length > 130 ? "…" : ""}
        </p>
      )}

      {/* CTA */}
      <Link
        href={`/philosophers/${philosopher.slug}`}
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "9.5px",
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--accent)",
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          pointerEvents: "auto",
        }}
      >
        View Profile
        <span style={{ opacity: 0.7 }}>→</span>
      </Link>
    </motion.div>
  );
}
