"use client";

import type { Note, Tag } from "./types";
import { tagStyle } from "./utils";

export function StreamView({ notes, onOpen, tags }: { notes: Note[]; onOpen: (id: string) => void; tags: Tag[] }) {
  return (
    <div className="max-w-[660px] mx-auto px-4 md:px-0 pb-10">
      {notes.map(n => {
        const preview = (n.body ?? "").replace(/[#>*[\]]/g, "").replace(/\n/g, " ").slice(0, 220);
        return (
          <div key={n.id} onClick={() => onOpen(n.id)} className="flex gap-5 pb-[26px] mb-[26px] border-b border-stone-300 dark:border-stone-700 cursor-pointer transition-opacity duration-150 hover:opacity-[.78]">
            <div className="w-[50px] shrink-0 pt-1 text-right">
              {n.pinned && (
                <div className="ml-auto mb-1.5 size-2 rounded-full bg-amber-700 dark:bg-amber-600 shadow-sm flex items-center justify-center">
                  <div className="size-0.5 rounded-full bg-white/40 -translate-x-px -translate-y-px" />
                </div>
              )}
              <div className="font-cinzel text-xs text-stone-400 dark:text-stone-500 leading-normal">
                {new Date(n.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </div>
              <div className="text-xs text-stone-400 dark:text-stone-600 mt-0.5">{new Date(n.createdAt).getFullYear()}</div>
            </div>
            <div className="flex-1 min-w-0">
              {n.title && <div className="font-cinzel text-sm tracking-[.04em] text-stone-900 dark:text-stone-100 mb-[7px] leading-[1.3]">{n.title}</div>}
              {preview && <p className="font-cormorant text-lg italic font-light text-stone-600 dark:text-stone-400 leading-loose">{preview}{(n.body ?? "").length > 220 ? "…" : ""}</p>}
              <div className="flex gap-1.5 mt-[9px] flex-wrap">
                {(n.tags ?? []).map(tag => (
                  <span key={tag} className={`text-xs font-cinzel px-1.5 py-px rounded-xs border ${tagStyle(tag, tags).pill}`}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
