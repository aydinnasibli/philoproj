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
        <div className="font-cinzel text-xs font-semibold tracking-widest text-amber-700 dark:text-amber-500 [writing-mode:vertical-rl] rotate-180 opacity-70 hover:opacity-100 transition-opacity duration-150 whitespace-nowrap">
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
        className="w-[36px] h-[36px] rounded-full bg-amber-700 dark:bg-amber-600 border-none text-white text-xl cursor-pointer flex items-center justify-center shadow-[0_3px_12px_rgba(184,124,40,.35)] transition-[background-color,transform,scale] duration-200 font-light hover:bg-amber-700 dark:bg-amber-600-b hover:scale-[1.08]"
      >+</button>
      <div className="h-[10px]" />
    </div>
  );
}
