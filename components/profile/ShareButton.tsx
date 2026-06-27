"use client";

import { useState, useCallback } from "react";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://thelivingmanuscript.com";

export default function ShareButton({ slug, name }: { slug: string; name: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const url = `${BASE}/philosophers/${slug}`;
    const title = `${name} — The Living Manuscript`;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }, [slug, name]);

  return (
    <button
      onClick={handleShare}
      aria-label={copied ? "Link copied" : `Share ${name}`}
      className="touch-target cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-950/5 dark:bg-stone-100/5 border border-zinc-950/10 dark:border-stone-100/10 text-slate-500 dark:text-stone-400 hover:text-zinc-950 dark:hover:text-stone-100 hover:border-zinc-950/20 dark:hover:border-stone-100/20 transition-colors duration-200 text-xs font-sans tracking-wider"
    >
      {copied ? (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          Share
        </>
      )}
    </button>
  );
}
