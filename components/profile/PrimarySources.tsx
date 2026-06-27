"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";

type Source = { title: string; url: string; description: string; excerpt: string };

export default function PrimarySources({ sources, philosopherName }: { sources: Source[]; philosopherName: string }) {
  const { isSignedIn } = useAuth();
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  if (sources.length === 0) return null;

  const handleCopyExcerpt = async (excerpt: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(excerpt);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch { /* clipboard not available */ }
  };

  return (
    <section className="mt-14">
      <h2 className="font-cinzel text-[0.65rem] tracking-widest uppercase text-slate-500 dark:text-stone-400 mb-7 pb-3 border-b border-zinc-950/[0.07] dark:border-stone-100/[0.07]">
        Primary Sources
      </h2>

      <div className="space-y-5">
        {sources.map((source, i) => (
          <div key={i} className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-serif italic text-base font-medium text-zinc-950 dark:text-stone-100 mb-1">
                    {source.title}
                  </h3>
                  {source.description && (
                    <p className="font-sans text-sm text-slate-500 dark:text-stone-400 leading-relaxed">
                      {source.description}
                    </p>
                  )}
                </div>
                {source.url && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-sans font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    Read
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                )}
              </div>
            </div>

            {source.excerpt && (
              <div className="px-5 py-3 bg-zinc-950/3 dark:bg-stone-100/3 border-t border-zinc-200 dark:border-zinc-800">
                <p className="font-serif italic text-sm leading-relaxed text-zinc-950/80 dark:text-stone-100/80 mb-2">
                  &ldquo;{source.excerpt}&rdquo;
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-sans tracking-wider text-slate-500 dark:text-stone-500 uppercase">
                    — {philosopherName}
                  </span>
                  {isSignedIn && (
                    <button
                      onClick={() => handleCopyExcerpt(source.excerpt, i)}
                      className="ml-auto text-[10px] font-sans tracking-wider text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-stone-100 transition-colors cursor-pointer"
                    >
                      {copiedIdx === i ? "Copied!" : "Copy excerpt"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
