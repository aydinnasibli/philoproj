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
    <div
      className="flex gap-[2.5px] shrink-0"
      style={{ '--sb-a': accent } as React.CSSProperties}
    >
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className={`w-[5px] h-[5px] rounded-full transition-[background] duration-200 ${i < filled ? "bg-[var(--sb-a)]" : "bg-[rgba(17,21,26,0.12)]"}`}
        />
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
      className="fixed right-0 top-0 bottom-0 w-[400px] z-60 overflow-y-auto overflow-x-hidden flex flex-col bg-[rgba(253,250,245,0.98)] backdrop-blur-[28px] border-l-[3px] border-l-[var(--pa)] shadow-[-24px_0_72px_rgba(17,21,26,0.13)]"
      style={{
        '--pa':   accent,
        '--pa-14': `${accent}14`,
        '--pa-20': `${accent}20`,
        '--pa-30': `${accent}30`,
        '--pa-40': `${accent}40`,
        '--pa-08': `${accent}08`,
        '--pa-35': `${accent}35`,
      } as React.CSSProperties}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-start justify-between bg-[rgba(253,250,245,0.96)] backdrop-blur-[20px] border-b border-b-[var(--pa-20)]" style={{ padding: "18px 24px 14px" }}>
        <div>
          <div className="inline-block font-sans text-[7px] font-bold tracking-[0.22em] uppercase text-[var(--pa)] bg-[var(--pa-14)] border border-[var(--pa-30)] px-[9px] py-[3px] rounded-[2px] mb-[9px]">
            {eraLabel}
          </div>
          <div className="font-serif text-[1.45rem] font-medium text-[#11151a] leading-[1.2] tracking-[-0.01em]">
            {node.name}
          </div>
          <div className="font-sans text-[0.68rem] text-[#5F6A78] mt-1">
            {birthStr} — {deathStr}
          </div>
        </div>
        <button
          onClick={onClose}
          className="cursor-pointer bg-transparent border-none text-[rgba(17,21,26,0.35)] text-[1.1rem] px-[6px] py-1 mt-1 leading-none transition-colors duration-200 hover:text-[#11151a]"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="p-6 pb-10 flex-1">

        {/* Avatar + branch */}
        <div className="flex items-center gap-[14px] mb-5">
          {node.avatarUrl && (
            <div
              className="relative w-14 h-14 rounded-full shrink-0 overflow-hidden border-[1.5px] border-[var(--pa-40)] [filter:sepia(30%)_contrast(1.05)]"
            >
              <Image src={node.avatarUrl} alt={node.name} fill sizes="56px" style={{ objectFit: "cover" }} />
            </div>
          )}
          <div className="font-sans text-[7.5px] font-bold tracking-[0.18em] uppercase text-[var(--pa)]">
            {node.coreBranch}
          </div>
        </div>

        {/* Connections */}
        {(influencedBy.length > 0 || influenced.length > 0) && (
          <div className="mb-7">
            {[
              { label: "Influenced by", list: influencedBy, arrow: "←" },
              { label: "Influenced",    list: influenced,   arrow: "→" },
            ].map(({ label, list, arrow }) => list.length > 0 && (
              <div key={label} className="mb-[18px]">
                <div className="font-sans text-[7px] font-bold tracking-[0.2em] uppercase text-[#5F6A78] mb-[10px]">
                  {label}
                </div>
                <div className="flex flex-col gap-1">
                  {list.map(({ node: n, strength, kind }) => (
                    <button
                      key={n._id}
                      onClick={() => onNavigate(n._id)}
                      className="flex items-center gap-[10px] px-3 py-[7px] rounded-[3px] cursor-pointer text-left w-full bg-[rgba(17,21,26,0.02)] border border-[rgba(17,21,26,0.08)] transition-[background,border-color] duration-[180ms] hover:bg-[var(--pa-08)] hover:border-[var(--pa-35)]"
                    >
                      <StrengthBar strength={strength} accent={accent} />
                      <span
                        className="font-serif italic text-[0.85rem] text-[#11151a] flex-1"
                        style={{
                          fontWeight: strength >= 0.85 ? 500 : 400,
                          opacity: 0.5 + strength * 0.5,
                        }}
                      >
                        {n.name}
                      </span>
                      {kind === "lineage" && (
                        <span className="font-sans text-[6.5px] font-bold tracking-[0.15em] uppercase text-[var(--pa)] opacity-70 shrink-0">
                          direct
                        </span>
                      )}
                      <span className="text-[0.7rem] shrink-0 text-[rgba(17,21,26,0.25)]">
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
        <div className="h-px mb-[18px] bg-[linear-gradient(to_right,var(--pa-20),transparent)]" />

        {/* Hook quote */}
        <div className="pl-[14px] mb-4 border-l-2 border-l-[var(--pa)] font-serif italic text-[0.88rem] text-[#43474c] leading-[1.7]">
          &ldquo;{node.hookQuote}&rdquo;
        </div>

        {/* Short summary */}
        <p className="font-sans text-[0.77rem] leading-[1.82] text-[#43474c] mb-6">
          {node.shortSummary}
        </p>

        {/* Read more */}
        <Link
          href={`/philosophers/${node.slug}`}
          className="inline-flex items-center gap-2 px-5 py-[10px] rounded-[2px] bg-[var(--pa)] text-white font-sans text-[0.7rem] font-bold tracking-[0.18em] uppercase no-underline transition-opacity duration-200 hover:opacity-85"
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
