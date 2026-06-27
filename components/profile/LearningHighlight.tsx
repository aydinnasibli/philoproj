"use client";

type Work = { title: string; year: number; synopsis: string };
type Props = | { type: "works"; works: Work[] } | { type: "takeaways"; takeaways: string[] };

function BookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function LightbulbIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
      <path d="M9 21h6" />
      <path d="M12 3a6 6 0 0 1 6 6c0 2.22-1.21 4.16-3 5.2V17H9v-2.8A6.002 6.002 0 0 1 6 9a6 6 0 0 1 6-6z" />
    </svg>
  );
}

export default function LearningHighlight(props: Props) {
  if (props.type === "works") {
    return (
      <section className="animate-fade-up mt-12">
        <div className="bg-zinc-700/7 dark:bg-zinc-500/10 border border-zinc-700/15 dark:border-zinc-500/15 p-4 md:p-8">
          <div className="flex items-center gap-2 mb-6 text-zinc-700 dark:text-zinc-400">
            <BookIcon />
            <span className="font-sans text-xs font-medium tracking-widest">Important Works</span>
          </div>
          <div className="flex flex-col gap-5">
            {props.works.map((work, i) => (
              <div key={i} className={`animate-fade-up ${i < props.works.length - 1 ? "border-b border-zinc-700/12 dark:border-zinc-500/12 pb-5" : ""}`} style={{ animationDelay: `${0.05 + i * 0.07}s` }}>
                <div className="flex flex-wrap justify-between items-baseline gap-3">
                  <h4 className="font-serif italic text-base font-normal text-zinc-950 dark:text-stone-100">{work.title}</h4>
                  {work.year && (
                    <span className="font-sans text-xs text-slate-500 dark:text-stone-400 shrink-0">
                      {work.year < 0 ? `${Math.abs(work.year)} BC` : work.year}
                    </span>
                  )}
                </div>
                {work.synopsis && (
                  <p className="font-serif text-lg leading-[1.75] text-slate-500 dark:text-stone-400 mt-1">{work.synopsis}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="animate-fade-up mt-8">
      <div className="bg-zinc-700/7 dark:bg-zinc-500/10 border border-zinc-700/15 dark:border-zinc-500/15 p-4 md:p-8">
        <div className="flex items-center gap-2 mb-5 text-zinc-700 dark:text-zinc-400">
          <LightbulbIcon />
          <span className="font-sans text-xs font-medium tracking-widest">Key Takeaways</span>
        </div>
        <ul className="flex flex-col gap-2.5 list-none">
          {props.takeaways.map((point, i) => (
            <li key={i} className="animate-fade-up flex gap-3 items-start" style={{ animationDelay: `${0.05 + i * 0.07}s` }}>
              <span className="inline-block w-[6px] h-[6px] rounded-full bg-zinc-700 dark:bg-zinc-500 shrink-0 mt-2" />
              <span className="font-serif text-lg leading-[1.75] text-slate-500 dark:text-stone-400">{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
