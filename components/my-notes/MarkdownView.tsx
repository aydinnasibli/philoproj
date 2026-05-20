"use client";

import { parseInline } from "@/lib/markdown";
import type { Note } from "./types";

export function MarkdownView({ text = "", notes = [], onLink }: {
  text?: string; notes?: Note[]; onLink?: (id: string) => void;
}) {
  return (
    <div className="[&_h1]:font-cinzel [&_h1]:text-2xl [&_h1]:font-medium [&_h1]:tracking-[.04em] [&_h1]:text-stone-900 dark:text-stone-100 [&_h1]:mt-[22px] [&_h1]:mb-2.5 [&_h1]:leading-[1.3] [&_h2]:font-cinzel [&_h2]:text-sm [&_h2]:font-medium [&_h2]:tracking-[.06em] [&_h2]:text-stone-900 dark:text-stone-100 [&_h2]:mt-[18px] [&_h2]:mb-2 [&_blockquote]:border-l-2 [&_blockquote]:border-l-zinc-600 dark:border-l-zinc-400 [&_blockquote]:py-1 [&_blockquote]:pl-[18px] [&_blockquote]:my-[14px] [&_blockquote]:font-cormorant [&_blockquote]:text-xl [&_blockquote]:italic [&_blockquote]:text-stone-600 dark:text-stone-400 [&_blockquote]:leading-loose [&_p]:font-serif [&_p]:text-lg [&_p]:leading-[1.95] [&_p]:text-stone-900 dark:text-stone-100 [&_p]:mb-1 [&_strong]:font-semibold [&_hr]:[border:none] [&_hr]:border-t [&_hr]:border-stone-300 dark:border-stone-700 [&_hr]:my-5">
      {text.split("\n").map((line, i) => {
        if (line.startsWith("# "))  return <h1 key={i}>{line.slice(2)}</h1>;
        if (line.startsWith("## ")) return <h2 key={i}>{line.slice(3)}</h2>;
        if (line.startsWith("---")) return <hr key={i} />;
        if (line.startsWith("> "))  return <blockquote key={i}>{parseInline(line.slice(2), notes, onLink)}</blockquote>;
        if (!line.trim())           return <div key={i} className="h-2" />;
        return <p key={i}>{parseInline(line, notes, onLink)}</p>;
      })}
    </div>
  );
}
