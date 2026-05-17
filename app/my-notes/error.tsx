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
    <div className="flex h-screen items-center justify-center flex-col gap-4 text-center p-10" style={{ backgroundColor: "var(--mn-bg)" }}>
      <div className="font-cinzel text-[28px] tracking-[.3em]" style={{ color: "var(--mn-border)" }}>✦</div>
      <div className="font-cormorant text-[20px] italic max-w-[360px] leading-[1.7]" style={{ color: "var(--mn-ink-3)" }}>
        Something went wrong loading your manuscript.
      </div>
      {error.digest && (
        <div className="font-mono text-[10px]" style={{ color: "var(--mn-border2)" }}>{error.digest}</div>
      )}
      <button
        onClick={reset}
        className="mt-2 bg-transparent py-2 px-6 text-[10px] font-cinzel tracking-[.12em] cursor-pointer rounded-[2px] transition-all duration-150"
        style={{
          border: "1px solid var(--mn-border)",
          color: "var(--mn-ink-3)",
        }}
        onMouseOver={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--mn-gold)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--mn-gold)";
        }}
        onMouseOut={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--mn-border)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--mn-ink-3)";
        }}
      >
        Try again
      </button>
    </div>
  );
}
