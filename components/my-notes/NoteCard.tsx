"use client";

import { memo } from "react";
import type { Note, Tag } from "./types";
import { tagStyle, cardRotCls, timeAgo, wc } from "./utils";

export const NoteCard = memo(function NoteCard({ note, onOpen, flat, tags }: {
  note: Note; onOpen: (id: string) => void; flat: boolean; tags: Tag[];
}) {
  const rotCls  = cardRotCls(note.id);
  const rotDeg  = (() => {
    const m = rotCls.match(/\[([\d.]+)deg\]/);
    return m ? parseFloat(m[1]) * (rotCls.startsWith('-') ? -1 : 1) : 0;
  })();
  const preview  = (note.body ?? "").replace(/[#>*[\]]/g, "").replace(/\n/g, " ");
  const wordCount = wc(note.body ?? "");

  return (
    <div
      className={`relative animate-fade-up hover:-translate-y-2 hover:scale-105 hover:rotate-0 transition-transform duration-250 ${note.pinned ? "pt-2" : ""}`}
      style={{ transform: `rotate(${flat ? 0 : rotDeg}deg)` }}
    >
      <article
        role="button"
        tabIndex={0}
        onClick={() => onOpen(note.id)}
        onKeyDown={e => (e.key === "Enter" || e.key === " ") && onOpen(note.id)}
        className="bg-stone-50 dark:bg-stone-800 rounded-sm cursor-pointer relative border border-stone-300 dark:border-stone-700 shadow group"
      >
        {note.pinned && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 size-4 rounded-full bg-zinc-600 dark:bg-zinc-400 shadow-md flex items-center justify-center">
            <div className="size-1.5 rounded-full bg-white/30 -translate-x-px -translate-y-px" />
          </div>
        )}
        <div className="relative overflow-hidden rounded-sm">
          <div className="px-4 pt-[15px] pb-[13px]">
            {(note.tags ?? []).length > 0 && (
              <div className="flex gap-1 flex-wrap mb-[7px]">
                {(note.tags ?? []).map(tag => (
                  <span key={tag} className={`text-xs font-cinzel tracking-wider px-1.5 py-px rounded-xs border ${tagStyle(tag, tags).pill}`}>{tag}</span>
                ))}
              </div>
            )}
            {note.title && <h3 className="font-cinzel text-sm font-medium tracking-[0.08em] text-stone-900 dark:text-stone-100 mb-[7px] leading-[1.35]">{note.title}</h3>}
            {preview ? (
              <p className="font-serif text-base italic font-normal text-stone-600 dark:text-stone-400 leading-relaxed overflow-hidden [display:-webkit-box] [-webkit-line-clamp:4] [-webkit-box-orient:vertical]">
                {preview.slice(0, 160)}{preview.length > 160 ? "…" : ""}
              </p>
            ) : (
              <p className="font-serif text-sm italic text-stone-400 dark:text-stone-600">Empty…</p>
            )}
            <div className="mt-[11px] pt-[9px] border-t border-stone-300 dark:border-stone-700 flex items-center gap-1.5">
              <span className="text-xs text-stone-400 dark:text-stone-500 italic flex-1">{timeAgo(note.updatedAt)}</span>
              {wordCount > 0 && <span className="text-xs text-stone-400 dark:text-stone-500 italic">{wordCount}w</span>}
              {(note.links ?? []).length > 0 && <span className="text-xs text-slate-500 dark:text-slate-400 opacity-70">⟜</span>}
              {(note.marginalia ?? []).length > 0 && <span className="text-xs text-zinc-500 dark:text-zinc-400 opacity-70">✎</span>}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
});
