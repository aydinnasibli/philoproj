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
      className="fixed inset-0 z-[700] bg-[rgba(18,15,10,.55)] backdrop-blur-[6px] flex items-center justify-center p-6"
    >
      <div className="w-full max-w-[440px] bg-(--mn-card) rounded-[4px] border border-(--mn-border) shadow-[0_30px_80px_rgba(0,0,0,.22)] overflow-hidden">
        <div className="h-[2px] bg-linear-to-r from-(--mn-gold) via-(--mn-gold-b) to-transparent" />
        <div className="px-[22px] pt-[18px] pb-[14px] border-b border-(--mn-border) flex justify-between items-center">
          <div className="font-cinzel text-[11px] tracking-[.12em] text-(--mn-ink)">MANAGE THEMES</div>
          <button onClick={onClose} className="bg-transparent border-none text-(--mn-ink-3) cursor-pointer text-[14px] hover:text-(--mn-ink) transition-colors duration-150">✕</button>
        </div>
        <div className="px-[22px] py-[14px] max-h-[280px] overflow-y-auto">
          <div className="font-cinzel text-[8.5px] tracking-[.14em] text-(--mn-ink-3) mb-2">DEFAULT</div>
          {DEFAULT_TAGS.map(t => (
            <div key={t.name} className="flex items-center gap-[10px] mb-2">
              <div className={`size-[14px] rounded-full shrink-0 ${TAG_STYLES[t.color]?.dot ?? FALLBACK_STYLE.dot}`} />
              <span className="font-cinzel text-[10.5px] text-(--mn-ink-3)">{t.name}</span>
            </div>
          ))}
          {custom.length > 0 && (
            <>
              <div className="font-cinzel text-[8.5px] tracking-[.14em] text-(--mn-ink-3) mt-3 mb-2">CUSTOM</div>
              {custom.map(t => (
                <div key={t.name} className="flex items-center gap-[10px] mb-[9px]">
                  <div className="flex gap-1">
                    {TAG_PALETTE.map(c => (
                      <button
                        key={c}
                        onClick={() => setCustom(p => p.map(x => x.name === t.name ? { ...x, color: c } : x))}
                        className={`size-3 rounded-full cursor-pointer transition-transform duration-120 hover:scale-125 ${TAG_STYLES[c]?.dot ?? FALLBACK_STYLE.dot} ${t.color === c ? "ring-1 ring-offset-1 ring-(--mn-ink)" : ""}`}
                      />
                    ))}
                  </div>
                  <span className="flex-1 font-cinzel text-[10.5px] text-(--mn-ink-2)">{t.name}</span>
                  <button
                    onClick={() => setCustom(p => p.filter(x => x.name !== t.name))}
                    className="bg-transparent border-none text-(--mn-ink-3) cursor-pointer text-[11px] hover:text-(--mn-red) transition-colors duration-150"
                  >✕</button>
                </div>
              ))}
            </>
          )}
        </div>
        <div className="px-[22px] py-3 border-t border-(--mn-border) bg-(--mn-surface)">
          <div className="font-cinzel text-[8.5px] tracking-[.14em] text-(--mn-ink-3) mb-2">ADD CUSTOM THEME</div>
          <div className="flex gap-[5px] flex-wrap mb-[10px]">
            {TAG_PALETTE.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`size-4 rounded-full border-2 cursor-pointer transition-transform duration-120 hover:scale-[1.2] ${TAG_STYLES[c]?.dot ?? FALLBACK_STYLE.dot} ${color === c ? "border-(--mn-ink)" : "border-transparent"}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={name}
              onChange={e => { setName(e.target.value); setErr(""); }}
              placeholder="Theme name…"
              onKeyDown={e => e.key === "Enter" && add()}
              className={`flex-1 bg-(--mn-panel) border rounded-[3px] px-[10px] py-[6px] text-[13.5px] text-(--mn-ink) outline-none font-serif focus:border-(--mn-gold) ${err ? "border-(--mn-red)" : "border-(--mn-border)"}`}
            />
            <button onClick={add} className="px-4 py-[6px] bg-(--mn-ink) text-(--mn-surface) border-none rounded-[3px] font-cinzel text-[9.5px] tracking-[.09em] cursor-pointer">Add</button>
          </div>
          {err && <div className="text-[11px] text-(--mn-red) mt-[5px] italic">{err}</div>}
        </div>
        <div className="px-[22px] py-3 border-t border-(--mn-border) flex justify-end gap-2">
          <button onClick={onClose} className="bg-transparent border border-(--mn-border) text-(--mn-ink-3) px-[18px] py-[5px] text-[9.5px] font-cinzel cursor-pointer rounded-[2px]">Cancel</button>
          <button onClick={() => onSave(custom)} className="bg-(--mn-gold) text-white border-none px-[18px] py-[5px] text-[9.5px] font-cinzel cursor-pointer rounded-[2px] hover:bg-(--mn-gold-b) transition-colors duration-150">Save</button>
        </div>
      </div>
    </div>
  );
}
