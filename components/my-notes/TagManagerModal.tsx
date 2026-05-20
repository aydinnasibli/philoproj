"use client";

import { useState } from "react";
import type { Tag, Prefs } from "./types";
import { TAG_STYLES, FALLBACK_STYLE, TAG_PALETTE, DEFAULT_TAGS } from "./tag-styles";

export function TagManagerModal({ prefs, onSave, onClose }: {
  prefs: Prefs; onSave: (customTags: Tag[]) => void; onClose: () => void;
}) {
  const [custom, setCustom] = useState(prefs.customTags.map(t => ({ ...t })));
  const [name, setName]     = useState("");
  const [color, setColor]   = useState<string>(TAG_PALETTE[0]);
  const [err, setErr]       = useState("");

  function add() {
    const n = name.trim();
    if (!n) { setErr("Name required"); return; }
    if ([...DEFAULT_TAGS, ...custom].find(t => t.name.toLowerCase() === n.toLowerCase())) { setErr("Already exists"); return; }
    setCustom(p => [...p, { name: n, color }]);
    setName(""); setErr("");
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[700] bg-neutral-950/55 backdrop-blur-[6px] flex items-center justify-center p-6"
    >
      <div className="w-full max-w-[440px] bg-stone-50 dark:bg-stone-800 rounded-md border border-stone-300 dark:border-stone-700 shadow-[0_30px_80px_rgba(0,0,0,.22)] overflow-hidden">
        <div className="h-[2px] bg-linear-to-r from-zinc-700 dark:from-zinc-500 via-zinc-600 dark:via-zinc-400 to-transparent" />
        <div className="px-5 pt-4.5 pb-[14px] border-b border-stone-300 dark:border-stone-700 flex justify-between items-center">
          <div className="font-cinzel text-xs tracking-widest text-stone-900 dark:text-stone-100">MANAGE THEMES</div>
          <button onClick={onClose} className="bg-transparent border-none text-stone-400 dark:text-stone-500 cursor-pointer text-sm hover:text-stone-900 dark:hover:text-stone-100 transition-colors duration-150">✕</button>
        </div>
        <div className="px-5 py-3.5 max-h-[280px] overflow-y-auto">
          <div className="font-cinzel text-xs tracking-widest text-stone-400 dark:text-stone-500 mb-2">DEFAULT</div>
          {DEFAULT_TAGS.map(t => (
            <div key={t.name} className="flex items-center gap-2.5 mb-2">
              <div className={`size-[14px] rounded-full shrink-0 ${TAG_STYLES[t.color]?.dot ?? FALLBACK_STYLE.dot}`} />
              <span className="font-cinzel text-xs text-stone-400 dark:text-stone-500">{t.name}</span>
            </div>
          ))}
          {custom.length > 0 && (
            <>
              <div className="font-cinzel text-xs tracking-widest text-stone-400 dark:text-stone-500 mt-3 mb-2">CUSTOM</div>
              {custom.map(t => (
                <div key={t.name} className="flex items-center gap-2.5 mb-[9px]">
                  <div className="flex gap-1">
                    {TAG_PALETTE.map(c => (
                      <button
                        key={c}
                        onClick={() => setCustom(p => p.map(x => x.name === t.name ? { ...x, color: c } : x))}
                        className={`size-3 rounded-full cursor-pointer transition-[transform,scale] duration-100 hover:scale-125 ${TAG_STYLES[c]?.dot ?? FALLBACK_STYLE.dot} ${t.color === c ? "ring-1 ring-offset-1 ring-stone-900 dark:ring-stone-100" : ""}`}
                      />
                    ))}
                  </div>
                  <span className="flex-1 font-cinzel text-xs text-stone-600 dark:text-stone-400">{t.name}</span>
                  <button
                    onClick={() => setCustom(p => p.filter(x => x.name !== t.name))}
                    className="bg-transparent border-none text-stone-400 dark:text-stone-500 cursor-pointer text-xs hover:text-zinc-700 dark:hover:text-zinc-500 transition-colors duration-150"
                  >✕</button>
                </div>
              ))}
            </>
          )}
        </div>
        <div className="px-5 py-3 border-t border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900">
          <div className="font-cinzel text-xs tracking-widest text-stone-400 dark:text-stone-500 mb-2">ADD CUSTOM THEME</div>
          <div className="flex gap-1.5 flex-wrap mb-2.5">
            {TAG_PALETTE.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`size-4 rounded-full border-2 cursor-pointer transition-[transform,scale] duration-100 hover:scale-[1.2] ${TAG_STYLES[c]?.dot ?? FALLBACK_STYLE.dot} ${color === c ? "border-mn-ink" : "border-transparent"}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={name}
              onChange={e => { setName(e.target.value); setErr(""); }}
              placeholder="Theme name…"
              onKeyDown={e => e.key === "Enter" && add()}
              className={`flex-1 bg-stone-200 dark:bg-stone-800 border rounded-sm px-2.5 py-1.5 text-sm text-stone-900 dark:text-stone-100 outline-none font-serif focus:border-zinc-700 dark:focus:border-zinc-400 ${err ? "border-zinc-700 dark:border-zinc-500" : "border-stone-300 dark:border-stone-700"}`}
            />
            <button onClick={add} className="px-4 py-1.5 bg-stone-950 dark:bg-stone-100 text-stone-50 dark:text-stone-900 border-none rounded-sm font-cinzel text-xs tracking-wider cursor-pointer">Add</button>
          </div>
          {err && <div className="text-xs text-zinc-700 dark:text-zinc-500 mt-[5px] italic">{err}</div>}
        </div>
        <div className="px-5 py-3 border-t border-stone-300 dark:border-stone-700 flex justify-end gap-2">
          <button onClick={onClose} className="bg-transparent border border-stone-300 dark:border-stone-700 text-stone-400 dark:text-stone-500 px-4 py-1 text-xs font-cinzel cursor-pointer rounded-xs">Cancel</button>
          <button onClick={() => onSave(custom)} className="bg-zinc-800 dark:bg-zinc-600 text-white border-none px-4 py-1 text-xs font-cinzel cursor-pointer rounded-xs transition-colors duration-150">Save</button>
        </div>
      </div>
    </div>
  );
}
