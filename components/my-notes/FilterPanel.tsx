"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { Note, Prefs, Tag } from "./types";
import { TAG_STYLES, FALLBACK_STYLE } from "./tag-styles";
import { allTags } from "./utils";

const SORTS: [string, string][] = [["newest","Newest"],["oldest","Oldest"],["alpha","A – Z"],["wc","Word count"]];

function SortSection({ sort, setSort }: { sort: string; setSort: (s: string) => void }) {
  return (
    <div className="p-4 pb-2.5">
      <div className="font-cinzel text-xs tracking-widest text-stone-400 dark:text-stone-500 mb-2">SORT</div>
      {SORTS.map(([val, lbl]) => (
        <button
          key={val}
          onClick={() => setSort(val)}
          className={`block w-full text-left px-2 py-1 rounded-xs border font-cinzel text-xs tracking-[.06em] cursor-pointer transition-[background-color] duration-100 mb-[3px] ${
            sort === val
              ? "bg-[#F5EEE3] dark:bg-stone-800 border-[#845400]/20 dark:border-stone-700 text-[#845400] dark:text-[#C47029]"
              : "bg-transparent border-transparent text-stone-400 dark:text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-[#845400] dark:hover:text-[#C47029]"
          }`}
        >{lbl}</button>
      ))}
    </div>
  );
}

function TagsSection({ tags, activeTags, setActiveTags, tagCounts, onManageTags }: {
  tags: Tag[]; activeTags: string[]; setActiveTags: (t: string[]) => void;
  tagCounts: Record<string, number>; onManageTags: () => void;
}) {
  return (
    <div className="px-4 pt-2.5 pb-2">
      <div className="font-cinzel text-xs tracking-widest text-stone-400 dark:text-stone-500 mb-2 flex justify-between items-center">
        <span>THEMES</span>
        <div className="flex gap-1.5 items-center">
          {activeTags.length > 0 && (
            <button onClick={() => setActiveTags([])} className="text-xs text-[#845400] dark:text-[#C47029] bg-transparent border-none cursor-pointer font-cinzel">✕ clear</button>
          )}
          <button onClick={onManageTags} className="flex items-center justify-center w-5 h-5 rounded-sm border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400 bg-stone-200 dark:bg-stone-800 cursor-pointer hover:border-[#845400]/40 hover:text-[#845400] hover:bg-[#F5EEE3] dark:hover:border-[#C47029]/40 dark:hover:text-[#C47029] dark:hover:bg-stone-700 transition-[color,background-color,border-color] duration-150 text-xs">⚙</button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {tags.map(t => {
          const on  = activeTags.includes(t.name);
          const cnt = tagCounts[t.name] ?? 0;
          const s   = TAG_STYLES[t.color] ?? FALLBACK_STYLE;
          return (
            <button
              key={t.name}
              onClick={() => setActiveTags(on ? activeTags.filter(x => x !== t.name) : [...activeTags, t.name])}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-xs font-cinzel tracking-wider border cursor-pointer transition-[color,background-color,border-color] duration-150 ${
                on ? s.pill : `bg-transparent text-stone-400 dark:text-stone-500 border-stone-300 dark:border-stone-700 ${s.hover}`
              }`}
            >
              <span className={`size-1 rounded-full shrink-0 ${s.dot}`} />
              {t.name}{cnt > 0 && <span className="text-xs text-stone-400 dark:text-stone-500 ml-0.5">{cnt}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function OptionsSection({ flatCards, onSetFlat }: { flatCards: boolean; onSetFlat: (v: boolean) => void }) {
  return (
    <div className="px-4 pt-2.5 pb-2">
      <div className="font-cinzel text-xs tracking-widest text-stone-400 dark:text-stone-500 mb-2">OPTIONS</div>
      <label className="flex items-center gap-2 cursor-pointer">
        <div
          onClick={() => onSetFlat(!flatCards)}
          className={`w-7 h-4 rounded-full relative transition-colors duration-200 cursor-pointer shrink-0 ${flatCards ? "bg-[#845400]" : "bg-stone-300 dark:bg-stone-600"}`}
        >
          <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white dark:bg-stone-200 transition-[left] duration-200 shadow-[0_1px_3px_rgba(0,0,0,.2)] ${flatCards ? "left-3" : "left-0.5"}`} />
        </div>
        <span className="font-cinzel text-xs tracking-wider text-stone-400 dark:text-stone-500">Flat cards</span>
      </label>
    </div>
  );
}

function FooterSection({ onResurface, resurfaceMsg, noteCount }: { onResurface: () => void; resurfaceMsg?: string; noteCount: number }) {
  return (
    <div className="px-4 py-3 border-t border-stone-300 dark:border-stone-700">
      <button
        onClick={onResurface}
        className="w-full py-1.5 bg-transparent border border-stone-300 dark:border-stone-700 rounded-sm font-cinzel text-xs tracking-wider text-stone-400 dark:text-stone-500 cursor-pointer transition-[color,border-color] duration-150 hover:border-[#845400]/40 hover:text-[#845400] dark:hover:border-[#C47029]/40 dark:hover:text-[#C47029]"
      >✦ Resurface a thought</button>
      {resurfaceMsg && (
        <div className="mt-[7px] text-xs font-serif italic text-stone-400 dark:text-stone-500 text-center leading-normal">{resurfaceMsg}</div>
      )}
      <div className="mt-2.5 font-cinzel text-xs tracking-widest text-stone-400 dark:text-stone-500 text-center">
        {noteCount} {noteCount === 1 ? "ENTRY" : "ENTRIES"}
      </div>
    </div>
  );
}

export function FilterPanel({ notes, activeTags, setActiveTags, prefs, onResurface, resurfaceMsg, sort, setSort, onSetFlat, onManageTags, onClose }: {
  notes: Note[];
  activeTags: string[]; setActiveTags: (t: string[]) => void;
  prefs: Prefs; onResurface: () => void; resurfaceMsg?: string;
  sort: string; setSort: (s: string) => void;
  onSetFlat: (v: boolean) => void; onManageTags: () => void;
  onClose: () => void;
}) {
  const tags = allTags(prefs);
  const tagCounts = useMemo(() => {
    const m: Record<string, number> = {};
    notes.forEach(n => (n.tags ?? []).forEach(t => { m[t] = (m[t] ?? 0) + 1; }));
    return m;
  }, [notes]);

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <motion.div
        className="hidden md:flex w-[210px] bg-stone-50 dark:bg-stone-900 border-l border-stone-300 dark:border-stone-700 flex-col overflow-hidden shrink-0"
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 16 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        <SortSection sort={sort} setSort={setSort} />
        <div className="border-t border-stone-300 dark:border-stone-700 mx-[10px]" />
        <TagsSection tags={tags} activeTags={activeTags} setActiveTags={setActiveTags} tagCounts={tagCounts} onManageTags={onManageTags} />
        <div className="border-t border-stone-300 dark:border-stone-700 mx-[10px]" />
        <OptionsSection flatCards={prefs.flatCards} onSetFlat={onSetFlat} />
        <div className="flex-1" />
        <FooterSection onResurface={onResurface} resurfaceMsg={resurfaceMsg} noteCount={notes.length} />
      </motion.div>

      {/* ── Mobile bottom sheet ── */}
      <div className="md:hidden">
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-79 bg-black/30"
          onClick={onClose}
        />
        {/* Sheet */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-80 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-700 rounded-t-[12px] max-h-[72vh] flex flex-col shadow-[0_-8px_40px_rgba(0,0,0,0.18)]"
        >
          {/* Handle + header */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
            <div className="absolute left-1/2 -translate-x-1/2 top-[10px] w-10 h-1 rounded-full bg-stone-300 dark:bg-stone-600" />
            <span className="font-cinzel text-xs tracking-widest text-stone-400 dark:text-stone-500 mt-3">FILTER & SORT</span>
            <button
              onClick={onClose}
              className="mt-3 bg-transparent border-none text-stone-400 dark:text-stone-500 cursor-pointer font-cinzel text-xs hover:text-stone-900 dark:hover:text-stone-100 transition-colors duration-150"
            >✕</button>
          </div>

          <div className="overflow-y-auto flex-1">
            <SortSection sort={sort} setSort={setSort} />
            <div className="border-t border-stone-300 dark:border-stone-700 mx-[10px]" />
            <TagsSection tags={tags} activeTags={activeTags} setActiveTags={setActiveTags} tagCounts={tagCounts} onManageTags={onManageTags} />
            <div className="border-t border-stone-300 dark:border-stone-700 mx-[10px]" />
            <OptionsSection flatCards={prefs.flatCards} onSetFlat={onSetFlat} />
            <FooterSection onResurface={onResurface} resurfaceMsg={resurfaceMsg} noteCount={notes.length} />
          </div>
        </motion.div>
      </div>
    </>
  );
}
