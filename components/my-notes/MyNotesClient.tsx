"use client";

import { useState, useEffect, useRef, useMemo, useTransition, useCallback } from "react";
import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";
import {
  createNote as createNoteAction,
  updateNote as updateNoteAction,
  deleteNote as deleteNoteAction,
  updatePrefs as updatePrefsAction,
} from "@/app/my-notes/actions";
import type { NoteData, PrefsData, TagData } from "@/app/my-notes/actions";

/* ─── LOCAL TYPES ─── */
type Note     = NoteData;
type Tag      = TagData;
type Prefs    = PrefsData;
type Position = { x: number; y: number };
type Edge     = { from: string; to: string };

/* ─── TAG COLOR SYSTEM ─────────────────────────────────────────────────────
   Tag.color stores a Tailwind color token (e.g. "green-700").
   TAG_STYLES maps that token to every class string we need.
   Complete strings here — Tailwind's scanner picks them all up at build time.
──────────────────────────────────────────────────────────────────────────── */
const TAG_STYLES: Record<string, {
  pill:    string;   // bg/text/border for pills and active buttons
  bar:     string;   // solid bg for the card left accent bar
  dot:     string;   // solid bg for small dot indicators
  fill:    string;   // CSS fill for SVG constellation nodes
  from:    string;   // gradient from-* for the editor top bar
  borderB: string;   // border-bottom for the editor tab underline
  hover:   string;   // hover classes for inactive filter/editor buttons
}> = {
  "green-700":   { pill: "bg-green-700/10 text-green-700 border-green-700/30",    bar: "bg-green-700",   dot: "bg-green-700",   fill: "fill-green-700",   from: "from-green-700",   borderB: "border-b-green-700",   hover: "hover:text-green-700 hover:border-green-700/30"   },
  "blue-600":    { pill: "bg-blue-600/10 text-blue-600 border-blue-600/30",        bar: "bg-blue-600",    dot: "bg-blue-600",    fill: "fill-blue-600",    from: "from-blue-600",    borderB: "border-b-blue-600",    hover: "hover:text-blue-600 hover:border-blue-600/30"    },
  "amber-600":   { pill: "bg-amber-600/10 text-amber-600 border-amber-600/30",     bar: "bg-amber-600",   dot: "bg-amber-600",   fill: "fill-amber-600",   from: "from-amber-600",   borderB: "border-b-amber-600",   hover: "hover:text-amber-600 hover:border-amber-600/30"  },
  "purple-600":  { pill: "bg-purple-600/10 text-purple-600 border-purple-600/30",  bar: "bg-purple-600",  dot: "bg-purple-600",  fill: "fill-purple-600",  from: "from-purple-600",  borderB: "border-b-purple-600",  hover: "hover:text-purple-600 hover:border-purple-600/30"},
  "teal-600":    { pill: "bg-teal-600/10 text-teal-600 border-teal-600/30",        bar: "bg-teal-600",    dot: "bg-teal-600",    fill: "fill-teal-600",    from: "from-teal-600",    borderB: "border-b-teal-600",    hover: "hover:text-teal-600 hover:border-teal-600/30"    },
  "rose-600":    { pill: "bg-rose-600/10 text-rose-600 border-rose-600/30",        bar: "bg-rose-600",    dot: "bg-rose-600",    fill: "fill-rose-600",    from: "from-rose-600",    borderB: "border-b-rose-600",    hover: "hover:text-rose-600 hover:border-rose-600/30"    },
  "yellow-800":  { pill: "bg-yellow-800/10 text-yellow-800 border-yellow-800/30",  bar: "bg-yellow-800",  dot: "bg-yellow-800",  fill: "fill-yellow-800",  from: "from-yellow-800",  borderB: "border-b-yellow-800",  hover: "hover:text-yellow-800 hover:border-yellow-800/30"},
  "cyan-700":    { pill: "bg-cyan-700/10 text-cyan-700 border-cyan-700/30",        bar: "bg-cyan-700",    dot: "bg-cyan-700",    fill: "fill-cyan-700",    from: "from-cyan-700",    borderB: "border-b-cyan-700",    hover: "hover:text-cyan-700 hover:border-cyan-700/30"    },
  "orange-700":  { pill: "bg-orange-700/10 text-orange-700 border-orange-700/30",  bar: "bg-orange-700",  dot: "bg-orange-700",  fill: "fill-orange-700",  from: "from-orange-700",  borderB: "border-b-orange-700",  hover: "hover:text-orange-700 hover:border-orange-700/30"},
  "emerald-700": { pill: "bg-emerald-700/10 text-emerald-700 border-emerald-700/30", bar: "bg-emerald-700", dot: "bg-emerald-700", fill: "fill-emerald-700", from: "from-emerald-700", borderB: "border-b-emerald-700", hover: "hover:text-emerald-700 hover:border-emerald-700/30"},
  "indigo-600":  { pill: "bg-indigo-600/10 text-indigo-600 border-indigo-600/30",  bar: "bg-indigo-600",  dot: "bg-indigo-600",  fill: "fill-indigo-600",  from: "from-indigo-600",  borderB: "border-b-indigo-600",  hover: "hover:text-indigo-600 hover:border-indigo-600/30"},
  "stone-500":   { pill: "bg-stone-500/10 text-stone-500 border-stone-500/30",     bar: "bg-stone-500",   dot: "bg-stone-500",   fill: "fill-stone-500",   from: "from-stone-500",   borderB: "border-b-stone-500",   hover: "hover:text-stone-500 hover:border-stone-500/30"  },
};

const FALLBACK_STYLE = TAG_STYLES["amber-600"];

/* ─── CARD ROTATION — precomputed so Tailwind finds every class ─── */
const CARD_ROTATIONS = [
  "-rotate-[1.1deg]", "-rotate-[0.9deg]", "-rotate-[0.7deg]", "-rotate-[0.5deg]",
  "-rotate-[0.3deg]", "-rotate-[0.1deg]",  "rotate-[0.1deg]",  "rotate-[0.3deg]",
   "rotate-[0.5deg]",  "rotate-[0.7deg]",  "rotate-[0.9deg]",  "rotate-[1.1deg]",
] as const;

/* ─── CONSTANTS ─── */
const DEFAULT_TAGS: Tag[] = [
  { name: "Reflection", color: "green-700"   },
  { name: "Question",   color: "blue-600"    },
  { name: "Insight",    color: "amber-600"   },
  { name: "Quote",      color: "purple-600"  },
  { name: "Dialogue",   color: "teal-600"    },
  { name: "Reading",    color: "rose-600"    },
  { name: "Personal",   color: "yellow-800"  },
];

const TAG_PALETTE = [
  "green-700", "blue-600",   "amber-600",  "purple-600",
  "teal-600",  "rose-600",   "yellow-800", "cyan-700",
  "orange-700","emerald-700","indigo-600",  "stone-500",
] as const;

const PROMPTS = [
  "What are you thinking about right now?",
  "What question has been following you today?",
  "What did you observe that made you pause?",
  "A thought you haven't written down yet…",
  "What would you tell your future self?",
  "What are you uncertain about?",
  "Capture something before it escapes.",
  "What assumption did you question today?",
  "If Socrates asked you one question right now…",
  "What is the examined life to you, today?",
];

const DEFAULT_PREFS: Prefs = { sort: "newest", flatCards: false, wcGoal: 200, customTags: [] };

/* ─── UTILITIES ─── */
const genId     = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const timeAgo   = (ts: number) => {
  const d = Math.floor((Date.now() - ts) / 86400000);
  if (d === 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 7)  return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return `${Math.floor(d / 30)}mo ago`;
};
const getPrompt = () => PROMPTS[Math.floor(Date.now() / 86400000) % PROMPTS.length];
const wc        = (s: string) => s.trim() ? s.split(/\s+/).filter(Boolean).length : 0;
const readTime  = (s: string) => { const m = Math.ceil(wc(s) / 200); return m <= 1 ? "~1 min read" : `~${m} min read`; };
const allTags   = (prefs: Prefs) => [...DEFAULT_TAGS, ...prefs.customTags];
const tagStyle  = (name: string, tags: Tag[]) => TAG_STYLES[tags.find(t => t.name === name)?.color ?? ""] ?? FALLBACK_STYLE;
const cardRotCls = (id: string) => CARD_ROTATIONS[parseInt(id.slice(-4), 36) % CARD_ROTATIONS.length];

/* ─── FORCE GRAPH HOOK ─── */
function useForce(nodes: Note[], edges: Edge[]) {
  const pos   = useRef<Record<string, Position>>({});
  const vel   = useRef<Record<string, Position>>({});
  const [positions, setPositions] = useState<Record<string, Position>>({});
  const iter  = useRef(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    nodes.forEach(n => {
      if (!pos.current[n.id]) {
        const a = Math.random() * Math.PI * 2, r = 60 + Math.random() * 140;
        pos.current[n.id] = { x: Math.cos(a) * r, y: Math.sin(a) * r };
        vel.current[n.id] = { x: 0, y: 0 };
      }
    });
    iter.current = 0;
    const run = () => {
      if (iter.current++ > 300) { if (frame.current) cancelAnimationFrame(frame.current); return; }
      const P = pos.current, V = vel.current;
      nodes.forEach(a => {
        let fx = 0, fy = 0;
        nodes.forEach(b => {
          if (a.id === b.id) return;
          const dx = (P[a.id]?.x ?? 0) - (P[b.id]?.x ?? 0);
          const dy = (P[a.id]?.y ?? 0) - (P[b.id]?.y ?? 0);
          const d2 = dx * dx + dy * dy + 1, d = Math.sqrt(d2);
          const f  = 5000 / d2; fx += dx / d * f; fy += dy / d * f;
        });
        edges.forEach(e => {
          const oid = e.from === a.id ? e.to : e.to === a.id ? e.from : null;
          if (!oid || !P[oid]) return;
          const dx = P[oid].x - (P[a.id]?.x ?? 0);
          const dy = P[oid].y - (P[a.id]?.y ?? 0);
          const d  = Math.sqrt(dx * dx + dy * dy) || 1, tgt = 160;
          const f  = (d - tgt) * 0.02; fx += dx / d * f; fy += dy / d * f;
        });
        fx -= (P[a.id]?.x ?? 0) * 0.035; fy -= (P[a.id]?.y ?? 0) * 0.035;
        if (!V[a.id]) V[a.id] = { x: 0, y: 0 };
        V[a.id].x = (V[a.id].x + fx) * 0.55; V[a.id].y = (V[a.id].y + fy) * 0.55;
        if (!P[a.id]) P[a.id] = { x: 0, y: 0 };
        P[a.id].x += V[a.id].x; P[a.id].y += V[a.id].y;
      });
      setPositions({ ...pos.current });
      frame.current = requestAnimationFrame(run);
    };
    frame.current = requestAnimationFrame(run);
    return () => { if (frame.current) cancelAnimationFrame(frame.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.map(n => n.id).join(","), edges.length]);

  return positions;
}

/* ─── MARKDOWN ─── */
function parseInline(text: string, notes: Note[], onLink?: (id: string) => void): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const re = /\[\[([^\]]+)\]\]|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0, m: RegExpExecArray | null, key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(<span key={key++}>{text.slice(last, m.index)}</span>);
    if (m[1] !== undefined) {
      const linked = notes.find(n => n.title?.toLowerCase() === m![1].toLowerCase());
      parts.push(
        <span key={key++} className={linked ? "text-(--mn-link) border-b border-b-[rgba(90,110,138,.35)] cursor-pointer italic transition-colors duration-140 hover:text-[#3a4e6a]" : "text-(--mn-ink-3) border-b border-dashed border-(--mn-border2) cursor-default italic"}
          onClick={e => { e.stopPropagation(); if (linked) onLink?.(linked.id); }}>
          {m[1]}
        </span>
      );
    } else if (m[2] !== undefined) {
      parts.push(<strong key={key++}>{m[2]}</strong>);
    } else {
      parts.push(<em key={key++}>{m[3]}</em>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(<span key={key++}>{text.slice(last)}</span>);
  return parts.length ? parts : [text];
}

function MarkdownView({ text = "", notes = [], onLink }: {
  text?: string; notes?: Note[]; onLink?: (id: string) => void;
}) {
  return (
    <div className="[&_h1]:font-cinzel [&_h1]:text-[22px] [&_h1]:font-medium [&_h1]:tracking-[.04em] [&_h1]:text-(--mn-ink) [&_h1]:mt-[22px] [&_h1]:mb-[10px] [&_h1]:leading-[1.3] [&_h2]:font-cinzel [&_h2]:text-[15px] [&_h2]:font-medium [&_h2]:tracking-[.06em] [&_h2]:text-(--mn-ink) [&_h2]:mt-[18px] [&_h2]:mb-[8px] [&_blockquote]:border-l-2 [&_blockquote]:border-l-(--mn-gold) [&_blockquote]:py-1 [&_blockquote]:pl-[18px] [&_blockquote]:my-[14px] [&_blockquote]:font-cormorant [&_blockquote]:text-[20px] [&_blockquote]:italic [&_blockquote]:text-(--mn-ink-2) [&_blockquote]:leading-[1.75] [&_p]:font-serif [&_p]:text-[18.5px] [&_p]:leading-[1.95] [&_p]:text-(--mn-ink) [&_p]:mb-1 [&_strong]:font-semibold [&_hr]:[border:none] [&_hr]:border-t [&_hr]:border-(--mn-border) [&_hr]:my-5">
      {text.split("\n").map((line, i) => {
        if (line.startsWith("# "))  return <h1 key={i}>{line.slice(2)}</h1>;
        if (line.startsWith("## ")) return <h2 key={i}>{line.slice(3)}</h2>;
        if (line.startsWith("---")) return <hr key={i} />;
        if (line.startsWith("> "))  return <blockquote key={i}>{parseInline(line.slice(2), notes, onLink)}</blockquote>;
        if (!line.trim())           return <div key={i} className="h-2" />;
        return <p key={i}>{parseInline(line, notes, onLink)}</p>;
      })}
    </div>
  );
}

/* ─── ICON BTN ─── */
function IconBtn({ children, active, onClick, title }: {
  children: React.ReactNode; active?: boolean; onClick?: () => void; title?: string;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`size-[38px] flex items-center justify-center rounded-[4px] cursor-pointer text-[16px] transition-all duration-150 shrink-0 border ${
        active
          ? "bg-(--mn-gold-hi) border-(--mn-gold) text-(--mn-gold)"
          : "bg-transparent border-transparent text-(--mn-ink-3) hover:bg-(--mn-panel) hover:text-(--mn-ink-2)"
      }`}
    >
      {children}
    </button>
  );
}

/* ─── NAV RAIL ─── */
function NavRail({ view, setView, panelOpen, setPanelOpen, onNew }: {
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

/* ─── TAG MANAGER ─── */
function TagManagerModal({ prefs, onSave, onClose }: {
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

/* ─── FILTER PANEL ─── */
function FilterPanel({ notes, activeTags, setActiveTags, prefs, onResurface, resurfaceMsg, sort, setSort, onSetFlat, onManageTags }: {
  notes: Note[];
  activeTags: string[]; setActiveTags: (t: string[]) => void;
  prefs: Prefs; onResurface: () => void; resurfaceMsg?: string;
  sort: string; setSort: (s: string) => void;
  onSetFlat: (v: boolean) => void; onManageTags: () => void;
}) {
  const tags = allTags(prefs);
  const tagCounts = useMemo(() => {
    const m: Record<string, number> = {};
    notes.forEach(n => (n.tags ?? []).forEach(t => { m[t] = (m[t] ?? 0) + 1; }));
    return m;
  }, [notes]);

  const SORTS: [string, string][] = [["newest","Newest"],["oldest","Oldest"],["alpha","A – Z"],["wc","Word count"]];

  return (
    <div className="w-[210px] bg-(--mn-surface) border-l border-(--mn-border) flex flex-col overflow-hidden shrink-0">
      <div className="p-4 pb-[10px]">
        <div className="font-cinzel text-[8.5px] tracking-[.18em] text-(--mn-ink-3) mb-2">SORT</div>
        {SORTS.map(([val, lbl]) => (
          <button
            key={val}
            onClick={() => setSort(val)}
            className={`block w-full text-left px-2 py-1 rounded-[2px] border font-cinzel text-[9.5px] tracking-[.06em] cursor-pointer transition-all duration-120 mb-[3px] ${
              sort === val
                ? "bg-(--mn-gold-hi) border-(--mn-gold) text-(--mn-gold)"
                : "bg-transparent border-transparent text-(--mn-ink-3) hover:bg-(--mn-panel) hover:text-(--mn-ink-2)"
            }`}
          >{lbl}</button>
        ))}
      </div>
      <div className="border-t border-(--mn-border) mx-[10px]" />
      <div className="px-4 pt-[10px] pb-2">
        <div className="font-cinzel text-[8.5px] tracking-[.18em] text-(--mn-ink-3) mb-2 flex justify-between items-center">
          <span>THEMES</span>
          <div className="flex gap-[6px] items-center">
            {activeTags.length > 0 && (
              <button onClick={() => setActiveTags([])} className="text-[8px] text-(--mn-gold) bg-transparent border-none cursor-pointer font-cinzel">✕ clear</button>
            )}
            <button onClick={onManageTags} className="text-[10px] text-(--mn-ink-3) bg-transparent border-none cursor-pointer hover:text-(--mn-gold) transition-colors duration-150">⚙</button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {tags.map(t => {
            const on  = activeTags.includes(t.name);
            const cnt = tagCounts[t.name] ?? 0;
            const s   = TAG_STYLES[t.color] ?? FALLBACK_STYLE;
            return (
              <button
                key={t.name}
                onClick={() => setActiveTags(on ? activeTags.filter(x => x !== t.name) : [...activeTags, t.name])}
                className={`inline-flex items-center gap-1 px-2 py-[3px] rounded-[2px] text-[9.5px] font-cinzel tracking-wider border cursor-pointer transition-all duration-130 ${
                  on ? s.pill : `bg-transparent text-(--mn-ink-3) border-(--mn-border) ${s.hover}`
                }`}
              >
                <span className={`size-1 rounded-full shrink-0 ${s.dot}`} />
                {t.name}{cnt > 0 && <span className="text-[8px] text-(--mn-ink-3) ml-0.5">{cnt}</span>}
              </button>
            );
          })}
        </div>
      </div>
      <div className="border-t border-(--mn-border) mx-[10px]" />
      <div className="px-4 pt-[10px] pb-2">
        <div className="font-cinzel text-[8.5px] tracking-[.18em] text-(--mn-ink-3) mb-2">OPTIONS</div>
        <label className="flex items-center gap-2 cursor-pointer">
          <div
            onClick={() => onSetFlat(!prefs.flatCards)}
            className={`w-7 h-4 rounded-full relative transition-colors duration-200 cursor-pointer shrink-0 ${prefs.flatCards ? "bg-(--mn-gold)" : "bg-(--mn-border)"}`}
          >
            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-[left] duration-200 shadow-[0_1px_3px_rgba(0,0,0,.2)] ${prefs.flatCards ? "left-3" : "left-0.5"}`} />
          </div>
          <span className="font-cinzel text-[9.5px] tracking-wider text-(--mn-ink-3)">Flat cards</span>
        </label>
      </div>
      <div className="flex-1" />
      <div className="px-4 py-3 border-t border-(--mn-border)">
        <button
          onClick={onResurface}
          className="w-full py-[7px] bg-transparent border border-(--mn-border) rounded-[3px] font-cinzel text-[9.5px] tracking-[.07em] text-(--mn-ink-3) cursor-pointer transition-all duration-140 hover:border-(--mn-gold) hover:text-(--mn-gold)"
        >✦ Resurface a thought</button>
        {resurfaceMsg && (
          <div className="mt-[7px] text-[9px] font-cormorant italic text-(--mn-ink-3) text-center leading-[1.5]">{resurfaceMsg}</div>
        )}
        <div className="mt-[10px] font-cinzel text-[8.5px] tracking-[.12em] text-(--mn-ink-3) text-center">
          {notes.length} {notes.length === 1 ? "ENTRY" : "ENTRIES"}
        </div>
      </div>
    </div>
  );
}

/* ─── NOTE CARD ─── */
function NoteCard({ note, onClick, flat, tags }: {
  note: Note; onClick: () => void; flat: boolean; tags: Tag[];
}) {
  const [hov, setHov] = useState(false);
  const s       = tagStyle(note.tags?.[0] ?? "", tags);
  const rotCls  = cardRotCls(note.id);
  const preview = (note.body ?? "").replace(/[#>*[\]]/g, "").replace(/\n/g, " ");

  return (
    <div>
      <article
        onClick={onClick}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        className={`bg-(--mn-card) rounded-[3px] cursor-pointer relative overflow-hidden transition-all duration-220 ease-[cubic-bezier(.23,.8,.32,1)] border border-(--mn-border) ${
          flat
            ? hov ? "-translate-y-1 shadow-[0_14px_36px_rgba(0,0,0,.12),0_2px_6px_rgba(0,0,0,.08)]"
                  : "shadow-[0_2px_10px_rgba(0,0,0,.08)]"
            : hov ? "translate-y-[-5px] rotate-0 shadow-[0_14px_36px_rgba(0,0,0,.12),0_2px_6px_rgba(0,0,0,.08)]"
                  : `${rotCls} shadow-[0_2px_10px_rgba(0,0,0,.08)]`
        }`}
      >
        <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${note.tags?.[0] ? s.bar : "bg-stone-300"} transition-opacity duration-200 ${hov ? "opacity-90" : "opacity-50"}`} />
        <div className="px-4 pt-[15px] pb-[13px] pl-[18px]">
          {note.pinned && <div className="text-[8px] font-cinzel tracking-[.14em] text-(--mn-gold) mb-[6px]">⊛ PINNED</div>}
          {(note.tags ?? []).length > 0 && (
            <div className="flex gap-[3px] flex-wrap mb-[7px]">
              {(note.tags ?? []).map(tag => (
                <span key={tag} className={`text-[8.5px] font-cinzel tracking-[.08em] px-[6px] py-px rounded-[2px] border ${tagStyle(tag, tags).pill}`}>{tag}</span>
              ))}
            </div>
          )}
          {note.title && <h3 className="font-cinzel text-[12px] font-medium tracking-[.04em] text-(--mn-ink) mb-[7px] leading-[1.35]">{note.title}</h3>}
          {preview ? (
            <p className="font-cormorant text-[16.5px] italic font-light text-(--mn-ink-2) leading-[1.7] overflow-hidden [display:-webkit-box] [-webkit-line-clamp:4] [-webkit-box-orient:vertical]">
              {preview.slice(0, 160)}{preview.length > 160 ? "…" : ""}
            </p>
          ) : (
            <p className="font-cormorant text-[14px] italic text-(--mn-border2)">Empty…</p>
          )}
          <div className="mt-[11px] pt-[9px] border-t border-(--mn-border) flex items-center gap-[6px]">
            <span className="text-[10.5px] text-(--mn-ink-3) italic flex-1">{timeAgo(note.updatedAt)}</span>
            {wc(note.body ?? "") > 0 && <span className="text-[9.5px] text-(--mn-ink-3) italic">{wc(note.body ?? "")}w</span>}
            {(note.links ?? []).length > 0 && <span className="text-[11px] text-(--mn-link) opacity-70">⟜</span>}
            {(note.marginalia ?? []).length > 0 && <span className="text-[10px] text-(--mn-gold) opacity-70">✎</span>}
          </div>
        </div>
      </article>
    </div>
  );
}

/* ─── STREAM VIEW ─── */
function StreamView({ notes, onOpen, tags }: { notes: Note[]; onOpen: (id: string) => void; tags: Tag[] }) {
  return (
    <div className="max-w-[660px] mx-auto pb-10">
      {notes.map(n => {
        const preview = (n.body ?? "").replace(/[#>*[\]]/g, "").replace(/\n/g, " ").slice(0, 220);
        return (
          <div key={n.id} onClick={() => onOpen(n.id)} className="flex gap-5 pb-[26px] mb-[26px] border-b border-(--mn-border) cursor-pointer transition-opacity duration-150 hover:opacity-[.78]">
            <div className="w-[50px] shrink-0 pt-1 text-right">
              <div className="font-cinzel text-[9.5px] text-(--mn-ink-3) leading-[1.5]">
                {new Date(n.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </div>
              <div className="text-[9px] text-(--mn-border2) mt-0.5">{new Date(n.createdAt).getFullYear()}</div>
            </div>
            <div className="flex-1 min-w-0">
              {n.title && <div className="font-cinzel text-[13px] tracking-[.04em] text-(--mn-ink) mb-[7px] leading-[1.3]">{n.title}</div>}
              {preview && <p className="font-cormorant text-[17.5px] italic font-light text-(--mn-ink-2) leading-[1.75]">{preview}{(n.body ?? "").length > 220 ? "…" : ""}</p>}
              <div className="flex gap-[5px] mt-[9px] flex-wrap">
                {(n.tags ?? []).map(tag => (
                  <span key={tag} className={`text-[8.5px] font-cinzel px-[6px] py-px rounded-[2px] border ${tagStyle(tag, tags).pill}`}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── CONSTELLATION ─── */
function ConstellationView({ notes, onOpen, tags }: { notes: Note[]; onOpen: (id: string) => void; tags: Tag[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dim, setDim] = useState({ w: 800, h: 600 });
  const [hov, setHov] = useState<string | null>(null);
  const edges = useMemo(() => {
    const e: Edge[] = [];
    notes.forEach(n => (n.links ?? []).forEach(lid => { if (notes.find(x => x.id === lid)) e.push({ from: n.id, to: lid }); }));
    return e;
  }, [notes]);
  const positions = useForce(notes, edges);

  useEffect(() => {
    const ob = new ResizeObserver(([e]) => setDim({ w: e.contentRect.width, h: e.contentRect.height }));
    if (svgRef.current?.parentElement) ob.observe(svgRef.current.parentElement);
    return () => ob.disconnect();
  }, []);

  const cx = dim.w / 2, cy = dim.h / 2;
  const hovNote = hov ? notes.find(n => n.id === hov) : null;

  return (
    <div className="flex-1 overflow-hidden bg-[#0f0d0a] relative">
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <circle key={i} cx={`${(i * 137.5) % 100}%`} cy={`${(i * 97.3) % 100}%`} r={i % 3 === 0 ? 1 : .5} fill={`rgba(255,255,240,${.04 + .08 * ((i * 7) % 10) / 10})`} />
        ))}
      </svg>
      {notes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 text-center p-10">
          <div className="font-cormorant text-[20px] italic text-[rgba(255,255,220,.3)] leading-[1.6] max-w-[340px]">Write notes and link them to watch your constellation form</div>
        </div>
      )}
      <svg ref={svgRef} className="w-full h-full cursor-default" overflow="visible">
        <defs>
          <filter id="mn-glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        {edges.map((e, i) => { const a = positions[e.from], b = positions[e.to]; if (!a || !b) return null; return <line key={i} x1={cx+a.x} y1={cy+a.y} x2={cx+b.x} y2={cy+b.y} stroke="rgba(212,168,67,.22)" strokeWidth={1} strokeDasharray="4 6" />; })}
        {notes.map(n => {
          const p = positions[n.id]; if (!p) return null;
          const x = cx + p.x, y = cy + p.y, isHov = hov === n.id;
          const s = tagStyle(n.tags?.[0] ?? "", tags);
          return (
            <g key={n.id} transform={`translate(${x},${y})`} onClick={() => onOpen(n.id)} onMouseEnter={() => setHov(n.id)} onMouseLeave={() => setHov(null)} className="cursor-pointer">
              {isHov && <circle r={22} className={`${s.fill} opacity-10`} />}
              <circle r={isHov ? 9 : 5.5} className={`${isHov ? "fill-yellow-300" : s.fill} [transition:r_.2s]`} filter="url(#mn-glow)" />
              {(n.links ?? []).length > 0 && <circle r={3} className="fill-(--mn-link) opacity-70" />}
            </g>
          );
        })}
        {hovNote && (() => {
          const p = positions[hovNote.id]; if (!p) return null;
          const px = cx + p.x, py = cy + p.y;
          const x = (px + dim.w / 2 > dim.w * 0.7) ? px - 216 : px + 16;
          const y = Math.min(py - 10, dim.h - 130);
          const preview = (hovNote.body ?? "").replace(/[#>*[\]]/g, "").replace(/\n/g, " ").slice(0, 120);
          return (
            <foreignObject key="tooltip" x={x} y={y} width={200} height={140}>
              <div className="bg-[rgba(15,13,10,.92)] border border-[rgba(212,168,67,.25)] rounded-[4px] px-[14px] py-3 pointer-events-none shadow-[0_8px_28px_rgba(0,0,0,.4)]">
                {hovNote.title && <div className="font-cinzel text-[10px] text-[rgba(212,168,67,.9)] mb-[6px]">{hovNote.title}</div>}
                {preview && <div className="font-cormorant text-[13.5px] italic text-[rgba(255,255,220,.55)] leading-[1.6]">{preview}{(hovNote.body ?? "").length > 120 ? "…" : ""}</div>}
                <div className="mt-[6px] text-[9px] text-[rgba(212,168,67,.35)] font-cinzel">{wc(hovNote.body ?? "")} words · {timeAgo(hovNote.updatedAt)}</div>
              </div>
            </foreignObject>
          );
        })()}
      </svg>
      <div className="absolute bottom-4 left-0 right-0 flex gap-4 justify-center pointer-events-none">
        <div className="font-cinzel text-[8.5px] tracking-[.14em] text-[rgba(212,168,67,.35)]">{notes.length} THOUGHTS · {edges.length} CONNECTIONS</div>
      </div>
    </div>
  );
}

/* ─── QUICK CAPTURE ─── */
function QuickCapture({ onSave, onClose, placeholder }: {
  onSave: (d: { title: string; body: string }) => void; onClose: () => void; placeholder: string;
}) {
  const [body, setBody] = useState("");
  const [title, setTitle] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { ref.current?.focus(); }, []);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) save();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  });

  function save() {
    if (!body.trim() && !title.trim()) return onClose();
    onSave({ title: title.trim(), body: body.trim() });
  }

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} className="fixed inset-0 z-600 bg-[rgba(18,15,10,.6)] backdrop-blur-sm flex items-center justify-center p-6">
      <div className="w-full max-w-[560px] bg-(--mn-card) rounded-[4px] border border-(--mn-border) shadow-[0_30px_80px_rgba(0,0,0,.22)] overflow-hidden">
        <div className="h-[2px] bg-linear-to-r from-(--mn-gold) via-(--mn-gold-b) to-transparent" />
        <div className="px-[22px] pt-4">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title (optional)…" className="w-full bg-transparent border-none outline-none font-cinzel text-[14px] tracking-[.04em] text-(--mn-ink) mb-3" />
          <textarea ref={ref} value={body} onChange={e => setBody(e.target.value)} placeholder={placeholder} rows={5} className="w-full bg-transparent border-none outline-none resize-none font-serif text-[18px] leading-[1.9] text-(--mn-ink)" />
        </div>
        <div className="px-[22px] py-[10px] border-t border-(--mn-border) flex items-center justify-between bg-(--mn-surface)">
          <span className="text-[11.5px] text-(--mn-ink-3) italic">⌘↵ save · Esc cancel</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="bg-transparent border border-(--mn-border) text-(--mn-ink-3) px-[14px] py-1 text-[10px] font-cinzel cursor-pointer rounded-[2px]">Cancel</button>
            <button onClick={save} className="bg-(--mn-ink) text-(--mn-surface) border-none px-[18px] py-1 text-[10px] font-cinzel tracking-widest cursor-pointer rounded-[2px]">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── EXPORT MENU ─── */
function ExportMenu({ note }: { note: Note }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  function exportNote(fmt: string) {
    setOpen(false);
    if (fmt === "txt") {
      const text = `${note.title || "Untitled"}\n${"─".repeat(40)}\n${note.body || ""}`;
      const a = document.createElement("a");
      a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(text);
      a.download = `${(note.title || "note").replace(/\s+/g, "_")}.txt`;
      a.click();
    } else {
      const w = window.open("", "_blank");
      if (!w) return;
      w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${note.title || "Note"}</title><style>body{font-family:Georgia,serif;max-width:700px;margin:60px auto;padding:0 40px;font-size:16px;line-height:1.8;color:#1c1710;}h1{font-size:26px;margin-bottom:8px;}.meta{font-size:12px;color:#9a8a70;margin-bottom:32px;border-bottom:1px solid #ddd5c2;padding-bottom:16px;}blockquote{border-left:2px solid #b87c28;padding-left:18px;font-style:italic;color:#5a5040;}</style></head><body><h1>${note.title || "Untitled"}</h1><div class="meta">${new Date(note.createdAt).toLocaleDateString("en-GB",{year:"numeric",month:"long",day:"numeric"})} · ${wc(note.body ?? "")} words</div><div>${(note.body ?? "").replace(/\n/g,"<br>")}</div></body></html>`);
      w.document.close(); w.focus(); setTimeout(() => w.print(), 400);
    }
  }

  return (
    <div ref={ref} className="relative flex items-center">
      <button onClick={() => setOpen(p => !p)} className="bg-transparent border border-(--mn-border) text-(--mn-ink-3) px-[10px] py-[3px] text-[9px] font-cinzel tracking-[.07em] cursor-pointer rounded-[2px] transition-all duration-120 h-6 leading-none hover:border-(--mn-gold) hover:text-(--mn-gold)">Export ↓</button>
      {open && (
        <div className="absolute top-[calc(100%+4px)] right-0 bg-(--mn-card) border border-(--mn-border) rounded-[3px] shadow-[0_8px_24px_rgba(0,0,0,.12)] z-20 min-w-[130px]">
          {([["txt","Plain text (.txt)"],["pdf","Print / PDF"]] as [string,string][]).map(([fmt,lbl]) => (
            <div key={fmt} onClick={() => exportNote(fmt)} className="px-[14px] py-2 cursor-pointer font-cinzel text-[9.5px] text-(--mn-ink-2) transition-colors duration-120 hover:bg-(--mn-panel)">{lbl}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function buildPayload(n: Note) {
  return { title: n.title, body: n.body, tags: n.tags, links: n.links, marginalia: n.marginalia, pinned: n.pinned ?? false };
}

/* ─── EDITOR PAGE ─── */
function EditorPage({ note, onChange, onClose, onDelete, allNotes, onOpen, prefs }: {
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

/* ─── ROOT ─── */
export default function MyNotesClient({
  isAuthenticated, initialNotes, initialPrefs,
}: {
  isAuthenticated: boolean; initialNotes: Note[]; initialPrefs: Prefs | null;
}) {
  const [notes, setNotes]           = useState<Note[]>(initialNotes);
  const [prefs, setPrefs]           = useState<Prefs>(initialPrefs ?? DEFAULT_PREFS);
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

  function handleSort(s: string) { setSort(s); savePrefs({ ...prefs, sort: s }); }
  function handleSetFlat(v: boolean) { savePrefs({ ...prefs, flatCards: v }); }
  function handleSaveCustomTags(customTags: Tag[]) { setTagModal(false); savePrefs({ ...prefs, customTags }); }

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
                <div className="font-cormorant text-[12.5px] italic font-light text-(--mn-ink-3) mt-[1px]">&ldquo;{prompt}&rdquo;</div>
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
                      {notes.length === 0 ? "“The unexamined life is not worth living.”" : "No entries match your search."}
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
