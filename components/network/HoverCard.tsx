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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      style={{
        position: "absolute",
        top: "calc(100% + 12px)",
        left: "50%",
        transform: "translateX(-50%)",
        width: "280px",
        zIndex: 100,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        backgroundColor: "rgba(245, 242, 235, 0.92)",
        border: "1px solid var(--border)",
        padding: "20px",
        boxShadow: "0 8px 32px rgba(26,32,44,0.08)",
        pointerEvents: "none",
      }}
    >
      {/* Quote */}
      {philosopher.hookQuote && (
        <blockquote
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: "0.8rem",
            lineHeight: 1.55,
            color: "var(--ink)",
            borderLeft: "2px solid var(--accent)",
            paddingLeft: "10px",
            marginBottom: "12px",
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
            fontSize: "0.75rem",
            lineHeight: 1.65,
            color: "var(--ink-muted)",
            marginBottom: "14px",
          }}
        >
          {philosopher.shortSummary.slice(0, 140)}
          {philosopher.shortSummary.length > 140 ? "…" : ""}
        </p>
      )}

      {/* CTA */}
      <Link
        href={`/philosophers/${philosopher.slug}`}
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "var(--accent)",
          borderBottom: "1px solid var(--accent)",
          paddingBottom: "1px",
          pointerEvents: "auto",
        }}
      >
        View Profile →
      </Link>
    </motion.div>
  );
}
