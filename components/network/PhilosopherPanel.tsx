"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

const bodyContainer = {
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.18 } },
};

const bodyItem = {
  hidden: { opacity: 0, y: 6 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.28, ease } },
};
import type { LineageNode, SchoolWithPhilosophers } from "@/lib/types";

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


interface Props {
  node: LineageNode;
  allNodes: LineageNode[];
  schools: SchoolWithPhilosophers[];
  onClose: () => void;
  onNavigate: (id: string) => void;
}

export default function PhilosopherPanel({ node, allNodes, schools, onClose, onNavigate }: Props) {
  const influencedBy = useMemo(() => buildInfluencedBy(node, allNodes), [node, allNodes]);
  const influenced   = useMemo(() => buildInfluenced(node, allNodes), [node, allNodes]);
  const memberSchools = schools.filter(s => s.philosophers.some(p => p._id === node._id));
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
      className="fixed right-0 top-0 bottom-0 w-full md:w-[400px] z-60 overflow-y-auto overflow-x-hidden flex flex-col bg-stone-50/98 dark:bg-stone-900/98 backdrop-blur-[28px] border-l border-zinc-200 dark:border-zinc-700/60 shadow-[-24px_0_72px_rgba(17,21,26,0.18),-4px_0_20px_rgba(17,21,26,0.08)]"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-start justify-between bg-stone-50/96 dark:bg-stone-900/96 backdrop-blur-[20px] border-b border-zinc-200 dark:border-zinc-700 px-6 pt-4.5 pb-[14px]">
        <div>
          <div className="inline-block font-cinzel text-[0.6rem] tracking-widest uppercase text-slate-500 dark:text-stone-400 bg-zinc-950/[0.05] dark:bg-stone-100/[0.05] border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 rounded-xs mb-[9px]">
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
          aria-label="Close panel"
          className="cursor-pointer bg-transparent border-none text-zinc-950/35 dark:text-stone-100/35 p-3 md:px-1.5 md:py-1 mt-1 leading-none transition-colors duration-200 hover:text-zinc-950 dark:hover:text-stone-100 -mr-1.5 md:mr-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <motion.div
        className="p-6 pb-10 flex-1"
        variants={bodyContainer}
        initial="hidden"
        animate="show"
      >

        {/* Avatar + branch */}
        <motion.div variants={bodyItem} className="flex items-center gap-3.5 mb-5">
          {node.avatarUrl && (
            <div className="relative w-14 h-14 rounded-full shrink-0 overflow-hidden border-[1.5px] border-zinc-200 dark:border-zinc-700 filter-[grayscale(0.55)_brightness(0.90)_contrast(1.08)]">
              <Image src={node.avatarUrl} alt={node.name} fill sizes="56px" className="object-cover" />
            </div>
          )}
          <div className="font-sans text-xs md:text-[10px] font-medium tracking-widest text-slate-500 dark:text-stone-400">
            {node.coreBranch}
          </div>
        </motion.div>

        {/* Schools */}
        {memberSchools.length > 0 && (
          <motion.div variants={bodyItem} className="mb-5">
            <div className="font-sans text-xs md:text-[10px] font-medium tracking-widest text-slate-500 dark:text-stone-400 mb-2.5">
              Schools of Thought
            </div>
            <div className="flex flex-col gap-1.5">
              {memberSchools.map(s => (
                <Link
                  key={s._id}
                  href={`/schools/${s.slug}`}
                  className="flex items-center justify-between gap-2 px-3 py-2 rounded-sm no-underline border border-zinc-950/8 dark:border-stone-100/8 bg-zinc-950/2 dark:bg-stone-100/2 transition-[background,border-color] duration-200 hover:bg-zinc-950/8 dark:hover:bg-stone-100/8 hover:border-zinc-200 dark:hover:border-zinc-700"
                >
                  <div>
                    <div className="font-serif text-sm text-zinc-950 dark:text-stone-100">{s.title}</div>
                    {s.eraRange && (
                      <div className="font-sans text-[10px] text-slate-500 dark:text-stone-400 mt-0.5">{s.eraRange}</div>
                    )}
                  </div>
                  <span className="text-xs shrink-0 text-zinc-950/25 dark:text-stone-100/25">→</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Divider */}
        <motion.div variants={bodyItem} className="h-px mb-4.5 bg-linear-to-r from-zinc-200 dark:from-zinc-700 to-transparent" />

        {/* Connections */}
        {(influencedBy.length > 0 || influenced.length > 0) && (
          <motion.div variants={bodyItem} className="mb-7">
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
                      className="flex items-center gap-2.5 px-3 py-1.5 rounded-sm cursor-pointer text-left w-full bg-zinc-950/2 dark:bg-stone-100/2 border border-zinc-950/8 dark:border-stone-100/8 transition-[background,border-color] duration-200 hover:bg-zinc-950/8 dark:hover:bg-stone-100/8 hover:border-zinc-200 dark:hover:border-zinc-700"
                    >
                      <StrengthBar strength={strength} />
                      <span
                        className={`font-serif italic text-sm text-zinc-950 dark:text-stone-100 flex-1 ${strength >= 0.85 ? "font-medium" : "font-normal"} ${strength >= 0.85 ? "opacity-100" : strength >= 0.5 ? "opacity-80" : "opacity-[0.65]"}`}
                      >
                        {n.name}
                      </span>
                      {kind === "lineage" && (
                        <span className="font-sans text-[10px] font-medium tracking-widest uppercase text-slate-500 dark:text-stone-400 opacity-60 shrink-0">
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
          </motion.div>
        )}

        {/* Divider */}
        <motion.div variants={bodyItem} className="h-px mb-4.5 bg-linear-to-r from-zinc-200 dark:from-zinc-700 to-transparent" />

        {/* Hook quote */}
        <motion.div variants={bodyItem} className="mb-4 px-4 py-3 rounded-sm bg-zinc-950/4 dark:bg-stone-100/4 border border-zinc-950/8 dark:border-stone-100/8 font-serif italic text-sm text-slate-500 dark:text-stone-400 leading-relaxed">
          &ldquo;{node.hookQuote}&rdquo;
        </motion.div>

        {/* Short summary */}
        <motion.p variants={bodyItem} className="font-serif text-[0.9375rem] leading-[1.7] text-slate-500 dark:text-stone-400 mb-6">
          {node.shortSummary}
        </motion.p>

        {/* Read more */}
        <motion.div variants={bodyItem}>
          <Link
            href={`/philosophers/${node.slug}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xs font-sans text-xs md:text-[10px] font-medium tracking-widest text-zinc-950 dark:text-stone-100 no-underline border border-zinc-200 dark:border-zinc-700 transition-[background,opacity] duration-200 hover:bg-zinc-950/5 dark:hover:bg-stone-100/5"
          >
            Read full entry
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
      </motion.div>
    </motion.aside>
  );
}
