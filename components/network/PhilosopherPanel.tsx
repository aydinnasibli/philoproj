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
  for (const mentor of (node.mentors ?? [])) {
    const n = allNodes.find(x => x._id === mentor.id);
    if (n && !seen.has(mentor.id)) { seen.add(mentor.id); out.push({ node: n, strength: STRENGTH_NUM[mentor.strength], kind: "lineage" }); }
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
  for (const student of (node.students ?? [])) {
    const n = allNodes.find(x => x._id === student.id);
    if (n && !seen.has(student.id)) { seen.add(student.id); out.push({ node: n, strength: STRENGTH_NUM[student.strength], kind: "lineage" }); }
  }
  for (const other of allNodes) {
    if (other._id === node._id || seen.has(other._id)) continue;
    const link = (other.influences ?? []).find(l => l.id === node._id);
    if (link) { seen.add(other._id); out.push({ node: other, strength: STRENGTH_NUM[link.strength], kind: "influence" }); }
  }
  return out.sort((a, b) => b.strength - a.strength);
}

function StrengthBar({ strength }: { strength: number }) {
  const filled = strength >= 0.85 ? 3 : strength >= 0.5 ? 2 : 1;
  return (
    <div className="flex gap-[2.5px] shrink-0">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className={`w-[5px] h-[5px] rounded-full transition-[background] duration-200 ${i < filled ? "bg-zinc-950/75 dark:bg-stone-100/75" : "bg-zinc-950/12 dark:bg-stone-100/12"}`}
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

type PanelColors = {
  panelBorderL:    string;
  headerBorderB:   string;
  badgeText:       string;
  badgeBg:         string;
  badgeBorder:     string;
  avatarBorder:    string;
  branchText:      string;
  btnHoverBg:      string;
  btnHoverBorder:  string;
  dividerGradient: string;
  quoteBorderL:    string;
  linkText:        string;
  linkBorder:      string;
  linkHoverBg:     string;
};

const PANEL_COLORS: Record<string, PanelColors> = {
  "era-1": {
    panelBorderL:    "border-l-amber-600 dark:border-l-amber-400",
    headerBorderB:   "border-b-amber-600/13 dark:border-b-amber-400/13",
    badgeText:       "text-amber-600 dark:text-amber-400",
    badgeBg:         "bg-amber-600/8 dark:bg-amber-400/8",
    badgeBorder:     "border-amber-600/19 dark:border-amber-400/19",
    avatarBorder:    "border-amber-600/25 dark:border-amber-400/25",
    branchText:      "text-amber-600 dark:text-amber-400",
    btnHoverBg:      "hover:bg-amber-600/3 dark:hover:bg-amber-400/3",
    btnHoverBorder:  "hover:border-amber-600/21 dark:hover:border-amber-400/21",
    dividerGradient: "bg-linear-to-r from-amber-600/13 dark:from-amber-400/13",
    quoteBorderL:    "border-l-amber-600 dark:border-l-amber-400",
    linkText:        "text-amber-600 dark:text-amber-400",
    linkBorder:      "border-amber-600/25 dark:border-amber-400/25",
    linkHoverBg:     "hover:bg-amber-600/8 dark:hover:bg-amber-400/8",
  },
  "era-2": {
    panelBorderL:    "border-l-amber-800",
    headerBorderB:   "border-b-amber-800/13",
    badgeText:       "text-amber-800",
    badgeBg:         "bg-amber-800/8",
    badgeBorder:     "border-amber-800/19",
    avatarBorder:    "border-amber-800/25",
    branchText:      "text-amber-800",
    btnHoverBg:      "hover:bg-amber-800/3",
    btnHoverBorder:  "hover:border-amber-800/21",
    dividerGradient: "bg-linear-to-r from-amber-800/13",
    quoteBorderL:    "border-l-amber-800",
    linkText:        "text-amber-800",
    linkBorder:      "border-amber-800/25",
    linkHoverBg:     "hover:bg-amber-800/8",
  },
  "era-3": {
    panelBorderL:    "border-l-yellow-800",
    headerBorderB:   "border-b-yellow-800/13",
    badgeText:       "text-yellow-800",
    badgeBg:         "bg-yellow-800/8",
    badgeBorder:     "border-yellow-800/19",
    avatarBorder:    "border-yellow-800/25",
    branchText:      "text-yellow-800",
    btnHoverBg:      "hover:bg-yellow-800/3",
    btnHoverBorder:  "hover:border-yellow-800/21",
    dividerGradient: "bg-linear-to-r from-yellow-800/13",
    quoteBorderL:    "border-l-yellow-800",
    linkText:        "text-yellow-800",
    linkBorder:      "border-yellow-800/25",
    linkHoverBg:     "hover:bg-yellow-800/8",
  },
  "era-4": {
    panelBorderL:    "border-l-slate-500",
    headerBorderB:   "border-b-slate-500/13",
    badgeText:       "text-slate-500",
    badgeBg:         "bg-slate-500/8",
    badgeBorder:     "border-slate-500/19",
    avatarBorder:    "border-slate-500/25",
    branchText:      "text-slate-500",
    btnHoverBg:      "hover:bg-slate-500/3",
    btnHoverBorder:  "hover:border-slate-500/21",
    dividerGradient: "bg-linear-to-r from-slate-500/13",
    quoteBorderL:    "border-l-slate-500",
    linkText:        "text-slate-500",
    linkBorder:      "border-slate-500/25",
    linkHoverBg:     "hover:bg-slate-500/8",
  },
};

const FALLBACK_COLORS = PANEL_COLORS["era-1"];

interface Props {
  node: LineageNode;
  allNodes: LineageNode[];
  onClose: () => void;
  onNavigate: (id: string) => void;
}

export default function PhilosopherPanel({ node, allNodes, onClose, onNavigate }: Props) {
  const influencedBy = buildInfluencedBy(node, allNodes);
  const influenced   = buildInfluenced(node, allNodes);
  const eraLabel = ERA_LABELS[node.eraId] ?? "";
  const birthStr = node.birthYear < 0 ? `${Math.abs(node.birthYear)} BC` : `AD ${node.birthYear}`;
  const deathStr = node.deathYear < 0 ? `${Math.abs(node.deathYear)} BC` : `AD ${node.deathYear}`;
  const c = PANEL_COLORS[node.eraId] ?? FALLBACK_COLORS;

  return (
    <motion.aside
      data-panel="true"
      onClick={(e) => e.stopPropagation()}
      initial={{ x: 420, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 420, opacity: 0 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed right-0 top-0 bottom-0 w-full md:w-[400px] z-60 overflow-y-auto overflow-x-hidden flex flex-col bg-stone-50/98 dark:bg-stone-900/98 backdrop-blur-[28px] border-l-[3px] ${c.panelBorderL} shadow-[-24px_0_72px_rgba(17,21,26,0.13)]`}
    >
      {/* Header */}
      <div className={`sticky top-0 z-10 flex items-start justify-between bg-stone-50/96 dark:bg-stone-900/96 backdrop-blur-[20px] border-b ${c.headerBorderB} px-6 pt-4.5 pb-[14px]`}>
        <div>
          <div className={`inline-block font-sans text-xs md:text-[10px] font-medium tracking-widest ${c.badgeText} ${c.badgeBg} border ${c.badgeBorder} px-2 py-0.5 rounded-xs mb-[9px]`}>
            {eraLabel}
          </div>
          <div className="font-serif text-2xl font-medium text-zinc-950 dark:text-stone-100 leading-snug tracking-[-0.01em]">
            {node.name}
          </div>
          <div className="font-sans text-xs text-slate-500 dark:text-stone-400 mt-1">
            {birthStr} — {deathStr}
          </div>
        </div>
        <button
          onClick={onClose}
          className="cursor-pointer bg-transparent border-none text-zinc-950/35 dark:text-stone-100/35 text-lg px-1.5 py-1 mt-1 leading-none transition-colors duration-200 hover:text-zinc-950 dark:hover:text-stone-100"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="p-6 pb-10 flex-1">

        {/* Avatar + branch */}
        <div className="flex items-center gap-3.5 mb-5">
          {node.avatarUrl && (
            <div className={`relative w-14 h-14 rounded-full shrink-0 overflow-hidden border-[1.5px] ${c.avatarBorder} [filter:sepia(30%)_contrast(1.05)]`}>
              <Image src={node.avatarUrl} alt={node.name} fill sizes="56px" className="object-cover" />
            </div>
          )}
          <div className={`font-sans text-xs md:text-[10px] font-medium tracking-widest ${c.branchText}`}>
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
              <div key={label} className="mb-4.5">
                <div className="font-sans text-xs md:text-[10px] font-medium tracking-widest text-slate-500 dark:text-stone-400 mb-2.5">
                  {label}
                </div>
                <div className="flex flex-col gap-1">
                  {list.map(({ node: n, strength, kind }) => (
                    <button
                      key={n._id}
                      onClick={() => onNavigate(n._id)}
                      className={`flex items-center gap-2.5 px-3 py-1.5 rounded-sm cursor-pointer text-left w-full bg-zinc-950/[0.02] dark:bg-stone-100/[0.02] border border-zinc-950/[0.08] dark:border-stone-100/[0.08] transition-[background,border-color] duration-200 ${c.btnHoverBg} ${c.btnHoverBorder}`}
                    >
                      <StrengthBar strength={strength} />
                      <span
                        className={`font-serif italic text-sm text-zinc-950 dark:text-stone-100 flex-1 ${strength >= 0.85 ? "font-medium" : "font-normal"} ${strength >= 0.85 ? "opacity-100" : strength >= 0.5 ? "opacity-80" : "opacity-[0.65]"}`}
                      >
                        {n.name}
                      </span>
                      {kind === "lineage" && (
                        <span className={`font-sans text-xs font-bold tracking-widest uppercase ${c.badgeText} opacity-70 shrink-0`}>
                          direct
                        </span>
                      )}
                      <span className="text-xs shrink-0 text-zinc-950/25 dark:text-stone-100/25">
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
        <div className={`h-px mb-4.5 ${c.dividerGradient}`} />

        {/* Hook quote */}
        <div className={`pl-[14px] mb-4 border-l-2 ${c.quoteBorderL} font-serif italic text-sm text-slate-500 dark:text-stone-400 leading-relaxed`}>
          &ldquo;{node.hookQuote}&rdquo;
        </div>

        {/* Short summary */}
        <p className="font-sans text-xs leading-[1.82] text-slate-500 dark:text-stone-400 mb-6">
          {node.shortSummary}
        </p>

        {/* Read more */}
        <Link
          href={`/philosophers/${node.slug}`}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xs font-sans text-xs md:text-[10px] font-medium tracking-widest ${c.linkText} no-underline border ${c.linkBorder} transition-[background,opacity] duration-200 ${c.linkHoverBg}`}
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
