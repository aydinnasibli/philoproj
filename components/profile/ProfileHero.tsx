"use client";

import { motion } from "framer-motion";
import type { FullPhilosopher } from "@/lib/mockData";
import Link from "next/link";

function formatYears(birth?: number, death?: number) {
  if (!birth && !death) return "";
  const b = birth ? (birth < 0 ? `${Math.abs(birth)} BC` : `${birth}`) : "?";
  const d = death ? (death < 0 ? `${Math.abs(death)} BC` : `${death}`) : "present";
  return `${b} – ${d}`;
}

export default function ProfileHero({ philosopher }: { philosopher: FullPhilosopher }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Breadcrumb */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
          marginBottom: "2.5rem",
          fontFamily: "var(--font-sans)",
          fontSize: "11px",
          color: "var(--ink-muted)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          fontWeight: 600,
        }}
      >
        <Link href="/" style={{ color: "var(--ink-muted)" }}>Network</Link>
        <span>→</span>
        {philosopher.eraTitle && (
          <>
            <Link href="/lineage" style={{ color: "var(--ink-muted)" }}>{philosopher.eraTitle}</Link>
            <span>→</span>
          </>
        )}
        <span style={{ color: "var(--accent)" }}>{philosopher.name}</span>
      </div>

      {/* Avatar + Title group */}
      <div style={{ display: "flex", gap: "2.5rem", alignItems: "flex-start", marginBottom: "2rem" }}>
        {/* Large avatar */}
        {philosopher.avatarUrl && (
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              overflow: "hidden",
              border: "3px solid var(--ink)",
              flexShrink: 0,
              marginTop: "8px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={philosopher.avatarUrl}
              alt={philosopher.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        )}

        <div>
          {/* Branch tag */}
          <span
            style={{
              display: "inline-block",
              fontFamily: "var(--font-sans)",
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: "12px",
              borderBottom: "1px solid var(--accent)",
              paddingBottom: "2px",
            }}
          >
            {philosopher.coreBranch}
          </span>

          {/* Name */}
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 500,
              fontSize: "clamp(3rem, 7vw, 5rem)",
              lineHeight: 0.95,
              color: "var(--ink)",
              letterSpacing: "-0.02em",
            }}
          >
            {philosopher.name}
          </h1>

          {/* Years */}
          {(philosopher.birthYear || philosopher.deathYear) && (
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "13px",
                color: "var(--ink-muted)",
                marginTop: "10px",
                letterSpacing: "0.05em",
              }}
            >
              {formatYears(philosopher.birthYear, philosopher.deathYear)}
            </p>
          )}
        </div>
      </div>

      {/* Hook Quote */}
      {philosopher.hookQuote && (
        <blockquote
          style={{
            borderLeft: "3px solid var(--accent)",
            paddingLeft: "1.5rem",
            margin: "0 0 2rem",
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: "1.35rem",
            lineHeight: 1.5,
            color: "var(--ink)",
            maxWidth: "64ch",
          }}
        >
          &ldquo;{philosopher.hookQuote}&rdquo;
        </blockquote>
      )}

      {/* Short summary */}
      {philosopher.shortSummary && (
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "1rem",
            lineHeight: 1.8,
            color: "var(--ink-muted)",
            maxWidth: "68ch",
            borderTop: "1px solid var(--border)",
            paddingTop: "1.5rem",
          }}
        >
          {philosopher.shortSummary}
        </p>
      )}
    </motion.div>
  );
}
