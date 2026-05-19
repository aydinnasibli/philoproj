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
  "school-socratic-method":  { topBar: "bg-yellow-500/75",  acText: "text-amber-600 dark:text-amber-400", acBg: "bg-amber-600 dark:bg-amber-400",  chipHover: "hover:border-amber-600 dark:hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-600/3 dark:hover:bg-amber-400/3",  arrowText: "text-amber-600 dark:text-amber-400", lineageText: "text-amber-600 dark:text-amber-400" },
  "school-platonism":        { topBar: "bg-yellow-500/75",  acText: "text-amber-600 dark:text-amber-400", acBg: "bg-amber-600 dark:bg-amber-400",  chipHover: "hover:border-amber-600 dark:hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-600/3 dark:hover:bg-amber-400/3",  arrowText: "text-amber-600 dark:text-amber-400", lineageText: "text-amber-600 dark:text-amber-400" },
  "school-aristotelianism":  { topBar: "bg-yellow-500/75",  acText: "text-amber-600 dark:text-amber-400", acBg: "bg-amber-600 dark:bg-amber-400",  chipHover: "hover:border-amber-600 dark:hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-600/3 dark:hover:bg-amber-400/3",  arrowText: "text-amber-600 dark:text-amber-400", lineageText: "text-amber-600 dark:text-amber-400" },
  "school-stoicism":         { topBar: "bg-amber-800/75",   acText: "text-amber-800", acBg: "bg-amber-800",  chipHover: "hover:border-amber-800 hover:text-amber-800 hover:bg-amber-800/3",   arrowText: "text-amber-800", lineageText: "text-amber-800" },
  "school-neoplatonism":     { topBar: "bg-amber-800/75",   acText: "text-amber-800", acBg: "bg-amber-800",  chipHover: "hover:border-amber-800 hover:text-amber-800 hover:bg-amber-800/3",   arrowText: "text-amber-800", lineageText: "text-amber-800" },
  "school-scholasticism":    { topBar: "bg-lime-700/75",  acText: "text-lime-700", acBg: "bg-lime-700",  chipHover: "hover:border-lime-700 hover:text-lime-700 hover:bg-lime-700/3",  arrowText: "text-lime-700", lineageText: "text-lime-700" },
  "school-rationalism":      { topBar: "bg-orange-700/75",  acText: "text-yellow-800", acBg: "bg-yellow-800",  chipHover: "hover:border-yellow-800 hover:text-yellow-800 hover:bg-yellow-800/3",  arrowText: "text-yellow-800", lineageText: "text-yellow-800" },
  "school-empiricism":       { topBar: "bg-orange-700/75",  acText: "text-yellow-800", acBg: "bg-yellow-800",  chipHover: "hover:border-yellow-800 hover:text-yellow-800 hover:bg-yellow-800/3",  arrowText: "text-yellow-800", lineageText: "text-yellow-800" },
  "school-critical-philosophy": { topBar: "bg-slate-500/75", acText: "text-slate-500", acBg: "bg-slate-500", chipHover: "hover:border-slate-500 hover:text-slate-500 hover:bg-slate-500/3", arrowText: "text-slate-500", lineageText: "text-slate-500" },
  "school-german-idealism":  { topBar: "bg-slate-500/75",  acText: "text-slate-500", acBg: "bg-slate-500",  chipHover: "hover:border-slate-500 hover:text-slate-500 hover:bg-slate-500/3",  arrowText: "text-slate-500", lineageText: "text-slate-500" },
  "school-existentialism":   { topBar: "bg-slate-500/75",  acText: "text-slate-500", acBg: "bg-slate-500",  chipHover: "hover:border-slate-500 hover:text-slate-500 hover:bg-slate-500/3",  arrowText: "text-slate-500", lineageText: "text-slate-500" },
  "school-analytic-philosophy": { topBar: "bg-slate-500/75", acText: "text-slate-500", acBg: "bg-slate-500", chipHover: "hover:border-slate-500 hover:text-slate-500 hover:bg-slate-500/3", arrowText: "text-slate-500", lineageText: "text-slate-500" },
};

const FALLBACK_SCHOOL_COLORS = SCHOOL_COLORS["school-socratic-method"];

export default function SchoolsGrid({ schools }: Props) {
  if (schools.length === 0) {
    return <div className="px-4 md:px-12 py-10 md:py-24 text-slate-500 dark:text-stone-400 font-serif italic">No schools of thought found.</div>;
  }

  return (
    <div className="pt-[80px] min-h-screen bg-stone-50 dark:bg-stone-900">
      <div className="px-4 md:px-14 pt-[52px] pb-10 border-b border-zinc-200 dark:border-zinc-700">
        <div className="font-sans text-xs md:text-[10px] font-medium tracking-widest text-amber-800 dark:text-amber-600 mb-3.5">Schools of Thought</div>
        <h1 className="font-serif italic font-normal leading-tight text-zinc-950 dark:text-stone-100 mb-4 text-[clamp(2rem,4vw,3rem)]">The Lineage of Ideas</h1>
        <p className="font-sans text-sm leading-[1.8] text-slate-500 dark:text-stone-400 max-w-[52ch]">
          Philosophy does not advance in isolation — each school emerges from, reacts against, and reshapes what came before.
          Here the chain of ideas is traced from ancient Athens to the twentieth century.
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(380px,100%),1fr))] gap-[1.5px] bg-zinc-200 dark:bg-zinc-700">
        {schools.map((school, idx) => (
          <motion.div key={school._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07, duration: 0.45, ease: "easeOut" }} className="bg-stone-50 dark:bg-stone-900">
            <SchoolCard school={school} colors={SCHOOL_COLORS[school._id] ?? FALLBACK_SCHOOL_COLORS} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SchoolCard({ school, colors: c }: { school: SchoolWithPhilosophers; colors: SchoolColors }) {
  return (
    <div className="p-5 md:p-10 h-full flex flex-col gap-6 relative overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${c.topBar}`} />

      <div>
        <div className={`font-sans text-xs md:text-[10px] font-medium tracking-widest ${c.acText} mb-2.5`}>{school.eraRange}</div>
        <h2 className="font-serif text-2xl font-medium leading-[1.15] text-zinc-950 dark:text-stone-100">{school.title}</h2>
      </div>

      <p className="font-sans text-sm leading-[1.8] text-slate-500 dark:text-stone-400">{school.description}</p>

      <div>
        <SectionLabel>Core Ideas</SectionLabel>
        <ul className="list-none flex flex-col gap-2">
          {school.coreIdeas.map((idea, i) => (
            <li key={i} className="flex gap-2.5 items-start">
              <span className={`shrink-0 rounded-full mt-[7px] w-[5px] h-[5px] ${c.acBg} opacity-70`} />
              <span className="font-sans text-xs leading-[1.65] text-slate-500 dark:text-stone-400">{idea}</span>
            </li>
          ))}
        </ul>
      </div>

      {school.philosophers.length > 0 && (
        <div>
          <SectionLabel>Key Thinkers</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {school.philosophers.map((p) => <PhilosopherChip key={p._id} philosopher={p} chipHover={c.chipHover} />)}
          </div>
        </div>
      )}

      {(school.influencedBy.length > 0 || school.influencedTo.length > 0) && (
        <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-700">
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
    <div className="font-sans text-xs md:text-[10px] font-medium tracking-widest text-slate-500 dark:text-stone-400 opacity-[0.65] mb-2.5 flex items-center gap-2.5">
      <span className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />{children}<span className="flex-3 h-px bg-zinc-200 dark:bg-zinc-700" />
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
      className={`flex items-center gap-1.5 pl-[5px] pr-[10px] py-1 border border-zinc-200 dark:border-zinc-700 rounded-full text-xs font-sans text-zinc-950 dark:text-stone-100 no-underline bg-transparent transition-[border-color,color,background] duration-200 ${chipHover}`}
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
    <div className="flex items-baseline gap-2.5 flex-wrap">
      <span className={`font-sans text-xs ${arrowText} opacity-70 shrink-0`}>{direction === "from" ? "←" : "→"}</span>
      <span className="font-sans text-xs md:text-[10px] font-medium tracking-widest text-slate-500 dark:text-stone-400 opacity-60 shrink-0">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {schools.map((s, i) => (
          <span key={s._id} className="flex items-center gap-1.5">
            <span className={`font-serif italic text-sm ${lineageText}`}>{s.title}</span>
            {i < schools.length - 1 && <span className="font-sans text-xs text-slate-500 dark:text-stone-400 opacity-40">&amp;</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
