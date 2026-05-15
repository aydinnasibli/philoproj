import type { Tag } from "./types";

/* ─── TAG COLOR SYSTEM ─────────────────────────────────────────────────────
   Tag.color stores a Tailwind color token (e.g. "green-700").
   TAG_STYLES maps that token to every class string we need.
   Complete strings here — Tailwind's scanner picks them all up at build time.
──────────────────────────────────────────────────────────────────────────── */
export const TAG_STYLES: Record<string, {
  pill:    string;
  bar:     string;
  dot:     string;
  fill:    string;
  from:    string;
  borderB: string;
  hover:   string;
}> = {
  "green-700":   { pill: "bg-green-700/10 text-green-700 border-green-700/30",    bar: "bg-green-700",   dot: "bg-green-700",   fill: "fill-green-700",   from: "from-green-700",   borderB: "border-b-green-700",   hover: "hover:text-green-700 hover:border-green-700/30"   },
  "blue-600":    { pill: "bg-blue-600/10 text-blue-600 border-blue-600/30",        bar: "bg-blue-600",    dot: "bg-blue-600",    fill: "fill-blue-600",    from: "from-blue-600",    borderB: "border-b-blue-600",    hover: "hover:text-blue-600 hover:border-blue-600/30"    },
  "amber-600":   { pill: "bg-amber-600/10 text-amber-600 border-amber-600/30",     bar: "bg-amber-600",   dot: "bg-amber-600",   fill: "fill-amber-600",   from: "from-amber-600",   borderB: "border-b-amber-600",   hover: "hover:text-amber-600 hover:border-amber-600/30"  },
  "purple-600":  { pill: "bg-purple-600/10 text-purple-600 border-purple-600/30",  bar: "bg-purple-600",  dot: "bg-purple-600",  fill: "fill-purple-600",  from: "from-purple-600",  borderB: "border-b-purple-600",  hover: "hover:text-purple-600 hover:border-purple-600/30"},
  "teal-600":    { pill: "bg-teal-600/10 text-teal-600 border-teal-600/30",        bar: "bg-teal-600",    dot: "bg-teal-600",    fill: "fill-teal-600",    from: "from-teal-600",    borderB: "border-b-teal-600",    hover: "hover:text-teal-600 hover:border-teal-600/30"    },
  "rose-600":    { pill: "bg-rose-600/10 text-rose-600 border-rose-600/30",        bar: "bg-rose-600",    dot: "bg-rose-600",    fill: "fill-rose-600",    from: "from-rose-600",    borderB: "border-b-rose-600",    hover: "hover:text-rose-600 hover:border-rose-600/30"    },
  "yellow-800":  { pill: "bg-yellow-800/10 text-yellow-800 border-yellow-800/30",  bar: "bg-yellow-800",  dot: "bg-yellow-800",  fill: "fill-yellow-800",  from: "from-yellow-800",  borderB: "border-b-yellow-800",  hover: "hover:text-yellow-800 hover:border-yellow-800/30"},
  "cyan-700":    { pill: "bg-cyan-700/10 text-cyan-700 border-cyan-700/30",        bar: "bg-cyan-700",    dot: "bg-cyan-700",    fill: "fill-cyan-700",    from: "from-cyan-700",    borderB: "border-b-cyan-700",    hover: "hover:text-cyan-700 hover:border-cyan-700/30"    },
  "orange-700":  { pill: "bg-orange-700/10 text-orange-700 border-orange-700/30",  bar: "bg-orange-700",  dot: "bg-orange-700",  fill: "fill-orange-700",  from: "from-orange-700",  borderB: "border-b-orange-700",  hover: "hover:text-orange-700 hover:border-orange-700/30"},
  "emerald-700": { pill: "bg-emerald-700/10 text-emerald-700 border-emerald-700/30", bar: "bg-emerald-700", dot: "bg-emerald-700", fill: "fill-emerald-700", from: "from-emerald-700", borderB: "border-b-emerald-700", hover: "hover:text-emerald-700 hover:border-emerald-700/30"},
  "indigo-600":  { pill: "bg-indigo-600/10 text-indigo-600 border-indigo-600/30",  bar: "bg-indigo-600",  dot: "bg-indigo-600",  fill: "fill-indigo-600",  from: "from-indigo-600",  borderB: "border-b-indigo-600",  hover: "hover:text-indigo-600 hover:border-indigo-600/30"},
  "stone-500":   { pill: "bg-stone-500/10 text-stone-500 border-stone-500/30",     bar: "bg-stone-500",   dot: "bg-stone-500",   fill: "fill-stone-500",   from: "from-stone-500",   borderB: "border-b-stone-500",   hover: "hover:text-stone-500 hover:border-stone-500/30"  },
};

export const FALLBACK_STYLE = TAG_STYLES["amber-600"];

export const CARD_ROTATIONS = [
  "-rotate-[1.1deg]", "-rotate-[0.9deg]", "-rotate-[0.7deg]", "-rotate-[0.5deg]",
  "-rotate-[0.3deg]", "-rotate-[0.1deg]",  "rotate-[0.1deg]",  "rotate-[0.3deg]",
   "rotate-[0.5deg]",  "rotate-[0.7deg]",  "rotate-[0.9deg]",  "rotate-[1.1deg]",
] as const;

export const DEFAULT_TAGS: Tag[] = [
  { name: "Reflection", color: "green-700"   },
  { name: "Question",   color: "blue-600"    },
  { name: "Insight",    color: "amber-600"   },
  { name: "Quote",      color: "purple-600"  },
  { name: "Dialogue",   color: "teal-600"    },
  { name: "Reading",    color: "rose-600"    },
  { name: "Personal",   color: "yellow-800"  },
];

export const TAG_PALETTE = [
  "green-700", "blue-600",   "amber-600",  "purple-600",
  "teal-600",  "rose-600",   "yellow-800", "cyan-700",
  "orange-700","emerald-700","indigo-600",  "stone-500",
] as const;
