"use client";

import { useState } from "react";
import type { Note, Tag } from "./types";
import { tagStyle, cardRotCls, timeAgo, wc } from "./utils";

export function NoteCard({ note, onClick, flat, tags }: {
  note: Note; onClick: () => void; flat: boolean; tags: Tag[];
}) {
  const [hov, setHov] = useState(false);
  const s       = tagStyle(note.tags?.[0] ?? "", tags);
  const rotCls  = cardRotCls(note.id);
  const preview = (note.body ?? "").replace(/[#>*[\]]/g, "").replace(/\n/g, " ");

  return (
    <div className={`relative ${note.pinned ? "pt-2" : ""}`}>
      <article
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={e => (e.key === "Enter" || e.key === " ") && onClick?.()}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        className={`bg-stone-50 dark:bg-stone-800 rounded-sm cursor-pointer relative transition-[color,background-color,border-color,transform,rotate,box-shadow] duration-300 ease-[cubic-bezier(.23,.8,.32,1)] border border-stone-300 dark:border-stone-700 ${
          flat
            ? hov ? "-translate-y-1 shadow-[0_14px_36px_rgba(0,0,0,.12),0_2px_6px_rgba(0,0,0,.08)]"
                  : "shadow-[0_2px_10px_rgba(0,0,0,.08)]"
            : hov ? "translate-y-[-5px] rotate-0 shadow-[0_14px_36px_rgba(0,0,0,.12),0_2px_6px_rgba(0,0,0,.08)]"
                  : `${rotCls} shadow-[0_2px_10px_rgba(0,0,0,.08)]`
        }`}
      >
        {note.pinned && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 size-4 rounded-full bg-amber-700 dark:bg-amber-600 shadow-md flex items-center justify-center">
            <div className="size-1.5 rounded-full bg-white/30 -translate-x-px -translate-y-px" />
          </div>
        )}
        <div className="relative overflow-hidden rounded-sm">
          <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${note.tags?.[0] ? s.bar : "bg-stone-300"} transition-opacity duration-200 ${hov ? "opacity-90" : "opacity-50"}`} />
          <div className="px-4 pt-[15px] pb-[13px] pl-[18px]">
            {(note.tags ?? []).length > 0 && (
              <div className="flex gap-1 flex-wrap mb-[7px]">
                {(note.tags ?? []).map(tag => (
                  <span key={tag} className={`text-xs font-cinzel tracking-wider px-1.5 py-px rounded-xs border ${tagStyle(tag, tags).pill}`}>{tag}</span>
                ))}
              </div>
            )}
            {note.title && <h3 className="font-cinzel text-sm font-medium tracking-[.04em] text-stone-900 dark:text-stone-100 mb-[7px] leading-[1.35]">{note.title}</h3>}
            {preview ? (
              <p className="font-cormorant text-base italic font-light text-stone-600 dark:text-stone-400 leading-relaxed overflow-hidden [display:-webkit-box] [-webkit-line-clamp:4] [-webkit-box-orient:vertical]">
                {preview.slice(0, 160)}{preview.length > 160 ? "…" : ""}
              </p>
            ) : (
              <p className="font-cormorant text-sm italic text-stone-400 dark:text-stone-600">Empty…</p>
            )}
            <div className="mt-[11px] pt-[9px] border-t border-stone-300 dark:border-stone-700 flex items-center gap-1.5">
              <span className="text-xs text-stone-400 dark:text-stone-500 italic flex-1">{timeAgo(note.updatedAt)}</span>
              {wc(note.body ?? "") > 0 && <span className="text-xs text-stone-400 dark:text-stone-500 italic">{wc(note.body ?? "")}w</span>}
              {(note.links ?? []).length > 0 && <span className="text-xs text-slate-500 dark:text-slate-400 opacity-70">⟜</span>}
              {(note.marginalia ?? []).length > 0 && <span className="text-xs text-amber-700 dark:text-amber-500 opacity-70">✎</span>}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
