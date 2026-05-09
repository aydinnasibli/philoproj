"use client";

import { motion } from "framer-motion";

type Work = { title: string; year: number; synopsis: string };
type Props = | { type: "works"; works: Work[] } | { type: "takeaways"; takeaways: string[] };

function BookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-[2px]">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function LightbulbIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-[2px]">
      <path d="M9 21h6" />
      <path d="M12 3a6 6 0 0 1 6 6c0 2.22-1.21 4.16-3 5.2V17H9v-2.8A6.002 6.002 0 0 1 6 9a6 6 0 0 1 6-6z" />
    </svg>
  );
}

export default function LearningHighlight(props: Props) {
  if (props.type === "works") {
    return (
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="mt-12">
        <div className="bg-accent-pale border border-[rgba(139,115,85,0.15)] p-8">
          <div className="flex items-center gap-2 mb-6 text-accent">
            <BookIcon />
            <span className="font-sans text-[10px] font-bold tracking-[0.2em] uppercase">Important Works</span>
          </div>
          <div className="flex flex-col gap-5">
            {props.works.map((work, i) => (
              <div key={i} className={i < props.works.length - 1 ? "border-b border-[rgba(139,115,85,0.12)] pb-5" : ""}>
                <div className="flex justify-between items-baseline gap-3">
                  <h4 className="font-serif italic text-base font-normal text-ink">{work.title}</h4>
                  {work.year && (
                    <span className="font-sans text-[11px] text-ink-muted shrink-0">
                      {work.year < 0 ? `${Math.abs(work.year)} BC` : work.year}
                    </span>
                  )}
                </div>
                {work.synopsis && (
                  <p className="font-sans text-[0.85rem] leading-[1.7] text-ink-muted mt-1">{work.synopsis}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.5 }} className="mt-8">
      <div className="bg-accent-pale border border-[rgba(139,115,85,0.15)] p-8">
        <div className="flex items-center gap-2 mb-5 text-accent">
          <LightbulbIcon />
          <span className="font-sans text-[10px] font-bold tracking-[0.2em] uppercase">Key Takeaways</span>
        </div>
        <ul className="flex flex-col gap-[10px] list-none">
          {props.takeaways.map((point, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="inline-block w-[6px] h-[6px] rounded-full bg-accent shrink-0 mt-2" />
              <span className="font-sans text-[0.875rem] leading-[1.7] text-ink-muted">{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.section>
  );
}
