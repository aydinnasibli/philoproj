import Image from "next/image";
import Link from "next/link";
import type { PhilosopherListItem } from "@/lib/types";

function formatYears(birth?: number, death?: number) {
  if (!birth && !death) return "";
  const b = birth ? (birth < 0 ? `${Math.abs(birth)} BC` : `${birth} AD`) : "?";
  const d = death ? (death < 0 ? `${Math.abs(death)} BC` : `${death} AD`) : "?";
  return `${b} — ${d}`;
}

const ERA_DOT_COLOR: Record<string, string> = {
  "era-1": "oklch(0.64 0.08 68)",   // Ancient Greece — warm amber
  "era-2": "oklch(0.58 0.06 145)",  // Hellenistic — sage
  "era-3": "oklch(0.52 0.07 245)",  // Early Modern — slate
  "era-4": "oklch(0.54 0.07 30)",   // Critical Era — terracotta
};

type Props = { philosopher: PhilosopherListItem; priority?: boolean };

export default function DirectoryRow({ philosopher, priority = false }: Props) {
  const dotColor = ERA_DOT_COLOR[philosopher.eraId] ?? "oklch(0.52 0.03 60)";

  return (
    <Link href={`/philosophers/${philosopher.slug}`} className="no-underline group">
      <div className="grid grid-cols-[1fr] sm:grid-cols-[1fr_160px] md:grid-cols-[1fr_200px_200px] items-center cursor-pointer border-b border-zinc-100 dark:border-zinc-800 bg-transparent transition-[background-color] duration-150 group-hover:bg-stone-100/70 dark:group-hover:bg-stone-800/50 py-3 md:py-3.5">

        {/* Name + avatar */}
        <div className="flex items-center gap-3">
          <div
            className="w-2 h-2 rounded-full shrink-0 opacity-50 transition-opacity duration-150 group-hover:opacity-90"
            style={{ backgroundColor: dotColor }}
          />

          {philosopher.avatarUrl ? (
            <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700">
              <Image
                src={philosopher.avatarUrl}
                alt={philosopher.name}
                width={44}
                height={44}
                priority={priority}
                className="object-cover w-full h-full"
              />
            </div>
          ) : (
            <div className="w-11 h-11 rounded-full bg-stone-100 dark:bg-stone-950 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 font-serif text-sm text-slate-500 dark:text-stone-400">
              {philosopher.name[0]}
            </div>
          )}

          <div className="translate-x-0 transition-transform duration-200 group-hover:translate-x-1">
            <span className="font-serif italic text-base text-zinc-950 dark:text-stone-100 block">
              {philosopher.name}
            </span>
            {(philosopher.birthYear || philosopher.deathYear) && (
              <span className="font-sans text-xs text-slate-500 dark:text-stone-400 block mt-px">
                {formatYears(philosopher.birthYear, philosopher.deathYear)}
              </span>
            )}
          </div>
        </div>

        <span className="hidden sm:inline font-sans text-xs text-slate-500 dark:text-stone-400">{philosopher.eraTitle}</span>
        <span className="hidden md:inline font-sans text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-stone-400">
          {philosopher.coreBranch}
        </span>
      </div>
    </Link>
  );
}
