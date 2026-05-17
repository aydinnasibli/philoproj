import type { Note, Tag, Prefs } from "./types";
import { TAG_STYLES, FALLBACK_STYLE, DEFAULT_TAGS, CARD_ROTATIONS } from "./tag-styles";
import { wc } from "@/lib/utils";

export const PROMPTS = [
  "What are you thinking about right now?",
  "What question has been following you today?",
  "What did you observe that made you pause?",
  "A thought you haven't written down yet…",
  "What would you tell your future self?",
  "What are you uncertain about?",
  "Capture something before it escapes.",
  "What assumption did you question today?",
  "If Socrates asked you one question right now…",
  "What is the examined life to you, today?",
];

export const DEFAULT_PREFS: Prefs = { sort: "newest", flatCards: false, wcGoal: 200, customTags: [] };

export const genId     = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

export const timeAgo   = (ts: number) => {
  const d = Math.floor((Date.now() - ts) / 86400000);
  if (d === 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 7)  return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return `${Math.floor(d / 30)}mo ago`;
};

export const getPrompt = () => PROMPTS[Math.floor(Date.now() / 86400000) % PROMPTS.length];
export { wc };
export const readTime  = (s: string) => { const m = Math.ceil(wc(s) / 200); return m <= 1 ? "~1 min read" : `~${m} min read`; };
export const allTags   = (prefs: Prefs) => [...DEFAULT_TAGS, ...prefs.customTags];
export const tagStyle  = (name: string, tags: Tag[]) => TAG_STYLES[tags.find(t => t.name === name)?.color ?? ""] ?? FALLBACK_STYLE;
export const cardRotCls = (id: string) => CARD_ROTATIONS[parseInt(id.slice(-4), 36) % CARD_ROTATIONS.length];
