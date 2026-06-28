import type { Metadata } from "next";
import { getLearningPaths } from "@/sanity/queries";
import PathCard from "@/components/paths/PathCard";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://thelivingmanuscript.com";

export const metadata: Metadata = {
  title: "Learning Paths",
  description: "Curated journeys through connected philosophers and schools of thought.",
  alternates: { canonical: "/paths" },
  openGraph: {
    title: "Learning Paths",
    description: "Curated journeys through connected philosophers and schools of thought.",
    url: `${BASE}/paths`,
  },
};

export default async function PathsPage() {
  const paths = await getLearningPaths();

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-10 pt-8 md:pt-16 pb-12">
      <header className="mb-10">
        <p className="font-cinzel text-[0.65rem] tracking-widest uppercase text-slate-500 dark:text-stone-400 mb-2">
          Guided Study
        </p>
        <h1 className="font-serif italic font-medium text-zinc-950 dark:text-stone-100 tracking-[-0.02em] text-[clamp(2.5rem,6vw,4rem)] leading-[0.95] mb-4">
          Learning Paths
        </h1>
        <p className="font-sans text-base text-slate-500 dark:text-stone-400 max-w-[60ch]">
          Curated journeys through connected philosophers and schools of thought. Each path guides you step by step through a philosophical question or tradition.
        </p>
      </header>

      {paths.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-28 md:py-36">
          <div className="font-cinzel text-3xl tracking-[.3em] text-stone-300 dark:text-stone-700 mb-6">
            ✦
          </div>
          <p className="font-cinzel text-[0.65rem] tracking-widest uppercase text-slate-500 dark:text-stone-400 mb-3">
            In the Making
          </p>
          <p className="font-serif italic text-lg text-slate-500 dark:text-stone-400 max-w-[42ch] leading-relaxed">
            New journeys are being carefully curated. In the meantime, the manuscript is yours to wander.
          </p>
          <div className="flex items-center gap-6 mt-8">
            <a
              href="/schools"
              className="font-cinzel text-[0.7rem] tracking-widest uppercase text-stone-400 dark:text-stone-500 transition-colors duration-150 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Explore Schools
            </a>
            <span className="text-stone-300 dark:text-stone-700">·</span>
            <a
              href="/philosophers"
              className="font-cinzel text-[0.7rem] tracking-widest uppercase text-stone-400 dark:text-stone-500 transition-colors duration-150 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Browse Thinkers
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paths.map((path, i) => (
            <PathCard key={path._id} path={path} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
