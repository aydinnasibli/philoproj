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
    <div className="w-[52px] bg-(--mn-panel) border-l border-(--mn-border) flex flex-col items-center py-[14px] gap-[6px] shrink-0 z-10">
      <Link href="/" title="Back to site" className="no-underline mt-1 mb-3">
        <div className="font-cinzel text-[7.5px] font-semibold tracking-[.14em] text-(--mn-gold) [writing-mode:vertical-rl] rotate-180 opacity-70 hover:opacity-100 transition-opacity duration-150 whitespace-nowrap">
          The Living Manuscript
        </div>
      </Link>
      <IconBtn title="Toggle filters" active={panelOpen} onClick={() => setPanelOpen(p => !p)}>☰</IconBtn>
      <div className="w-[28px] border-t border-(--mn-border) my-1" />
      {views.map(([v, ico, lbl]) => (
        <IconBtn key={v} title={lbl} active={view === v} onClick={() => setView(v)}>{ico}</IconBtn>
      ))}
      <div className="flex-1" />
      <button
        onClick={onNew}
        title="New note (N)"
        className="w-[36px] h-[36px] rounded-full bg-(--mn-gold) border-none text-white text-[22px] cursor-pointer flex items-center justify-center shadow-[0_3px_12px_rgba(184,124,40,.35)] transition-all duration-180 font-light hover:bg-(--mn-gold-b) hover:scale-[1.08]"
      >+</button>
      <div className="h-[10px]" />
    </div>
  );
}
