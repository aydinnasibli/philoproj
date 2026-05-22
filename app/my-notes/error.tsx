"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function MyNotesError({
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
    <div className="flex h-screen items-center justify-center flex-col gap-4 text-center p-10 bg-stone-100 dark:bg-stone-900">
      <div className="font-cinzel text-3xl tracking-[.3em] text-stone-300 dark:text-stone-700">✦</div>
      <div className="font-serif text-xl italic max-w-[360px] leading-relaxed text-stone-400 dark:text-stone-500">
        Something went wrong loading your manuscript.
      </div>
      {error.digest && (
        <div className="font-mono text-xs text-stone-400 dark:text-stone-600">{error.digest}</div>
      )}
      <button
        onClick={reset}
        className="mt-2 bg-transparent py-2 px-6 text-xs font-cinzel tracking-widest cursor-pointer rounded-xs transition-[color,border-color] duration-150 border border-stone-300 dark:border-stone-700 text-stone-400 dark:text-stone-500 hover:border-zinc-700 dark:hover:border-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-400"
      >
        Try again
      </button>
    </div>
  );
}
