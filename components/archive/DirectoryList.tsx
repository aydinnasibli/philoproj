import type { PhilosopherListItem } from "@/lib/types";
import DirectoryRow from "./DirectoryRow";
import DirectoryListHeader from "./DirectoryListHeader";

type Props = { philosophers: PhilosopherListItem[] };

export default function DirectoryList({ philosophers }: Props) {
  if (philosophers.length === 0) {
    return (
      <div className="min-h-screen pl-0 md:pl-20">
        <div className="max-w-[1100px] mx-auto px-4 md:px-12 pt-16 md:pt-16 pb-24 md:pb-24 text-slate-500 dark:text-stone-400 font-serif italic">
          No philosophers found. Run <code>npm run seed</code>.
        </div>
      </div>
    );
  }

  const grouped = philosophers.reduce<Record<string, PhilosopherListItem[]>>((acc, p) => {
    const letter = p.name[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(p);
    return acc;
  }, {});

  const presentLetters = Object.keys(grouped).sort();

  // Track cumulative index so the first handful of avatars get fetchpriority="high"
  let cumIndex = 0;

  return (
    <div className="min-h-screen pl-0 md:pl-20">
      <div className="max-w-[1100px] mx-auto px-4 md:px-12 pt-16 md:pt-16 pb-24 md:pb-24">
        <DirectoryListHeader count={philosophers.length} />

        <div className="grid grid-cols-[1fr] sm:grid-cols-[1fr_160px] md:grid-cols-[1fr_200px_200px] py-2 border-b border-zinc-200 dark:border-zinc-700 bg-stone-100 dark:bg-stone-950">
          {["Name", "Era", "Branch"].map((h, i) => (
            <span
              key={h}
              className={`font-sans text-xs font-semibold tracking-widest uppercase text-slate-500 dark:text-stone-400 ${i === 1 ? "hidden sm:inline" : i === 2 ? "hidden md:inline" : ""}`}
            >
              {h}
            </span>
          ))}
        </div>

        {presentLetters.map((letter, i) => {
          const group = grouped[letter];
          const letterStart = cumIndex;
          cumIndex += group.length;

          return (
            <div
              key={letter}
              style={{
                animation: `fade-up 0.35s cubic-bezier(0.22, 1, 0.36, 1) ${Math.min(i * 0.03, 0.18)}s both`,
              }}
            >
              <div className="sticky top-0 z-10 bg-stone-100 dark:bg-stone-950 border-b border-t border-zinc-200 dark:border-zinc-700 flex items-center gap-4 overflow-hidden h-14">
                <span
                  aria-hidden="true"
                  className="font-serif text-[clamp(2.5rem,8vw,5rem)] font-bold text-zinc-950 dark:text-stone-100 opacity-[0.06] leading-none tracking-[-0.04em] select-none shrink-0 mt-1"
                >
                  {letter}
                </span>
                <span className="font-serif text-lg italic text-zinc-700 dark:text-zinc-400 font-normal">{letter}</span>
                <span className="font-sans text-xs tracking-widest uppercase text-slate-500 dark:text-stone-400 font-semibold">
                  {group.length} {group.length === 1 ? "thinker" : "thinkers"}
                </span>
              </div>
              {group.map((p, j) => (
                <DirectoryRow key={p._id} philosopher={p} priority={letterStart + j < 6} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
