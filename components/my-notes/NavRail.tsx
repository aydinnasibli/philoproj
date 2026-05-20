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
    </div>
  );
}
