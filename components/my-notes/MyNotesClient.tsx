"use client";

import { useState, useEffect, useMemo, useCallback, useTransition, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
        <div className="font-serif text-xl italic text-stone-400 dark:text-stone-500 max-w-90 leading-relaxed">Sign in to access your personal manuscript.</div>
        <SignInButton mode="modal">
          <button className="mt-2 bg-[#845400] hover:bg-[#C47029] text-[#FCFBF9] border-none px-7 py-2.5 text-xs font-cinzel tracking-widest cursor-pointer rounded-sm transition-colors duration-150">SIGN IN</button>
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
    if (id.startsWith("tmp_")) {
      setNotes(p => p.filter(n => n.id !== id));
      setEditId(null);
      return;
    }
    const removed = notes.find(n => n.id === id);
    setNotes(p => p.filter(n => n.id !== id));
    setEditId(null);
    startTransition(async () => {
      try {
        await deleteNoteAction(id);
      } catch {
        if (removed) setNotes(p => [removed, ...p]);
        setEditId(id);
      }
    });
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

  const editNote   = notes.find(n => n.id === editId);
  const tags       = useMemo(() => allTags(prefs), [prefs]);
  const handleOpen = useCallback((id: string) => setEditId(id), []);

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
                <div className="hidden sm:block font-serif text-xs italic font-light text-stone-400 dark:text-stone-500 mt-px">&ldquo;{prompt}&rdquo;</div>
              </div>
              {createError && <span className="text-xs text-zinc-700 dark:text-zinc-500 font-cinzel tracking-wider">⚠ Failed to save — try again</span>}
              {prefsError && <span className="text-xs text-zinc-700 dark:text-zinc-500 font-cinzel tracking-wider">⚠ Preferences not saved</span>}
              <div className="ml-auto flex items-center gap-3 min-w-0">
                {view !== "constellation" && (
                  <span className="hidden sm:inline font-cinzel text-xs tracking-widest text-stone-400 dark:text-stone-500 shrink-0">
                    {filtered.length} {filtered.length === 1 ? "ENTRY" : "ENTRIES"}
                  </span>
                )}
                <div className="relative w-[120px] sm:w-[200px] md:w-[260px]">
                  <span className="absolute left-[9px] top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 text-xs pointer-events-none">⌕</span>
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" aria-label="Search notes"
                    className={`w-full bg-stone-200 dark:bg-stone-800 border rounded-sm px-2.5 py-1 pl-[26px] text-base text-stone-900 dark:text-stone-100 outline-none font-serif focus:border-[#845400] dark:focus:border-[#C47029] ${searchError ? "border-[#845400] dark:border-[#C47029]/60" : "border-stone-300 dark:border-stone-700"}`} />
                  {search && !searchPending && <button onClick={() => setSearch("")} className="absolute right-[7px] top-1/2 -translate-y-1/2 bg-transparent border-none text-stone-400 dark:text-stone-500 cursor-pointer text-xs p-0">✕</button>}
                  {searchPending && <span className="absolute right-[8px] top-1/2 -translate-y-1/2 pointer-events-none inline-block w-3 h-3 rounded-full border-2 border-stone-300 dark:border-stone-700 border-t-zinc-700 dark:border-t-zinc-400 animate-spin" />}
                  {searchError && !searchPending && <span className="absolute right-[7px] top-1/2 -translate-y-1/2 text-zinc-700 dark:text-zinc-500 text-xs pointer-events-none" title="Search failed">⚠</span>}
                </div>
              </div>
            </div>
            {resurface && (
              <div className="px-6 py-2.5 border-b border-stone-300 dark:border-stone-700 bg-stone-200 dark:bg-stone-800 flex items-center gap-3.5">
                <span className="text-sm text-zinc-600 dark:text-zinc-400 opacity-60">✦</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-cinzel tracking-widest text-stone-400 dark:text-stone-500 mb-0.5">FROM {timeAgo(resurface.createdAt).toUpperCase()}</div>
                  <div className="font-serif text-base italic text-stone-600 dark:text-stone-400 overflow-hidden text-ellipsis whitespace-nowrap">{resurface.title || resurface.body.slice(0, 80)}</div>
                </div>
                <button onClick={() => setEditId(resurface.id)} className="bg-transparent border border-[#845400]/25 text-[#845400] dark:text-[#C47029] text-xs font-cinzel cursor-pointer px-3 py-1 rounded-xs whitespace-nowrap hover:bg-[#F5EEE3] dark:hover:bg-stone-800 hover:border-[#845400]/40 dark:hover:border-[#C47029]/40 transition-[color,background-color,border-color] duration-150">Read</button>
                <button onClick={() => setResurface(null)} className="bg-transparent border-none text-stone-400 dark:text-stone-500 cursor-pointer text-sm hover:text-stone-900 dark:hover:text-stone-100 transition-colors duration-150">✕</button>
              </div>
            )}
            <AnimatePresence mode="wait" initial={false}>
              {view === "constellation" ? (
                <motion.div
                  key="constellation"
                  className="flex-1 flex overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ConstellationView notes={filtered} onOpen={id => setEditId(id)} tags={tags} />
                </motion.div>
              ) : (
                <motion.div
                  key={view}
                  className="flex-1 overflow-y-auto px-6 py-5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                >
                  {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3.5 text-center">
                      <div className="font-cinzel text-3xl text-stone-300 dark:text-stone-700 tracking-[.3em]">✦</div>
                      <div className="font-serif text-xl italic font-light text-stone-400 dark:text-stone-500 max-w-85 leading-relaxed">
                        {notes.length === 0 ? "\u201cThe unexamined life is not worth living.\u201d" : "No entries match your search."}
                      </div>
                      {notes.length === 0 && (
                        <button onClick={() => setCapturing(true)} className="mt-2 bg-transparent border border-stone-300 dark:border-stone-700 text-stone-400 dark:text-stone-500 px-5 py-1.5 text-xs font-cinzel tracking-widest cursor-pointer rounded-xs hover:border-[#845400]/40 hover:text-[#845400] dark:hover:border-[#C47029]/40 dark:hover:text-[#C47029] transition-[color,border-color] duration-150">Begin writing</button>
                      )}
                    </div>
                  ) : view === "grid" ? (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(260px,100%),1fr))] gap-4 items-start">
                      {filtered.map(n => <NoteCard key={n.id} note={n} onOpen={handleOpen} flat={prefs.flatCards} tags={tags} />)}
                    </div>
                  ) : (
                    <StreamView notes={filtered} onOpen={id => setEditId(id)} tags={tags} />
                  )}
                  {cursor && (
                    <div className="flex justify-center pt-6 pb-10">
                      <button
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="bg-transparent border border-stone-300 dark:border-stone-700 text-stone-400 dark:text-stone-500 px-5 py-1.5 text-xs font-cinzel tracking-widest cursor-pointer rounded-xs transition-[color,border-color,opacity] duration-150 hover:border-[#845400]/40 hover:text-[#845400] dark:hover:border-[#C47029]/40 dark:hover:text-[#C47029] disabled:opacity-40 disabled:cursor-default"
                      >
                        {loadingMore ? "Loading\u2026" : "Load more entries"}
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <AnimatePresence>
          {panelOpen && (
            <FilterPanel notes={notes} activeTags={activeTags} setActiveTags={setActiveTags}
              prefs={prefs} onResurface={doResurface} resurfaceMsg={resurfaceMsg}
              sort={sort} setSort={handleSort} onSetFlat={handleSetFlat} onManageTags={() => setTagModal(true)}
              onClose={() => setPanelOpen(false)} />
          )}
        </AnimatePresence>
        <NavRail view={view} setView={setView} panelOpen={panelOpen} setPanelOpen={setPanelOpen} onNew={() => setCapturing(true)} />

        {/* New note button — bottom-right, outside NavRail */}
        <button
          onClick={() => setCapturing(true)}
          title="New note (N)"
          className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-6 right-16 z-30 size-10 rounded bg-[#845400] hover:bg-[#C47029] border-none text-[#FCFBF9] cursor-pointer flex items-center justify-center shadow-md transition-[background-color,box-shadow,transform] duration-200 hover:scale-105 hover:shadow-lg active:scale-95 active:shadow-sm"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </button>

        {capturing && <QuickCapture onSave={handleCreate} onClose={() => { setCapturing(false); setCaptureDraft(null); }} placeholder={`"${prompt}"`} initialTitle={captureDraft?.title} initialBody={captureDraft?.body} />}
        {tagModal && <TagManagerModal prefs={prefs} onSave={handleSaveCustomTags} onClose={() => setTagModal(false)} />}
      </div>
    </>
  );
}
