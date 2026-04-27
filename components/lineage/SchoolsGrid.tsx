"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { SchoolWithPhilosophers } from "@/lib/types";

// Era-derived accent colour for each school — mirrors the era bands on the map
const SCHOOL_STYLE: Record<string, { accentColor: string; accentFill: string; stripColor: string }> = {
  "sch-1": { accentColor: "#7a5e00", accentFill: "rgba(215,170,50,0.07)",  stripColor: "rgba(215,170,50,0.75)" },
  "sch-2": { accentColor: "#7a5e00", accentFill: "rgba(215,170,50,0.07)",  stripColor: "rgba(215,170,50,0.75)" },
  "sch-3": { accentColor: "#7a5e00", accentFill: "rgba(215,170,50,0.07)",  stripColor: "rgba(215,170,50,0.75)" },
  "sch-4": { accentColor: "#7a3c15", accentFill: "rgba(195,100,55,0.07)",  stripColor: "rgba(195,100,55,0.75)" },
  "sch-5": { accentColor: "#7a3c15", accentFill: "rgba(195,100,55,0.07)",  stripColor: "rgba(195,100,55,0.75)" },
  "sch-6": { accentColor: "#38407a", accentFill: "rgba(90,105,175,0.07)",  stripColor: "rgba(90,105,175,0.75)" },
  "sch-7": { accentColor: "#38407a", accentFill: "rgba(90,105,175,0.07)",  stripColor: "rgba(90,105,175,0.75)" },
  "sch-8": { accentColor: "#38407a", accentFill: "rgba(90,105,175,0.07)",  stripColor: "rgba(90,105,175,0.75)" },
};

function fallbackStyle() {
  return { accentColor: "var(--accent)", accentFill: "var(--accent-pale)", stripColor: "var(--accent)" };
}

type Props = { schools: SchoolWithPhilosophers[] };

export default function SchoolsGrid({ schools }: Props) {
  if (schools.length === 0) {
    return (
      <div style={{ padding: "6rem 3rem", color: "var(--ink-muted)", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
        No schools of thought found.
      </div>
    );
  }

  return (
    <div
      style={{
        paddingTop: "80px",
        minHeight: "100vh",
        backgroundColor: "var(--canvas)",
      }}
    >
      {/* Page header */}
      <div style={{ padding: "52px 56px 40px", borderBottom: "1px solid var(--border)" }}>
        <div style={{
          fontFamily: "var(--font-sans)", fontSize: "10px", fontWeight: 700,
          letterSpacing: "0.22em", textTransform: "uppercase",
          color: "var(--accent)", marginBottom: 14,
        }}>
          Schools of Thought
        </div>
        <h1 style={{
          fontFamily: "var(--font-serif)", fontStyle: "italic",
          fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 400,
          lineHeight: 1.1, color: "var(--ink)", marginBottom: 16,
        }}>
          The Lineage of Ideas
        </h1>
        <p style={{
          fontFamily: "var(--font-sans)", fontSize: "0.875rem",
          lineHeight: 1.8, color: "var(--ink-muted)", maxWidth: "52ch",
        }}>
          Philosophy does not advance in isolation — each school emerges from, reacts against, and reshapes what came before.
          Here the chain of ideas is traced from ancient Athens to the twentieth century.
        </p>
      </div>

      {/* School cards grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
          gap: "1.5px",
          backgroundColor: "var(--border)",
        }}
      >
        {schools.map((school, idx) => {
          const style = SCHOOL_STYLE[school._id] ?? fallbackStyle();
          return (
            <motion.div
              key={school._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07, duration: 0.45, ease: "easeOut" }}
              style={{ backgroundColor: "var(--canvas)" }}
            >
              <SchoolCard school={school} style={style} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── Individual school card ────────────────────────────────

type CardStyle = { accentColor: string; accentFill: string; stripColor: string };

function SchoolCard({ school, style }: { school: SchoolWithPhilosophers; style: CardStyle }) {
  return (
    <div
      style={{
        padding: "2.5rem",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Coloured top strip */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "2px",
          background: style.stripColor,
        }}
      />

      {/* Header row: title + era range */}
      <div>
        <div style={{
          fontFamily: "var(--font-sans)", fontSize: "10px", fontWeight: 700,
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: style.accentColor, marginBottom: 10,
        }}>
          {school.eraRange}
        </div>
        <h2 style={{
          fontFamily: "var(--font-serif)",
          fontSize: "1.65rem", fontWeight: 500,
          lineHeight: 1.15, color: "var(--ink)",
        }}>
          {school.title}
        </h2>
      </div>

      {/* Description */}
      <p style={{
        fontFamily: "var(--font-sans)", fontSize: "0.85rem",
        lineHeight: 1.8, color: "var(--ink-muted)",
      }}>
        {school.description}
      </p>

      {/* Core ideas */}
      <div>
        <SectionLabel>Core Ideas</SectionLabel>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
          {school.coreIdeas.map((idea, i) => (
            <li
              key={i}
              style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}
            >
              <span style={{
                flexShrink: 0,
                width: 5, height: 5, marginTop: "7px",
                borderRadius: "50%",
                backgroundColor: style.accentColor,
                opacity: 0.7,
              }} />
              <span style={{
                fontFamily: "var(--font-sans)", fontSize: "0.8rem",
                lineHeight: 1.65, color: "var(--ink-muted)",
              }}>
                {idea}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Key thinkers */}
      {school.philosophers.length > 0 && (
        <div>
          <SectionLabel>Key Thinkers</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {school.philosophers.map((p) => (
              <PhilosopherChip key={p._id} philosopher={p} accentColor={style.accentColor} />
            ))}
          </div>
        </div>
      )}

      {/* Intellectual lineage — influenced by / to */}
      {(school.influencedBy.length > 0 || school.influencedTo.length > 0) && (
        <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
          <SectionLabel>Intellectual Lineage</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {school.influencedBy.length > 0 && (
              <LineageRow
                direction="from"
                label="Emerged from"
                schools={school.influencedBy}
                accentColor={style.accentColor}
              />
            )}
            {school.influencedTo.length > 0 && (
              <LineageRow
                direction="to"
                label="Gave rise to"
                schools={school.influencedTo}
                accentColor={style.accentColor}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: "var(--font-sans)", fontSize: "9px", fontWeight: 700,
      letterSpacing: "0.18em", textTransform: "uppercase",
      color: "var(--ink-muted)", opacity: 0.65,
      marginBottom: "10px",
      display: "flex", alignItems: "center", gap: "10px",
    }}>
      <span style={{ flex: 1, height: "1px", background: "var(--border)" }} />
      {children}
      <span style={{ flex: 3, height: "1px", background: "var(--border)" }} />
    </div>
  );
}

function PhilosopherChip({
  philosopher,
  accentColor,
}: {
  philosopher: { _id: string; name: string; slug: string; avatarUrl: string; coreBranch: string };
  accentColor: string;
}) {
  return (
    <Link
      href={`/philosophers/${philosopher.slug}`}
      style={{
        display: "flex", alignItems: "center", gap: "6px",
        padding: "4px 10px 4px 5px",
        border: "1px solid var(--border)",
        borderRadius: "100px",
        fontSize: "12px", fontFamily: "var(--font-sans)",
        color: "var(--ink)", textDecoration: "none",
        transition: "border-color 0.2s, color 0.2s, background 0.2s",
        backgroundColor: "transparent",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = accentColor;
        (e.currentTarget as HTMLElement).style.color = accentColor;
        (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(0,0,0,0.02)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLElement).style.color = "var(--ink)";
        (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
      }}
    >
      {philosopher.avatarUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={philosopher.avatarUrl}
          alt={philosopher.name}
          width={20}
          height={20}
          style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
        />
      )}
      {philosopher.name}
    </Link>
  );
}

function LineageRow({
  direction,
  label,
  schools,
  accentColor,
}: {
  direction: "from" | "to";
  label: string;
  schools: { _id: string; title: string; slug: string }[];
  accentColor: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: "10px", flexWrap: "wrap" }}>
      {/* Arrow glyph */}
      <span style={{
        fontFamily: "var(--font-sans)", fontSize: "10px",
        color: accentColor, opacity: 0.7, flexShrink: 0,
      }}>
        {direction === "from" ? "←" : "→"}
      </span>
      {/* Label */}
      <span style={{
        fontFamily: "var(--font-sans)", fontSize: "9px", fontWeight: 600,
        letterSpacing: "0.12em", textTransform: "uppercase",
        color: "var(--ink-muted)", opacity: 0.6, flexShrink: 0,
      }}>
        {label}
      </span>
      {/* School names */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {schools.map((s, i) => (
          <span key={s._id} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{
              fontFamily: "var(--font-serif)", fontStyle: "italic",
              fontSize: "0.82rem", color: accentColor,
            }}>
              {s.title}
            </span>
            {i < schools.length - 1 && (
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "10px", color: "var(--ink-muted)", opacity: 0.4 }}>&amp;</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
