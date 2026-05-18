"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { Note, Prefs } from "./types";
import { TAG_STYLES, FALLBACK_STYLE } from "./tag-styles";
import { allTags } from "./utils";

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

  const SORTS: [string, string][] = [["newest","Newest"],["oldest","Oldest"],["alpha","A – Z"],["wc","Word count"]];

  const SortSection = () => (
    <div className="p-4 pb-2.5">
      <div className="font-cinzel text-[8.5px] tracking-[.18em] text-(--mn-ink-3) mb-2">SORT</div>
      {SORTS.map(([val, lbl]) => (
        <button
          key={val}
          onClick={() => setSort(val)}
          className={`block w-full text-left px-2 py-1 rounded-[2px] border font-cinzel text-[9.5px] tracking-[.06em] cursor-pointer transition-all duration-120 mb-[3px] ${
            sort === val
              ? "bg-(--mn-gold-hi) border-(--mn-gold) text-(--mn-gold)"
              : "bg-transparent border-transparent text-(--mn-ink-3) hover:bg-(--mn-panel) hover:text-(--mn-ink-2)"
          }`}
        >{lbl}</button>
      ))}
    </div>
  );

  const TagsSection = () => (
    <div className="px-4 pt-2.5 pb-2">
      <div className="font-cinzel text-[8.5px] tracking-[.18em] text-(--mn-ink-3) mb-2 flex justify-between items-center">
        <span>THEMES</span>
        <div className="flex gap-1.5 items-center">
          {activeTags.length > 0 && (
            <button onClick={() => setActiveTags([])} className="text-[8px] text-(--mn-gold) bg-transparent border-none cursor-pointer font-cinzel">✕ clear</button>
          )}
          <button onClick={onManageTags} className="flex items-center justify-center w-5 h-5 rounded-[3px] border border-(--mn-border) text-(--mn-ink-2) bg-(--mn-panel) cursor-pointer hover:border-(--mn-gold) hover:text-(--mn-gold) hover:bg-(--mn-gold-hi) transition-all duration-150 text-[11px]">⚙</button>
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
              className={`inline-flex items-center gap-1 px-2 py-[3px] rounded-[2px] text-[9.5px] font-cinzel tracking-wider border cursor-pointer transition-all duration-130 ${
                on ? s.pill : `bg-transparent text-(--mn-ink-3) border-(--mn-border) ${s.hover}`
              }`}
            >
              <span className={`size-1 rounded-full shrink-0 ${s.dot}`} />
              {t.name}{cnt > 0 && <span className="text-[8px] text-(--mn-ink-3) ml-0.5">{cnt}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );

  const OptionsSection = () => (
    <div className="px-4 pt-2.5 pb-2">
      <div className="font-cinzel text-[8.5px] tracking-[.18em] text-(--mn-ink-3) mb-2">OPTIONS</div>
      <label className="flex items-center gap-2 cursor-pointer">
        <div
          onClick={() => onSetFlat(!prefs.flatCards)}
          className={`w-7 h-4 rounded-full relative transition-colors duration-200 cursor-pointer shrink-0 ${prefs.flatCards ? "bg-(--mn-gold)" : "bg-(--mn-border)"}`}
        >
          <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-[left] duration-200 shadow-[0_1px_3px_rgba(0,0,0,.2)] ${prefs.flatCards ? "left-3" : "left-0.5"}`} />
        </div>
        <span className="font-cinzel text-[9.5px] tracking-wider text-(--mn-ink-3)">Flat cards</span>
      </label>
    </div>
  );

  const Footer = () => (
    <div className="px-4 py-3 border-t border-(--mn-border)">
      <button
        onClick={onResurface}
        className="w-full py-[7px] bg-transparent border border-(--mn-border) rounded-[3px] font-cinzel text-[9.5px] tracking-[.07em] text-(--mn-ink-3) cursor-pointer transition-all duration-140 hover:border-(--mn-gold) hover:text-(--mn-gold)"
      >✦ Resurface a thought</button>
      {resurfaceMsg && (
        <div className="mt-[7px] text-4xs font-cormorant italic text-(--mn-ink-3) text-center leading-normal">{resurfaceMsg}</div>
      )}
      <div className="mt-2.5 font-cinzel text-[8.5px] tracking-[.12em] text-(--mn-ink-3) text-center">
        {notes.length} {notes.length === 1 ? "ENTRY" : "ENTRIES"}
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar (unchanged) ── */}
      <div className="hidden md:flex w-[210px] bg-(--mn-surface) border-l border-(--mn-border) flex-col overflow-hidden shrink-0">
        <SortSection />
        <div className="border-t border-(--mn-border) mx-[10px]" />
        <TagsSection />
        <div className="border-t border-(--mn-border) mx-[10px]" />
        <OptionsSection />
        <div className="flex-1" />
        <Footer />
      </div>

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
          className="fixed bottom-[64px] left-0 right-0 z-80 bg-(--mn-surface) border-t-2 border-t-(--mn-gold) rounded-t-[12px] max-h-[72vh] flex flex-col shadow-[0_-8px_40px_rgba(0,0,0,0.18)]"
        >
          {/* Handle + header */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
            <div className="absolute left-1/2 -translate-x-1/2 top-[10px] w-10 h-1 rounded-full bg-(--mn-border)" />
            <span className="font-cinzel text-[9px] tracking-[.18em] text-(--mn-ink-3) mt-3">FILTER & SORT</span>
            <button
              onClick={onClose}
              className="mt-3 bg-transparent border-none text-(--mn-ink-3) cursor-pointer font-cinzel text-[11px] hover:text-(--mn-ink) transition-colors duration-150"
            >✕</button>
          </div>

          <div className="overflow-y-auto flex-1">
            <SortSection />
            <div className="border-t border-(--mn-border) mx-[10px]" />
            <TagsSection />
            <div className="border-t border-(--mn-border) mx-[10px]" />
            <OptionsSection />
            <Footer />
          </div>
        </motion.div>
      </div>
    </>
  );
}
