"use client";

import Image from "next/image";
import Link from "next/link";
import type { FullPhilosopher } from "@/lib/types";

type Person = FullPhilosopher["mentors"][number];

const ERA_TEXT: Record<string, string> = {
  "era-1": "text-zinc-600/90",
  "era-2": "text-zinc-600/90",
  "era-3": "text-zinc-600/90",
  "era-4": "text-zinc-500/90",
};

const ERA_BORDER_T: Record<string, string> = {
  "era-1": "border-t-zinc-600/90",
  "era-2": "border-t-zinc-600/90",
  "era-3": "border-t-zinc-600/90",
  "era-4": "border-t-zinc-600/90",
};

const ERA_BORDER_B_MUTED: Record<string, string> = {
  "era-1": "border-b-zinc-600/25",
  "era-2": "border-b-zinc-600/25",
  "era-3": "border-b-zinc-600/25",
  "era-4": "border-b-zinc-600/25",
};

function MiniAvatar({ person }: { person: Person }) {
  return (
    <Link href={`/philosophers/${person.slug}`} className="flex items-center gap-2.5 py-2 border-b border-zinc-100 dark:border-zinc-800 no-underline group">
      <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border-2 border-zinc-200 dark:border-zinc-700 transition-[border-color] duration-200 group-hover:border-zinc-700 dark:group-hover:border-zinc-500">
        {person.avatarUrl ? (
          <Image src={person.avatarUrl} alt={person.name} fill sizes="44px" className="object-cover" />
        ) : (
          <div className="w-full h-full bg-stone-100 dark:bg-stone-900 flex items-center justify-center font-serif text-sm text-slate-500 dark:text-stone-400">
            {person.name[0]}
          </div>
        )}
      </div>
      <div>
        <span className="font-serif italic text-sm text-zinc-950 dark:text-stone-100 block leading-snug">{person.name}</span>
        {person.coreBranch && (
          <span className="font-sans text-xs text-slate-500 dark:text-stone-400 tracking-[0.06em] uppercase font-medium block mt-0.5">
            {person.coreBranch}
          </span>
        )}
      </div>
    </Link>
  );
}

function SidebarSection({ label, people, textCls, borderBCls }: {
  label: string; people: Person[]; textCls: string; borderBCls: string;
}) {
  if (people.length === 0) return null;
  return (
    <div className="mb-8">
      <p className={`font-sans text-xs font-medium tracking-widest ${textCls} mb-4 pb-2 border-b ${borderBCls}`}>
        {label}
      </p>
      <div>{people.map((p) => <MiniAvatar key={p._id} person={p} />)}</div>
    </div>
  );
}

export default function ContextSidebar({ philosopher }: { philosopher: FullPhilosopher }) {
  function fmtYear(y: number) { return y < 0 ? `${Math.abs(y)} BC` : `${y} AD`; }

  const textCls    = ERA_TEXT[philosopher.eraId]          ?? "text-zinc-600/90 dark:text-zinc-400/90";
  const borderTCls = ERA_BORDER_T[philosopher.eraId]      ?? "border-t-zinc-600/90";
  const borderBCls = ERA_BORDER_B_MUTED[philosopher.eraId] ?? "border-b-zinc-600/25";

  return (
    <div
      className="animate-fade-up"
      style={{ animationDelay: '0.2s' }}
    >
      {/* Info card */}
      <div className={`border border-zinc-200 dark:border-zinc-700 border-t-[3px] ${borderTCls} p-4 md:p-6 mb-8 bg-stone-100 dark:bg-stone-900`}>
        <p className="font-sans text-xs tracking-widest uppercase font-medium text-slate-500 dark:text-stone-400 mb-4">At a Glance</p>

        {philosopher.eraTitle && (
          <div className="mb-3">
            <span className="font-sans text-xs text-slate-500 dark:text-stone-400 uppercase tracking-widest font-medium">Era</span>
            <p className="font-serif italic text-sm text-zinc-950 dark:text-stone-100 mt-0.5">{philosopher.eraTitle}</p>
          </div>
        )}
        {(philosopher.birthYear || philosopher.deathYear) && (
          <div className="mb-3">
            <span className="font-sans text-xs text-slate-500 dark:text-stone-400 uppercase tracking-widest font-medium">Lifespan</span>
            <p className="font-sans text-sm text-zinc-950 dark:text-stone-100 mt-0.5">
              {philosopher.birthYear ? fmtYear(philosopher.birthYear) : "?"}
              {" – "}
              {philosopher.deathYear ? fmtYear(philosopher.deathYear) : "present"}
            </p>
          </div>
        )}
        {philosopher.coreBranch && (
          <div>
            <span className="font-sans text-xs text-slate-500 dark:text-stone-400 uppercase tracking-widest font-medium">Branch</span>
            <p className="font-sans text-sm text-zinc-950 dark:text-stone-100 mt-0.5">{philosopher.coreBranch}</p>
          </div>
        )}
      </div>

      <SidebarSection label="Mentors"  people={philosopher.mentors}  textCls={textCls} borderBCls={borderBCls} />
      <SidebarSection label="Students" people={philosopher.students} textCls={textCls} borderBCls={borderBCls} />

      <div className="border-t border-zinc-200 dark:border-zinc-700 pt-6 flex flex-col gap-2.5">
        <Link href="/philosophers" className="font-sans text-xs font-medium tracking-widest text-slate-500 dark:text-stone-400 flex items-center gap-1.5 transition-colors duration-150 hover:text-zinc-700 dark:hover:text-zinc-400 no-underline">
          ← Back to Archive
        </Link>
        <Link href="/" className="font-sans text-xs font-medium tracking-widest text-slate-500 dark:text-stone-400 flex items-center gap-1.5 transition-colors duration-150 hover:text-zinc-700 dark:hover:text-zinc-400 no-underline">
          ⊕ View Network
        </Link>
      </div>
    </div>
  );
}
