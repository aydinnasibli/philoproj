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

function StrengthBar({ strength }: { strength: number }) {
  const filled = strength >= 0.85 ? 3 : strength >= 0.5 ? 2 : 1;
  return (
    <div className="flex gap-[2.5px] shrink-0">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className={`w-[5px] h-[5px] rounded-full transition-[background] duration-200 ${i < filled ? "bg-[rgba(17,21,26,0.75)]" : "bg-[rgba(17,21,26,0.12)]"}`}
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
    panelBorderL:    "border-l-[#C47029]",
    headerBorderB:   "border-b-[rgba(196,112,41,0.13)]",
    badgeText:       "text-[#C47029]",
    badgeBg:         "bg-[rgba(196,112,41,0.08)]",
    badgeBorder:     "border-[rgba(196,112,41,0.19)]",
    avatarBorder:    "border-[rgba(196,112,41,0.25)]",
    branchText:      "text-[#C47029]",
    btnHoverBg:      "hover:bg-[rgba(196,112,41,0.03)]",
    btnHoverBorder:  "hover:border-[rgba(196,112,41,0.21)]",
    dividerGradient: "bg-[linear-gradient(to_right,rgba(196,112,41,0.13),transparent)]",
    quoteBorderL:    "border-l-[#C47029]",
    linkText:        "text-[#C47029]",
    linkBorder:      "border-[rgba(196,112,41,0.25)]",
    linkHoverBg:     "hover:bg-[rgba(196,112,41,0.08)]",
  },
  "era-2": {
    panelBorderL:    "border-l-[#8B6229]",
    headerBorderB:   "border-b-[rgba(139,98,41,0.13)]",
    badgeText:       "text-[#8B6229]",
    badgeBg:         "bg-[rgba(139,98,41,0.08)]",
    badgeBorder:     "border-[rgba(139,98,41,0.19)]",
    avatarBorder:    "border-[rgba(139,98,41,0.25)]",
    branchText:      "text-[#8B6229]",
    btnHoverBg:      "hover:bg-[rgba(139,98,41,0.03)]",
    btnHoverBorder:  "hover:border-[rgba(139,98,41,0.21)]",
    dividerGradient: "bg-[linear-gradient(to_right,rgba(139,98,41,0.13),transparent)]",
    quoteBorderL:    "border-l-[#8B6229]",
    linkText:        "text-[#8B6229]",
    linkBorder:      "border-[rgba(139,98,41,0.25)]",
    linkHoverBg:     "hover:bg-[rgba(139,98,41,0.08)]",
  },
  "era-3": {
    panelBorderL:    "border-l-[#8B6914]",
    headerBorderB:   "border-b-[rgba(139,105,20,0.13)]",
    badgeText:       "text-[#8B6914]",
    badgeBg:         "bg-[rgba(139,105,20,0.08)]",
    badgeBorder:     "border-[rgba(139,105,20,0.19)]",
    avatarBorder:    "border-[rgba(139,105,20,0.25)]",
    branchText:      "text-[#8B6914]",
    btnHoverBg:      "hover:bg-[rgba(139,105,20,0.03)]",
    btnHoverBorder:  "hover:border-[rgba(139,105,20,0.21)]",
    dividerGradient: "bg-[linear-gradient(to_right,rgba(139,105,20,0.13),transparent)]",
    quoteBorderL:    "border-l-[#8B6914]",
    linkText:        "text-[#8B6914]",
    linkBorder:      "border-[rgba(139,105,20,0.25)]",
    linkHoverBg:     "hover:bg-[rgba(139,105,20,0.08)]",
  },
  "era-4": {
    panelBorderL:    "border-l-[#5A6999]",
    headerBorderB:   "border-b-[rgba(90,105,153,0.13)]",
    badgeText:       "text-[#5A6999]",
    badgeBg:         "bg-[rgba(90,105,153,0.08)]",
    badgeBorder:     "border-[rgba(90,105,153,0.19)]",
    avatarBorder:    "border-[rgba(90,105,153,0.25)]",
    branchText:      "text-[#5A6999]",
    btnHoverBg:      "hover:bg-[rgba(90,105,153,0.03)]",
    btnHoverBorder:  "hover:border-[rgba(90,105,153,0.21)]",
    dividerGradient: "bg-[linear-gradient(to_right,rgba(90,105,153,0.13),transparent)]",
    quoteBorderL:    "border-l-[#5A6999]",
    linkText:        "text-[#5A6999]",
    linkBorder:      "border-[rgba(90,105,153,0.25)]",
    linkHoverBg:     "hover:bg-[rgba(90,105,153,0.08)]",
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
      className={`fixed right-0 top-0 bottom-0 w-[400px] z-60 overflow-y-auto overflow-x-hidden flex flex-col bg-[rgba(253,250,245,0.98)] backdrop-blur-[28px] border-l-[3px] ${c.panelBorderL} shadow-[-24px_0_72px_rgba(17,21,26,0.13)]`}
    >
      {/* Header */}
      <div className={`sticky top-0 z-10 flex items-start justify-between bg-[rgba(253,250,245,0.96)] backdrop-blur-[20px] border-b ${c.headerBorderB} px-6 pt-[18px] pb-[14px]`}>
        <div>
          <div className={`inline-block font-sans text-[7px] font-bold tracking-[0.22em] uppercase ${c.badgeText} ${c.badgeBg} border ${c.badgeBorder} px-[9px] py-[3px] rounded-[2px] mb-[9px]`}>
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
            <div className={`relative w-14 h-14 rounded-full shrink-0 overflow-hidden border-[1.5px] ${c.avatarBorder} [filter:sepia(30%)_contrast(1.05)]`}>
              <Image src={node.avatarUrl} alt={node.name} fill sizes="56px" className="object-cover" />
            </div>
          )}
          <div className={`font-sans text-[7.5px] font-bold tracking-[0.18em] uppercase ${c.branchText}`}>
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
                      className={`flex items-center gap-[10px] px-3 py-[7px] rounded-[3px] cursor-pointer text-left w-full bg-[rgba(17,21,26,0.02)] border border-[rgba(17,21,26,0.08)] transition-[background,border-color] duration-180 ${c.btnHoverBg} ${c.btnHoverBorder}`}
                    >
                      <StrengthBar strength={strength} />
                      <span
                        className={`font-serif italic text-[0.85rem] text-[#11151a] flex-1 ${strength >= 0.85 ? "font-medium" : "font-normal"} ${strength >= 0.85 ? "opacity-100" : strength >= 0.5 ? "opacity-80" : "opacity-[0.65]"}`}
                      >
                        {n.name}
                      </span>
                      {kind === "lineage" && (
                        <span className={`font-sans text-[6.5px] font-bold tracking-[0.15em] uppercase ${c.badgeText} opacity-70 shrink-0`}>
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
        <div className={`h-px mb-[18px] ${c.dividerGradient}`} />

        {/* Hook quote */}
        <div className={`pl-[14px] mb-4 border-l-2 ${c.quoteBorderL} font-serif italic text-[0.88rem] text-[#43474c] leading-[1.7]`}>
          &ldquo;{node.hookQuote}&rdquo;
        </div>

        {/* Short summary */}
        <p className="font-sans text-[0.77rem] leading-[1.82] text-[#43474c] mb-6">
          {node.shortSummary}
        </p>

        {/* Read more */}
        <Link
          href={`/philosophers/${node.slug}`}
          className={`inline-flex items-center gap-2 px-5 py-[10px] rounded-[2px] font-sans text-[0.7rem] font-bold tracking-[0.18em] uppercase ${c.linkText} no-underline border ${c.linkBorder} transition-[background,opacity] duration-200 ${c.linkHoverBg}`}
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
