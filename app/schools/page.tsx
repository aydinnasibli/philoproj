import type { Metadata } from "next";
import { Suspense } from "react";
import SchoolsData from "./SchoolsData";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://thelivingmanuscript.com";
const TITLE = "Schools of Thought";
const DESCRIPTION =
  "The great philosophical traditions of Western thought — from Stoicism and Platonism to Existentialism and Analytic Philosophy.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/schools" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    url: `${BASE}/schools`,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const DELAYS = [
  "",
  "[animation-delay:0.08s]",
  "[animation-delay:0.16s]",
  "[animation-delay:0.24s]",
  "[animation-delay:0.32s]",
  "[animation-delay:0.40s]",
  "[animation-delay:0.48s]",
  "[animation-delay:0.56s]",
] as const;

function SchoolsGridSkeleton() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-[2px]">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className={`h-[170px] rounded-sm bg-[rgba(17,21,26,0.06)] animate-sk-pulse ${DELAYS[i]}`}
        />
      ))}
    </div>
  );
}

export default function SchoolsPage() {
  return (
    <div className="min-h-screen pl-[80px]">
      <div className="max-w-[1100px] mx-auto px-12 pt-16 pb-24">
        <div className="mb-14">
          <h1 className="font-serif italic font-normal text-ink leading-[1.1] tracking-[-0.01em] m-0 text-[clamp(2.2rem,4vw,3.2rem)]">
            Schools of Thought
          </h1>
          <div className="h-px bg-[linear-gradient(to_right,rgba(132,84,0,0.2),transparent)] mt-6" />
        </div>
        <Suspense fallback={<SchoolsGridSkeleton />}>
          <SchoolsData />
        </Suspense>
      </div>
    </div>
  );
}
