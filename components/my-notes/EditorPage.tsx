"use client";

import { useState, useEffect, useRef, useMemo, useTransition, useCallback } from "react";
import { updateNote as updateNoteAction } from "@/app/my-notes/actions";
import type { Note, Prefs } from "./types";
import { TAG_STYLES, FALLBACK_STYLE } from "./tag-styles";
import { allTags, tagStyle, timeAgo, wc, readTime, genId } from "./utils";
import { MarkdownView } from "./MarkdownView";
import { ExportMenu } from "./ExportMenu";

function buildPayload(n: Note) {
  return { title: n.title, body: n.body, tags: n.tags, links: n.links, marginalia: n.marginalia, pinned: n.pinned ?? false, wordCount: wc(n.body ?? "") };
}

export function EditorPage({ note, onChange, onClose, onDelete, allNotes, onOpen, prefs }: {
  note: Note; onChange: (n: Note) => void; onClose: () => void; onDelete: () => void;
  allNotes: Note[]; onOpen: (id: string) => void; prefs: Prefs;
}) {
  const tags = allTags(prefs);
  const [mode, setMode]             = useState<"write" | "read">("write");
  const [focus, setFocus]           = useState(false);
  const [margOpen, setMargOpen]     = useState(false);
  const [margNote, setMargNote]     = useState("");
  const [linkSearch, setLinkSearch] = useState("");
  const [showLinks, setShowLinks]   = useState(false);
  const [savedFlash, setSavedFlash]       = useState(false);
  const [saveError, setSaveError]         = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const taRef      = useRef<HTMLTextAreaElement>(null);
  const saveTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [, startTransition] = useTransition();

  const set = useCallback((k: keyof Note, v: unknown) => {
    const updated = { ...note, [k]: v, updatedAt: Date.now() };
    onChange(updated);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      startTransition(async () => {
        try {
          await updateNoteAction(updated.id, buildPayload(updated));
          setSavedFlash(true);
          setTimeout(() => setSavedFlash(false), 1800);
        } catch {
          setSaveError(true);
          setTimeout(() => setSaveError(false), 3000);
        }
      });
    }, 1500);
  }, [note, onChange, startTransition]);

  function toggleTag(tag: string) { const t = note.tags ?? []; set("tags", t.includes(tag) ? t.filter(x => x !== tag) : [...t, tag]); }
  function togglePin() {
    const updated = { ...note, pinned: !note.pinned, updatedAt: Date.now() };
    onChange(updated);
    startTransition(async () => {
      try { await updateNoteAction(updated.id, buildPayload(updated)); }
      catch { setSaveError(true); setTimeout(() => setSaveError(false), 3000); }
    });
  }
  const addMarginalia = useCallback(() => {
    if (!margNote.trim()) return;
    set("marginalia", [...(note.marginalia ?? []), { id: genId(), text: margNote.trim(), createdAt: Date.now() }]);
    setMargNote("");
  }, [set, note, margNote]);
  function removeMarginalia(id: string) { set("marginalia", (note.marginalia ?? []).filter(m => m.id !== id)); }
  function toggleLink(id: string) { const l = note.links ?? []; set("links", l.includes(id) ? l.filter(x => x !== id) : [...l, id]); }

  const linkableNotes = useMemo(() => allNotes.filter(n => n.id !== note.id && (n.title ?? "").toLowerCase().includes(linkSearch.toLowerCase())), [allNotes, linkSearch, note.id]);

  useEffect(() => {
    if (mode === "write" && !focus) {
      const ta = taRef.current; if (!ta) return;
      ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length);
    }
  }, [note.id, mode, focus]);

  useEffect(() => {
    if (!focus) return;
    const ta = taRef.current; if (!ta) return;
    ta.setSelectionRange(ta.value.length, ta.value.length);
  }, [focus]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") { if (showLinks) { setShowLinks(false); return; } if (focus) { setFocus(false); return; } onClose(); }
    };
    window.addEventListener("keydown", fn); return () => window.removeEventListener("keydown", fn);
  }, [focus, showLinks, onClose]);

  const accentS    = tagStyle(note.tags?.[0] ?? "", tags);
  const wordCount  = wc(note.body ?? "");

  if (focus) return (
    <div className="flex-1 flex flex-col bg-[#fdfaf4] overflow-hidden">
      <div className={`h-[2px] bg-linear-to-r ${accentS.from} to-transparent`} />
      <textarea ref={taRef} value={note.body ?? ""} onChange={e => set("body", e.target.value)} autoFocus placeholder="Write freely…"
        className="flex-1 bg-transparent border-none outline-none resize-none font-serif text-[22px] leading-[2.1] text-(--mn-ink) caret-(--mn-gold) pt-[80px] pb-[60px] px-[min(120px,14%)]" />
      <div className="px-[min(120px,14%)] py-3 flex justify-between items-center border-t border-(--mn-border) gap-4">
        <span className="text-[13px] text-(--mn-ink-3) italic">{wordCount} words</span>
        <button onClick={() => setFocus(false)} className="bg-transparent border border-(--mn-border2) text-(--mn-ink-3) px-[18px] py-[5px] text-[9.5px] font-cinzel cursor-pointer rounded-[2px] transition-all duration-150 hover:text-(--mn-ink) hover:border-(--mn-ink-2)">Exit focus</button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-(--mn-surface) overflow-hidden">
      <div className={`h-[2px] shrink-0 bg-linear-to-r ${accentS.from} to-transparent`} />
      <div className="px-7 py-[10px] border-b border-(--mn-border) flex items-center gap-[10px] shrink-0 bg-[rgba(249,245,238,.96)] backdrop-blur-[6px] flex-wrap">
        <button onClick={onClose} className="flex items-center gap-[5px] bg-transparent border-none text-(--mn-ink-3) cursor-pointer font-cinzel text-[9.5px] tracking-[.08em] py-[3px] transition-colors duration-130 shrink-0 hover:text-(--mn-ink)">← Back</button>
        {savedFlash && <span className="text-[10px] text-(--mn-green) font-cinzel tracking-[.07em]">✓ saved</span>}
        {saveError  && <span className="text-[10px] text-(--mn-red) font-cinzel tracking-[.07em]">⚠ save failed</span>}
        <div className="w-px h-4 bg-(--mn-border) shrink-0" />
        {(["write", "read"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`bg-transparent border-none border-b-2 px-[10px] py-[3px] text-[9.5px] font-cinzel tracking-[.08em] cursor-pointer transition-all duration-140 ${
              mode === m ? `text-(--mn-ink) ${accentS.borderB}` : "text-(--mn-ink-3) border-b-transparent"
            }`}
          >{m === "write" ? "Write" : "Preview"}</button>
        ))}
        <div className="flex-1" />
        <div className="flex gap-[3px] flex-wrap">
          {tags.map(tg => {
            const on = (note.tags ?? []).includes(tg.name);
            const s  = TAG_STYLES[tg.color] ?? FALLBACK_STYLE;
            return (
              <button key={tg.name} onClick={() => toggleTag(tg.name)}
                className={`inline-flex items-center gap-[3px] px-[7px] py-[2px] rounded-[2px] text-[8.5px] font-cinzel border cursor-pointer transition-all duration-120 ${
                  on ? s.pill : `bg-transparent text-(--mn-ink-3) border-(--mn-border) ${s.hover}`
                }`}
              >
                <span className={`size-1 rounded-full ${on ? s.dot : "bg-(--mn-ink-3)"}`} />{tg.name}
              </button>
            );
          })}
        </div>
        <div className="w-px h-4 bg-(--mn-border) shrink-0" />
        <ExportMenu note={note} />
        <button onClick={togglePin}
          className={`border px-[10px] py-[3px] text-[9px] font-cinzel cursor-pointer rounded-[2px] transition-all duration-120 h-6 leading-none ${
            note.pinned
              ? "bg-(--mn-gold-hi) border-(--mn-gold) text-(--mn-gold)"
              : "bg-transparent border-(--mn-border) text-(--mn-ink-3) hover:border-(--mn-gold) hover:text-(--mn-gold)"
          }`}
        >{note.pinned ? "⊛ Pinned" : "⊙ Pin"}</button>
        <button onClick={() => setFocus(true)} className="bg-transparent border border-(--mn-border) text-(--mn-ink-3) px-[10px] py-[3px] text-[9px] font-cinzel cursor-pointer rounded-[2px] transition-all duration-120 h-6 leading-none hover:border-(--mn-gold) hover:text-(--mn-gold)">Focus</button>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className="max-w-[700px] w-full mx-auto px-10 pt-12 pb-[60px] flex flex-col flex-1">
            <input value={note.title ?? ""} onChange={e => set("title", e.target.value)} placeholder="Untitled entry…"
              className="bg-transparent border-none outline-none font-cinzel text-[26px] font-medium tracking-[.04em] text-(--mn-ink) mb-[6px] w-full" />
            <div className="flex items-center gap-3 mb-7 pb-[18px] border-b border-(--mn-border) flex-wrap">
              <span className="text-[11.5px] text-(--mn-ink-3) italic">{timeAgo(note.updatedAt)}</span>
              {wordCount > 0 && <span className="text-[11.5px] text-(--mn-ink-3) italic">{wordCount} words · {readTime(note.body ?? "")}</span>}
              {(note.tags ?? []).map(tag => (
                <span key={tag} className={`text-[8.5px] font-cinzel px-[7px] py-px rounded-[2px] border ${tagStyle(tag, tags).pill}`}>{tag}</span>
              ))}
            </div>
            {mode === "write" && (
              <textarea ref={taRef} value={note.body ?? ""} onChange={e => set("body", e.target.value)}
                placeholder={"Write freely…\n\n**bold**  *italic*  > blockquote  [[Note Title]]"}
                className="flex-1 bg-transparent border-none outline-none resize-none font-serif text-[19px] leading-[1.95] text-(--mn-ink) caret-(--mn-gold) min-h-[400px] w-full" />
            )}
            {mode === "read" && (
              <MarkdownView text={note.body ?? ""} notes={allNotes} onLink={id => { onClose(); setTimeout(() => onOpen(id), 50); }} />
            )}
          </div>
        </div>
        {/* Marginalia */}
        <div className={`shrink-0 border-l border-(--mn-border) bg-(--mn-panel) flex flex-col overflow-hidden transition-[width] duration-220 ease-[cubic-bezier(.23,.8,.32,1)] relative ${margOpen ? "w-[220px]" : "w-8"}`}>
          <button onClick={() => setMargOpen(p => !p)} className="w-8 absolute top-0 bottom-0 bg-transparent border-none cursor-pointer flex items-start justify-center pt-[18px] text-(--mn-ink-3) transition-colors duration-120 z-2 hover:text-(--mn-gold)">
            <span className="[writing-mode:vertical-rl] rotate-180 font-cinzel text-[7.5px] tracking-[.18em] whitespace-nowrap">
              {margOpen ? "▸ NOTES" : "◂ NOTES"}{(note.marginalia ?? []).length > 0 ? ` (${note.marginalia.length})` : ""}
            </span>
          </button>
          {margOpen && (
            <div className="flex flex-col flex-1 overflow-hidden pl-8">
              <div className="px-[10px] pt-4 pb-[10px] border-b border-(--mn-border)">
                <div className="font-cinzel text-[8px] tracking-[.18em] text-(--mn-ink-3) mb-[10px]">MARGINALIA</div>
                <textarea value={margNote} onChange={e => setMargNote(e.target.value)} placeholder="Add an annotation…" rows={3}
                  className="w-full bg-(--mn-card) border border-(--mn-border) rounded-[3px] px-[9px] py-[7px] text-[13.5px] font-serif leading-[1.6] text-(--mn-ink) outline-none resize-none focus:border-(--mn-gold)" />
                <button onClick={addMarginalia} className="mt-[6px] w-full py-[5px] bg-transparent border border-(--mn-border) rounded-[2px] font-cinzel text-[9px] text-(--mn-ink-3) cursor-pointer transition-all duration-120 hover:border-(--mn-gold) hover:text-(--mn-gold)">+ Add</button>
              </div>
              <div className="flex-1 overflow-y-auto p-[10px]">
                {(note.marginalia ?? []).length === 0 && <div className="font-cormorant text-[13.5px] italic text-(--mn-ink-3) text-center pt-5">No annotations yet.</div>}
                {(note.marginalia ?? []).map(m => (
                  <div key={m.id} className="mb-[10px] px-[9px] py-2 bg-(--mn-card) rounded-[3px] border border-(--mn-border)">
                    <p className="font-serif text-[13px] leading-[1.6] text-(--mn-ink-2)">{m.text}</p>
                    <div className="mt-1 flex justify-between items-center">
                      <span className="text-[9px] text-(--mn-ink-3) italic">{timeAgo(m.createdAt)}</span>
                      <button onClick={() => removeMarginalia(m.id)} className="bg-transparent border-none text-(--mn-ink-3) text-[10px] cursor-pointer hover:text-(--mn-red) transition-colors duration-150">✕</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-[10px] border-t border-(--mn-border) flex flex-col gap-[6px]">
                <div className="relative">
                  <button onClick={() => setShowLinks(p => !p)}
                    className={`w-full bg-transparent border px-0 py-1 text-[9px] font-cinzel cursor-pointer rounded-[2px] transition-all duration-120 ${showLinks ? "border-(--mn-link) text-(--mn-link)" : "border-(--mn-border) text-(--mn-ink-3)"}`}
                  >⟜ Links{(note.links ?? []).length > 0 ? ` (${note.links.length})` : ""}</button>
                  {showLinks && (
                    <div className="absolute bottom-[calc(100%+4px)] left-0 right-0 bg-(--mn-card) border border-(--mn-border) rounded-[3px] shadow-[0_8px_24px_rgba(0,0,0,.12)] z-10 overflow-hidden">
                      <div className="px-[9px] py-[6px] border-b border-(--mn-border)">
                        <input value={linkSearch} onChange={e => setLinkSearch(e.target.value)} placeholder="Search…" autoFocus
                          className="w-full bg-transparent border-none outline-none text-[13px] text-(--mn-ink) font-serif" />
                      </div>
                      <div className="max-h-[160px] overflow-y-auto">
                        {linkableNotes.length === 0 && <div className="px-[10px] py-2 text-[13px] italic text-(--mn-ink-3) font-cormorant">No notes</div>}
                        {linkableNotes.map(ln => {
                          const on = (note.links ?? []).includes(ln.id);
                          return (
                            <div key={ln.id} onClick={() => toggleLink(ln.id)}
                              className={`px-[10px] py-[6px] cursor-pointer flex items-center gap-[6px] transition-colors duration-120 hover:bg-(--mn-panel) ${on ? "bg-(--mn-link-hi)" : "bg-transparent"}`}
                            >
                              <span className={`text-[9px] ${on ? "text-(--mn-link)" : "text-(--mn-border2)"}`}>{on ? "●" : "○"}</span>
                              <span className={`font-cinzel text-[9.5px] overflow-hidden text-ellipsis whitespace-nowrap ${on ? "text-(--mn-link)" : "text-(--mn-ink-2)"}`}>{ln.title || "Untitled"}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                {deleteConfirm ? (
                  <div className="flex gap-1">
                    <button onClick={onDelete} className="flex-1 bg-(--mn-red) border-none text-white py-1 text-[9px] font-cinzel cursor-pointer rounded-[2px]">Confirm</button>
                    <button onClick={() => setDeleteConfirm(false)} className="flex-1 bg-transparent border border-(--mn-border) text-(--mn-ink-3) py-1 text-[9px] font-cinzel cursor-pointer rounded-[2px]">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteConfirm(true)} className="w-full bg-transparent border border-(--mn-border) text-(--mn-ink-3) py-1 text-[9px] font-cinzel cursor-pointer rounded-[2px] transition-all duration-120 hover:border-(--mn-red) hover:text-(--mn-red)">Delete</button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
