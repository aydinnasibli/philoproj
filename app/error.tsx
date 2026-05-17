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
    <div className="min-h-screen flex flex-col items-center justify-center font-serif bg-canvas gap-6 text-center p-8">
      <div className="font-sans text-[8px] font-bold tracking-[0.28em] uppercase text-accent">
        Something went wrong
      </div>
      <h2 className="italic text-[clamp(1.8rem,4vw,3rem)] font-normal text-ink leading-[1.1]">
        The manuscript could not be loaded
      </h2>
      <p className="font-sans text-[0.9rem] text-ink-muted max-w-[42ch] leading-[1.7]">
        An unexpected error occurred. You can try again or return to the network.
      </p>
      <div className="flex gap-6 items-center">
        <button
          onClick={reset}
          className="font-sans text-[9px] font-bold tracking-[0.2em] uppercase text-accent bg-transparent border-b border-current pb-[2px] cursor-pointer"
        >
          Try again
        </button>
        <Link href="/" className="font-sans text-[9px] font-bold tracking-[0.2em] uppercase text-ink-muted border-b border-current pb-[2px]">
          Return to Network
        </Link>
      </div>
    </div>
  );
}
