"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { FullPhilosopher } from "@/lib/types";

type Person = FullPhilosopher["mentors"][number];

function MiniAvatar({ person }: { person: Person }) {
  return (
    <Link href={`/philosophers/${person.slug}`} className="flex items-center gap-[10px] py-2 border-b border-border-pale no-underline group">
      <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border-2 border-border transition-[border-color] duration-200 group-hover:border-accent">
        {person.avatarUrl ? (
          <Image src={person.avatarUrl} alt={person.name} fill sizes="44px" className="object-cover" />
        ) : (
          <div className="w-full h-full bg-canvas-warm flex items-center justify-center font-serif text-[14px] text-ink-muted">
            {person.name[0]}
          </div>
        )}
      </div>
      <div>
        <span className="font-serif italic text-[0.9rem] text-ink block leading-[1.2]">{person.name}</span>
        {person.coreBranch && (
          <span className="font-sans text-[10px] text-ink-muted tracking-[0.06em] uppercase font-semibold block mt-[2px]">
            {person.coreBranch}
          </span>
        )}
      </div>
    </Link>
  );
}

function SidebarSection({ label, people }: { label: string; people: Person[] }) {
  if (people.length === 0) return null;
  return (
    <div className="mb-8">
      <p className="font-sans text-[10px] font-bold tracking-[0.18em] uppercase text-(--era-col) mb-4 pb-2 border-b border-b-(--era-col-25)">
        {label}
      </p>
      <div>{people.map((p) => <MiniAvatar key={p._id} person={p} />)}</div>
    </div>
  );
}

export default function ContextSidebar({ philosopher }: { philosopher: FullPhilosopher }) {
  function fmtYear(y: number) { return y < 0 ? `${Math.abs(y)} BC` : `${y} AD`; }

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
      data-era={philosopher.eraId}
    >
      {/* Info card */}
      <div className="border border-border border-t-[3px] border-t-(--era-col) p-6 mb-8 bg-canvas-warm">
        <p className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-ink-muted mb-4">At a Glance</p>

        {philosopher.eraTitle && (
          <div className="mb-3">
            <span className="font-sans text-[10px] text-ink-muted uppercase tracking-widest font-semibold">Era</span>
            <p className="font-serif italic text-[0.9rem] text-ink mt-[2px]">{philosopher.eraTitle}</p>
          </div>
        )}
        {(philosopher.birthYear || philosopher.deathYear) && (
          <div className="mb-3">
            <span className="font-sans text-[10px] text-ink-muted uppercase tracking-widest font-semibold">Lifespan</span>
            <p className="font-sans text-[0.875rem] text-ink mt-[2px]">
              {philosopher.birthYear ? fmtYear(philosopher.birthYear) : "?"}
              {" – "}
              {philosopher.deathYear ? fmtYear(philosopher.deathYear) : "present"}
            </p>
          </div>
        )}
        {philosopher.coreBranch && (
          <div>
            <span className="font-sans text-[10px] text-ink-muted uppercase tracking-widest font-semibold">Branch</span>
            <p className="font-sans text-[0.875rem] text-ink mt-[2px]">{philosopher.coreBranch}</p>
          </div>
        )}
      </div>

      <SidebarSection label="Mentors"  people={philosopher.mentors}  />
      <SidebarSection label="Students" people={philosopher.students} />

      <div className="border-t border-border pt-6 flex flex-col gap-[10px]">
        <Link href="/philosophers" className="font-sans text-[11px] font-semibold tracking-[0.12em] uppercase text-ink-muted flex items-center gap-[6px] transition-colors duration-150 hover:text-accent no-underline">
          ← Back to Archive
        </Link>
        <Link href="/" className="font-sans text-[11px] font-semibold tracking-[0.12em] uppercase text-ink-muted flex items-center gap-[6px] transition-colors duration-150 hover:text-accent no-underline">
          ⊕ View Network
        </Link>
      </div>
    </motion.div>
  );
}
