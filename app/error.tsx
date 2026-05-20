"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center font-serif bg-stone-50 dark:bg-stone-900 gap-6 text-center p-8">
      <div className="font-sans text-xs font-bold tracking-[0.28em] uppercase text-zinc-700 dark:text-zinc-400">
        Something went wrong
      </div>
      <h2 className="italic text-[clamp(1.8rem,4vw,3rem)] font-normal text-zinc-950 dark:text-stone-100 leading-tight">
        The manuscript could not be loaded
      </h2>
      <p className="font-sans text-sm text-slate-500 dark:text-stone-400 max-w-[42ch] leading-relaxed">
        An unexpected error occurred. You can try again or return to the network.
      </p>
      <div className="flex gap-6 items-center">
        <button
          onClick={reset}
          className="font-sans text-xs font-bold tracking-widest uppercase text-zinc-700 dark:text-zinc-400 bg-transparent border-b border-current pb-0.5 cursor-pointer"
        >
          Try again
        </button>
        <Link href="/" className="font-sans text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-stone-400 border-b border-current pb-0.5">
          Return to Network
        </Link>
      </div>
    </div>
  );
}
