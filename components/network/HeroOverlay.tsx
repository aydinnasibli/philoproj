"use client";

interface Props { onEnter: () => void | Promise<void>; }

export default function HeroOverlay({ onEnter }: Props) {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center cursor-default bg-[radial-gradient(ellipse_at_40%_50%,var(--color-stone-50)_0%,var(--color-stone-100)_55%,var(--color-stone-200)_100%)] dark:bg-[radial-gradient(ellipse_at_40%_50%,var(--color-stone-900)_0%,var(--color-stone-900)_55%,var(--color-stone-950)_100%)]"
    >
      {/* Subtle radial glow */}
      <div className="absolute pointer-events-none top-[45%] left-1/2 w-[70vw] h-[70vw] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse,color-mix(in_srgb,var(--color-zinc-950)_4%,transparent)_0%,transparent_65%)]" />

      {/* Content */}
      <div className="text-center relative z-2 max-w-170 px-5 md:px-10">

        <div
          className="animate-fade-up font-sans text-xs font-bold tracking-[0.30em] uppercase text-zinc-600 dark:text-zinc-400 mb-7"
          style={{ animationDelay: "0.2s", animationDuration: "0.9s" }}
        >
          A Living Map of Thought
        </div>

        <h1
          className="animate-fade-up font-serif font-medium italic leading-none text-zinc-950 dark:text-stone-100 tracking-[-0.02em] mb-7 text-[clamp(3rem,7vw,5.5rem)]"
          style={{ animationDelay: "0.4s", animationDuration: "1.1s" }}
        >
          The Living<br />Manuscript
        </h1>

        <div
          className="flex items-center justify-center gap-4 mb-7 animate-[scale-x-in_0.9s_cubic-bezier(0.22,1,0.36,1)_both]"
          style={{ animationDelay: "0.7s" }}
        >
          <div className="flex-1 max-w-20 h-px bg-linear-to-r from-transparent to-zinc-600/35" />
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 dark:bg-zinc-400 opacity-70" />
          <div className="flex-1 max-w-20 h-px bg-linear-to-l from-transparent to-zinc-600/35" />
        </div>

        <p
          className="animate-fade-up font-serif italic text-lg leading-loose text-slate-500 dark:text-stone-400 mx-auto mb-13 max-w-full md:max-w-120"
          style={{ animationDelay: "0.85s", animationDuration: "0.9s" }}
        >
          Trace the lineage, ideas, and connections of history&rsquo;s greatest thinkers — from Socrates to Wittgenstein.
        </p>

        <button
          className="animate-fade-up font-cinzel text-[0.7rem] tracking-[0.25em] uppercase text-stone-50 bg-zinc-950 border-none rounded-xs px-6 md:px-10 py-4 cursor-pointer inline-flex items-center gap-3 shadow-[0_8px_32px_rgba(9,9,11,0.2),0_2px_8px_rgba(9,9,11,0.1)] transition-[colors,transform] duration-180 hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98]"
          style={{ animationDelay: "1.1s", animationDuration: "0.9s" }}
          onClick={onEnter}
        >
          Enter the Network
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>

        <div
          className="animate-fade-in font-sans text-xs font-medium tracking-widest uppercase text-slate-500 dark:text-stone-400 opacity-50 mt-7"
          style={{ animationDelay: "1.5s" }}
        >
          10 Thinkers · 4 Eras · Centuries of Thought
        </div>
      </div>

      <div
        className="animate-fade-in absolute bottom-[max(2.5rem,calc(4.5rem+env(safe-area-inset-bottom)))] md:bottom-10 font-serif italic text-xs text-slate-500 dark:text-stone-400 opacity-40 tracking-wider"
        style={{ animationDelay: "1.6s" }}
      >
        &ldquo;The unexamined life is not worth living.&rdquo; — Socrates
      </div>
    </div>
  );
}
