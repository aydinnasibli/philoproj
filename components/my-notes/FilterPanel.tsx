"use client";

import { useMemo } from "react";
import type { Note, Tag, Prefs } from "./types";
import { TAG_STYLES, FALLBACK_STYLE } from "./tag-styles";
import { allTags, tagStyle } from "./utils";

export function FilterPanel({ notes, activeTags, setActiveTags, prefs, onResurface, resurfaceMsg, sort, setSort, onSetFlat, onManageTags }: {
  notes: Note[];
  activeTags: string[]; setActiveTags: (t: string[]) => void;
  prefs: Prefs; onResurface: () => void; resurfaceMsg?: string;
  sort: string; setSort: (s: string) => void;
  onSetFlat: (v: boolean) => void; onManageTags: () => void;
}) {
  const tags = allTags(prefs);
  const tagCounts = useMemo(() => {
    const m: Record<string, number> = {};
    notes.forEach(n => (n.tags ?? []).forEach(t => { m[t] = (m[t] ?? 0) + 1; }));
    return m;
  }, [notes]);

  const SORTS: [string, string][] = [["newest","Newest"],["oldest","Oldest"],["alpha","A – Z"],["wc","Word count"]];

  return (
    <div className="w-[210px] bg-(--mn-surface) border-l border-(--mn-border) flex flex-col overflow-hidden shrink-0">
      <div className="p-4 pb-[10px]">
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
      <div className="border-t border-(--mn-border) mx-[10px]" />
      <div className="px-4 pt-[10px] pb-2">
        <div className="font-cinzel text-[8.5px] tracking-[.18em] text-(--mn-ink-3) mb-2 flex justify-between items-center">
          <span>THEMES</span>
          <div className="flex gap-[6px] items-center">
            {activeTags.length > 0 && (
              <button onClick={() => setActiveTags([])} className="text-[8px] text-(--mn-gold) bg-transparent border-none cursor-pointer font-cinzel">✕ clear</button>
            )}
            <button onClick={onManageTags} className="text-[10px] text-(--mn-ink-3) bg-transparent border-none cursor-pointer hover:text-(--mn-gold) transition-colors duration-150">⚙</button>
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
      <div className="border-t border-(--mn-border) mx-[10px]" />
      <div className="px-4 pt-[10px] pb-2">
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
      <div className="flex-1" />
      <div className="px-4 py-3 border-t border-(--mn-border)">
        <button
          onClick={onResurface}
          className="w-full py-[7px] bg-transparent border border-(--mn-border) rounded-[3px] font-cinzel text-[9.5px] tracking-[.07em] text-(--mn-ink-3) cursor-pointer transition-all duration-140 hover:border-(--mn-gold) hover:text-(--mn-gold)"
        >✦ Resurface a thought</button>
        {resurfaceMsg && (
          <div className="mt-[7px] text-[9px] font-cormorant italic text-(--mn-ink-3) text-center leading-[1.5]">{resurfaceMsg}</div>
        )}
        <div className="mt-[10px] font-cinzel text-[8.5px] tracking-[.12em] text-(--mn-ink-3) text-center">
          {notes.length} {notes.length === 1 ? "ENTRY" : "ENTRIES"}
        </div>
      </div>
    </div>
  );
}
