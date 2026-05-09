"use client";

import Link from "next/link";
import type { SchoolWithPhilosophers } from "@/lib/types";

export default function SchoolCard({ school }: { school: SchoolWithPhilosophers }) {
  return (
    <Link href={`/schools/${school.slug}`} className="no-underline block">
      <div
        className="cursor-pointer bg-[rgba(253,250,245,0.7)] border border-[rgba(17,21,26,0.06)] transition-[background,border-color,transform,box-shadow] duration-220 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[rgba(253,250,245,1)] hover:border-[rgba(132,84,0,0.18)] hover:translate-y-[-3px] hover:shadow-[0_8px_28px_rgba(17,21,26,0.08)]"
        style={{ padding: "28px 28px 24px" }}
      >
        <div className="font-sans text-[7px] font-bold tracking-[0.22em] uppercase text-accent mb-3">
          {school.eraRange}
        </div>
        <div className="font-serif italic text-[1.35rem] font-normal text-ink leading-[1.2] mb-3">
          {school.title}
        </div>
        <p
          className="font-sans text-[0.74rem] leading-[1.72] text-ink-muted m-0 mb-4 overflow-hidden"
          style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" } as React.CSSProperties}
        >
          {school.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex gap-[6px] flex-wrap">
            {school.philosophers.slice(0, 3).map(p => (
              <span key={p._id} className="font-sans text-[0.62rem] text-ink-muted bg-[rgba(17,21,26,0.04)] border border-[rgba(17,21,26,0.07)] px-[7px] py-[2px] rounded-sm">
                {p.name}
              </span>
            ))}
            {school.philosophers.length > 3 && (
              <span className="font-sans text-[0.62rem] text-ink-muted opacity-60 px-1 py-[2px]">
                +{school.philosophers.length - 3}
              </span>
            )}
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(132,84,0,0.5)" strokeWidth="1.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
