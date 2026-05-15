"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { SignInButton } from "@clerk/nextjs";
import {
  getNotes as getNotesAction,
  createNote as createNoteAction,
  deleteNote as deleteNoteAction,
  updatePrefs as updatePrefsAction,
} from "@/app/my-notes/actions";
import type { Note, Prefs, Tag } from "./types";
import { DEFAULT_PREFS, getPrompt, wc, allTags, genId, timeAgo } from "./utils";
import { NavRail } from "./NavRail";
import { FilterPanel } from "./FilterPanel";
import { NoteCard } from "./NoteCard";
import { StreamView } from "./StreamView";
import { ConstellationView } from "./ConstellationView";
import { QuickCapture } from "./QuickCapture";
import { TagManagerModal } from "./TagManagerModal";
import { EditorPage } from "./EditorPage";

export default function MyNotesClient({
  isAuthenticated, initialNotes, initialCursor, initialPrefs,
}: {
  isAuthenticated: boolean; initialNotes: Note[]; initialCursor: string | null; initialPrefs: Prefs | null;
}) {
  const [notes, setNotes]           = useState<Note[]>(initialNotes);
  const [prefs, setPrefs]           = useState<Prefs>(initialPrefs ?? DEFAULT_PREFS);
  const [cursor, setCursor]         = useState<string | null>(initialCursor);
  const [loadingMore, setLoadingMore] = useState(false);
  const [editId, setEditId]         = useState<string | null>(null);
  const [view, setView]             = useState("grid");
  const [panelOpen, setPanelOpen]   = useState(false);
  const [search, setSearch]         = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [sort, setSort]             = useState(initialPrefs?.sort ?? "newest");
  const [capturing, setCapturing]   = useState(false);
  const [resurface, setResurface]   = useState<Note | null>(null);
  const [resurfaceMsg, setResurfaceMsg] = useState("");
  const [tagModal, setTagModal]     = useState(false);
  const prompt = useMemo(() => getPrompt(), []);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "n" && !e.metaKey && !e.ctrlKey && !e.altKey && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault(); setCapturing(true);
      }
    };
    window.addEventListener("keydown", fn); return () => window.removeEventListener("keydown", fn);
  }, []);

  const filtered = useMemo(() => {
    let list = notes.filter(n => {
      const q = search.toLowerCase();
      return (!q || (n.title ?? "").toLowerCase().includes(q) || (n.body ?? "").toLowerCase().includes(q))
        && (activeTags.length === 0 || activeTags.every(tag => (n.tags ?? []).includes(tag)));
    });
    if (sort === "oldest") list = [...list].sort((a, b) => a.createdAt - b.createdAt);
    else if (sort === "alpha") list = [...list].sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
    else if (sort === "wc") list = [...list].sort((a, b) => wc(b.body ?? "") - wc(a.body ?? ""));
    else list = [...list].sort((a, b) => b.createdAt - a.createdAt);
    return [...list.filter(n => n.pinned), ...list.filter(n => !n.pinned)];
  }, [notes, search, activeTags, sort]);

  if (!isAuthenticated) return (
    <>
      <div className="flex h-screen overflow-hidden bg-(--mn-bg) items-center justify-center flex-col gap-5 text-center p-10">
        <div className="font-cinzel text-[28px] text-(--mn-border) tracking-[.3em]">✦</div>
        <div className="font-cormorant text-[22px] italic text-(--mn-ink-3) max-w-[360px] leading-[1.7]">Sign in to access your personal manuscript.</div>
        <SignInButton mode="modal">
          <button className="mt-2 bg-(--mn-gold) text-white border-none px-7 py-[10px] text-[10px] font-cinzel tracking-[.14em] cursor-pointer rounded-[3px] hover:bg-(--mn-gold-b) transition-colors duration-150">SIGN IN</button>
        </SignInButton>
      </div>
    </>
  );

  function savePrefs(next: Prefs) { setPrefs(next); startTransition(() => updatePrefsAction(next)); }

  async function handleCreate({ title, body }: { title: string; body: string }) {
    setCapturing(false);
    const tempId = "tmp_" + genId(), now = Date.now();
    const tempNote: Note = { id: tempId, title, body, tags: [], links: [], marginalia: [], pinned: false, createdAt: now, updatedAt: now };
    setNotes(p => [tempNote, ...p]); setEditId(tempId);
    try {
      const saved = await createNoteAction({ title, body });
      setNotes(p => p.map(n => n.id === tempId ? saved : n)); setEditId(saved.id);
    } catch { setNotes(p => p.filter(n => n.id !== tempId)); setEditId(null); }
  }

  function handleChange(updated: Note) { setNotes(p => p.map(n => n.id === updated.id ? updated : n)); }

  async function handleDelete() {
    if (!editId) return;
    const id = editId;
    setNotes(p => p.filter(n => n.id !== id)); setEditId(null);
    if (!id.startsWith("tmp_")) startTransition(() => deleteNoteAction(id));
  }

  function handleSort(s: string) {
    setSort(s);
    savePrefs({ ...prefs, sort: s });
    getNotesAction(undefined, s).then(({ notes: fresh, nextCursor: nc }) => {
      setNotes(fresh);
      setCursor(nc);
    });
  }
  function handleSetFlat(v: boolean) { savePrefs({ ...prefs, flatCards: v }); }
  function handleSaveCustomTags(customTags: Tag[]) { setTagModal(false); savePrefs({ ...prefs, customTags }); }

  async function loadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const { notes: more, nextCursor } = await getNotesAction(cursor, sort);
      setNotes(p => [...p, ...more]);
      setCursor(nextCursor);
    } finally {
      setLoadingMore(false);
    }
  }

  function doResurface() {
    const old = notes.filter(n => Date.now() - n.createdAt > 3 * 86400000 && (n.body ?? "").length > 20);
    if (old.length > 0) { setResurface(old[Math.floor(Math.random() * old.length)]); setResurfaceMsg(""); }
    else { setResurfaceMsg("Write more entries — resurface shows notes older than 3 days."); setTimeout(() => setResurfaceMsg(""), 4000); }
  }

  const editNote = notes.find(n => n.id === editId);
  const tags     = allTags(prefs);

  return (
    <>
      <div className="fixed left-20 right-0 top-0 bottom-0 flex overflow-hidden bg-(--mn-bg) font-serif [-webkit-font-smoothing:antialiased]">
        <div className="flex-1 flex overflow-hidden">
          {editNote && (
            <EditorPage note={editNote} onChange={handleChange} onClose={() => setEditId(null)}
              onDelete={handleDelete} allNotes={notes} onOpen={id => setEditId(id)} prefs={prefs} />
          )}
          <div className={`flex-1 ${editNote ? "hidden" : "flex"} flex-col overflow-hidden min-w-0`}>
            <div className="px-6 py-[11px] border-b border-(--mn-border) flex items-center gap-[14px] shrink-0 bg-[rgba(242,236,224,.92)] backdrop-blur-sm">
              <div className="shrink-0">
                <div className="font-cinzel text-[11px] font-medium tracking-[.09em] text-(--mn-ink)">My Manuscript</div>
                <div className="font-cormorant text-[12.5px] italic font-light text-(--mn-ink-3) mt-px">&ldquo;{prompt}&rdquo;</div>
              </div>
              <div className="ml-auto flex items-center gap-3">
                {view !== "constellation" && (
                  <span className="font-cinzel text-[9px] tracking-[.12em] text-(--mn-ink-3) shrink-0">
                    {filtered.length} {filtered.length === 1 ? "ENTRY" : "ENTRIES"}
                  </span>
                )}
                <div className="relative w-[260px]">
                  <span className="absolute left-[9px] top-1/2 -translate-y-1/2 text-(--mn-ink-3) text-[12px] pointer-events-none">⌕</span>
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
                    className="w-full bg-(--mn-panel) border border-(--mn-border) rounded-[3px] px-[10px] py-[5px] pl-[26px] text-[13.5px] text-(--mn-ink) outline-none font-serif focus:border-(--mn-gold)" />
                  {search && <button onClick={() => setSearch("")} className="absolute right-[7px] top-1/2 -translate-y-1/2 bg-transparent border-none text-(--mn-ink-3) cursor-pointer text-[11px] p-0">✕</button>}
                </div>
              </div>
            </div>
            {resurface && (
              <div className="px-6 py-[10px] border-b border-(--mn-border) bg-(--mn-panel) flex items-center gap-[14px]">
                <span className="text-[13px] text-(--mn-gold) opacity-60">✦</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] font-cinzel tracking-[.15em] text-(--mn-ink-3) mb-0.5">FROM {timeAgo(resurface.createdAt).toUpperCase()}</div>
                  <div className="font-cormorant text-[15px] italic text-(--mn-ink-2) overflow-hidden text-ellipsis whitespace-nowrap">{resurface.title || resurface.body.slice(0, 80)}</div>
                </div>
                <button onClick={() => setEditId(resurface.id)} className="bg-transparent border border-[rgba(184,124,40,.3)] text-(--mn-gold) text-[9.5px] font-cinzel cursor-pointer px-3 py-1 rounded-[2px] whitespace-nowrap hover:bg-(--mn-gold-hi) hover:border-(--mn-gold) transition-all duration-150">Read</button>
                <button onClick={() => setResurface(null)} className="bg-transparent border-none text-(--mn-ink-3) cursor-pointer text-[13px] hover:text-(--mn-ink) transition-colors duration-150">✕</button>
              </div>
            )}
            {view === "constellation" ? (
              <ConstellationView notes={filtered} onOpen={id => setEditId(id)} tags={tags} />
            ) : (
              <div className="flex-1 overflow-y-auto px-6 py-[22px]">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center min-h-[50vh] gap-[14px] text-center">
                    <div className="font-cinzel text-[28px] text-(--mn-border) tracking-[.3em]">✦</div>
                    <div className="font-cormorant text-[20px] italic font-light text-(--mn-ink-3) max-w-[340px] leading-[1.7]">
                      {notes.length === 0 ? "\u201cThe unexamined life is not worth living.\u201d" : "No entries match your search."}
                    </div>
                    {notes.length === 0 && (
                      <button onClick={() => setCapturing(true)} className="mt-2 bg-transparent border border-(--mn-border) text-(--mn-ink-3) px-[22px] py-[7px] text-[10px] font-cinzel tracking-widest cursor-pointer rounded-[2px] hover:border-(--mn-gold) hover:text-(--mn-gold) transition-all duration-150">Begin writing</button>
                    )}
                  </div>
                ) : view === "grid" ? (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4 items-start">
                    {filtered.map(n => <NoteCard key={n.id} note={n} onClick={() => setEditId(n.id)} flat={prefs.flatCards} tags={tags} />)}
                  </div>
                ) : (
                  <StreamView notes={filtered} onOpen={id => setEditId(id)} tags={tags} />
                )}
                {cursor && (
                  <div className="flex justify-center pt-6 pb-10">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="bg-transparent border border-(--mn-border) text-(--mn-ink-3) px-[22px] py-[7px] text-[10px] font-cinzel tracking-widest cursor-pointer rounded-[2px] transition-all duration-150 hover:border-(--mn-gold) hover:text-(--mn-gold) disabled:opacity-40 disabled:cursor-default"
                    >
                      {loadingMore ? "Loading…" : "Load more entries"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {panelOpen && (
          <FilterPanel notes={notes} activeTags={activeTags} setActiveTags={setActiveTags}
            prefs={prefs} onResurface={doResurface} resurfaceMsg={resurfaceMsg}
            sort={sort} setSort={handleSort} onSetFlat={handleSetFlat} onManageTags={() => setTagModal(true)} />
        )}
        <NavRail view={view} setView={setView} panelOpen={panelOpen} setPanelOpen={setPanelOpen} onNew={() => setCapturing(true)} />
        {capturing && <QuickCapture onSave={handleCreate} onClose={() => setCapturing(false)} placeholder={`"${prompt}"`} />}
        {tagModal && <TagManagerModal prefs={prefs} onSave={handleSaveCustomTags} onClose={() => setTagModal(false)} />}
      </div>
    </>
  );
}
