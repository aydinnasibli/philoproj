"use client";

import { motion } from "framer-motion";
import type { FullPhilosopher } from "@/lib/mockData";
import Link from "next/link";

const ERA_COLOUR: Record<string, string> = {
  "era-1": "#D7AA32",
  "era-2": "#D7AA32",
  "era-3": "#C36437",
  "era-4": "#5A69AF",
};

const ERA_GLOW: Record<string, string> = {
  "era-1": "rgba(215,170,50,0.22)",
  "era-2": "rgba(215,170,50,0.22)",
  "era-3": "rgba(195,100,55,0.22)",
  "era-4": "rgba(90,105,175,0.22)",
};

const ERA_GRADIENT: Record<string, string> = {
  "era-1": "radial-gradient(ellipse at 0% 50%, rgba(215,170,50,0.12) 0%, transparent 65%)",
  "era-2": "radial-gradient(ellipse at 0% 50%, rgba(215,170,50,0.12) 0%, transparent 65%)",
  "era-3": "radial-gradient(ellipse at 0% 50%, rgba(195,100,55,0.12) 0%, transparent 65%)",
  "era-4": "radial-gradient(ellipse at 0% 50%, rgba(90,105,175,0.12) 0%, transparent 65%)",
};

function formatYears(birth?: number, death?: number) {
  if (!birth && !death) return "";
  const b = birth ? (birth < 0 ? `${Math.abs(birth)} BC` : `${birth}`) : "?";
  const d = death ? (death < 0 ? `${Math.abs(death)} BC` : `${death}`) : "present";
  return `${b} – ${d}`;
}

export default function ProfileHero({ philosopher }: { philosopher: FullPhilosopher }) {
  const eraColour  = ERA_COLOUR[philosopher.eraId]   ?? "var(--accent)";
  const eraGlow    = ERA_GLOW[philosopher.eraId]     ?? "rgba(212,152,42,0.22)";
  const eraGrad    = ERA_GRADIENT[philosopher.eraId] ?? "none";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: "easeOut" }}
    >
      {/* ── Full-bleed hero banner ───────────────────────── */}
      <div
        style={{
          position: "relative",
          background: `${eraGrad}, linear-gradient(180deg, var(--surface) 0%, var(--canvas-warm) 100%)`,
          borderBottom: `1px solid rgba(236,232,223,0.06)`,
          padding: "2.5rem 0 3rem",
          marginBottom: "2.5rem",
          marginLeft: "-2.5rem",
          marginRight: "-2.5rem",
          paddingLeft: "2.5rem",
          paddingRight: "2.5rem",
          overflow: "hidden",
        }}
      >
        {/* Era colour stripe at top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: `linear-gradient(90deg, ${eraColour} 0%, transparent 60%)`,
          }}
        />

        {/* Large ghost name in background */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            right: "-1rem",
            bottom: "-1.5rem",
            fontFamily: "var(--font-display)",
            fontSize: "clamp(6rem, 16vw, 12rem)",
            fontWeight: 700,
            fontStyle: "italic",
            color: eraColour,
            opacity: 0.035,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            userSelect: "none",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {philosopher.name.split(" ").at(-1)}
        </div>

        {/* Breadcrumb */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            marginBottom: "2.5rem",
            fontFamily: "var(--font-sans)",
            fontSize: "10px",
            color: "var(--ink-muted)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          <Link href="/" style={{ color: "var(--ink-muted)", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--ink)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-muted)")}
          >
            Network
          </Link>
          <span style={{ opacity: 0.35 }}>›</span>
          {philosopher.eraTitle && (
            <>
              <Link href="/lineage" style={{ color: "var(--ink-muted)", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--ink)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-muted)")}
              >
                {philosopher.eraTitle}
              </Link>
              <span style={{ opacity: 0.35 }}>›</span>
            </>
          )}
          <span style={{ color: eraColour }}>{philosopher.name}</span>
        </div>

        {/* Avatar + Title */}
        <div style={{ display: "flex", gap: "2.5rem", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
          {philosopher.avatarUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              style={{
                width: "180px",
                height: "180px",
                borderRadius: "50%",
                overflow: "hidden",
                border: `2px solid ${eraColour}`,
                boxShadow: `0 0 0 6px ${eraGlow}, 0 0 40px ${eraGlow}, 0 16px 48px rgba(0,0,0,0.45)`,
                flexShrink: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={philosopher.avatarUrl}
                alt={philosopher.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </motion.div>
          )}

          <div style={{ paddingTop: "0.75rem" }}>
            {/* Branch tag */}
            <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "20px", height: "1px", background: eraColour, opacity: 0.7 }} />
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "9.5px",
                  fontWeight: 700,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: eraColour,
                }}
              >
                {philosopher.coreBranch}
              </span>
            </div>

            {/* Name */}
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "clamp(2.8rem, 6.5vw, 5rem)",
                lineHeight: 0.92,
                color: "var(--ink)",
                letterSpacing: "-0.03em",
                marginBottom: "20px",
              }}
            >
              {philosopher.name}
            </h1>

            {/* Years */}
            {(philosopher.birthYear || philosopher.deathYear) && (
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "12px",
                  color: "var(--ink-muted)",
                  letterSpacing: "0.08em",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: eraColour,
                    opacity: 0.8,
                    flexShrink: 0,
                  }}
                />
                {formatYears(philosopher.birthYear, philosopher.deathYear)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Hook Quote ──────────────────────────────────── */}
      {philosopher.hookQuote && (
        <motion.blockquote
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.55 }}
          style={{
            position: "relative",
            paddingLeft: "1.75rem",
            paddingTop: "0.25rem",
            paddingBottom: "0.25rem",
            margin: "0 0 2.5rem",
            maxWidth: "60ch",
          }}
        >
          {/* Left glow bar */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "3px",
              borderRadius: "2px",
              background: `linear-gradient(180deg, ${eraColour} 0%, transparent 100%)`,
              boxShadow: `0 0 10px ${eraGlow}`,
            }}
          />
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: "1.3rem",
              lineHeight: 1.55,
              color: "var(--ink)",
              letterSpacing: "-0.005em",
            }}
          >
            &ldquo;{philosopher.hookQuote}&rdquo;
          </p>
        </motion.blockquote>
      )}

      {/* ── Short summary ───────────────────────────────── */}
      {philosopher.shortSummary && (
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "1rem",
            lineHeight: 1.85,
            color: "var(--ink-muted)",
            maxWidth: "68ch",
            borderTop: "1px solid var(--border)",
            paddingTop: "1.75rem",
          }}
        >
          {philosopher.shortSummary}
        </p>
      )}
    </motion.div>
  );
}
