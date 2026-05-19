import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Not Found" };

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center font-serif gap-6 text-center p-8">
      <div className="font-sans text-xs font-bold tracking-[0.28em] uppercase text-amber-800 dark:text-amber-600">
        404
      </div>
      <h1 className="italic text-[clamp(2rem,5vw,3.5rem)] font-normal text-zinc-950 dark:text-stone-100 leading-tight m-0">
        This page has been lost to history
      </h1>
      <p className="font-sans text-sm text-slate-500 dark:text-stone-400 max-w-[40ch] leading-relaxed m-0">
        The entry you were looking for could not be found in the manuscript.
      </p>
      <Link href="/" className="font-sans text-xs font-bold tracking-widest uppercase text-amber-800 dark:text-amber-600 no-underline border-b border-current pb-0.5">
        Return to the Network
      </Link>
    </div>
  );
}
