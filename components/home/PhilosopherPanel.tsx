"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { LineageNode } from "@/lib/mockData";

const ERA_LABELS: Record<string, string> = {
  "era-1": "Ancient Greece",
  "era-2": "Hellenistic",
  "era-3": "Early Modern",
  "era-4": "Critical Era",
};

const ERA_ACCENT: Record<string, string> = {
  "era-1": "#C47029",
  "era-2": "#8B6229",
  "era-3": "#8B6914",
  "era-4": "#5A6999",
};

interface Props {
  node: LineageNode;
  allNodes: LineageNode[];
  onClose: () => void;
  onNavigate: (id: string) => void;
}

export default function PhilosopherPanel({ node, allNodes, onClose, onNavigate }: Props) {
  const accent = ERA_ACCENT[node.eraId] ?? "#C47029";

  const mentors  = node.mentors.map(id => allNodes.find(n => n._id === id)).filter(Boolean) as LineageNode[];
  const students = node.students.map(id => allNodes.find(n => n._id === id)).filter(Boolean) as LineageNode[];
  const eraLabel = ERA_LABELS[node.eraId] ?? "";
  const birthStr = node.birthYear < 0 ? `${Math.abs(node.birthYear)} BC` : `AD ${node.birthYear}`;
  const deathStr = node.deathYear < 0 ? `${Math.abs(node.deathYear)} BC` : `AD ${node.deathYear}`;

  return (
    <motion.aside
      data-panel="true"
      onClick={(e) => e.stopPropagation()}
      initial={{ x: 420, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 420, opacity: 0 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed", right: 0, top: 0, bottom: 0,
        width: 400, zIndex: 60,
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
            {eraLabel}
          </div>
          <div style={{
            fontFamily: "var(--font-serif)", fontSize: "1.45rem",
            fontWeight: 500, color: "#11151a", lineHeight: 1.2,
            letterSpacing: "-0.01em",
          }}>
            {node.name}
          </div>
          <div style={{
            fontFamily: "var(--font-sans)", fontSize: "0.68rem",
            color: "#5F6A78", marginTop: 4,
          }}>
            {birthStr} — {deathStr}
          </div>
        </div>
        <button
          onClick={onClose}
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

        {/* Avatar */}
        {node.avatarUrl && (
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            overflow: "hidden", marginBottom: 20,
            border: `1.5px solid ${accent}40`,
            filter: "sepia(30%) contrast(1.05)",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={node.avatarUrl} alt={node.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}

        {/* Core branch badge */}
        <div style={{
          fontFamily: "var(--font-sans)", fontSize: "7.5px", fontWeight: 700,
          letterSpacing: "0.18em", textTransform: "uppercase",
          color: accent, marginBottom: 14,
        }}>
          {node.coreBranch}
        </div>

        {/* Hook quote */}
        <div style={{
          borderLeft: `2px solid ${accent}`,
          paddingLeft: 14, marginBottom: 20,
        }}>
          <div style={{
            fontFamily: "var(--font-serif)", fontStyle: "italic",
            fontSize: "0.9rem", color: "#43474c", lineHeight: 1.7,
          }}>
            &ldquo;{node.hookQuote}&rdquo;
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: `linear-gradient(to right, ${accent}20, transparent)`, marginBottom: 18 }} />

        {/* Short summary */}
        <p style={{
          fontFamily: "var(--font-sans)", fontSize: "0.78rem",
          lineHeight: 1.82, color: "#43474c", marginBottom: 28,
        }}>
          {node.shortSummary}
        </p>

        {/* Influences */}
        {(mentors.length > 0 || students.length > 0) && (
          <div style={{ marginBottom: 28 }}>
            {mentors.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <div style={{
                  fontFamily: "var(--font-sans)", fontSize: "7px", fontWeight: 700,
                  letterSpacing: "0.2em", textTransform: "uppercase",
                  color: "#5F6A78", marginBottom: 10,
                }}>
                  Influenced by
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {mentors.map(m => (
                    <button
                      key={m._id}
                      onClick={() => onNavigate(m._id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 7,
                        padding: "5px 11px 5px 7px",
                        background: "rgba(17,21,26,0.03)",
                        border: "1px solid rgba(17,21,26,0.1)",
                        borderRadius: 2, cursor: "pointer",
                        fontFamily: "var(--font-serif)", fontStyle: "italic",
                        fontSize: "0.82rem", color: "#43474c",
                        transition: "border-color 0.2s, color 0.2s",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = `${accent}50`;
                        e.currentTarget.style.color = accent;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = "rgba(17,21,26,0.1)";
                        e.currentTarget.style.color = "#43474c";
                      }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                      </svg>
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {students.length > 0 && (
              <div>
                <div style={{
                  fontFamily: "var(--font-sans)", fontSize: "7px", fontWeight: 700,
                  letterSpacing: "0.2em", textTransform: "uppercase",
                  color: "#5F6A78", marginBottom: 10,
                }}>
                  Influenced
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {students.map(s => (
                    <button
                      key={s._id}
                      onClick={() => onNavigate(s._id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 7,
                        padding: "5px 11px 5px 9px",
                        background: "rgba(17,21,26,0.03)",
                        border: "1px solid rgba(17,21,26,0.1)",
                        borderRadius: 2, cursor: "pointer",
                        fontFamily: "var(--font-serif)", fontStyle: "italic",
                        fontSize: "0.82rem", color: "#43474c",
                        transition: "border-color 0.2s, color 0.2s",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = `${accent}50`;
                        e.currentTarget.style.color = accent;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = "rgba(17,21,26,0.1)";
                        e.currentTarget.style.color = "#43474c";
                      }}
                    >
                      {s.name}
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Read more */}
        <Link
          href={`/philosophers/${node.slug}`}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "10px 20px",
            background: accent,
            color: "#fff",
            borderRadius: 2,
            fontFamily: "var(--font-sans)", fontSize: "0.7rem",
            fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
            textDecoration: "none",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = "0.85")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = "1")}
        >
          Read full entry
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </motion.aside>
  );
}
