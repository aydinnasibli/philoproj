"use client";

import { parseInline } from "@/lib/markdown";
import type { Note } from "./types";

export function MarkdownView({ text = "", notes = [], onLink }: {
  text?: string; notes?: Note[]; onLink?: (id: string) => void;
}) {
  return (
    <div className="[&_h1]:font-cinzel [&_h1]:text-[22px] [&_h1]:font-medium [&_h1]:tracking-[.04em] [&_h1]:text-(--mn-ink) [&_h1]:mt-[22px] [&_h1]:mb-[10px] [&_h1]:leading-[1.3] [&_h2]:font-cinzel [&_h2]:text-[15px] [&_h2]:font-medium [&_h2]:tracking-[.06em] [&_h2]:text-(--mn-ink) [&_h2]:mt-[18px] [&_h2]:mb-[8px] [&_blockquote]:border-l-2 [&_blockquote]:border-l-(--mn-gold) [&_blockquote]:py-1 [&_blockquote]:pl-[18px] [&_blockquote]:my-[14px] [&_blockquote]:font-cormorant [&_blockquote]:text-[20px] [&_blockquote]:italic [&_blockquote]:text-(--mn-ink-2) [&_blockquote]:leading-[1.75] [&_p]:font-serif [&_p]:text-[18.5px] [&_p]:leading-[1.95] [&_p]:text-(--mn-ink) [&_p]:mb-1 [&_strong]:font-semibold [&_hr]:[border:none] [&_hr]:border-t [&_hr]:border-(--mn-border) [&_hr]:my-5">
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
