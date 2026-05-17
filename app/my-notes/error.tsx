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
    <div className="flex h-screen items-center justify-center bg-[#f2ece0] flex-col gap-4 text-center p-10">
      <div className="font-cinzel text-[28px] text-[#ddd5c2] tracking-[.3em]">✦</div>
      <div className="font-cormorant text-[20px] italic text-[#9a8a70] max-w-[360px] leading-[1.7]">
        Something went wrong loading your manuscript.
      </div>
      {error.digest && (
        <div className="font-mono text-[10px] text-[#ccc0a8]">{error.digest}</div>
      )}
      <button
        onClick={reset}
        className="mt-2 bg-transparent border border-[#ddd5c2] text-[#9a8a70] py-2 px-6 text-[10px] font-cinzel tracking-[.12em] cursor-pointer rounded-[2px] transition-all duration-150 hover:border-[#b87c28] hover:text-[#b87c28]"
      >
        Try again
      </button>
    </div>
  );
}
