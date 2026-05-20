"use client";

import Link from "next/link";
import { IconBtn } from "./IconBtn";

export function NavRail({ view, setView, panelOpen, setPanelOpen, onNew }: {
  view: string; setView: (v: string) => void;
  panelOpen: boolean; setPanelOpen: (fn: (p: boolean) => boolean) => void;
  onNew: () => void;
}) {
  const views: [string, string, string][] = [
    ["grid", "⊞", "Cards"], ["stream", "≡", "Stream"], ["constellation", "✦", "Cosmos"],
  ];
  return (
    <div className="w-[52px] bg-stone-200 dark:bg-stone-800 border-l border-stone-300 dark:border-stone-700 flex flex-col items-center py-3.5 gap-1.5 shrink-0 z-10">
      <Link href="/" title="Back to site" className="no-underline mt-1 mb-3">
        <div className="font-cinzel text-xs font-semibold tracking-widest text-zinc-600 dark:text-zinc-400 [writing-mode:vertical-rl] rotate-180 opacity-70 hover:opacity-100 transition-opacity duration-150 whitespace-nowrap">
          The Living Manuscript
        </div>
      </Link>
      <IconBtn title="Toggle filters" active={panelOpen} onClick={() => setPanelOpen(p => !p)}>☰</IconBtn>
      <div className="w-[28px] border-t border-stone-300 dark:border-stone-700 my-1" />
      {views.map(([v, ico, lbl]) => (
        <IconBtn key={v} title={lbl} active={view === v} onClick={() => setView(v)}>{ico}</IconBtn>
      ))}
      <div className="flex-1" />
      <button
        onClick={onNew}
        title="New note (N)"
        className="w-[40px] h-[40px] rounded-[10px] bg-zinc-950 dark:bg-zinc-100 border-none text-zinc-50 dark:text-zinc-950 cursor-pointer flex items-center justify-center shadow-[0_1px_3px_rgba(0,0,0,0.12),0_4px_14px_rgba(0,0,0,0.18)] transition-[transform,box-shadow] duration-200 hover:scale-[1.06] hover:shadow-[0_2px_6px_rgba(0,0,0,0.14),0_8px_24px_rgba(0,0,0,0.22)] active:scale-[0.95] active:shadow-[0_1px_2px_rgba(0,0,0,0.10)]"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      </button>
      <div className="h-[10px]" />
    </div>
  );
}
