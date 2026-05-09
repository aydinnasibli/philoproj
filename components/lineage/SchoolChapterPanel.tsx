"use client";

import Image from "next/image";
import { useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { SchoolWithPhilosophers } from "@/lib/types";

type Props = { school: SchoolWithPhilosophers | null; allSchools: SchoolWithPhilosophers[]; onClose: () => void; onNavigate: (id: string) => void; };

function Divider() {
  return (
    <div className="flex items-center gap-[10px] my-[22px]">
      <div className="flex-1 h-px bg-[linear-gradient(to_right,var(--a-40),transparent)]" />
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
        <circle cx="4" cy="4" r="1.5" className="fill-(--ac)" opacity={0.5} />
        <circle cx="4" cy="4" r="3.5" className="stroke-(--ac)" strokeWidth="0.6" fill="none" opacity={0.3} />
      </svg>
      <div className="flex-1 h-px bg-[linear-gradient(to_left,var(--a-40),transparent)]" />
    </div>
  );
}

export default function SchoolChapterPanel({ school, onClose, onNavigate }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {school && (
        <motion.aside
          key={school._id}
          data-panel="true"
          data-school={school._id}
          initial={{ x: 440, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 440, opacity: 0 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="fixed right-0 top-0 bottom-0 w-[420px] z-60 overflow-y-auto overflow-x-hidden flex flex-col bg-[rgba(253,250,245,0.98)] backdrop-blur-[28px] border-l-[3px] border-l-(--ac) shadow-[-24px_0_72px_rgba(17,21,26,0.13)]"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 px-6 pt-[18px] pb-[14px] flex items-start justify-between bg-[rgba(253,250,245,0.96)] backdrop-blur-[20px] border-b border-b-(--a-20)">
            <div>
              <div className="inline-block font-sans text-[7px] font-bold tracking-[0.22em] uppercase text-(--ac) bg-(--a-14) border border-(--a-30) px-[9px] py-[3px] rounded-[2px] mb-[9px]">
                {school.eraRange}
              </div>
              <div className="font-serif text-[1.45rem] font-medium text-[#11151a] leading-[1.2] tracking-[-0.01em]">{school.title}</div>
            </div>
            <button onClick={onClose} aria-label="Close panel" className="cursor-pointer bg-transparent border-none text-[rgba(17,21,26,0.35)] text-[1.1rem] px-[6px] py-1 mt-1 leading-none transition-colors duration-200 hover:text-[#11151a]">
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="px-6 pt-6 pb-10 flex-1">
            {school.philosophers[0] && (
              <div className="pl-[14px] mb-[22px] border-l-2 border-l-(--ac)">
                <div className="font-serif italic text-[0.88rem] text-[#43474c] leading-[1.7]">&ldquo;{school.philosophers[0].coreBranch}&rdquo;</div>
                <div className="font-sans text-[7.5px] font-semibold tracking-[0.14em] uppercase text-(--ac) mt-[7px]">— {school.philosophers[0].name}</div>
              </div>
            )}

            <div className="font-sans text-[7.5px] font-bold tracking-[0.22em] uppercase text-(--ac) mb-3">The Story</div>
            <p className="font-sans text-[0.78rem] leading-[1.82] text-[#43474c]">{school.description}</p>

            <Divider />

            <div className="font-sans text-[7.5px] font-bold tracking-[0.22em] uppercase text-(--ac) mb-3">Core Ideas</div>
            <ul className="list-none flex flex-col gap-[9px] mb-1">
              {school.coreIdeas.map((idea, i) => (
                <li key={i} className="flex gap-[10px] items-start">
                  <div className="w-[5px] h-[5px] rounded-full bg-(--ac) opacity-55 mt-[6px] shrink-0" />
                  <span className="font-sans text-[0.745rem] leading-[1.72] text-[#43474c]">{idea}</span>
                </li>
              ))}
            </ul>

            <Divider />

            {school.influencedBy.length > 0 && (
              <>
                <div className="font-sans text-[7.5px] font-bold tracking-[0.22em] uppercase text-(--ac) mb-3">Received From</div>
                <div className="flex flex-wrap gap-[7px] mb-[18px]">
                  {school.influencedBy.map(s => (
                    <button key={s._id} onClick={() => onNavigate(s._id)}
                      className="flex items-center gap-[6px] px-3 py-[6px] rounded-[3px] cursor-pointer font-sans text-[0.72rem] text-[#43474c] transition-all duration-200 bg-(--a-0d) border border-(--a-30) hover-accent-strong"
                    >
                      <span className="text-[0.6rem] opacity-60">←</span>{s.title}
                    </button>
                  ))}
                </div>
              </>
            )}

            {school.influencedTo.length > 0 && (
              <>
                <div className="font-sans text-[7.5px] font-bold tracking-[0.22em] uppercase text-(--ac) mb-3">Passed Forward</div>
                <div className="flex flex-wrap gap-[7px] mb-[22px]">
                  {school.influencedTo.map(s => (
                    <button key={s._id} onClick={() => onNavigate(s._id)}
                      className="flex items-center gap-[6px] px-3 py-[6px] rounded-[3px] cursor-pointer font-sans text-[0.72rem] text-[#43474c] transition-all duration-200 bg-(--a-0d) border border-(--a-30) hover-accent-strong"
                    >
                      {s.title}<span className="text-[0.6rem] opacity-60">→</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            <Divider />

            {school.philosophers.length > 0 && (
              <>
                <div className="font-sans text-[7.5px] font-bold tracking-[0.22em] uppercase text-(--ac) mb-3">Thinkers of This Era</div>
                <div className="flex flex-col gap-[10px]">
                  {school.philosophers.map(p => (
                    <Link key={p._id} href={`/philosophers/${p.slug}`}
                      className="flex items-center gap-3 px-3 py-[10px] rounded-[4px] no-underline transition-[background,border-color] duration-200 border border-[rgba(17,21,26,0.07)] bg-[rgba(17,21,26,0.025)] hover:bg-(--a-10) hover:border-(--a-30)"
                    >
                      <div className="relative w-10 h-10 rounded-full shrink-0 overflow-hidden flex items-center justify-center border-[1.5px] border-(--a-40) bg-(--a-18)">
                        {p.avatarUrl ? (
                          <Image src={p.avatarUrl} alt={p.name} fill sizes="40px" className="object-cover [filter:grayscale(0.5)_sepia(0.25)]" />
                        ) : (
                          <span className="font-serif italic text-base text-(--ac)">{p.name.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-serif text-[0.9rem] text-[#11151a] font-medium">{p.name}</div>
                        <div className="font-sans text-[0.68rem] text-[#5F6A78] mt-[2px]">{p.coreBranch}</div>
                      </div>
                      <div className="ml-auto font-sans text-[10px] text-(--ac) opacity-60">View →</div>
                    </Link>
                  ))}
                </div>
              </>
            )}

            <Divider />

            <Link href={`/schools/${school.slug}`}
              className="inline-flex items-center gap-2 px-[18px] py-[10px] rounded-[2px] font-sans text-[0.7rem] font-bold tracking-[0.16em] uppercase text-(--ac) no-underline border border-(--a-40) transition-[background] duration-200 hover:bg-(--a-10)"
            >
              View full tradition
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
