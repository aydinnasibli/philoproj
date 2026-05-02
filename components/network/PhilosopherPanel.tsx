"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { LineageNode } from "@/lib/types";

type Connection = { node: LineageNode; strength: number; kind: "lineage" | "influence" };

const STRENGTH_NUM = { strong: 0.9, medium: 0.6, weak: 0.3 };

function buildInfluencedBy(node: LineageNode, allNodes: LineageNode[]): Connection[] {
  const seen = new Set<string>();
  const out: Connection[] = [];
  for (const id of (node.mentors ?? [])) {
    const n = allNodes.find(x => x._id === id);
    if (n && !seen.has(id)) { seen.add(id); out.push({ node: n, strength: 1.0, kind: "lineage" }); }
  }
  for (const link of (node.influences ?? [])) {
    const n = allNodes.find(x => x._id === link.id);
    if (n && !seen.has(link.id)) { seen.add(link.id); out.push({ node: n, strength: STRENGTH_NUM[link.strength], kind: "influence" }); }
  }
  return out.sort((a, b) => b.strength - a.strength);
}

function buildInfluenced(node: LineageNode, allNodes: LineageNode[]): Connection[] {
  const seen = new Set<string>();
  const out: Connection[] = [];
  for (const id of (node.students ?? [])) {
    const n = allNodes.find(x => x._id === id);
    if (n && !seen.has(id)) { seen.add(id); out.push({ node: n, strength: 1.0, kind: "lineage" }); }
  }
  for (const other of allNodes) {
    if (other._id === node._id || seen.has(other._id)) continue;
    const link = (other.influences ?? []).find(l => l.id === node._id);
    if (link) { seen.add(other._id); out.push({ node: other, strength: STRENGTH_NUM[link.strength], kind: "influence" }); }
  }
  return out.sort((a, b) => b.strength - a.strength);
}

function StrengthBar({ strength, accent }: { strength: number; accent: string }) {
  const filled = strength >= 0.85 ? 3 : strength >= 0.5 ? 2 : 1;
  return (
    <div style={{ display: "flex", gap: 2.5, flexShrink: 0 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 5, height: 5, borderRadius: "50%",
          background: i < filled ? accent : "rgba(17,21,26,0.12)",
          transition: "background 0.2s",
        }} />
      ))}
    </div>
  );
}

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

  const influencedBy = buildInfluencedBy(node, allNodes);
  const influenced   = buildInfluenced(node, allNodes);
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

        {/* Avatar + branch */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          {node.avatarUrl && (
            <div style={{
              position: "relative",
              width: 56, height: 56, borderRadius: "50%", flexShrink: 0,
              overflow: "hidden",
              border: `1.5px solid ${accent}40`,
              filter: "sepia(30%) contrast(1.05)",
            }}>
              <Image src={node.avatarUrl} alt={node.name} fill sizes="56px" style={{ objectFit: "cover" }} />
            </div>
          )}
          <div style={{
            fontFamily: "var(--font-sans)", fontSize: "7.5px", fontWeight: 700,
            letterSpacing: "0.18em", textTransform: "uppercase", color: accent,
          }}>
            {node.coreBranch}
          </div>
        </div>

        {/* Connections — ranked by strength — shown first for quick scanning */}
        {(influencedBy.length > 0 || influenced.length > 0) && (
          <div style={{ marginBottom: 28 }}>
            {[
              { label: "Influenced by", list: influencedBy, arrow: "←" },
              { label: "Influenced",    list: influenced,   arrow: "→" },
            ].map(({ label, list, arrow }) => list.length > 0 && (
              <div key={label} style={{ marginBottom: 18 }}>
                <div style={{
                  fontFamily: "var(--font-sans)", fontSize: "7px", fontWeight: 700,
                  letterSpacing: "0.2em", textTransform: "uppercase",
                  color: "#5F6A78", marginBottom: 10,
                }}>
                  {label}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {list.map(({ node: n, strength, kind }) => (
                    <button
                      key={n._id}
                      onClick={() => onNavigate(n._id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "7px 12px",
                        background: "rgba(17,21,26,0.02)",
                        border: "1px solid rgba(17,21,26,0.08)",
                        borderRadius: 3, cursor: "pointer", textAlign: "left",
                        width: "100%",
                        transition: "background 0.18s, border-color 0.18s",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = `${accent}08`;
                        e.currentTarget.style.borderColor = `${accent}35`;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = "rgba(17,21,26,0.02)";
                        e.currentTarget.style.borderColor = "rgba(17,21,26,0.08)";
                      }}
                    >
                      <StrengthBar strength={strength} accent={accent} />
                      <span style={{
                        fontFamily: "var(--font-serif)", fontStyle: "italic",
                        fontSize: "0.85rem", color: "#11151a", flex: 1,
                        fontWeight: strength >= 0.85 ? 500 : 400,
                        opacity: 0.5 + strength * 0.5,
                      }}>
                        {n.name}
                      </span>
                      {kind === "lineage" && (
                        <span style={{
                          fontFamily: "var(--font-sans)", fontSize: "6.5px",
                          fontWeight: 700, letterSpacing: "0.15em",
                          textTransform: "uppercase", color: accent, opacity: 0.7,
                          flexShrink: 0,
                        }}>
                          direct
                        </span>
                      )}
                      <span style={{ color: "rgba(17,21,26,0.25)", fontSize: "0.7rem", flexShrink: 0 }}>
                        {arrow}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: `linear-gradient(to right, ${accent}20, transparent)`, marginBottom: 18 }} />

        {/* Hook quote */}
        <div style={{ borderLeft: `2px solid ${accent}`, paddingLeft: 14, marginBottom: 16 }}>
          <div style={{
            fontFamily: "var(--font-serif)", fontStyle: "italic",
            fontSize: "0.88rem", color: "#43474c", lineHeight: 1.7,
          }}>
            &ldquo;{node.hookQuote}&rdquo;
          </div>
        </div>

        {/* Short summary */}
        <p style={{
          fontFamily: "var(--font-sans)", fontSize: "0.77rem",
          lineHeight: 1.82, color: "#43474c", marginBottom: 24,
        }}>
          {node.shortSummary}
        </p>

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
