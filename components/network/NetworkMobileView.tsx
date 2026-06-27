"use client";

import Image from "next/image";
import { useState, useCallback, useMemo, useEffect } from "react";
import type { LineageNode, SchoolWithPhilosophers } from "@/lib/types";
import PhilosopherPanel from "./PhilosopherPanel";

type Props = { nodes: LineageNode[]; schools: SchoolWithPhilosophers[] };

// Ordered era list — drives section order in the list
const ERA_ORDER = ["era-1", "era-2", "era-3", "era-4"];

function groupByEra(
  nodes: LineageNode[]
): { eraId: string; title: string; nodes: LineageNode[] }[] {
  const map = new Map<string, { title: string; nodes: LineageNode[] }>();
  for (const node of nodes) {
    if (!map.has(node.eraId)) {
      map.set(node.eraId, { title: node.eraTitle, nodes: [] });
    }
    map.get(node.eraId)!.nodes.push(node);
  }
  for (const g of map.values()) {
    g.nodes.sort((a, b) => (a.birthYear ?? 0) - (b.birthYear ?? 0));
  }
  // Known eras first, unknown eras appended at end
  const known = ERA_ORDER.filter(id => map.has(id)).map(id => ({ eraId: id, ...map.get(id)! }));
  const unknown = [...map.entries()]
    .filter(([id]) => !ERA_ORDER.includes(id))
    .map(([eraId, g]) => ({ eraId, ...g }));
  return [...known, ...unknown];
}

function formatYear(y: number): string {
  return y < 0 ? `${Math.abs(y)} BC` : `AD ${y}`;
}

export default function NetworkMobileView({ nodes, schools }: Props) {
  const [selected, setSelected]       = useState<LineageNode | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Lock body scroll while panel is open
  useEffect(() => {
    document.body.style.overflow = selected ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selected]);

  const onNavigate = useCallback(
    (id: string) => setSelected(nodes.find(n => n._id === id) ?? null),
    [nodes]
  );

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return nodes;
    return nodes.filter(
      n =>
        n.name.toLowerCase().includes(q) ||
        n.coreBranch.toLowerCase().includes(q) ||
        n.eraTitle.toLowerCase().includes(q)
    );
  }, [nodes, searchQuery]);

  const groups = useMemo(() => groupByEra(filtered), [filtered]);

  return (
    <>
      <div className="min-h-screen parchment-bg pt-14 pb-24">

        {/* Sticky search bar — sits just below the fixed top header (h-14) */}
        <div className="sticky top-14 z-30 px-4 py-2.5 bg-stone-50/96 dark:bg-stone-900/96 backdrop-blur-sm border-b border-zinc-100 dark:border-zinc-800">
          <div className="relative max-w-sm mx-auto">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-950/30 dark:text-stone-100/30 pointer-events-none"
              width="13" height="13" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              placeholder="Search philosophers…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent font-sans text-sm text-zinc-950 dark:text-stone-100 placeholder:text-zinc-950/28 dark:placeholder:text-stone-100/28 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-950/30 dark:text-stone-100/30 hover:text-zinc-950/60 dark:hover:text-stone-100/60 transition-colors duration-150"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Page header — hidden while searching */}
        {!searchQuery && (
          <div className="pt-6 pb-4 text-center px-6">
            <div className="font-cinzel text-[0.6rem] tracking-widest uppercase text-slate-500 dark:text-stone-400 mb-2">
              The Network
            </div>
            <h1 className="font-serif text-[1.6rem] font-medium text-zinc-950 dark:text-stone-100 tracking-[-0.02em]">
              Thinkers
            </h1>
            <p className="font-serif italic text-sm text-slate-500 dark:text-stone-400 mt-2 max-w-[260px] mx-auto leading-relaxed">
              Tap a philosopher to explore their thought and connections.
            </p>
          </div>
        )}

        {/* Era groups */}
        <div className="px-4 pt-2 max-w-sm mx-auto">
          {groups.length === 0 ? (
            <div className="py-16 text-center font-serif italic text-slate-500 dark:text-stone-400 text-sm">
              No results for &ldquo;{searchQuery}&rdquo;
            </div>
          ) : (
            <div
              key={searchQuery}
              className="flex flex-col gap-8"
            >
              {groups.map(group => (
                <div key={group.eraId}>
                  {/* Era header */}
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <span className="font-cinzel text-[0.58rem] tracking-widest uppercase text-slate-500 dark:text-stone-400">
                      {group.title}
                    </span>
                    <div className="flex-1 h-px bg-zinc-950/8 dark:bg-stone-100/8" />
                    <span className="font-sans text-[10px] text-zinc-950/20 dark:text-stone-100/20">
                      {group.nodes.length}
                    </span>
                  </div>

                  {/* Philosopher rows */}
                  <div className="flex flex-col gap-1.5">
                    {group.nodes.map((node, i) => (
                      <button
                        key={node._id}
                        onClick={() => setSelected(node)}
                        className="animate-fade-up-sm w-full text-left flex items-center gap-3 px-3.5 py-3 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-stone-50/80 dark:bg-stone-900/80 shadow-[0_1px_3px_rgba(17,21,26,0.03)] transition-[border-color,background] duration-150 active:border-zinc-300 dark:active:border-zinc-600 active:bg-zinc-950/[0.03] dark:active:bg-stone-100/[0.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-700 dark:focus-visible:ring-zinc-400"
                        style={{ animationDelay: `${0.05 + i * 0.04}s` }}
                      >
                        {/* Avatar */}
                        <div className="relative w-10 h-10 rounded-full shrink-0 overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800">
                          {node.avatarUrl ? (
                            <Image
                              src={node.avatarUrl}
                              alt={node.name}
                              fill
                              sizes="40px"
                              className="object-cover filter-[grayscale(0.5)_brightness(0.9)]"
                            />
                          ) : (
                            <span className="absolute inset-0 flex items-center justify-center font-serif italic text-base text-slate-500 dark:text-stone-400">
                              {node.name[0]}
                            </span>
                          )}
                        </div>

                        {/* Name + branch */}
                        <div className="flex-1 min-w-0">
                          <div className="font-serif text-[0.9375rem] font-medium text-zinc-950 dark:text-stone-100 leading-snug">
                            {node.name}
                          </div>
                          <div className="font-sans text-[10px] text-slate-500 dark:text-stone-400 mt-0.5 truncate">
                            {node.coreBranch}
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="shrink-0 text-right mr-1">
                          {node.birthYear != null && (
                            <div className="font-sans text-[10px] text-zinc-950/30 dark:text-stone-100/30 leading-tight">
                              {formatYear(node.birthYear)}
                            </div>
                          )}
                          {node.deathYear != null && (
                            <div className="font-sans text-[10px] text-zinc-950/18 dark:text-stone-100/18 leading-tight">
                              {formatYear(node.deathYear)}
                            </div>
                          )}
                        </div>

                        <svg
                          width="10" height="10" viewBox="0 0 24 24"
                          fill="none" stroke="currentColor" strokeWidth="2"
                          className="shrink-0 text-zinc-950/18 dark:text-stone-100/18"
                          aria-hidden="true"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {selected && (
        <div
          className="animate-fade-in fixed inset-0 z-[55] bg-zinc-950/25 dark:bg-zinc-950/40"
          onClick={() => setSelected(null)}
        />
      )}

      {/* Philosopher panel */}
      {selected && (
        <PhilosopherPanel
          node={selected}
          allNodes={nodes}
          schools={schools}
          onClose={() => setSelected(null)}
          onNavigate={onNavigate}
        />
      )}
    </>
  );
}
