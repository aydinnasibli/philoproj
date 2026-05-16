import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Not Found" };

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center font-serif gap-6 text-center p-8">
      <div className="font-sans text-[8px] font-bold tracking-[0.28em] uppercase text-accent">
        404
      </div>
      <h1 className="italic text-[clamp(2rem,5vw,3.5rem)] font-normal text-ink leading-[1.1] m-0">
        This page has been lost to history
      </h1>
      <p className="font-sans text-[0.9rem] text-ink-muted max-w-[40ch] leading-[1.7] m-0">
        The entry you were looking for could not be found in the manuscript.
      </p>
      <Link href="/" className="font-sans text-[9px] font-bold tracking-[0.2em] uppercase text-accent no-underline border-b border-current pb-[2px]">
        Return to the Network
      </Link>
    </div>
  );
}
