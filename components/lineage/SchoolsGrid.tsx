"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import type { SchoolWithPhilosophers } from "@/lib/types";

type Props = { schools: SchoolWithPhilosophers[] };

type SchoolColors = {
  topBar:        string;
  acText:        string;
  acBg:          string;
  chipHover:     string;
  arrowText:     string;
  lineageText:   string;
};

const SCHOOL_COLORS: Record<string, SchoolColors> = {
  "school-socratic-method":  { topBar: "bg-[rgba(215,170,50,0.75)]",  acText: "text-[#C47029]", acBg: "bg-[#C47029]",  chipHover: "hover:border-[#C47029] hover:text-[#C47029] hover:bg-[rgba(196,112,41,0.03)]",  arrowText: "text-[#C47029]", lineageText: "text-[#C47029]" },
  "school-platonism":        { topBar: "bg-[rgba(215,170,50,0.75)]",  acText: "text-[#C47029]", acBg: "bg-[#C47029]",  chipHover: "hover:border-[#C47029] hover:text-[#C47029] hover:bg-[rgba(196,112,41,0.03)]",  arrowText: "text-[#C47029]", lineageText: "text-[#C47029]" },
  "school-aristotelianism":  { topBar: "bg-[rgba(215,170,50,0.75)]",  acText: "text-[#C47029]", acBg: "bg-[#C47029]",  chipHover: "hover:border-[#C47029] hover:text-[#C47029] hover:bg-[rgba(196,112,41,0.03)]",  arrowText: "text-[#C47029]", lineageText: "text-[#C47029]" },
  "school-stoicism":         { topBar: "bg-[rgba(139,98,41,0.75)]",   acText: "text-[#8B6229]", acBg: "bg-[#8B6229]",  chipHover: "hover:border-[#8B6229] hover:text-[#8B6229] hover:bg-[rgba(139,98,41,0.03)]",   arrowText: "text-[#8B6229]", lineageText: "text-[#8B6229]" },
  "school-neoplatonism":     { topBar: "bg-[rgba(139,98,41,0.75)]",   acText: "text-[#8B6229]", acBg: "bg-[#8B6229]",  chipHover: "hover:border-[#8B6229] hover:text-[#8B6229] hover:bg-[rgba(139,98,41,0.03)]",   arrowText: "text-[#8B6229]", lineageText: "text-[#8B6229]" },
  "school-scholasticism":    { topBar: "bg-[rgba(107,122,71,0.75)]",  acText: "text-[#6B7A47]", acBg: "bg-[#6B7A47]",  chipHover: "hover:border-[#6B7A47] hover:text-[#6B7A47] hover:bg-[rgba(107,122,71,0.03)]",  arrowText: "text-[#6B7A47]", lineageText: "text-[#6B7A47]" },
  "school-rationalism":      { topBar: "bg-[rgba(195,100,55,0.75)]",  acText: "text-[#8B6914]", acBg: "bg-[#8B6914]",  chipHover: "hover:border-[#8B6914] hover:text-[#8B6914] hover:bg-[rgba(139,105,20,0.03)]",  arrowText: "text-[#8B6914]", lineageText: "text-[#8B6914]" },
  "school-empiricism":       { topBar: "bg-[rgba(195,100,55,0.75)]",  acText: "text-[#8B6914]", acBg: "bg-[#8B6914]",  chipHover: "hover:border-[#8B6914] hover:text-[#8B6914] hover:bg-[rgba(139,105,20,0.03)]",  arrowText: "text-[#8B6914]", lineageText: "text-[#8B6914]" },
  "school-critical-philosophy": { topBar: "bg-[rgba(90,105,175,0.75)]", acText: "text-[#5A6999]", acBg: "bg-[#5A6999]", chipHover: "hover:border-[#5A6999] hover:text-[#5A6999] hover:bg-[rgba(90,105,153,0.03)]", arrowText: "text-[#5A6999]", lineageText: "text-[#5A6999]" },
  "school-german-idealism":  { topBar: "bg-[rgba(90,105,175,0.75)]",  acText: "text-[#5A6999]", acBg: "bg-[#5A6999]",  chipHover: "hover:border-[#5A6999] hover:text-[#5A6999] hover:bg-[rgba(90,105,153,0.03)]",  arrowText: "text-[#5A6999]", lineageText: "text-[#5A6999]" },
  "school-existentialism":   { topBar: "bg-[rgba(90,105,175,0.75)]",  acText: "text-[#5A6999]", acBg: "bg-[#5A6999]",  chipHover: "hover:border-[#5A6999] hover:text-[#5A6999] hover:bg-[rgba(90,105,153,0.03)]",  arrowText: "text-[#5A6999]", lineageText: "text-[#5A6999]" },
  "school-analytic-philosophy": { topBar: "bg-[rgba(90,105,175,0.75)]", acText: "text-[#5A6999]", acBg: "bg-[#5A6999]", chipHover: "hover:border-[#5A6999] hover:text-[#5A6999] hover:bg-[rgba(90,105,153,0.03)]", arrowText: "text-[#5A6999]", lineageText: "text-[#5A6999]" },
};

const FALLBACK_SCHOOL_COLORS = SCHOOL_COLORS["school-socratic-method"];

export default function SchoolsGrid({ schools }: Props) {
  if (schools.length === 0) {
    return <div className="px-12 py-24 text-ink-muted font-serif italic">No schools of thought found.</div>;
  }

  return (
    <div className="pt-[80px] min-h-screen bg-canvas">
      <div className="px-14 pt-[52px] pb-10 border-b border-border">
        <div className="font-sans text-[10px] font-bold tracking-[0.22em] uppercase text-accent mb-[14px]">Schools of Thought</div>
        <h1 className="font-serif italic font-normal leading-[1.1] text-ink mb-4 text-[clamp(2rem,4vw,3rem)]">The Lineage of Ideas</h1>
        <p className="font-sans text-[0.875rem] leading-[1.8] text-ink-muted max-w-[52ch]">
          Philosophy does not advance in isolation — each school emerges from, reacts against, and reshapes what came before.
          Here the chain of ideas is traced from ancient Athens to the twentieth century.
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(380px,1fr))] gap-[1.5px] bg-border">
        {schools.map((school, idx) => (
          <motion.div key={school._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07, duration: 0.45, ease: "easeOut" }} className="bg-canvas">
            <SchoolCard school={school} colors={SCHOOL_COLORS[school._id] ?? FALLBACK_SCHOOL_COLORS} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SchoolCard({ school, colors: c }: { school: SchoolWithPhilosophers; colors: SchoolColors }) {
  return (
    <div className="p-10 h-full flex flex-col gap-6 relative overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${c.topBar}`} />

      <div>
        <div className={`font-sans text-[10px] font-bold tracking-[0.2em] uppercase ${c.acText} mb-[10px]`}>{school.eraRange}</div>
        <h2 className="font-serif text-[1.65rem] font-medium leading-[1.15] text-ink">{school.title}</h2>
      </div>

      <p className="font-sans text-[0.85rem] leading-[1.8] text-ink-muted">{school.description}</p>

      <div>
        <SectionLabel>Core Ideas</SectionLabel>
        <ul className="list-none flex flex-col gap-2">
          {school.coreIdeas.map((idea, i) => (
            <li key={i} className="flex gap-[10px] items-start">
              <span className={`shrink-0 rounded-full mt-[7px] w-[5px] h-[5px] ${c.acBg} opacity-70`} />
              <span className="font-sans text-[0.8rem] leading-[1.65] text-ink-muted">{idea}</span>
            </li>
          ))}
        </ul>
      </div>

      {school.philosophers.length > 0 && (
        <div>
          <SectionLabel>Key Thinkers</SectionLabel>
          <div className="flex flex-wrap gap-[6px]">
            {school.philosophers.map((p) => <PhilosopherChip key={p._id} philosopher={p} chipHover={c.chipHover} />)}
          </div>
        </div>
      )}

      {(school.influencedBy.length > 0 || school.influencedTo.length > 0) && (
        <div className="mt-auto pt-4 border-t border-border">
          <SectionLabel>Intellectual Lineage</SectionLabel>
          <div className="flex flex-col gap-2">
            {school.influencedBy.length > 0 && <LineageRow direction="from" label="Emerged from" schools={school.influencedBy} arrowText={c.arrowText} lineageText={c.lineageText} />}
            {school.influencedTo.length > 0 && <LineageRow direction="to"   label="Gave rise to" schools={school.influencedTo}  arrowText={c.arrowText} lineageText={c.lineageText} />}
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

function PhilosopherChip({ philosopher, chipHover }: {
  philosopher: { _id: string; name: string; slug: string; avatarUrl: string; coreBranch: string };
  chipHover: string;
}) {
  return (
    <Link
      href={`/philosophers/${philosopher.slug}`}
      className={`flex items-center gap-[6px] pl-[5px] pr-[10px] py-1 border border-border rounded-full text-xs font-sans text-ink no-underline bg-transparent transition-[border-color,color,background] duration-200 ${chipHover}`}
    >
      {philosopher.avatarUrl && <Image src={philosopher.avatarUrl} alt={philosopher.name} width={20} height={20} className="rounded-full object-cover shrink-0" />}
      {philosopher.name}
    </Link>
  );
}

function LineageRow({ direction, label, schools, arrowText, lineageText }: {
  direction: "from" | "to";
  label: string;
  schools: { _id: string; title: string; slug: string }[];
  arrowText: string;
  lineageText: string;
}) {
  return (
    <div className="flex items-baseline gap-[10px] flex-wrap">
      <span className={`font-sans text-[10px] ${arrowText} opacity-70 shrink-0`}>{direction === "from" ? "←" : "→"}</span>
      <span className="font-sans text-[9px] font-semibold tracking-[0.12em] uppercase text-ink-muted opacity-60 shrink-0">{label}</span>
      <div className="flex flex-wrap gap-[6px]">
        {schools.map((s, i) => (
          <span key={s._id} className="flex items-center gap-[6px]">
            <span className={`font-serif italic text-[0.82rem] ${lineageText}`}>{s.title}</span>
            {i < schools.length - 1 && <span className="font-sans text-[10px] text-ink-muted opacity-40">&amp;</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
