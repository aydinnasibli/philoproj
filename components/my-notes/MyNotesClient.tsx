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

/* ─── CONSTANTS ─── */
const DEFAULT_TAGS: Tag[] = [
  { name: "Reflection", color: "#7a8a5a" },
  { name: "Question",   color: "#5a7aaa" },
  { name: "Insight",    color: "#b87c28" },
  { name: "Quote",      color: "#8a5aaa" },
  { name: "Dialogue",   color: "#5a9a8a" },
  { name: "Reading",    color: "#aa5a6a" },
  { name: "Personal",   color: "#8a7040" },
];

const TAG_PALETTE = [
  "#7a8a5a","#5a7aaa","#b87c28","#8a5aaa","#5a9a8a",
  "#aa5a6a","#8a7040","#6a8a8a","#9a6a5a","#5a8a7a","#7a6aaa","#aa8a5a",
];

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
const genId    = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const timeAgo  = (ts: number) => {
  const d = Math.floor((Date.now() - ts) / 86400000);
  if (d === 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 7)  return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return `${Math.floor(d / 30)}mo ago`;
};
const cardRot  = (id: string) => ((parseInt(id.slice(-4), 36) % 200) / 200 - 0.5) * 2.2;
const getPrompt = () => PROMPTS[Math.floor(Date.now() / 86400000) % PROMPTS.length];
const wc       = (s: string) => s.trim() ? s.split(/\s+/).filter(Boolean).length : 0;
const readTime = (s: string) => { const m = Math.ceil(wc(s) / 200); return m <= 1 ? "~1 min read" : `~${m} min read`; };
const tagColor = (name: string, tags: Tag[]) => tags.find(t => t.name === name)?.color ?? "#9a8060";
const allTags  = (prefs: Prefs) => [...DEFAULT_TAGS, ...prefs.customTags];

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
function parseInline(text: string, notes: Note[], tags: Tag[], onLink?: (id: string) => void): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const re = /\[\[([^\]]+)\]\]|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0, m: RegExpExecArray | null, key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(<span key={key++}>{text.slice(last, m.index)}</span>);
    if (m[1] !== undefined) {
      const linked = notes.find(n => n.title?.toLowerCase() === m![1].toLowerCase());
      parts.push(
        <span key={key++} className={linked ? "mn-note-link" : "mn-note-link-broken"}
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

function MarkdownView({ text = "", notes = [], tags = [], onLink }: {
  text?: string; notes?: Note[]; tags?: Tag[]; onLink?: (id: string) => void;
}) {
  return (
    <div className="mn-md-body">
      {text.split("\n").map((line, i) => {
        if (line.startsWith("# "))  return <h1 key={i}>{line.slice(2)}</h1>;
        if (line.startsWith("## ")) return <h2 key={i}>{line.slice(3)}</h2>;
        if (line.startsWith("---")) return <hr key={i} />;
        if (line.startsWith("> "))  return <blockquote key={i}>{parseInline(line.slice(2), notes, tags, onLink)}</blockquote>;
        if (!line.trim())           return <div key={i} style={{ height: 8 }} />;
        return <p key={i}>{parseInline(line, notes, tags, onLink)}</p>;
      })}
    </div>
  );
}

/* ─── ICON BTN ─── */
function IconBtn({ children, active, onClick, title, size = 38 }: {
  children: React.ReactNode; active?: boolean; onClick?: () => void; title?: string; size?: number;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button title={title} onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center",
        background: active ? "var(--mn-gold-hi)" : hov ? "var(--mn-panel)" : "transparent",
        border: `1px solid ${active ? "var(--mn-gold)" : "transparent"}`,
        borderRadius: 4, cursor: "pointer",
        color: active ? "var(--mn-gold)" : hov ? "var(--mn-ink-2)" : "var(--mn-ink-3)",
        fontSize: 16, transition: "all .15s", flexShrink: 0,
      }}>
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
    <div style={{ width: 52, background: "var(--mn-panel)", borderRight: "1px solid var(--mn-border)", display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 0", gap: 6, flexShrink: 0, zIndex: 10 }}>
      <Link href="/" title="Back to site" style={{ textDecoration: "none", margin: "4px 0 12px" }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 7.5, fontWeight: 600, letterSpacing: ".14em", color: "var(--mn-gold)", writingMode: "vertical-rl", transform: "rotate(180deg)", opacity: 0.7, transition: "opacity .15s", whiteSpace: "nowrap" }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "0.7")}>
          The Living Manuscript
        </div>
      </Link>
      <IconBtn title="Toggle filters" active={panelOpen} onClick={() => setPanelOpen(p => !p)}>☰</IconBtn>
      <div style={{ width: 28, borderTop: "1px solid var(--mn-border)", margin: "4px 0" }} />
      {views.map(([v, ico, lbl]) => (
        <IconBtn key={v} title={lbl} active={view === v} onClick={() => setView(v)}>{ico}</IconBtn>
      ))}
      <div style={{ flex: 1 }} />
      <button onClick={onNew} title="New note (N)" style={{
        width: 36, height: 36, borderRadius: "50%", background: "var(--mn-gold)", border: "none",
        color: "#fff", fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 3px 12px rgba(184,124,40,.35)", transition: "all .18s", fontWeight: 300,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = "var(--mn-gold-b)"; e.currentTarget.style.transform = "scale(1.08)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "var(--mn-gold)"; e.currentTarget.style.transform = "none"; }}>+</button>
      <div style={{ height: 10 }} />
    </div>
  );
}

/* ─── TAG MANAGER ─── */
function TagManagerModal({ prefs, onSave, onClose }: {
  prefs: Prefs; onSave: (customTags: Tag[]) => void; onClose: () => void;
}) {
  const [custom, setCustom] = useState(prefs.customTags.map(t => ({ ...t })));
  const [name, setName]     = useState("");
  const [color, setColor]   = useState(TAG_PALETTE[0]);
  const [err, setErr]       = useState("");

  function add() {
    const n = name.trim();
    if (!n) { setErr("Name required"); return; }
    if ([...DEFAULT_TAGS, ...custom].find(t => t.name.toLowerCase() === n.toLowerCase())) { setErr("Already exists"); return; }
    setCustom(p => [...p, { name: n, color }]);
    setName(""); setErr("");
  }

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 700, background: "rgba(18,15,10,.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 440, background: "var(--mn-card)", borderRadius: 4, border: "1px solid var(--mn-border)", boxShadow: "0 30px 80px rgba(0,0,0,.22)", overflow: "hidden" }}>
        <div style={{ height: 2, background: "linear-gradient(90deg,var(--mn-gold),var(--mn-gold-b),transparent)" }} />
        <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid var(--mn-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: ".12em", color: "var(--mn-ink)" }}>MANAGE THEMES</div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--mn-ink-3)", cursor: "pointer", fontSize: 14 }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--mn-ink)"} onMouseLeave={e => e.currentTarget.style.color = "var(--mn-ink-3)"}>✕</button>
        </div>
        <div style={{ padding: "14px 22px", maxHeight: 280, overflowY: "auto" }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: ".14em", color: "var(--mn-ink-3)", marginBottom: 8 }}>DEFAULT</div>
          {DEFAULT_TAGS.map(t => (
            <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: t.color, flexShrink: 0 }} />
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 10.5, color: "var(--mn-ink-3)" }}>{t.name}</span>
            </div>
          ))}
          {custom.length > 0 && (
            <>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: ".14em", color: "var(--mn-ink-3)", margin: "12px 0 8px" }}>CUSTOM</div>
              {custom.map(t => (
                <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                  <input type="color" value={t.color} onChange={e => setCustom(p => p.map(x => x.name === t.name ? { ...x, color: e.target.value } : x))}
                    style={{ width: 24, height: 24, border: "none", background: "none", cursor: "pointer", padding: 0, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontFamily: "'Cinzel',serif", fontSize: 10.5, color: "var(--mn-ink-2)" }}>{t.name}</span>
                  <button onClick={() => setCustom(p => p.filter(x => x.name !== t.name))}
                    style={{ background: "transparent", border: "none", color: "var(--mn-ink-3)", cursor: "pointer", fontSize: 11 }}
                    onMouseEnter={e => e.currentTarget.style.color = "var(--mn-red)"} onMouseLeave={e => e.currentTarget.style.color = "var(--mn-ink-3)"}>✕</button>
                </div>
              ))}
            </>
          )}
        </div>
        <div style={{ padding: "12px 22px", borderTop: "1px solid var(--mn-border)", background: "var(--mn-surface)" }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: ".14em", color: "var(--mn-ink-3)", marginBottom: 8 }}>ADD CUSTOM THEME</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
            {TAG_PALETTE.map(c => (
              <button key={c} onClick={() => setColor(c)} style={{ width: 16, height: 16, borderRadius: "50%", background: c, border: color === c ? "2px solid var(--mn-ink)" : "2px solid transparent", cursor: "pointer", transition: "transform .12s" }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.2)"}
                onMouseLeave={e => e.currentTarget.style.transform = "none"} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={name} onChange={e => { setName(e.target.value); setErr(""); }}
              placeholder="Theme name…" onKeyDown={e => e.key === "Enter" && add()}
              style={{ flex: 1, background: "var(--mn-panel)", border: `1px solid ${err ? "var(--mn-red)" : "var(--mn-border)"}`, borderRadius: 3, padding: "6px 10px", fontSize: 13.5, color: "var(--mn-ink)", outline: "none", fontFamily: "'EB Garamond',serif" }}
              onFocus={e => e.currentTarget.style.borderColor = "var(--mn-gold)"}
              onBlur={e => e.currentTarget.style.borderColor = err ? "var(--mn-red)" : "var(--mn-border)"} />
            <button onClick={add} style={{ padding: "6px 16px", background: "var(--mn-ink)", color: "var(--mn-surface)", border: "none", borderRadius: 3, fontFamily: "'Cinzel',serif", fontSize: 9.5, letterSpacing: ".09em", cursor: "pointer" }}>Add</button>
          </div>
          {err && <div style={{ fontSize: 11, color: "var(--mn-red)", marginTop: 5, fontStyle: "italic" }}>{err}</div>}
        </div>
        <div style={{ padding: "12px 22px", borderTop: "1px solid var(--mn-border)", display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} style={{ background: "transparent", border: "1px solid var(--mn-border)", color: "var(--mn-ink-3)", padding: "5px 18px", fontSize: 9.5, fontFamily: "'Cinzel',serif", cursor: "pointer", borderRadius: 2 }}>Cancel</button>
          <button onClick={() => onSave(custom)} style={{ background: "var(--mn-gold)", color: "#fff", border: "none", padding: "5px 18px", fontSize: 9.5, fontFamily: "'Cinzel',serif", cursor: "pointer", borderRadius: 2 }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--mn-gold-b)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--mn-gold)"}>Save</button>
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
    <div style={{ width: 210, background: "var(--mn-surface)", borderRight: "1px solid var(--mn-border)", display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>
      <div style={{ padding: "16px 16px 10px" }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: ".18em", color: "var(--mn-ink-3)", marginBottom: 8 }}>SORT</div>
        {SORTS.map(([val, lbl]) => (
          <button key={val} onClick={() => setSort(val)} style={{
            display: "block", width: "100%", textAlign: "left", padding: "4px 8px", borderRadius: 2,
            background: sort === val ? "var(--mn-gold-hi)" : "transparent",
            border: `1px solid ${sort === val ? "var(--mn-gold)" : "transparent"}`,
            color: sort === val ? "var(--mn-gold)" : "var(--mn-ink-3)",
            fontFamily: "'Cinzel',serif", fontSize: 9.5, letterSpacing: ".06em", cursor: "pointer",
            transition: "all .12s", marginBottom: 3,
          }}
          onMouseEnter={e => { if (sort !== val) { e.currentTarget.style.background = "var(--mn-panel)"; e.currentTarget.style.color = "var(--mn-ink-2)"; } }}
          onMouseLeave={e => { if (sort !== val) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--mn-ink-3)"; } }}
          >{lbl}</button>
        ))}
      </div>
      <div style={{ borderTop: "1px solid var(--mn-border)", margin: "0 10px" }} />
      <div style={{ padding: "10px 16px 8px" }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: ".18em", color: "var(--mn-ink-3)", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>THEMES</span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {activeTags.length > 0 && <button onClick={() => setActiveTags([])} style={{ fontSize: 8, color: "var(--mn-gold)", background: "transparent", border: "none", cursor: "pointer", fontFamily: "'Cinzel',serif" }}>✕ clear</button>}
            <button onClick={onManageTags} style={{ fontSize: 10, color: "var(--mn-ink-3)", background: "transparent", border: "none", cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--mn-gold)"} onMouseLeave={e => e.currentTarget.style.color = "var(--mn-ink-3)"}>⚙</button>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {tags.map(t => {
            const on = activeTags.includes(t.name), cnt = tagCounts[t.name] ?? 0;
            return (
              <button key={t.name} onClick={() => setActiveTags(on ? activeTags.filter(x => x !== t.name) : [...activeTags, t.name])} style={{
                display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 2,
                fontSize: 9.5, fontFamily: "'Cinzel',serif", letterSpacing: ".05em",
                background: on ? `${t.color}18` : "transparent", color: on ? t.color : "var(--mn-ink-3)",
                border: `1px solid ${on ? t.color + "55" : "var(--mn-border)"}`, cursor: "pointer", transition: "all .13s",
              }}
              onMouseEnter={e => { if (!on) { e.currentTarget.style.color = t.color; e.currentTarget.style.borderColor = t.color + "44"; } }}
              onMouseLeave={e => { if (!on) { e.currentTarget.style.color = "var(--mn-ink-3)"; e.currentTarget.style.borderColor = "var(--mn-border)"; } }}>
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: t.color, flexShrink: 0 }} />
                {t.name}{cnt > 0 && <span style={{ fontSize: 8, color: "var(--mn-ink-3)", marginLeft: 2 }}>{cnt}</span>}
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ borderTop: "1px solid var(--mn-border)", margin: "0 10px" }} />
      <div style={{ padding: "10px 16px 8px" }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: ".18em", color: "var(--mn-ink-3)", marginBottom: 8 }}>OPTIONS</div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <div onClick={() => onSetFlat(!prefs.flatCards)} style={{ width: 28, height: 16, borderRadius: 8, background: prefs.flatCards ? "var(--mn-gold)" : "var(--mn-border)", position: "relative", transition: "background .2s", cursor: "pointer", flexShrink: 0 }}>
            <div style={{ position: "absolute", top: 2, left: prefs.flatCards ? 12 : 2, width: 12, height: 12, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
          </div>
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9.5, letterSpacing: ".05em", color: "var(--mn-ink-3)" }}>Flat cards</span>
        </label>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ padding: "12px 16px", borderTop: "1px solid var(--mn-border)" }}>
        <button onClick={onResurface} style={{ width: "100%", padding: "7px", background: "transparent", border: "1px solid var(--mn-border)", borderRadius: 3, fontFamily: "'Cinzel',serif", fontSize: 9.5, letterSpacing: ".07em", color: "var(--mn-ink-3)", cursor: "pointer", transition: "all .14s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--mn-gold)"; e.currentTarget.style.color = "var(--mn-gold)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--mn-border)"; e.currentTarget.style.color = "var(--mn-ink-3)"; }}>✦ Resurface a thought</button>
        {resurfaceMsg && (
          <div style={{ marginTop: 7, fontSize: 9, fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", color: "var(--mn-ink-3)", textAlign: "center", lineHeight: 1.5 }}>{resurfaceMsg}</div>
        )}
        <div style={{ marginTop: 10, fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: ".12em", color: "var(--mn-ink-3)", textAlign: "center" }}>
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
  const rot     = cardRot(note.id);
  const tc      = note.tags?.[0] ? tagColor(note.tags[0], tags) : "var(--mn-border2)";
  const preview = (note.body ?? "").replace(/[#>*[\]]/g, "").replace(/\n/g, " ");

  return (
    <div>
      <article onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{
          background: "var(--mn-card)", borderRadius: 3, cursor: "pointer",
          position: "relative", overflow: "hidden",
          transform: flat ? (hov ? "translateY(-4px)" : "none") : (hov ? "translateY(-5px) rotate(0deg)" : `rotate(${rot}deg)`),
          boxShadow: hov ? "0 14px 36px rgba(0,0,0,.12),0 2px 6px rgba(0,0,0,.08)" : "0 2px 10px rgba(0,0,0,.08)",
          transition: "all .22s cubic-bezier(.23,.8,.32,1)", border: "1px solid var(--mn-border)",
        }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: tc, opacity: hov ? .9 : .5, transition: "opacity .2s" }} />
        <div style={{ padding: "15px 16px 13px 18px" }}>
          {note.pinned && <div style={{ fontSize: 8, fontFamily: "'Cinzel',serif", letterSpacing: ".14em", color: "var(--mn-gold)", marginBottom: 6 }}>⊛ PINNED</div>}
          {(note.tags ?? []).length > 0 && (
            <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 7 }}>
              {(note.tags ?? []).map(tag => (
                <span key={tag} style={{ fontSize: 8.5, fontFamily: "'Cinzel',serif", letterSpacing: ".08em", padding: "1px 6px", borderRadius: 2, background: `${tagColor(tag, tags)}14`, color: tagColor(tag, tags), border: `1px solid ${tagColor(tag, tags)}30` }}>{tag}</span>
              ))}
            </div>
          )}
          {note.title && <h3 style={{ fontFamily: "'Cinzel',serif", fontSize: 12, fontWeight: 500, letterSpacing: ".04em", color: "var(--mn-ink)", marginBottom: 7, lineHeight: 1.35 }}>{note.title}</h3>}
          {preview ? (
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16.5, fontStyle: "italic", fontWeight: 300, color: "var(--mn-ink-2)", lineHeight: 1.7, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical" }}>
              {preview.slice(0, 160)}{preview.length > 160 ? "…" : ""}
            </p>
          ) : (
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, fontStyle: "italic", color: "var(--mn-border2)" }}>Empty…</p>
          )}
          <div style={{ marginTop: 11, paddingTop: 9, borderTop: "1px solid var(--mn-border)", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 10.5, color: "var(--mn-ink-3)", fontStyle: "italic", flex: 1 }}>{timeAgo(note.updatedAt)}</span>
            {wc(note.body ?? "") > 0 && <span style={{ fontSize: 9.5, color: "var(--mn-ink-3)", fontStyle: "italic" }}>{wc(note.body ?? "")}w</span>}
            {(note.links ?? []).length > 0 && <span style={{ fontSize: 11, color: "var(--mn-link)", opacity: .7 }}>⟜</span>}
            {(note.marginalia ?? []).length > 0 && <span style={{ fontSize: 10, color: "var(--mn-gold)", opacity: .7 }}>✎</span>}
          </div>
        </div>
      </article>
    </div>
  );
}

/* ─── STREAM VIEW ─── */
function StreamView({ notes, onOpen, tags }: { notes: Note[]; onOpen: (id: string) => void; tags: Tag[] }) {
  return (
    <div style={{ maxWidth: 660, margin: "0 auto", padding: "0 0 40px" }}>
      {notes.map(n => {
        const preview = (n.body ?? "").replace(/[#>*[\]]/g, "").replace(/\n/g, " ").slice(0, 220);
        return (
          <div key={n.id} onClick={() => onOpen(n.id)}
            style={{ display: "flex", gap: 20, paddingBottom: 26, marginBottom: 26, borderBottom: "1px solid var(--mn-border)", cursor: "pointer", transition: "opacity .15s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = ".78"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            <div style={{ width: 50, flexShrink: 0, paddingTop: 4, textAlign: "right" }}>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9.5, color: "var(--mn-ink-3)", lineHeight: 1.5 }}>
                {new Date(n.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </div>
              <div style={{ fontSize: 9, color: "var(--mn-border2)", marginTop: 2 }}>{new Date(n.createdAt).getFullYear()}</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {n.title && <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, letterSpacing: ".04em", color: "var(--mn-ink)", marginBottom: 7, lineHeight: 1.3 }}>{n.title}</div>}
              {preview && <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17.5, fontStyle: "italic", fontWeight: 300, color: "var(--mn-ink-2)", lineHeight: 1.75 }}>{preview}{(n.body ?? "").length > 220 ? "…" : ""}</p>}
              <div style={{ display: "flex", gap: 5, marginTop: 9, flexWrap: "wrap" }}>
                {(n.tags ?? []).map(tag => <span key={tag} style={{ fontSize: 8.5, fontFamily: "'Cinzel',serif", padding: "1px 6px", borderRadius: 2, background: `${tagColor(tag, tags)}12`, color: tagColor(tag, tags), border: `1px solid ${tagColor(tag, tags)}28` }}>{tag}</span>)}
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
    <div style={{ flex: 1, overflow: "hidden", background: "#0f0d0a", position: "relative" }}>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        {Array.from({ length: 60 }).map((_, i) => (
          <circle key={i} cx={`${(i * 137.5) % 100}%`} cy={`${(i * 97.3) % 100}%`} r={i % 3 === 0 ? 1 : .5} fill={`rgba(255,255,240,${.04 + .08 * ((i * 7) % 10) / 10})`} />
        ))}
      </svg>
      {notes.length === 0 && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, textAlign: "center", padding: 40 }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontStyle: "italic", color: "rgba(255,255,220,.3)", lineHeight: 1.6, maxWidth: 340 }}>Write notes and link them to watch your constellation form</div>
        </div>
      )}
      <svg ref={svgRef} style={{ width: "100%", height: "100%", cursor: "default" }}>
        <defs>
          <filter id="mn-glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        {edges.map((e, i) => { const a = positions[e.from], b = positions[e.to]; if (!a || !b) return null; return <line key={i} x1={cx+a.x} y1={cy+a.y} x2={cx+b.x} y2={cy+b.y} stroke="rgba(212,168,67,.22)" strokeWidth={1} strokeDasharray="4 6" />; })}
        {notes.map(n => {
          const p = positions[n.id]; if (!p) return null;
          const x = cx + p.x, y = cy + p.y, isHov = hov === n.id;
          const tc = n.tags?.[0] ? tagColor(n.tags[0], tags) : "#d4a843";
          return (
            <g key={n.id} transform={`translate(${x},${y})`} onClick={() => onOpen(n.id)} onMouseEnter={() => setHov(n.id)} onMouseLeave={() => setHov(null)} style={{ cursor: "pointer" }}>
              {isHov && <circle r={22} fill={tc} opacity=".1" />}
              <circle r={isHov ? 9 : 5.5} fill={isHov ? "#ffd060" : tc} filter="url(#mn-glow)" style={{ transition: "r .2s" }} />
              {(n.links ?? []).length > 0 && <circle r={3} fill="var(--mn-link)" opacity=".7" />}
            </g>
          );
        })}
      </svg>
      {hovNote && (() => {
        const p = positions[hovNote.id]; if (!p) return null;
        const px = cx + p.x, py = cy + p.y, left = px + dim.w / 2 > dim.w * 0.7;
        const preview = (hovNote.body ?? "").replace(/[#>*[\]]/g, "").replace(/\n/g, " ").slice(0, 120);
        return (
          <div style={{ position: "absolute", left: left ? undefined : px + 16, right: left ? dim.w - px + 16 : undefined, top: Math.min(py - 10, dim.h - 130), width: 200, background: "rgba(15,13,10,.92)", border: "1px solid rgba(212,168,67,.25)", borderRadius: 4, padding: "12px 14px", pointerEvents: "none", boxShadow: "0 8px 28px rgba(0,0,0,.4)" }}>
            {hovNote.title && <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, color: "rgba(212,168,67,.9)", marginBottom: 6 }}>{hovNote.title}</div>}
            {preview && <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13.5, fontStyle: "italic", color: "rgba(255,255,220,.55)", lineHeight: 1.6 }}>{preview}{(hovNote.body ?? "").length > 120 ? "…" : ""}</div>}
            <div style={{ marginTop: 6, fontSize: 9, color: "rgba(212,168,67,.35)", fontFamily: "'Cinzel',serif" }}>{wc(hovNote.body ?? "")} words · {timeAgo(hovNote.updatedAt)}</div>
          </div>
        );
      })()}
      <div style={{ position: "absolute", bottom: 16, left: 0, right: 0, display: "flex", gap: 16, justifyContent: "center", pointerEvents: "none" }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: ".14em", color: "rgba(212,168,67,.35)" }}>{notes.length} THOUGHTS · {edges.length} CONNECTIONS</div>
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
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 600, background: "rgba(18,15,10,.6)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 560, background: "var(--mn-card)", borderRadius: 4, border: "1px solid var(--mn-border)", boxShadow: "0 30px 80px rgba(0,0,0,.22)", overflow: "hidden" }}>
        <div style={{ height: 2, background: "linear-gradient(90deg,var(--mn-gold),var(--mn-gold-b),transparent)" }} />
        <div style={{ padding: "16px 22px 0" }}>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title (optional)…"
            style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontFamily: "'Cinzel',serif", fontSize: 14, letterSpacing: ".04em", color: "var(--mn-ink)", marginBottom: 12 }} />
          <textarea ref={ref} value={body} onChange={e => setBody(e.target.value)} placeholder={placeholder} rows={5}
            style={{ width: "100%", background: "transparent", border: "none", outline: "none", resize: "none", fontFamily: "'EB Garamond',serif", fontSize: 18, lineHeight: 1.9, color: "var(--mn-ink)" }} />
        </div>
        <div style={{ padding: "10px 22px", borderTop: "1px solid var(--mn-border)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--mn-surface)" }}>
          <span style={{ fontSize: 11.5, color: "var(--mn-ink-3)", fontStyle: "italic" }}>⌘↵ save · Esc cancel</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} style={{ background: "transparent", border: "1px solid var(--mn-border)", color: "var(--mn-ink-3)", padding: "4px 14px", fontSize: 10, fontFamily: "'Cinzel',serif", cursor: "pointer", borderRadius: 2 }}>Cancel</button>
            <button onClick={save} style={{ background: "var(--mn-ink)", color: "var(--mn-surface)", border: "none", padding: "4px 18px", fontSize: 10, fontFamily: "'Cinzel',serif", letterSpacing: ".1em", cursor: "pointer", borderRadius: 2 }}>Save</button>
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
    <div ref={ref} style={{ position: "relative", display: "flex", alignItems: "center" }}>
      <button onClick={() => setOpen(p => !p)} style={{ background: "transparent", border: "1px solid var(--mn-border)", color: "var(--mn-ink-3)", padding: "3px 10px", fontSize: 9, fontFamily: "'Cinzel',serif", letterSpacing: ".07em", cursor: "pointer", borderRadius: 2, transition: "all .12s", height: 24, lineHeight: 1 }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--mn-gold)"; e.currentTarget.style.color = "var(--mn-gold)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--mn-border)"; e.currentTarget.style.color = "var(--mn-ink-3)"; }}>Export ↓</button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, background: "var(--mn-card)", border: "1px solid var(--mn-border)", borderRadius: 3, boxShadow: "0 8px 24px rgba(0,0,0,.12)", zIndex: 20, minWidth: 130 }}>
          {([["txt","Plain text (.txt)"],["pdf","Print / PDF"]] as [string,string][]).map(([fmt,lbl]) => (
            <div key={fmt} onClick={() => exportNote(fmt)} style={{ padding: "8px 14px", cursor: "pointer", fontFamily: "'Cinzel',serif", fontSize: 9.5, color: "var(--mn-ink-2)", transition: "background .12s" }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--mn-panel)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>{lbl}</div>
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
      try {
        await updateNoteAction(updated.id, buildPayload(updated));
      } catch {
        setSaveError(true);
        setTimeout(() => setSaveError(false), 3000);
      }
    });
  }
  const addMarginalia = useCallback(() => { if (!margNote.trim()) return; set("marginalia", [...(note.marginalia ?? []), { id: genId(), text: margNote.trim(), createdAt: Date.now() }]); setMargNote(""); }, [set, note, margNote, setMargNote]);
  function removeMarginalia(id: string) { set("marginalia", (note.marginalia ?? []).filter(m => m.id !== id)); }
  function toggleLink(id: string) { const l = note.links ?? []; set("links", l.includes(id) ? l.filter(x => x !== id) : [...l, id]); }

  const linkableNotes = useMemo(() => allNotes.filter(n => n.id !== note.id && (n.title ?? "").toLowerCase().includes(linkSearch.toLowerCase())), [allNotes, linkSearch, note.id]);

  useEffect(() => {
    if (mode === "write" && !focus) {
      const ta = taRef.current;
      if (!ta) return;
      ta.focus();
      ta.setSelectionRange(ta.value.length, ta.value.length);
    }
  }, [note.id, mode, focus]);

  useEffect(() => {
    if (!focus) return;
    const ta = taRef.current;
    if (!ta) return;
    ta.setSelectionRange(ta.value.length, ta.value.length);
  }, [focus]);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") { if (showLinks) { setShowLinks(false); return; } if (focus) { setFocus(false); return; } onClose(); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [focus, showLinks, onClose]);

  const accent    = note.tags?.[0] ? tagColor(note.tags[0], tags) : "var(--mn-gold)";
  const wordCount = wc(note.body ?? "");

  if (focus) return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#fdfaf4", overflow: "hidden" }}>
      <div style={{ height: 2, background: `linear-gradient(90deg,${accent},transparent)` }} />
      <textarea ref={taRef} value={note.body ?? ""} onChange={e => set("body", e.target.value)} autoFocus placeholder="Write freely…"
        style={{ flex: 1, background: "transparent", border: "none", outline: "none", resize: "none", padding: "80px min(120px,14%) 60px", fontFamily: "'EB Garamond',serif", fontSize: 22, lineHeight: 2.1, color: "var(--mn-ink)", caretColor: "var(--mn-gold)" }} />
      <div style={{ padding: "12px min(120px,14%)", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--mn-border)", gap: 16 }}>
        <span style={{ fontSize: 13, color: "var(--mn-ink-3)", fontStyle: "italic" }}>{wordCount} words</span>
        <button onClick={() => setFocus(false)} style={{ background: "transparent", border: "1px solid var(--mn-border2)", color: "var(--mn-ink-3)", padding: "5px 18px", fontSize: 9.5, fontFamily: "'Cinzel',serif", cursor: "pointer", borderRadius: 2 }}
          onMouseEnter={e => { e.currentTarget.style.color = "var(--mn-ink)"; e.currentTarget.style.borderColor = "var(--mn-ink-2)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "var(--mn-ink-3)"; e.currentTarget.style.borderColor = "var(--mn-border2)"; }}>Exit focus</button>
      </div>
    </div>
  );

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--mn-surface)", overflow: "hidden" }}>
      <div style={{ height: 2, background: `linear-gradient(90deg,${accent},${accent}44)`, flexShrink: 0 }} />
      <div style={{ padding: "10px 28px", borderBottom: "1px solid var(--mn-border)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0, background: "rgba(249,245,238,.96)", backdropFilter: "blur(6px)", flexWrap: "wrap" }}>
        <button onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 5, background: "transparent", border: "none", color: "var(--mn-ink-3)", cursor: "pointer", fontFamily: "'Cinzel',serif", fontSize: 9.5, letterSpacing: ".08em", padding: "3px 0", transition: "color .13s", flexShrink: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--mn-ink)"} onMouseLeave={e => e.currentTarget.style.color = "var(--mn-ink-3)"}>← Back</button>
        {savedFlash && <span style={{ fontSize: 10, color: "var(--mn-green)", fontFamily: "'Cinzel',serif", letterSpacing: ".07em" }}>✓ saved</span>}
        {saveError && <span style={{ fontSize: 10, color: "var(--mn-red)", fontFamily: "'Cinzel',serif", letterSpacing: ".07em" }}>⚠ save failed</span>}
        <div style={{ width: 1, height: 16, background: "var(--mn-border)", flexShrink: 0 }} />
        {(["write", "read"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{ background: "transparent", border: "none", padding: "3px 10px", fontSize: 9.5, fontFamily: "'Cinzel',serif", letterSpacing: ".08em", cursor: "pointer", color: mode === m ? "var(--mn-ink)" : "var(--mn-ink-3)", borderBottom: `2px solid ${mode === m ? accent : "transparent"}`, transition: "all .14s" }}>
            {m === "write" ? "Write" : "Preview"}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          {tags.map(tg => { const on = (note.tags ?? []).includes(tg.name); return (
            <button key={tg.name} onClick={() => toggleTag(tg.name)}
              style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 7px", borderRadius: 2, fontSize: 8.5, fontFamily: "'Cinzel',serif", background: on ? `${tg.color}16` : "transparent", color: on ? tg.color : "var(--mn-ink-3)", border: `1px solid ${on ? tg.color + "44" : "var(--mn-border)"}`, cursor: "pointer", transition: "all .12s" }}
              onMouseEnter={e => { if (!on) { e.currentTarget.style.color = tg.color; e.currentTarget.style.borderColor = tg.color + "44"; } }}
              onMouseLeave={e => { if (!on) { e.currentTarget.style.color = "var(--mn-ink-3)"; e.currentTarget.style.borderColor = "var(--mn-border)"; } }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: on ? tg.color : "var(--mn-ink-3)" }} />{tg.name}
            </button>
          ); })}
        </div>
        <div style={{ width: 1, height: 16, background: "var(--mn-border)", flexShrink: 0 }} />
        <ExportMenu note={note} />
        <button onClick={togglePin} style={{ background: note.pinned ? "var(--mn-gold-hi)" : "transparent", border: `1px solid ${note.pinned ? "var(--mn-gold)" : "var(--mn-border)"}`, color: note.pinned ? "var(--mn-gold)" : "var(--mn-ink-3)", padding: "3px 10px", fontSize: 9, fontFamily: "'Cinzel',serif", cursor: "pointer", borderRadius: 2, transition: "all .12s", height: 24, lineHeight: 1 }}
          onMouseEnter={e => { if (!note.pinned) { e.currentTarget.style.borderColor = "var(--mn-gold)"; e.currentTarget.style.color = "var(--mn-gold)"; } }}
          onMouseLeave={e => { if (!note.pinned) { e.currentTarget.style.borderColor = "var(--mn-border)"; e.currentTarget.style.color = "var(--mn-ink-3)"; } }}>
          {note.pinned ? "⊛ Pinned" : "⊙ Pin"}
        </button>
        <button onClick={() => setFocus(true)} style={{ background: "transparent", border: "1px solid var(--mn-border)", color: "var(--mn-ink-3)", padding: "3px 10px", fontSize: 9, fontFamily: "'Cinzel',serif", cursor: "pointer", borderRadius: 2, transition: "all .12s", height: 24, lineHeight: 1 }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--mn-gold)"; e.currentTarget.style.color = "var(--mn-gold)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--mn-border)"; e.currentTarget.style.color = "var(--mn-ink-3)"; }}>Focus</button>
      </div>
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          <div style={{ maxWidth: 700, width: "100%", margin: "0 auto", padding: "48px 40px 60px", display: "flex", flexDirection: "column", flex: 1 }}>
            <input value={note.title ?? ""} onChange={e => set("title", e.target.value)} placeholder="Untitled entry…"
              style={{ background: "transparent", border: "none", outline: "none", fontFamily: "'Cinzel',serif", fontSize: 26, fontWeight: 500, letterSpacing: ".04em", color: "var(--mn-ink)", marginBottom: 6, width: "100%" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28, paddingBottom: 18, borderBottom: "1px solid var(--mn-border)", flexWrap: "wrap" }}>
              <span style={{ fontSize: 11.5, color: "var(--mn-ink-3)", fontStyle: "italic" }}>{timeAgo(note.updatedAt)}</span>
              {wordCount > 0 && <span style={{ fontSize: 11.5, color: "var(--mn-ink-3)", fontStyle: "italic" }}>{wordCount} words · {readTime(note.body ?? "")}</span>}
              {(note.tags ?? []).map(tag => <span key={tag} style={{ fontSize: 8.5, fontFamily: "'Cinzel',serif", padding: "1px 7px", borderRadius: 2, background: `${tagColor(tag, tags)}14`, color: tagColor(tag, tags), border: `1px solid ${tagColor(tag, tags)}30` }}>{tag}</span>)}
            </div>
            {mode === "write" && (
              <textarea ref={taRef} value={note.body ?? ""} onChange={e => set("body", e.target.value)}
                placeholder={"Write freely…\n\n**bold**  *italic*  > blockquote  [[Note Title]]"}
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", resize: "none", fontFamily: "'EB Garamond',serif", fontSize: 19, lineHeight: 1.95, color: "var(--mn-ink)", caretColor: "var(--mn-gold)", minHeight: 400, width: "100%" }} />
            )}
            {mode === "read" && (
              <MarkdownView text={note.body ?? ""} notes={allNotes} tags={tags} onLink={id => { onClose(); setTimeout(() => onOpen(id), 50); }} />
            )}
          </div>
        </div>
        {/* Marginalia */}
        <div style={{ width: margOpen ? 220 : 32, flexShrink: 0, borderLeft: "1px solid var(--mn-border)", background: "var(--mn-panel)", display: "flex", flexDirection: "column", overflow: "hidden", transition: "width .22s cubic-bezier(.23,.8,.32,1)", position: "relative" }}>
          <button onClick={() => setMargOpen(p => !p)} style={{ width: 32, position: "absolute", top: 0, bottom: 0, background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 18, color: "var(--mn-ink-3)", transition: "color .12s", zIndex: 2 }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--mn-gold)"} onMouseLeave={e => e.currentTarget.style.color = "var(--mn-ink-3)"}>
            <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontFamily: "'Cinzel',serif", fontSize: 7.5, letterSpacing: ".18em", whiteSpace: "nowrap" }}>
              {margOpen ? "▸ NOTES" : "◂ NOTES"}{(note.marginalia ?? []).length > 0 ? ` (${note.marginalia.length})` : ""}
            </span>
          </button>
          {margOpen && (
            <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", paddingLeft: 32 }}>
              <div style={{ padding: "16px 10px 10px", borderBottom: "1px solid var(--mn-border)" }}>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: ".18em", color: "var(--mn-ink-3)", marginBottom: 10 }}>MARGINALIA</div>
                <textarea value={margNote} onChange={e => setMargNote(e.target.value)} placeholder="Add an annotation…" rows={3}
                  style={{ width: "100%", background: "var(--mn-card)", border: "1px solid var(--mn-border)", borderRadius: 3, padding: "7px 9px", fontSize: 13.5, fontFamily: "'EB Garamond',serif", lineHeight: 1.6, color: "var(--mn-ink)", outline: "none", resize: "none" }}
                  onFocus={e => e.currentTarget.style.borderColor = "var(--mn-gold)"}
                  onBlur={e => e.currentTarget.style.borderColor = "var(--mn-border)"} />
                <button onClick={addMarginalia} style={{ marginTop: 6, width: "100%", padding: "5px", background: "transparent", border: "1px solid var(--mn-border)", borderRadius: 2, fontFamily: "'Cinzel',serif", fontSize: 9, color: "var(--mn-ink-3)", cursor: "pointer", transition: "all .12s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--mn-gold)"; e.currentTarget.style.color = "var(--mn-gold)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--mn-border)"; e.currentTarget.style.color = "var(--mn-ink-3)"; }}>+ Add</button>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
                {(note.marginalia ?? []).length === 0 && <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13.5, fontStyle: "italic", color: "var(--mn-ink-3)", textAlign: "center", paddingTop: 20 }}>No annotations yet.</div>}
                {(note.marginalia ?? []).map(m => (
                  <div key={m.id} style={{ marginBottom: 10, padding: "8px 9px", background: "var(--mn-card)", borderRadius: 3, border: "1px solid var(--mn-border)" }}>
                    <p style={{ fontFamily: "'EB Garamond',serif", fontSize: 13, lineHeight: 1.6, color: "var(--mn-ink-2)" }}>{m.text}</p>
                    <div style={{ marginTop: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 9, color: "var(--mn-ink-3)", fontStyle: "italic" }}>{timeAgo(m.createdAt)}</span>
                      <button onClick={() => removeMarginalia(m.id)} style={{ background: "transparent", border: "none", color: "var(--mn-ink-3)", fontSize: 10, cursor: "pointer" }}
                        onMouseEnter={e => e.currentTarget.style.color = "var(--mn-red)"} onMouseLeave={e => e.currentTarget.style.color = "var(--mn-ink-3)"}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "10px", borderTop: "1px solid var(--mn-border)", display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ position: "relative" }}>
                  <button onClick={() => setShowLinks(p => !p)} style={{ width: "100%", background: "transparent", border: `1px solid ${showLinks ? "var(--mn-link)" : "var(--mn-border)"}`, color: showLinks ? "var(--mn-link)" : "var(--mn-ink-3)", padding: "4px 0", fontSize: 9, fontFamily: "'Cinzel',serif", cursor: "pointer", borderRadius: 2, transition: "all .12s" }}>
                    ⟜ Links{(note.links ?? []).length > 0 ? ` (${note.links.length})` : ""}
                  </button>
                  {showLinks && (
                    <div style={{ position: "absolute", bottom: "calc(100% + 4px)", left: 0, right: 0, background: "var(--mn-card)", border: "1px solid var(--mn-border)", borderRadius: 3, boxShadow: "0 8px 24px rgba(0,0,0,.12)", zIndex: 10, overflow: "hidden" }}>
                      <div style={{ padding: "6px 9px", borderBottom: "1px solid var(--mn-border)" }}>
                        <input value={linkSearch} onChange={e => setLinkSearch(e.target.value)} placeholder="Search…" autoFocus
                          style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: 13, color: "var(--mn-ink)", fontFamily: "'EB Garamond',serif" }} />
                      </div>
                      <div style={{ maxHeight: 160, overflowY: "auto" }}>
                        {linkableNotes.length === 0 && <div style={{ padding: "8px 10px", fontSize: 13, fontStyle: "italic", color: "var(--mn-ink-3)", fontFamily: "'Cormorant Garamond',serif" }}>No notes</div>}
                        {linkableNotes.map(ln => { const on = (note.links ?? []).includes(ln.id); return (
                          <div key={ln.id} onClick={() => toggleLink(ln.id)}
                            style={{ padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, background: on ? "var(--mn-link-hi)" : "transparent", transition: "background .12s" }}
                            onMouseEnter={e => { if (!on) e.currentTarget.style.background = "var(--mn-panel)"; }}
                            onMouseLeave={e => { if (!on) e.currentTarget.style.background = "transparent"; }}>
                            <span style={{ fontSize: 9, color: on ? "var(--mn-link)" : "var(--mn-border2)" }}>{on ? "●" : "○"}</span>
                            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9.5, color: on ? "var(--mn-link)" : "var(--mn-ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ln.title || "Untitled"}</span>
                          </div>
                        ); })}
                      </div>
                    </div>
                  )}
                </div>
                {deleteConfirm ? (
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={onDelete} style={{ flex: 1, background: "var(--mn-red)", border: "none", color: "#fff", padding: "4px 0", fontSize: 9, fontFamily: "'Cinzel',serif", cursor: "pointer", borderRadius: 2 }}>Confirm</button>
                    <button onClick={() => setDeleteConfirm(false)} style={{ flex: 1, background: "transparent", border: "1px solid var(--mn-border)", color: "var(--mn-ink-3)", padding: "4px 0", fontSize: 9, fontFamily: "'Cinzel',serif", cursor: "pointer", borderRadius: 2 }}>Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteConfirm(true)} style={{ width: "100%", background: "transparent", border: "1px solid var(--mn-border)", color: "var(--mn-ink-3)", padding: "4px 0", fontSize: 9, fontFamily: "'Cinzel',serif", cursor: "pointer", borderRadius: 2, transition: "all .12s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--mn-red)"; e.currentTarget.style.color = "var(--mn-red)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--mn-border)"; e.currentTarget.style.color = "var(--mn-ink-3)"; }}>Delete</button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── PAGE STYLES ─── */
const PAGE_CSS = `
.mn-page{--mn-bg:#f2ece0;--mn-surface:#f9f5ee;--mn-panel:#ede7da;--mn-card:#faf7f2;--mn-border:#ddd5c2;--mn-border2:#ccc0a8;--mn-ink:#1c1710;--mn-ink-2:#5a5040;--mn-ink-3:#9a8a70;--mn-gold:#b87c28;--mn-gold-b:#d4a843;--mn-gold-hi:rgba(184,124,40,0.13);--mn-link:#5a6e8a;--mn-link-hi:rgba(90,110,138,0.12);--mn-red:#8b3535;--mn-green:#4a7a4a;}
.mn-page ::-webkit-scrollbar{width:4px;}
.mn-page ::-webkit-scrollbar-track{background:transparent;}
.mn-page ::-webkit-scrollbar-thumb{background:var(--mn-border2);border-radius:2px;}
.mn-page ::selection{background:var(--mn-gold-hi);}
.mn-md-body h1{font-family:'Cinzel',serif;font-size:22px;font-weight:500;letter-spacing:.04em;color:var(--mn-ink);margin:22px 0 10px;line-height:1.3;}
.mn-md-body h2{font-family:'Cinzel',serif;font-size:15px;font-weight:500;letter-spacing:.06em;color:var(--mn-ink);margin:18px 0 8px;}
.mn-md-body blockquote{border-left:2px solid var(--mn-gold);padding:4px 0 4px 18px;margin:14px 0;font-family:'Cormorant Garamond',serif;font-size:20px;font-style:italic;color:var(--mn-ink-2);line-height:1.75;}
.mn-md-body p{font-family:'EB Garamond',serif;font-size:18.5px;line-height:1.95;color:var(--mn-ink);margin-bottom:4px;}
.mn-md-body strong{font-weight:600;}
.mn-md-body hr{border:none;border-top:1px solid var(--mn-border);margin:20px 0;}
.mn-note-link{color:var(--mn-link);border-bottom:1px solid rgba(90,110,138,.35);cursor:pointer;font-style:italic;transition:color .14s;}
.mn-note-link:hover{color:#3a4e6a;}
.mn-note-link-broken{color:var(--mn-ink-3);border-bottom:1px dashed var(--mn-border2);cursor:default;font-style:italic;}
`;

/* ─── ROOT ─── */
export default function MyNotesClient({
  isAuthenticated,
  initialNotes,
  initialPrefs,
}: {
  isAuthenticated: boolean;
  initialNotes: Note[];
  initialPrefs: Prefs | null;
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
        e.preventDefault();
        setCapturing(true);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
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

  // Not authenticated — show sign-in prompt
  if (!isAuthenticated) return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />
      <div className="mn-page" style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--mn-bg)", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20, textAlign: "center", padding: 40 }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 28, color: "var(--mn-border)", letterSpacing: ".3em" }}>✦</div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontStyle: "italic", color: "var(--mn-ink-3)", maxWidth: 360, lineHeight: 1.7 }}>Sign in to access your personal manuscript.</div>
        <SignInButton mode="modal">
          <button style={{ marginTop: 8, background: "var(--mn-gold)", color: "#fff", border: "none", padding: "10px 28px", fontSize: 10, fontFamily: "'Cinzel',serif", letterSpacing: ".14em", cursor: "pointer", borderRadius: 3 }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--mn-gold-b)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--mn-gold)"}>SIGN IN</button>
        </SignInButton>
      </div>
    </>
  );

  function savePrefs(next: Prefs) {
    setPrefs(next);
    startTransition(() => updatePrefsAction(next));
  }

  async function handleCreate({ title, body }: { title: string; body: string }) {
    setCapturing(false);
    const tempId  = "tmp_" + genId();
    const now     = Date.now();
    const tempNote: Note = { id: tempId, title, body, tags: [], links: [], marginalia: [], pinned: false, createdAt: now, updatedAt: now };
    setNotes(p => [tempNote, ...p]);
    setEditId(tempId);
    try {
      const saved = await createNoteAction({ title, body });
      setNotes(p => p.map(n => n.id === tempId ? saved : n));
      setEditId(saved.id);
    } catch {
      setNotes(p => p.filter(n => n.id !== tempId));
      setEditId(null);
    }
  }

  function handleChange(updated: Note) {
    setNotes(p => p.map(n => n.id === updated.id ? updated : n));
  }

  async function handleDelete() {
    if (!editId) return;
    const id = editId;
    setNotes(p => p.filter(n => n.id !== id));
    setEditId(null);
    if (!id.startsWith("tmp_")) {
      startTransition(() => deleteNoteAction(id));
    }
  }

  function handleSort(s: string) {
    setSort(s);
    savePrefs({ ...prefs, sort: s });
  }

  function handleSetFlat(v: boolean) {
    savePrefs({ ...prefs, flatCards: v });
  }

  function handleSaveCustomTags(customTags: Tag[]) {
    setTagModal(false);
    savePrefs({ ...prefs, customTags });
  }

  function doResurface() {
    const old = notes.filter(n => Date.now() - n.createdAt > 3 * 86400000 && (n.body ?? "").length > 20);
    if (old.length > 0) {
      setResurface(old[Math.floor(Math.random() * old.length)]);
      setResurfaceMsg("");
    } else {
      setResurfaceMsg("Write more entries — resurface shows notes older than 3 days.");
      setTimeout(() => setResurfaceMsg(""), 4000);
    }
  }

  const editNote = notes.find(n => n.id === editId);
  const tags     = allTags(prefs);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />
      <div className="mn-page" style={{ position: "fixed", inset: 0, display: "flex", overflow: "hidden", background: "var(--mn-bg)", fontFamily: "'EB Garamond',serif", WebkitFontSmoothing: "antialiased" }}>
        <NavRail view={view} setView={setView} panelOpen={panelOpen} setPanelOpen={setPanelOpen} onNew={() => setCapturing(true)} />
        {panelOpen && (
          <FilterPanel notes={notes}
            activeTags={activeTags} setActiveTags={setActiveTags}
            prefs={prefs} onResurface={doResurface} resurfaceMsg={resurfaceMsg}
            sort={sort} setSort={handleSort}
            onSetFlat={handleSetFlat} onManageTags={() => setTagModal(true)} />
        )}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {editNote && (
            <EditorPage note={editNote} onChange={handleChange} onClose={() => setEditId(null)}
              onDelete={handleDelete} allNotes={notes} onOpen={id => setEditId(id)} prefs={prefs} />
          )}
          <div style={{ flex: 1, display: editNote ? "none" : "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
            <div style={{ padding: "11px 24px", borderBottom: "1px solid var(--mn-border)", display: "flex", alignItems: "center", gap: 14, flexShrink: 0, background: "rgba(242,236,224,.92)", backdropFilter: "blur(8px)" }}>
              <div style={{ flexShrink: 0 }}>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 500, letterSpacing: ".09em", color: "var(--mn-ink)" }}>My Manuscript</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12.5, fontStyle: "italic", fontWeight: 300, color: "var(--mn-ink-3)", marginTop: 1 }}>&ldquo;{prompt}&rdquo;</div>
              </div>
              <div style={{ flex: 1, maxWidth: 260, position: "relative" }}>
                <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--mn-ink-3)", fontSize: 12, pointerEvents: "none" }}>⌕</span>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
                  style={{ width: "100%", background: "var(--mn-panel)", border: "1px solid var(--mn-border)", borderRadius: 3, padding: "5px 10px 5px 26px", fontSize: 13.5, color: "var(--mn-ink)", outline: "none", fontFamily: "'EB Garamond',serif" }}
                  onFocus={e => e.currentTarget.style.borderColor = "var(--mn-gold)"}
                  onBlur={e => e.currentTarget.style.borderColor = "var(--mn-border)"} />
                {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: 7, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", color: "var(--mn-ink-3)", cursor: "pointer", fontSize: 11, padding: 0 }}>✕</button>}
              </div>
              {view !== "constellation" && <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: ".12em", color: "var(--mn-ink-3)", flexShrink: 0 }}>{filtered.length} {filtered.length === 1 ? "ENTRY" : "ENTRIES"}</span>}
            </div>

            {resurface && (
              <div style={{ padding: "10px 24px", borderBottom: "1px solid var(--mn-border)", background: "var(--mn-panel)", display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 13, color: "var(--mn-gold)", opacity: .6 }}>✦</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 9, fontFamily: "'Cinzel',serif", letterSpacing: ".15em", color: "var(--mn-ink-3)", marginBottom: 2 }}>FROM {timeAgo(resurface.createdAt).toUpperCase()}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, fontStyle: "italic", color: "var(--mn-ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{resurface.title || resurface.body.slice(0, 80)}</div>
                </div>
                <button onClick={() => setEditId(resurface.id)} style={{ background: "transparent", border: "1px solid rgba(184,124,40,.3)", color: "var(--mn-gold)", fontSize: 9.5, fontFamily: "'Cinzel',serif", cursor: "pointer", padding: "4px 12px", borderRadius: 2, whiteSpace: "nowrap" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--mn-gold-hi)"; e.currentTarget.style.borderColor = "var(--mn-gold)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(184,124,40,.3)"; }}>Read</button>
                <button onClick={() => setResurface(null)} style={{ background: "transparent", border: "none", color: "var(--mn-ink-3)", cursor: "pointer", fontSize: 13 }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--mn-ink)"} onMouseLeave={e => e.currentTarget.style.color = "var(--mn-ink-3)"}>✕</button>
              </div>
            )}

            {view === "constellation" ? (
              <ConstellationView notes={filtered} onOpen={id => setEditId(id)} tags={tags} />
            ) : (
              <div style={{ flex: 1, overflowY: "auto", padding: "22px 24px" }}>
                {filtered.length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: 14, textAlign: "center" }}>
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: 28, color: "var(--mn-border)", letterSpacing: ".3em" }}>✦</div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontStyle: "italic", fontWeight: 300, color: "var(--mn-ink-3)", maxWidth: 340, lineHeight: 1.7 }}>
                      {notes.length === 0 ? "“The unexamined life is not worth living.”" : "No entries match your search."}
                    </div>
                    {notes.length === 0 && (
                      <button onClick={() => setCapturing(true)} style={{ marginTop: 8, background: "transparent", border: "1px solid var(--mn-border)", color: "var(--mn-ink-3)", padding: "7px 22px", fontSize: 10, fontFamily: "'Cinzel',serif", letterSpacing: ".1em", cursor: "pointer", borderRadius: 2 }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--mn-gold)"; e.currentTarget.style.color = "var(--mn-gold)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--mn-border)"; e.currentTarget.style.color = "var(--mn-ink-3)"; }}>Begin writing</button>
                    )}
                  </div>
                ) : view === "grid" ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16, alignItems: "start" }}>
                    {filtered.map(n => (
                      <NoteCard key={n.id} note={n} onClick={() => setEditId(n.id)} flat={prefs.flatCards} tags={tags} />
                    ))}
                  </div>
                ) : (
                  <StreamView notes={filtered} onOpen={id => setEditId(id)} tags={tags} />
                )}
              </div>
            )}
          </div>
        </div>

        {capturing && <QuickCapture onSave={handleCreate} onClose={() => setCapturing(false)} placeholder={`"${prompt}"`} />}
        {tagModal && <TagManagerModal prefs={prefs} onSave={handleSaveCustomTags} onClose={() => setTagModal(false)} />}
      </div>
    </>
  );
}
