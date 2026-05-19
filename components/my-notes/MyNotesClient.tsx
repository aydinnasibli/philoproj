"use client";

import { useState, useEffect, useMemo, useTransition, useRef } from "react";
import { SignInButton } from "@clerk/nextjs";
import {
  getNotes as getNotesAction,
  createNote as createNoteAction,
  deleteNote as deleteNoteAction,
  updatePrefs as updatePrefsAction,
  searchNotes,
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
  const [captureDraft, setCaptureDraft] = useState<{ title: string; body: string } | null>(null);
  const [resurface, setResurface]   = useState<Note | null>(null);
  const [resurfaceMsg, setResurfaceMsg] = useState("");
  const [createError, setCreateError] = useState(false);
  const [tagModal, setTagModal]     = useState(false);
  const prompt = useMemo(() => getPrompt(), []);
  const [searchResults, setSearchResults] = useState<Note[] | null>(null);
  const [searchPending, setSearchPending] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [prefsError, setPrefsError] = useState(false);
  const [, startTransition] = useTransition();
  const sortRef = useRef(sort);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "n" && !e.metaKey && !e.ctrlKey && !e.altKey && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault(); setCapturing(true);
      }
    };
    window.addEventListener("keydown", fn); return () => window.removeEventListener("keydown", fn);
  }, []);

  useEffect(() => {
    if (!search.trim()) { setSearchResults(null); setSearchPending(false); setSearchError(false); return; }
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    setSearchPending(true);
    setSearchError(false);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const results = await searchNotes(search);
        setSearchResults(results);
      } catch { setSearchResults(null); setSearchError(true); }
      finally { setSearchPending(false); }
    }, 400);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [search]);

  const filtered = useMemo(() => {
    const base = searchResults ?? notes;
    const isFiltered = search !== "" || activeTags.length > 0;
    let list = activeTags.length > 0
      ? base.filter(n => activeTags.every(tag => (n.tags ?? []).includes(tag)))
      : base;
    if (isFiltered && !searchResults) {
      const q = search.toLowerCase();
      list = list.filter(n => !q || (n.title ?? "").toLowerCase().includes(q) || (n.body ?? "").toLowerCase().includes(q));
    }
    if (sort === "oldest") list = [...list].sort((a, b) => a.createdAt - b.createdAt);
    else if (sort === "alpha") list = [...list].sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
    else if (sort === "wc") list = [...list].sort((a, b) => (b.wordCount ?? 0) - (a.wordCount ?? 0));
    else if (searchResults) list = [...list]; // preserve MongoDB text score order
    else list = [...list].sort((a, b) => b.createdAt - a.createdAt);
    return [...list.filter(n => n.pinned), ...list.filter(n => !n.pinned)];
  }, [notes, searchResults, search, activeTags, sort]);

  if (!isAuthenticated) return (
    <>
      <div className="flex h-screen overflow-hidden bg-stone-100 dark:bg-stone-900 items-center justify-center flex-col gap-5 text-center p-10">
        <div className="font-cinzel text-3xl text-stone-300 dark:text-stone-700 tracking-[.3em]">✦</div>
        <div className="font-cormorant text-xl italic text-stone-400 dark:text-stone-500 max-w-[360px] leading-relaxed">Sign in to access your personal manuscript.</div>
        <SignInButton mode="modal">
          <button className="mt-2 bg-amber-700 dark:bg-amber-600 text-white border-none px-7 py-2.5 text-xs font-cinzel tracking-widest cursor-pointer rounded-sm hover:bg-amber-700 dark:bg-amber-600-b transition-colors duration-150">SIGN IN</button>
        </SignInButton>
      </div>
    </>
  );

  function savePrefs(next: Prefs) {
    setPrefs(next);
    startTransition(async () => {
      try { await updatePrefsAction(next); }
      catch { setPrefsError(true); setTimeout(() => setPrefsError(false), 4000); }
    });
  }

  async function handleCreate({ title, body }: { title: string; body: string }) {
    setCapturing(false);
    const tempId = "tmp_" + genId(), now = Date.now();
    const tempNote: Note = { id: tempId, title, body, tags: [], links: [], marginalia: [], pinned: false, wordCount: wc(body), createdAt: now, updatedAt: now };
    setNotes(p => [tempNote, ...p]); setEditId(tempId);
    try {
      const saved = await createNoteAction({ title, body });
      setNotes(p => p.map(n => n.id === tempId ? saved : n)); setEditId(saved.id);
    } catch {
      setNotes(p => p.filter(n => n.id !== tempId)); setEditId(null);
      setCaptureDraft({ title, body }); setCapturing(true);
      setCreateError(true); setTimeout(() => setCreateError(false), 4000);
    }
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
    sortRef.current = s;
    savePrefs({ ...prefs, sort: s });
    getNotesAction(undefined, s).then(({ notes: fresh, nextCursor: nc }) => {
      if (sortRef.current === s) {
        setNotes(fresh);
        setCursor(nc);
      }
    }).catch(() => {});
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
      <div className="fixed left-0 md:left-20 right-0 top-[max(52px,calc(52px+env(safe-area-inset-top)))] md:top-0 bottom-[calc(64px+env(safe-area-inset-bottom))] md:bottom-0 flex overflow-hidden bg-stone-100 dark:bg-stone-900 font-serif [-webkit-font-smoothing:antialiased]">
        <div className="flex-1 flex overflow-hidden">
          {editNote && (
            <EditorPage note={editNote} onChange={handleChange} onClose={() => setEditId(null)}
              onDelete={handleDelete} allNotes={notes} onOpen={id => setEditId(id)} prefs={prefs} />
          )}
          <div className={`flex-1 ${editNote ? "hidden" : "flex"} flex-col overflow-hidden min-w-0`}>
            <div className="px-6 py-3 border-b border-stone-300 dark:border-stone-700 flex items-center gap-3.5 shrink-0 bg-stone-100/90 dark:bg-stone-900/90 backdrop-blur-sm">
              <div className="shrink-0">
                <div className="font-cinzel text-xs font-medium tracking-wider text-stone-900 dark:text-stone-100">My Manuscript</div>
                <div className="font-cormorant text-xs italic font-light text-stone-400 dark:text-stone-500 mt-px">&ldquo;{prompt}&rdquo;</div>
              </div>
              {createError && <span className="text-xs text-red-800 dark:text-red-400 font-cinzel tracking-wider">⚠ Failed to save — try again</span>}
              {prefsError && <span className="text-xs text-red-800 dark:text-red-400 font-cinzel tracking-wider">⚠ Preferences not saved</span>}
              <div className="ml-auto flex items-center gap-3">
                {view !== "constellation" && (
                  <span className="font-cinzel text-xs tracking-widest text-stone-400 dark:text-stone-500 shrink-0">
                    {filtered.length} {filtered.length === 1 ? "ENTRY" : "ENTRIES"}
                  </span>
                )}
                <div className="relative w-[140px] sm:w-[200px] md:w-[260px]">
                  <span className="absolute left-[9px] top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 text-xs pointer-events-none">⌕</span>
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" aria-label="Search notes"
                    className={`w-full bg-stone-200 dark:bg-stone-800 border rounded-sm px-2.5 py-1 pl-[26px] text-base text-stone-900 dark:text-stone-100 outline-none font-serif focus:border-amber-700 dark:border-amber-500 ${searchError ? "border-red-800 dark:border-red-400" : "border-stone-300 dark:border-stone-700"}`} />
                  {search && !searchPending && <button onClick={() => setSearch("")} className="absolute right-[7px] top-1/2 -translate-y-1/2 bg-transparent border-none text-stone-400 dark:text-stone-500 cursor-pointer text-xs p-0">✕</button>}
                  {searchPending && <span className="absolute right-[8px] top-1/2 -translate-y-1/2 pointer-events-none inline-block w-3 h-3 rounded-full border-2 border-stone-300 dark:border-stone-700 border-t-amber-700 dark:border-t-amber-500 animate-spin" />}
                  {searchError && !searchPending && <span className="absolute right-[7px] top-1/2 -translate-y-1/2 text-red-800 dark:text-red-400 text-xs pointer-events-none" title="Search failed">⚠</span>}
                </div>
              </div>
            </div>
            {resurface && (
              <div className="px-6 py-2.5 border-b border-stone-300 dark:border-stone-700 bg-stone-200 dark:bg-stone-800 flex items-center gap-3.5">
                <span className="text-sm text-amber-700 dark:text-amber-500 opacity-60">✦</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-cinzel tracking-widest text-stone-400 dark:text-stone-500 mb-0.5">FROM {timeAgo(resurface.createdAt).toUpperCase()}</div>
                  <div className="font-cormorant text-base italic text-stone-600 dark:text-stone-400 overflow-hidden text-ellipsis whitespace-nowrap">{resurface.title || resurface.body.slice(0, 80)}</div>
                </div>
                <button onClick={() => setEditId(resurface.id)} className="bg-transparent border border-amber-700/30 text-amber-700 dark:text-amber-500 text-xs font-cinzel cursor-pointer px-3 py-1 rounded-xs whitespace-nowrap hover:bg-amber-700 dark:bg-amber-600-hi hover:border-amber-700 dark:border-amber-500 transition-[color,background-color,border-color] duration-150">Read</button>
                <button onClick={() => setResurface(null)} className="bg-transparent border-none text-stone-400 dark:text-stone-500 cursor-pointer text-sm hover:text-stone-900 dark:hover:text-stone-100 transition-colors duration-150">✕</button>
              </div>
            )}
            {view === "constellation" ? (
              <ConstellationView notes={filtered} onOpen={id => setEditId(id)} tags={tags} />
            ) : (
              <div className="flex-1 overflow-y-auto px-6 py-5">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3.5 text-center">
                    <div className="font-cinzel text-3xl text-stone-300 dark:text-stone-700 tracking-[.3em]">✦</div>
                    <div className="font-cormorant text-xl italic font-light text-stone-400 dark:text-stone-500 max-w-[340px] leading-relaxed">
                      {notes.length === 0 ? "\u201cThe unexamined life is not worth living.\u201d" : "No entries match your search."}
                    </div>
                    {notes.length === 0 && (
                      <button onClick={() => setCapturing(true)} className="mt-2 bg-transparent border border-stone-300 dark:border-stone-700 text-stone-400 dark:text-stone-500 px-5 py-1.5 text-xs font-cinzel tracking-widest cursor-pointer rounded-xs hover:border-amber-700 dark:border-amber-500 hover:text-amber-700 dark:text-amber-500 transition-[color,border-color] duration-150">Begin writing</button>
                    )}
                  </div>
                ) : view === "grid" ? (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(min(260px,100%),1fr))] gap-4 items-start">
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
                      className="bg-transparent border border-stone-300 dark:border-stone-700 text-stone-400 dark:text-stone-500 px-5 py-1.5 text-xs font-cinzel tracking-widest cursor-pointer rounded-xs transition-[color,border-color,opacity] duration-150 hover:border-amber-700 dark:border-amber-500 hover:text-amber-700 dark:text-amber-500 disabled:opacity-40 disabled:cursor-default"
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
            sort={sort} setSort={handleSort} onSetFlat={handleSetFlat} onManageTags={() => setTagModal(true)}
            onClose={() => setPanelOpen(false)} />
        )}
        <NavRail view={view} setView={setView} panelOpen={panelOpen} setPanelOpen={setPanelOpen} onNew={() => setCapturing(true)} />
        {capturing && <QuickCapture onSave={handleCreate} onClose={() => { setCapturing(false); setCaptureDraft(null); }} placeholder={`"${prompt}"`} initialTitle={captureDraft?.title} initialBody={captureDraft?.body} />}
        {tagModal && <TagManagerModal prefs={prefs} onSave={handleSaveCustomTags} onClose={() => setTagModal(false)} />}
      </div>
    </>
  );
}
