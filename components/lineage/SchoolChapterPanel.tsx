"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { SchoolWithPhilosophers } from "@/lib/types";

const ERA_ACCENT: Record<string, string> = {
  "school-socratic-method":    "#C47029",
  "school-platonism":          "#C47029",
  "school-aristotelianism":    "#C47029",
  "school-stoicism":           "#8B6229",
  "school-neoplatonism":       "#8B6229",
  "school-scholasticism":      "#6B7A47",
  "school-rationalism":        "#8B6914",
  "school-empiricism":         "#8B6914",
  "school-critical-philosophy":"#5A6999",
  "school-german-idealism":    "#5A6999",
  "school-existentialism":     "#7A5C6E",
  "school-analytic-philosophy":"#4A5568",
};

type Props = {
  school: SchoolWithPhilosophers | null;
  allSchools: SchoolWithPhilosophers[];
  onClose: () => void;
  onNavigate: (id: string) => void;
};

function Divider({ accent }: { accent: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "22px 0 18px" }}>
      <div style={{ flex: 1, height: "1px", background: `linear-gradient(to right, ${accent}40, transparent)` }} />
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
        <circle cx="4" cy="4" r="1.5" fill={accent} opacity={0.5} />
        <circle cx="4" cy="4" r="3.5" stroke={accent} strokeWidth="0.6" fill="none" opacity={0.3} />
      </svg>
      <div style={{ flex: 1, height: "1px", background: `linear-gradient(to left, ${accent}40, transparent)` }} />
    </div>
  );
}

function SectionLabel({ children, accent }: { children: string; accent: string }) {
  return (
    <div style={{
      fontFamily: "var(--font-sans)", fontSize: "7.5px", fontWeight: 700,
      letterSpacing: "0.22em", textTransform: "uppercase",
      color: accent, marginBottom: 12,
    }}>
      {children}
    </div>
  );
}

export default function SchoolChapterPanel({ school, onClose, onNavigate }: Props) {
  const accent = school ? (ERA_ACCENT[school._id] ?? "#C47029") : "#C47029";

  // Escape key closes panel
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {school && (
        <motion.aside
          key={school._id}
          data-panel="true"
          initial={{ x: 440, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 440, opacity: 0 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "fixed", right: 0, top: 0, bottom: 0,
            width: 420, zIndex: 60,
            background: "rgba(253,250,245,0.98)",
            backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
            borderLeft: `3px solid ${accent}`,
            boxShadow: "-24px 0 72px rgba(17,21,26,0.13)",
            overflowY: "auto", overflowX: "hidden",
            display: "flex", flexDirection: "column",
          }}
        >
          {/* Header */}
          <div style={{
            position: "sticky", top: 0, zIndex: 10,
            background: "rgba(253,250,245,0.96)",
            backdropFilter: "blur(20px)",
            padding: "18px 24px 14px",
            borderBottom: `1px solid ${accent}20`,
            display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          }}>
            <div>
              <div style={{
                display: "inline-block",
                fontFamily: "var(--font-sans)", fontSize: "7px", fontWeight: 700,
                letterSpacing: "0.22em", textTransform: "uppercase",
                color: accent, background: `${accent}14`,
                border: `1px solid ${accent}30`,
                padding: "3px 9px", borderRadius: 2, marginBottom: 9,
              }}>
                {school.eraRange}
              </div>
              <div style={{
                fontFamily: "var(--font-serif)", fontSize: "1.45rem",
                fontWeight: 500, color: "#11151a", lineHeight: 1.2,
                letterSpacing: "-0.01em",
              }}>
                {school.title}
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close panel"
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "rgba(17,21,26,0.35)", fontSize: "1.1rem",
                padding: "4px 6px", marginTop: 4, lineHeight: 1,
                transition: "color 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#11151a")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(17,21,26,0.35)")}
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: "24px 24px 40px", flex: 1 }}>

            {/* Primary philosopher quote */}
            {school.philosophers[0] && (
              <div style={{
                borderLeft: `2px solid ${accent}`,
                paddingLeft: 14, marginBottom: 22,
              }}>
                <div style={{
                  fontFamily: "var(--font-serif)", fontStyle: "italic",
                  fontSize: "0.88rem", color: "#43474c", lineHeight: 1.7,
                }}>
                  &ldquo;{school.philosophers[0].coreBranch}&rdquo;
                </div>
                <div style={{
                  fontFamily: "var(--font-sans)", fontSize: "7.5px", fontWeight: 600,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                  color: accent, marginTop: 7,
                }}>
                  — {school.philosophers[0].name}
                </div>
              </div>
            )}

            {/* Story */}
            <SectionLabel accent={accent}>The Story</SectionLabel>
            <p style={{
              fontFamily: "var(--font-sans)", fontSize: "0.78rem",
              lineHeight: 1.82, color: "#43474c",
            }}>
              {school.description}
            </p>

            <Divider accent={accent} />

            {/* Core Ideas */}
            <SectionLabel accent={accent}>Core Ideas</SectionLabel>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 9, marginBottom: 4 }}>
              {school.coreIdeas.map((idea, i) => (
                <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{
                    width: 5, height: 5, marginTop: 6, flexShrink: 0,
                    borderRadius: "50%", background: accent, opacity: 0.55,
                  }} />
                  <span style={{
                    fontFamily: "var(--font-sans)", fontSize: "0.745rem",
                    lineHeight: 1.72, color: "#43474c",
                  }}>{idea}</span>
                </li>
              ))}
            </ul>

            <Divider accent={accent} />

            {/* Inherited from */}
            {school.influencedBy.length > 0 && (
              <>
                <SectionLabel accent={accent}>Received From</SectionLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 18 }}>
                  {school.influencedBy.map(s => (
                    <button
                      key={s._id}
                      onClick={() => onNavigate(s._id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "6px 12px 6px 10px",
                        background: `${accent}0D`,
                        border: `1px solid ${accent}30`,
                        borderRadius: 3, cursor: "pointer",
                        fontFamily: "var(--font-sans)", fontSize: "0.72rem",
                        color: "#43474c", transition: "all 0.2s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = `${accent}1F`; e.currentTarget.style.color = accent; }}
                      onMouseLeave={e => { e.currentTarget.style.background = `${accent}0D`; e.currentTarget.style.color = "#43474c"; }}
                    >
                      <span style={{ fontSize: "0.6rem", opacity: 0.6 }}>←</span>
                      {s.title}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Passed forward */}
            {school.influencedTo.length > 0 && (
              <>
                <SectionLabel accent={accent}>Passed Forward</SectionLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 22 }}>
                  {school.influencedTo.map(s => (
                    <button
                      key={s._id}
                      onClick={() => onNavigate(s._id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "6px 12px 6px 10px",
                        background: `${accent}0D`,
                        border: `1px solid ${accent}30`,
                        borderRadius: 3, cursor: "pointer",
                        fontFamily: "var(--font-sans)", fontSize: "0.72rem",
                        color: "#43474c", transition: "all 0.2s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = `${accent}1F`; e.currentTarget.style.color = accent; }}
                      onMouseLeave={e => { e.currentTarget.style.background = `${accent}0D`; e.currentTarget.style.color = "#43474c"; }}
                    >
                      {s.title}
                      <span style={{ fontSize: "0.6rem", opacity: 0.6 }}>→</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            <Divider accent={accent} />

            {/* Thinkers */}
            {school.philosophers.length > 0 && (
              <>
                <SectionLabel accent={accent}>Thinkers of This Era</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {school.philosophers.map(p => (
                    <Link
                      key={p._id}
                      href={`/philosophers/${p.slug}`}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "10px 12px",
                        background: "rgba(17,21,26,0.025)",
                        border: "1px solid rgba(17,21,26,0.07)",
                        borderRadius: 4, textDecoration: "none",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${accent}10`; (e.currentTarget as HTMLElement).style.borderColor = `${accent}30`; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(17,21,26,0.025)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(17,21,26,0.07)"; }}
                    >
                      {/* Avatar */}
                      <div style={{
                        width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                        border: `1.5px solid ${accent}40`,
                        overflow: "hidden", background: `${accent}18`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {p.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.avatarUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(0.5) sepia(0.25)" }} />
                        ) : (
                          <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "1rem", color: accent }}>{p.name.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <div style={{ fontFamily: "var(--font-serif)", fontSize: "0.9rem", color: "#11151a", fontWeight: 500 }}>
                          {p.name}
                        </div>
                        <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.68rem", color: "#5F6A78", marginTop: 2 }}>
                          {p.coreBranch}
                        </div>
                      </div>
                      <div style={{ marginLeft: "auto", fontFamily: "var(--font-sans)", fontSize: "10px", color: accent, opacity: 0.6 }}>
                        View →
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          <Divider accent={accent} />

          {/* Link to full school page */}
          <Link
            href={`/schools/${school.slug}`}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 18px",
              border: `1px solid ${accent}40`,
              borderRadius: 2,
              fontFamily: "var(--font-sans)", fontSize: "0.7rem",
              fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase",
              color: accent, textDecoration: "none",
              transition: "background 0.2s",
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = `${accent}10`)}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}
          >
            View full tradition
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
