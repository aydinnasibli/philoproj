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
    <div>
      <article
        onClick={onClick}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        className={`bg-(--mn-card) rounded-[3px] cursor-pointer relative overflow-hidden transition-all duration-220 ease-[cubic-bezier(.23,.8,.32,1)] border border-(--mn-border) ${
          flat
            ? hov ? "-translate-y-1 shadow-[0_14px_36px_rgba(0,0,0,.12),0_2px_6px_rgba(0,0,0,.08)]"
                  : "shadow-[0_2px_10px_rgba(0,0,0,.08)]"
            : hov ? "translate-y-[-5px] rotate-0 shadow-[0_14px_36px_rgba(0,0,0,.12),0_2px_6px_rgba(0,0,0,.08)]"
                  : `${rotCls} shadow-[0_2px_10px_rgba(0,0,0,.08)]`
        }`}
      >
        <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${note.tags?.[0] ? s.bar : "bg-stone-300"} transition-opacity duration-200 ${hov ? "opacity-90" : "opacity-50"}`} />
        <div className="px-4 pt-[15px] pb-[13px] pl-[18px]">
          {note.pinned && <div className="text-[8px] font-cinzel tracking-[.14em] text-(--mn-gold) mb-[6px]">⊛ PINNED</div>}
          {(note.tags ?? []).length > 0 && (
            <div className="flex gap-[3px] flex-wrap mb-[7px]">
              {(note.tags ?? []).map(tag => (
                <span key={tag} className={`text-[8.5px] font-cinzel tracking-[.08em] px-[6px] py-px rounded-[2px] border ${tagStyle(tag, tags).pill}`}>{tag}</span>
              ))}
            </div>
          )}
          {note.title && <h3 className="font-cinzel text-[12px] font-medium tracking-[.04em] text-(--mn-ink) mb-[7px] leading-[1.35]">{note.title}</h3>}
          {preview ? (
            <p className="font-cormorant text-[16.5px] italic font-light text-(--mn-ink-2) leading-[1.7] overflow-hidden [display:-webkit-box] [-webkit-line-clamp:4] [-webkit-box-orient:vertical]">
              {preview.slice(0, 160)}{preview.length > 160 ? "…" : ""}
            </p>
          ) : (
            <p className="font-cormorant text-[14px] italic text-(--mn-border2)">Empty…</p>
          )}
          <div className="mt-[11px] pt-[9px] border-t border-(--mn-border) flex items-center gap-[6px]">
            <span className="text-[10.5px] text-(--mn-ink-3) italic flex-1">{timeAgo(note.updatedAt)}</span>
            {wc(note.body ?? "") > 0 && <span className="text-[9.5px] text-(--mn-ink-3) italic">{wc(note.body ?? "")}w</span>}
            {(note.links ?? []).length > 0 && <span className="text-[11px] text-(--mn-link) opacity-70">⟜</span>}
            {(note.marginalia ?? []).length > 0 && <span className="text-[10px] text-(--mn-gold) opacity-70">✎</span>}
          </div>
        </div>
      </article>
    </div>
  );
}
