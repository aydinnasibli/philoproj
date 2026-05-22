"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import type { Note, Tag } from "./types";
import { tagStyle } from "./utils";

const ease = [0.22, 1, 0.36, 1] as const;

const container = {
  show: { transition: { staggerChildren: 0.045 } },
};

const row = {
  hidden: { opacity: 0, y: 10 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.32, ease } },
};

export const StreamView = memo(function StreamView({ notes, onOpen, tags }: { notes: Note[]; onOpen: (id: string) => void; tags: Tag[] }) {
  return (
    <motion.div
      className="max-w-[660px] mx-auto px-4 md:px-0 pb-10"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {notes.map(n => {
        const preview = (n.body ?? "").replace(/[#>*[\]]/g, "").replace(/\n/g, " ").slice(0, 220);
        return (
          <motion.div
            key={n.id}
            variants={row}
            onClick={() => onOpen(n.id)}
            whileHover={{ opacity: 0.78 }}
            className="flex gap-5 pb-[26px] mb-[26px] border-b border-stone-300 dark:border-stone-700 cursor-pointer"
          >
            <div className="w-[50px] shrink-0 pt-1 text-right">
              {n.pinned && (
                <div className="ml-auto mb-1.5 size-2 rounded-full bg-zinc-600 dark:bg-zinc-400 shadow-sm flex items-center justify-center">
                  <div className="size-0.5 rounded-full bg-white/40 -translate-x-px -translate-y-px" />
                </div>
              )}
              <div className="font-cinzel text-xs text-stone-400 dark:text-stone-500 leading-normal">
                {new Date(n.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </div>
              <div className="font-cinzel text-xs text-stone-400 dark:text-stone-600 mt-0.5">{new Date(n.createdAt).getFullYear()}</div>
            </div>
            <div className="flex-1 min-w-0">
              {n.title && <div className="font-cinzel text-sm tracking-[.04em] text-stone-900 dark:text-stone-100 mb-[7px] leading-[1.3]">{n.title}</div>}
              {preview && <p className="font-serif text-lg italic font-normal text-stone-600 dark:text-stone-400 leading-loose">{preview}{(n.body ?? "").length > 220 ? "…" : ""}</p>}
              <div className="flex gap-1.5 mt-[9px] flex-wrap">
                {(n.tags ?? []).map(tag => (
                  <span key={tag} className={`text-xs font-cinzel px-1.5 py-px rounded-xs border ${tagStyle(tag, tags).pill}`}>{tag}</span>
                ))}
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
});
