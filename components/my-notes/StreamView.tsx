"use client";

import type { Note, Tag } from "./types";
import { tagStyle } from "./utils";

export function StreamView({ notes, onOpen, tags }: { notes: Note[]; onOpen: (id: string) => void; tags: Tag[] }) {
  return (
    <div className="max-w-[660px] mx-auto pb-10">
      {notes.map(n => {
        const preview = (n.body ?? "").replace(/[#>*[\]]/g, "").replace(/\n/g, " ").slice(0, 220);
        return (
          <div key={n.id} onClick={() => onOpen(n.id)} className="flex gap-5 pb-[26px] mb-[26px] border-b border-(--mn-border) cursor-pointer transition-opacity duration-150 hover:opacity-[.78]">
            <div className="w-[50px] shrink-0 pt-1 text-right">
              <div className="font-cinzel text-[9.5px] text-(--mn-ink-3) leading-[1.5]">
                {new Date(n.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </div>
              <div className="text-[9px] text-(--mn-border2) mt-0.5">{new Date(n.createdAt).getFullYear()}</div>
            </div>
            <div className="flex-1 min-w-0">
              {n.title && <div className="font-cinzel text-[13px] tracking-[.04em] text-(--mn-ink) mb-[7px] leading-[1.3]">{n.title}</div>}
              {preview && <p className="font-cormorant text-[17.5px] italic font-light text-(--mn-ink-2) leading-[1.75]">{preview}{(n.body ?? "").length > 220 ? "…" : ""}</p>}
              <div className="flex gap-[5px] mt-[9px] flex-wrap">
                {(n.tags ?? []).map(tag => (
                  <span key={tag} className={`text-[8.5px] font-cinzel px-[6px] py-px rounded-[2px] border ${tagStyle(tag, tags).pill}`}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
