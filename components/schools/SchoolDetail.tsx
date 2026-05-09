"use client";

import Image from "next/image";
import Link from "next/link";
import type { SchoolWithPhilosophers } from "@/lib/types";

function HoverLink({ href, children, dir }: { href: string; children: React.ReactNode; dir?: "left" | "right" }) {
  return (
    <Link href={href} className="font-sans text-[0.72rem] text-ink-muted no-underline px-3 py-[5px] border border-[rgba(17,21,26,0.1)] rounded-sm transition-[border-color,color] duration-200 hover:border-[rgba(132,84,0,0.3)] hover:text-accent inline-block">
      {dir === "left" && "← "}{children}{dir === "right" && " →"}
    </Link>
  );
}

export default function SchoolDetail({ school }: { school: SchoolWithPhilosophers }) {
  return (
    <div className="min-h-screen pl-[80px]">
      <div className="max-w-[820px] mx-auto px-12 pt-16 pb-24">

        <Link href="/schools" className="flex items-center gap-[6px] w-fit font-sans text-[0.7rem] font-semibold tracking-[0.14em] uppercase text-ink-muted no-underline mb-11 opacity-60 transition-[color,opacity] duration-180 hover:text-accent hover:opacity-100">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Schools
        </Link>

        <div className="inline-block font-sans text-[7px] font-bold tracking-[0.22em] uppercase text-accent bg-[rgba(132,84,0,0.08)] border border-[rgba(132,84,0,0.2)] px-[10px] py-1 rounded-sm mb-4">
          {school.eraRange}
        </div>

        <h1 className="font-serif italic font-normal text-ink leading-[1.08] tracking-[-0.01em] m-0 mb-7 text-[clamp(2.4rem,5vw,3.6rem)]">
          {school.title}
        </h1>

        <div className="flex items-center gap-3 mb-9">
          <div className="flex-1 h-px bg-[linear-gradient(to_right,rgba(132,84,0,0.2),transparent)]" />
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <circle cx="4" cy="4" r="1.5" fill="rgba(132,84,0,0.5)" />
            <circle cx="4" cy="4" r="3.5" stroke="rgba(132,84,0,0.2)" strokeWidth="0.75" fill="none" />
          </svg>
          <div className="flex-1 h-px bg-[linear-gradient(to_left,rgba(132,84,0,0.2),transparent)]" />
        </div>

        <p className="font-sans text-[0.88rem] leading-[1.85] text-ink-muted mb-12">{school.description}</p>

        {school.coreIdeas.length > 0 && (
          <div className="mb-12">
            <div className="font-sans text-[8px] font-bold tracking-[0.22em] uppercase text-ink-muted mb-[18px] pb-[10px] border-b border-[rgba(17,21,26,0.07)]">Core Ideas</div>
            <div className="flex flex-col gap-3">
              {school.coreIdeas.map((idea, i) => (
                <div key={i} className="flex gap-[14px] items-start">
                  <div className="w-1 h-1 rounded-full bg-accent shrink-0 mt-2 opacity-55" />
                  <span className="font-sans text-[0.82rem] leading-[1.72] text-ink-muted">{idea}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {(school.influencedBy.length > 0 || school.influencedTo.length > 0) && (
          <div className="flex gap-8 mb-12">
            {school.influencedBy.length > 0 && (
              <div className="flex-1">
                <div className="font-sans text-[8px] font-bold tracking-[0.22em] uppercase text-ink-muted mb-3 pb-[10px] border-b border-[rgba(17,21,26,0.07)]">Received From</div>
                <div className="flex flex-wrap gap-[6px]">{school.influencedBy.map(s => <HoverLink key={s._id} href={`/schools/${s.slug}`} dir="left">{s.title}</HoverLink>)}</div>
              </div>
            )}
            {school.influencedTo.length > 0 && (
              <div className="flex-1">
                <div className="font-sans text-[8px] font-bold tracking-[0.22em] uppercase text-ink-muted mb-3 pb-[10px] border-b border-[rgba(17,21,26,0.07)]">Passed Forward</div>
                <div className="flex flex-wrap gap-[6px]">{school.influencedTo.map(s => <HoverLink key={s._id} href={`/schools/${s.slug}`} dir="right">{s.title}</HoverLink>)}</div>
              </div>
            )}
          </div>
        )}

        {school.philosophers.length > 0 && (
          <div>
            <div className="font-sans text-[8px] font-bold tracking-[0.22em] uppercase text-ink-muted mb-[18px] pb-[10px] border-b border-[rgba(17,21,26,0.07)]">Key Thinkers</div>
            <div className="flex flex-col gap-[2px]">
              {school.philosophers.map(p => (
                <Link key={p._id} href={`/philosophers/${p.slug}`}
                  className="flex items-center gap-[14px] px-4 py-[14px] no-underline bg-[rgba(253,250,245,0.6)] border border-[rgba(17,21,26,0.05)] transition-[background,border-color] duration-200 hover:bg-[rgba(253,250,245,1)] hover:border-[rgba(132,84,0,0.15)]"
                >
                  <div className="relative w-[42px] h-[42px] rounded-full shrink-0 overflow-hidden bg-[rgba(132,84,0,0.1)] border border-[rgba(132,84,0,0.2)]">
                    {p.avatarUrl ? (
                      <Image src={p.avatarUrl} alt={p.name} fill sizes="42px" className="object-cover [filter:sepia(30%)_grayscale(0.2)]" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-serif italic text-[1.1rem] text-accent">{p.name[0]}</div>
                    )}
                  </div>
                  <div>
                    <div className="font-serif text-[0.95rem] text-ink font-medium mb-[2px]">{p.name}</div>
                    <div className="font-sans text-[0.68rem] text-ink-muted">{p.coreBranch}</div>
                  </div>
                  <div className="ml-auto font-sans text-[0.68rem] text-[rgba(132,84,0,0.5)]">View →</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
