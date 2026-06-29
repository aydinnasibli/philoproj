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
  const [saveStatus, setSaveStatus]       = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const taRef      = useRef<HTMLTextAreaElement>(null);
  const saveTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<Note | null>(null);
  const [, startTransition] = useTransition();

  const doSave = useCallback((n: Note) => {
    startTransition(async () => {
      setSaveStatus("saving");
      try {
        await updateNoteAction(n.id, buildPayload(n));
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus(s => s === "saved" ? "idle" : s), 1800);
      } catch {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus(s => s === "error" ? "idle" : s), 3000);
      }
      pendingRef.current = null;
    });
  }, [startTransition]);

  const set = useCallback((k: keyof Note, v: unknown) => {
    const updated = { ...note, [k]: v, updatedAt: Date.now() };
    onChange(updated);
    pendingRef.current = updated;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => doSave(updated), 600);
  }, [note, onChange, doSave]);

  const handleClose = useCallback(() => {
    if (saveTimer.current) { clearTimeout(saveTimer.current); saveTimer.current = null; }
    if (pendingRef.current) {
      updateNoteAction(pendingRef.current.id, buildPayload(pendingRef.current)).catch(() => {});
      pendingRef.current = null;
    }
    onClose();
  }, [onClose]);

  function toggleTag(tag: string) { const t = note.tags ?? []; set("tags", t.includes(tag) ? t.filter(x => x !== tag) : [...t, tag]); }
  function togglePin() {
    const previous = note;
    const updated = { ...note, pinned: !note.pinned, updatedAt: Date.now() };
    onChange(updated);
    startTransition(async () => {
      try { await updateNoteAction(updated.id, buildPayload(updated)); }
      catch { onChange(previous); setSaveStatus("error"); setTimeout(() => setSaveStatus(s => s === "error" ? "idle" : s), 3000); }
    });
  }
  const addMarginalia = useCallback(() => {
    if (!margNote.trim()) return;
    set("marginalia", [...(note.marginalia ?? []), { id: genId(), text: margNote.trim(), createdAt: Date.now() }]);
    setMargNote("");
  }, [set, note, margNote, setMargNote]);
  function removeMarginalia(id: string) { set("marginalia", (note.marginalia ?? []).filter(m => m.id !== id)); }
  function toggleLink(id: string) { const l = note.links ?? []; set("links", l.includes(id) ? l.filter(x => x !== id) : [...l, id]); }

  useEffect(() => {
    setSaveStatus("idle"); // eslint-disable-line react-hooks/set-state-in-effect -- reset on note switch
    return () => {
      if (saveTimer.current) { clearTimeout(saveTimer.current); saveTimer.current = null; }
      if (pendingRef.current) {
        updateNoteAction(pendingRef.current.id, buildPayload(pendingRef.current)).catch(() => {});
        pendingRef.current = null;
      }
    };
  }, [note.id]);

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
      if (e.key === "Escape") { if (showLinks) { setShowLinks(false); return; } if (focus) { setFocus(false); return; } handleClose(); }
    };
    window.addEventListener("keydown", fn); return () => window.removeEventListener("keydown", fn);
  }, [focus, showLinks, handleClose]);

  const accentS    = tagStyle(note.tags?.[0] ?? "", tags);
  const wordCount  = wc(note.body ?? "");

  if (focus) return (
    <div className="flex-1 flex flex-col bg-stone-50 dark:bg-stone-900 overflow-hidden">
      <div className={`h-[2px] bg-linear-to-r ${accentS.from} to-transparent`} />
      <textarea ref={taRef} value={note.body ?? ""} onChange={e => set("body", e.target.value)} autoFocus placeholder="Write freely…"
        className="flex-1 bg-transparent border-none outline-none resize-none font-serif text-xl leading-[2.1] text-stone-900 dark:text-stone-100 caret-zinc-700 dark:caret-zinc-400 pt-[80px] pb-[60px] px-[min(120px,14%)]" />
      <div className="px-[min(120px,14%)] py-3 flex justify-between items-center border-t border-stone-300 dark:border-stone-700 gap-4">
        <span className="text-sm text-stone-400 dark:text-stone-500 italic">{wordCount} words</span>
        <button onClick={() => setFocus(false)} className="bg-transparent border border-stone-400 dark:border-stone-600 text-stone-400 dark:text-stone-500 px-4 py-1 text-xs font-cinzel cursor-pointer rounded-xs transition-[color,border-color] duration-150 hover:text-stone-900 dark:hover:text-stone-100 hover:border-stone-600 dark:hover:border-stone-400">Exit focus</button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-stone-50 dark:bg-stone-900 overflow-hidden">
      <div className={`h-[2px] shrink-0 bg-linear-to-r ${accentS.from} to-transparent`} />
      <div className="px-7 py-2.5 border-b border-stone-300 dark:border-stone-700 flex items-center gap-2.5 shrink-0 bg-stone-50/95 dark:bg-stone-900/95 backdrop-blur-[6px] flex-wrap">
        <button onClick={handleClose} className="flex items-center gap-1.5 bg-transparent border-none text-stone-400 dark:text-stone-500 cursor-pointer font-cinzel text-xs tracking-wider py-0.5 transition-colors duration-150 shrink-0 hover:text-stone-900 dark:hover:text-stone-100">← Back</button>
        {saveStatus === "saving" && <span className="text-xs text-stone-400 dark:text-stone-500 font-cinzel tracking-wider">saving…</span>}
        {saveStatus === "saved"  && <span className="text-xs text-zinc-600 dark:text-zinc-400 font-cinzel tracking-wider">✓ saved</span>}
        {saveStatus === "error"  && <span className="text-xs text-zinc-700 dark:text-zinc-500 font-cinzel tracking-wider">⚠ save failed</span>}
        <div className="w-px h-4 bg-stone-300 dark:bg-stone-700 shrink-0" />
        {(["write", "read"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`bg-transparent border-none border-b-2 px-2.5 py-0.5 text-xs font-cinzel tracking-wider cursor-pointer transition-[color,background-color,border-color] duration-150 ${
              mode === m ? `text-stone-900 dark:text-stone-100 ${accentS.borderB}` : "text-stone-400 dark:text-stone-500 border-b-transparent"
            }`}
          >{m === "write" ? "Write" : "Preview"}</button>
        ))}
        <div className="flex-1" />
        <div className="flex gap-1 flex-wrap">
          {tags.map(tg => {
            const on = (note.tags ?? []).includes(tg.name);
            const s  = TAG_STYLES[tg.color] ?? FALLBACK_STYLE;
            return (
              <button key={tg.name} onClick={() => toggleTag(tg.name)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-xs font-cinzel border cursor-pointer transition-[color,background-color,border-color] duration-100 ${
                  on ? s.pill : `bg-transparent text-stone-400 dark:text-stone-500 border-stone-300 dark:border-stone-700 ${s.hover}`
                }`}
              >
                <span className={`size-1 rounded-full ${on ? s.dot : "bg-stone-950 dark:bg-stone-100-3"}`} />{tg.name}
              </button>
            );
          })}
        </div>
        <div className="w-px h-4 bg-stone-300 dark:bg-stone-700 shrink-0" />
        <ExportMenu note={note} />
        <button onClick={togglePin}
          className={`border px-2.5 py-0.5 text-xs font-cinzel cursor-pointer rounded-xs transition-[color,background-color,border-color] duration-100 h-6 leading-none ${
            note.pinned
              ? "bg-zinc-200 dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100"
              : "bg-transparent border-stone-300 dark:border-stone-700 text-stone-400 dark:text-stone-500 hover:border-zinc-700 dark:hover:border-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-400"
          }`}
        >{note.pinned ? "⊛ Pinned" : "⊙ Pin"}</button>
        <button onClick={() => setFocus(true)} className="bg-transparent border border-stone-300 dark:border-stone-700 text-stone-400 dark:text-stone-500 px-2.5 py-0.5 text-xs font-cinzel cursor-pointer rounded-xs transition-[color,border-color] duration-100 h-6 leading-none hover:border-zinc-700 dark:hover:border-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-400">Focus</button>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className="max-w-[700px] w-full mx-auto px-4 md:px-10 pt-6 md:pt-12 pb-[60px] flex flex-col flex-1">
            <input value={note.title ?? ""} onChange={e => set("title", e.target.value)} placeholder="Untitled entry…"
              className="bg-transparent border-none outline-none font-cinzel text-2xl font-medium tracking-[0.08em] text-stone-900 dark:text-stone-100 mb-1.5 w-full" />
            <div className="flex items-center gap-3 mb-7 pb-[18px] border-b border-stone-300 dark:border-stone-700 flex-wrap">
              <span className="text-xs text-stone-400 dark:text-stone-500 italic">{timeAgo(note.updatedAt)}</span>
              {wordCount > 0 && <span className="text-xs text-stone-400 dark:text-stone-500 italic">{wordCount} words · {readTime(note.body ?? "")}</span>}
              {(note.tags ?? []).map(tag => (
                <span key={tag} className={`text-xs font-cinzel px-2 py-px rounded-xs border ${tagStyle(tag, tags).pill}`}>{tag}</span>
              ))}
            </div>
            {mode === "write" && (
              <textarea ref={taRef} value={note.body ?? ""} onChange={e => set("body", e.target.value)}
                placeholder={"Write freely…\n\n**bold**  *italic*  > blockquote  [[Note Title]]"}
                className="flex-1 bg-transparent border-none outline-none resize-none font-serif text-lg leading-[1.95] text-stone-900 dark:text-stone-100 caret-zinc-700 dark:caret-zinc-400 min-h-[400px] w-full" />
            )}
            {mode === "read" && (
              <MarkdownView text={note.body ?? ""} notes={allNotes} onLink={id => { onClose(); setTimeout(() => onOpen(id), 50); }} />
            )}
          </div>
        </div>
        {/* Marginalia */}
        <div className={`shrink-0 border-l border-stone-300 dark:border-stone-700 bg-stone-200 dark:bg-stone-800 flex flex-col overflow-hidden transition-[width] duration-200 ease-[cubic-bezier(.23,.8,.32,1)] relative ${margOpen ? "w-[220px]" : "w-8"}`}>
          <button onClick={() => setMargOpen(p => !p)} className="w-8 absolute top-0 bottom-0 bg-transparent border-none cursor-pointer flex items-start justify-center pt-4.5 text-stone-400 dark:text-stone-500 transition-colors duration-100 z-2 hover:text-zinc-700 dark:hover:text-zinc-400">
            <span className="[writing-mode:vertical-rl] rotate-180 font-cinzel text-xs tracking-widest whitespace-nowrap">
              {margOpen ? "▸ NOTES" : "◂ NOTES"}{(note.marginalia ?? []).length > 0 ? ` (${note.marginalia.length})` : ""}
            </span>
          </button>
          {margOpen && (
            <div className="flex flex-col flex-1 overflow-hidden pl-8">
              <div className="px-2.5 pt-4 pb-2.5 border-b border-stone-300 dark:border-stone-700">
                <div className="font-cinzel text-xs tracking-widest text-stone-400 dark:text-stone-500 mb-2.5">MARGINALIA</div>
                <textarea value={margNote} onChange={e => setMargNote(e.target.value)} placeholder="Add an annotation…" rows={3}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-sm px-2 py-1.5 text-base font-serif leading-normal text-stone-900 dark:text-stone-100 outline-none resize-none focus:border-zinc-700 dark:focus:border-zinc-400" />
                <button onClick={addMarginalia} className="mt-1.5 w-full py-1 bg-transparent border border-stone-300 dark:border-stone-700 rounded-xs font-cinzel text-xs text-stone-400 dark:text-stone-500 cursor-pointer transition-[color,border-color] duration-100 hover:border-zinc-700 dark:hover:border-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-400">+ Add</button>
              </div>
              <div className="flex-1 overflow-y-auto p-[10px]">
                {(note.marginalia ?? []).length === 0 && <div className="font-serif text-sm italic text-stone-400 dark:text-stone-500 text-center pt-5">No annotations yet.</div>}
                {(note.marginalia ?? []).map(m => (
                  <div key={m.id} className="mb-2.5 px-2 py-2 bg-stone-50 dark:bg-stone-800 rounded-sm border border-stone-300 dark:border-stone-700">
                    <p className="font-serif text-sm leading-normal text-stone-600 dark:text-stone-400">{m.text}</p>
                    <div className="mt-1 flex justify-between items-center">
                      <span className="text-xs text-stone-400 dark:text-stone-500 italic">{timeAgo(m.createdAt)}</span>
                      <button onClick={() => removeMarginalia(m.id)} className="bg-transparent border-none text-stone-400 dark:text-stone-500 text-xs cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-400 transition-colors duration-150">✕</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-[10px] border-t border-stone-300 dark:border-stone-700 flex flex-col gap-1.5">
                <div className="relative">
                  <button onClick={() => setShowLinks(p => !p)}
                    className={`w-full bg-transparent border px-0 py-1 text-xs font-cinzel cursor-pointer rounded-xs transition-[color,background-color,border-color] duration-100 ${showLinks ? "border-slate-500 dark:border-slate-400 text-slate-500 dark:text-slate-400" : "border-stone-300 dark:border-stone-700 text-stone-400 dark:text-stone-500"}`}
                  >⟜ Links{(note.links ?? []).length > 0 ? ` (${note.links.length})` : ""}</button>
                  {showLinks && (
                    <div className="absolute bottom-[calc(100%+4px)] left-0 right-0 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-sm shadow-[0_8px_24px_rgba(0,0,0,.12)] z-10 overflow-hidden">
                      <div className="px-2 py-1.5 border-b border-stone-300 dark:border-stone-700">
                        <input value={linkSearch} onChange={e => setLinkSearch(e.target.value)} placeholder="Search…" autoFocus
                          className="w-full bg-transparent border-none outline-none text-base text-stone-900 dark:text-stone-100 font-serif" />
                      </div>
                      <div className="max-h-[160px] overflow-y-auto">
                        {linkableNotes.length === 0 && <div className="px-2.5 py-2 text-sm italic text-stone-400 dark:text-stone-500 font-serif">No notes</div>}
                        {linkableNotes.map(ln => {
                          const on = (note.links ?? []).includes(ln.id);
                          return (
                            <button type="button" key={ln.id} onClick={() => toggleLink(ln.id)} aria-pressed={on}
                              className={`w-full text-left border-none px-2.5 py-1.5 cursor-pointer flex items-center gap-1.5 transition-colors duration-100 hover:bg-stone-200 dark:hover:bg-stone-800 ${on ? "bg-zinc-500/12" : "bg-transparent"}`}
                            >
                              <span className={`text-xs ${on ? "text-slate-500 dark:text-slate-400" : "text-stone-400 dark:text-stone-600"}`}>{on ? "●" : "○"}</span>
                              <span className={`font-cinzel text-xs overflow-hidden text-ellipsis whitespace-nowrap ${on ? "text-slate-500 dark:text-slate-400" : "text-stone-600 dark:text-stone-400"}`}>{ln.title || "Untitled"}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                {deleteConfirm ? (
                  <div className="flex gap-1">
                    <button onClick={onDelete} className="flex-1 bg-zinc-800 dark:bg-zinc-700 border-none text-white py-1 text-xs font-cinzel cursor-pointer rounded-xs">Confirm</button>
                    <button onClick={() => setDeleteConfirm(false)} className="flex-1 bg-transparent border border-stone-300 dark:border-stone-700 text-stone-400 dark:text-stone-500 py-1 text-xs font-cinzel cursor-pointer rounded-xs">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteConfirm(true)} className="w-full bg-transparent border border-stone-300 dark:border-stone-700 text-stone-400 dark:text-stone-500 py-1 text-xs font-cinzel cursor-pointer rounded-xs transition-[color,border-color] duration-100 hover:border-zinc-700 dark:hover:border-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-500">Delete</button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
