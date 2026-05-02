"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { FullPhilosopher } from "@/lib/types";
import Link from "next/link";

const ERA_COLOUR: Record<string, string> = {
  "pre-socratic":      "rgba(196,150,40,0.90)",
  "classical-antiquity":"rgba(215,170,50,0.90)",
  "hellenistic-roman": "rgba(200,145,55,0.90)",
  "late-antique":      "rgba(180,110,50,0.90)",
  "medieval":          "rgba(107,130,85,0.90)",
  "early-modern":      "rgba(195,100,55,0.90)",
  "critical-era":      "rgba(90,105,175,0.90)",
};

const ERA_BG: Record<string, string> = {
  "pre-socratic":      "rgba(196,150,40,0.05)",
  "classical-antiquity":"rgba(215,170,50,0.05)",
  "hellenistic-roman": "rgba(200,145,55,0.05)",
  "late-antique":      "rgba(180,110,50,0.05)",
  "medieval":          "rgba(107,130,85,0.05)",
  "early-modern":      "rgba(195,100,55,0.05)",
  "critical-era":      "rgba(90,105,175,0.05)",
};

const ERA_GLOW: Record<string, string> = {
  "pre-socratic":      "rgba(196,150,40,0.14)",
  "classical-antiquity":"rgba(215,170,50,0.14)",
  "hellenistic-roman": "rgba(200,145,55,0.14)",
  "late-antique":      "rgba(180,110,50,0.14)",
  "medieval":          "rgba(107,130,85,0.14)",
  "early-modern":      "rgba(195,100,55,0.14)",
  "critical-era":      "rgba(90,105,175,0.14)",
};

function formatYears(birth?: number, death?: number) {
  if (!birth && !death) return "";
  const b = birth ? (birth < 0 ? `${Math.abs(birth)} BC` : `${birth}`) : "?";
  const d = death ? (death < 0 ? `${Math.abs(death)} BC` : `${death}`) : "present";
  return `${b} – ${d}`;
}

export default function ProfileHero({ philosopher }: { philosopher: FullPhilosopher }) {
  const eraColour = ERA_COLOUR[philosopher.eraSlug] ?? "var(--accent)";
  const eraBg     = ERA_BG[philosopher.eraSlug]     ?? "transparent";
  const eraGlow   = ERA_GLOW[philosopher.eraSlug]   ?? "transparent";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Era-tinted hero banner */}
      <div
        style={{
          backgroundColor: eraBg,
          borderTop: `4px solid ${eraColour}`,
          padding: "2rem 0 2.5rem",
          marginBottom: "2rem",
          marginLeft: "-2.5rem",
          marginRight: "-2.5rem",
          paddingLeft: "2.5rem",
          paddingRight: "2.5rem",
        }}
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
          <span style={{ color: eraColour }}>{philosopher.name}</span>
        </div>

        {/* Avatar + Title */}
        <div style={{ display: "flex", gap: "2.5rem", alignItems: "flex-start" }}>
          {philosopher.avatarUrl && (
            <div
              style={{
                position: "relative",
                width: "200px",
                height: "200px",
                borderRadius: "50%",
                overflow: "hidden",
                border: `3px solid ${eraColour}`,
                boxShadow: `0 0 0 8px ${eraGlow}, 0 12px 40px rgba(0,0,0,0.14)`,
                flexShrink: 0,
              }}
            >
              <Image
                src={philosopher.avatarUrl}
                alt={philosopher.name}
                fill
                sizes="200px"
                style={{ objectFit: "cover" }}
                priority
              />
            </div>
          )}

          <div style={{ paddingTop: "0.5rem" }}>
            {/* Branch tag */}
            <span
              style={{
                display: "inline-block",
                fontFamily: "var(--font-sans)",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: eraColour,
                marginBottom: "12px",
                borderBottom: `1px solid ${eraColour}`,
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

            {/* Era colour rule */}
            <div
              style={{
                width: "56px",
                height: "2px",
                backgroundColor: eraColour,
                marginTop: "16px",
                marginBottom: "10px",
                opacity: 0.75,
              }}
            />

            {/* Years */}
            {(philosopher.birthYear || philosopher.deathYear) && (
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "13px",
                  color: "var(--ink-muted)",
                  letterSpacing: "0.05em",
                }}
              >
                {formatYears(philosopher.birthYear, philosopher.deathYear)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Hook Quote */}
      {philosopher.hookQuote && (
        <blockquote
          style={{
            borderLeft: `3px solid ${eraColour}`,
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
