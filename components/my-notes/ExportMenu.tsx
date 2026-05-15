"use client";

import { useState, useEffect, useRef } from "react";
import type { Note } from "./types";
import { wc } from "./utils";

export function ExportMenu({ note }: { note: Note }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  function esc(s: string) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function exportNote(fmt: string) {
    setOpen(false);
    if (fmt === "txt") {
      const text = `${note.title || "Untitled"}\n${"─".repeat(40)}\n${note.body || ""}`;
      const a = document.createElement("a");
      a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(text);
      a.download = `${(note.title || "note").replace(/\s+/g, "_")}.txt`;
      a.click();
    } else {
      const w = window.open("", "_blank");
      if (!w) return;
      const title = esc(note.title || "Untitled");
      const body  = esc(note.body ?? "").replace(/\n/g, "<br>");
      w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title><style>body{font-family:Georgia,serif;max-width:700px;margin:60px auto;padding:0 40px;font-size:16px;line-height:1.8;color:#1c1710;}h1{font-size:26px;margin-bottom:8px;}.meta{font-size:12px;color:#9a8a70;margin-bottom:32px;border-bottom:1px solid #ddd5c2;padding-bottom:16px;}blockquote{border-left:2px solid #b87c28;padding-left:18px;font-style:italic;color:#5a5040;}</style></head><body><h1>${title}</h1><div class="meta">${new Date(note.createdAt).toLocaleDateString("en-GB",{year:"numeric",month:"long",day:"numeric"})} · ${wc(note.body ?? "")} words</div><div>${body}</div></body></html>`);
      w.document.close(); w.focus(); setTimeout(() => w.print(), 400);
    }
  }

  return (
    <div ref={ref} className="relative flex items-center">
      <button onClick={() => setOpen(p => !p)} className="bg-transparent border border-(--mn-border) text-(--mn-ink-3) px-[10px] py-[3px] text-[9px] font-cinzel tracking-[.07em] cursor-pointer rounded-[2px] transition-all duration-120 h-6 leading-none hover:border-(--mn-gold) hover:text-(--mn-gold)">Export ↓</button>
      {open && (
        <div className="absolute top-[calc(100%+4px)] right-0 bg-(--mn-card) border border-(--mn-border) rounded-[3px] shadow-[0_8px_24px_rgba(0,0,0,.12)] z-20 min-w-[130px]">
          {([["txt","Plain text (.txt)"],["pdf","Print / PDF"]] as [string,string][]).map(([fmt,lbl]) => (
            <div key={fmt} onClick={() => exportNote(fmt)} className="px-[14px] py-2 cursor-pointer font-cinzel text-[9.5px] text-(--mn-ink-2) transition-colors duration-120 hover:bg-(--mn-panel)">{lbl}</div>
          ))}
        </div>
      )}
    </div>
  );
}
