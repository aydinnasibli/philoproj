"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import type { SchoolWithPhilosophers } from "@/lib/types";

const SCHOOL_STYLE: Record<string, { accentColor: string; stripColor: string }> = {
  "school-socratic-method":    { accentColor: "#7a5e00", stripColor: "rgba(215,170,50,0.75)" },
  "school-platonism":          { accentColor: "#7a5e00", stripColor: "rgba(215,170,50,0.75)" },
  "school-aristotelianism":    { accentColor: "#7a5e00", stripColor: "rgba(215,170,50,0.75)" },
  "school-stoicism":           { accentColor: "#6b4a1a", stripColor: "rgba(139,98,41,0.75)"  },
  "school-neoplatonism":       { accentColor: "#6b4a1a", stripColor: "rgba(139,98,41,0.75)"  },
  "school-scholasticism":      { accentColor: "#4a5e2a", stripColor: "rgba(107,122,71,0.75)" },
  "school-rationalism":        { accentColor: "#7a3c15", stripColor: "rgba(195,100,55,0.75)" },
  "school-empiricism":         { accentColor: "#7a3c15", stripColor: "rgba(195,100,55,0.75)" },
  "school-critical-philosophy":{ accentColor: "#38407a", stripColor: "rgba(90,105,175,0.75)" },
  "school-german-idealism":    { accentColor: "#38407a", stripColor: "rgba(90,105,175,0.75)" },
  "school-existentialism":     { accentColor: "#38407a", stripColor: "rgba(90,105,175,0.75)" },
  "school-analytic-philosophy":{ accentColor: "#38407a", stripColor: "rgba(90,105,175,0.75)" },
};

function fallbackStyle() { return { accentColor: "var(--accent)", stripColor: "var(--accent)" }; }

type Props = { schools: SchoolWithPhilosophers[] };

export default function SchoolsGrid({ schools }: Props) {
  if (schools.length === 0) {
    return <div className="px-12 py-24 text-ink-muted font-serif italic">No schools of thought found.</div>;
  }

  return (
    <div className="pt-[80px] min-h-screen bg-canvas">
      <div className="px-14 pt-[52px] pb-10 border-b border-border">
        <div className="font-sans text-[10px] font-bold tracking-[0.22em] uppercase text-accent mb-[14px]">Schools of Thought</div>
        <h1 className="font-serif italic font-normal leading-[1.1] text-ink mb-4" style={{ fontSize: "clamp(2rem,4vw,3rem)" }}>The Lineage of Ideas</h1>
        <p className="font-sans text-[0.875rem] leading-[1.8] text-ink-muted max-w-[52ch]">
          Philosophy does not advance in isolation — each school emerges from, reacts against, and reshapes what came before.
          Here the chain of ideas is traced from ancient Athens to the twentieth century.
        </p>
      </div>

      <div className="grid bg-border" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "1.5px" }}>
        {schools.map((school, idx) => {
          const style = SCHOOL_STYLE[school._id] ?? fallbackStyle();
          return (
            <motion.div key={school._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07, duration: 0.45, ease: "easeOut" }} className="bg-canvas">
              <SchoolCard school={school} style={style} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

type CardStyle = { accentColor: string; stripColor: string };

function SchoolCard({ school, style }: { school: SchoolWithPhilosophers; style: CardStyle }) {
  return (
    <div
      className="p-10 h-full flex flex-col gap-6 relative overflow-hidden"
      style={{ '--ac': style.accentColor, '--sc': style.stripColor } as React.CSSProperties}
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-(--sc)" />

      <div>
        <div className="font-sans text-[10px] font-bold tracking-[0.2em] uppercase text-(--ac) mb-[10px]">{school.eraRange}</div>
        <h2 className="font-serif text-[1.65rem] font-medium leading-[1.15] text-ink">{school.title}</h2>
      </div>

      <p className="font-sans text-[0.85rem] leading-[1.8] text-ink-muted">{school.description}</p>

      <div>
        <SectionLabel>Core Ideas</SectionLabel>
        <ul className="list-none flex flex-col gap-2">
          {school.coreIdeas.map((idea, i) => (
            <li key={i} className="flex gap-[10px] items-start">
              <span className="shrink-0 rounded-full mt-[7px] bg-(--ac) opacity-70" style={{ width: 5, height: 5 }} />
              <span className="font-sans text-[0.8rem] leading-[1.65] text-ink-muted">{idea}</span>
            </li>
          ))}
        </ul>
      </div>

      {school.philosophers.length > 0 && (
        <div>
          <SectionLabel>Key Thinkers</SectionLabel>
          <div className="flex flex-wrap gap-[6px]">
            {school.philosophers.map((p) => <PhilosopherChip key={p._id} philosopher={p} accentColor={style.accentColor} />)}
          </div>
        </div>
      )}

      {(school.influencedBy.length > 0 || school.influencedTo.length > 0) && (
        <div className="mt-auto pt-4 border-t border-border">
          <SectionLabel>Intellectual Lineage</SectionLabel>
          <div className="flex flex-col gap-2">
            {school.influencedBy.length > 0 && <LineageRow direction="from" label="Emerged from" schools={school.influencedBy} accentColor={style.accentColor} />}
            {school.influencedTo.length > 0 && <LineageRow direction="to" label="Gave rise to" schools={school.influencedTo} accentColor={style.accentColor} />}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-sans text-[9px] font-bold tracking-[0.18em] uppercase text-ink-muted opacity-[0.65] mb-[10px] flex items-center gap-[10px]">
      <span className="flex-1 h-px bg-border" />{children}<span className="flex-3 h-px bg-border" />
    </div>
  );
}

function PhilosopherChip({ philosopher, accentColor }: { philosopher: { _id: string; name: string; slug: string; avatarUrl: string; coreBranch: string }; accentColor: string }) {
  return (
    <Link
      href={`/philosophers/${philosopher.slug}`}
      className="flex items-center gap-[6px] border border-border rounded-full text-xs font-sans text-ink no-underline bg-transparent transition-[border-color,color,background] duration-200 hover:bg-[rgba(0,0,0,0.02)]"
      style={{ padding: "4px 10px 4px 5px", '--ac': accentColor } as React.CSSProperties}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = accentColor; (e.currentTarget as HTMLElement).style.color = accentColor; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--ink)"; }}
    >
      {philosopher.avatarUrl && <Image src={philosopher.avatarUrl} alt={philosopher.name} width={20} height={20} style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />}
      {philosopher.name}
    </Link>
  );
}

function LineageRow({ direction, label, schools, accentColor }: { direction: "from" | "to"; label: string; schools: { _id: string; title: string; slug: string }[]; accentColor: string }) {
  return (
    <div className="flex items-baseline gap-[10px] flex-wrap" style={{ '--ac': accentColor } as React.CSSProperties}>
      <span className="font-sans text-[10px] text-(--ac) opacity-70 shrink-0">{direction === "from" ? "←" : "→"}</span>
      <span className="font-sans text-[9px] font-semibold tracking-[0.12em] uppercase text-ink-muted opacity-60 shrink-0">{label}</span>
      <div className="flex flex-wrap gap-[6px]">
        {schools.map((s, i) => (
          <span key={s._id} className="flex items-center gap-[6px]">
            <span className="font-serif italic text-[0.82rem] text-(--ac)">{s.title}</span>
            {i < schools.length - 1 && <span className="font-sans text-[10px] text-ink-muted opacity-40">&amp;</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
