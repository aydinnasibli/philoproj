"use server";

import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongoose";
import NoteModel from "@/lib/models/Note";
import UserPrefsModel from "@/lib/models/UserPrefs";

/* ── Serialisable types shared with client ── */
export type MarginaliaData = { id: string; text: string; createdAt: number };
export type NoteData = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  links: string[];
  marginalia: MarginaliaData[];
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
};
export type TagData = { name: string; color: string };
export type PrefsData = {
  sort: string;
  flatCards: boolean;
  wcGoal: number;
  customTags: TagData[];
};

const TITLE_MAX = 500;
const BODY_MAX = 200_000;
const TAG_MAX = 50;
const TAGS_MAX = 20;
const LINKS_MAX = 100;
const MARG_MAX = 200;

const VALID_SORTS = new Set(["newest", "oldest", "alpha", "wc"]);
const VALID_COLORS = new Set([
  "green-700", "blue-600", "amber-600", "purple-600",
  "teal-600", "rose-600", "yellow-800", "cyan-700",
  "orange-700", "emerald-700", "indigo-600", "stone-500",
]);

function validatePrefs(prefs: PrefsData) {
  if (!VALID_SORTS.has(prefs.sort)) throw new Error("Invalid sort");
  if (typeof prefs.flatCards !== "boolean") throw new Error("Invalid flatCards");
  if (typeof prefs.wcGoal !== "number" || !isFinite(prefs.wcGoal) || prefs.wcGoal < 1 || prefs.wcGoal > 50000) throw new Error("Invalid word count goal");
  if (!Array.isArray(prefs.customTags) || prefs.customTags.length > 20) throw new Error("Too many custom tags");
  for (const t of prefs.customTags) {
    if (typeof t.name !== "string" || t.name.length === 0 || t.name.length > 50) throw new Error("Invalid tag name");
    if (!VALID_COLORS.has(t.color)) throw new Error("Invalid tag color");
  }
}

function validateNote(data: { title?: string; body?: string; tags?: string[]; links?: string[]; marginalia?: MarginaliaData[] }) {
  if ((data.title ?? "").length > TITLE_MAX) throw new Error(`Title exceeds ${TITLE_MAX} characters`);
  if ((data.body ?? "").length > BODY_MAX) throw new Error(`Note body exceeds ${BODY_MAX} characters`);
  if ((data.tags ?? []).length > TAGS_MAX) throw new Error(`Too many tags (max ${TAGS_MAX})`);
  if ((data.tags ?? []).some(t => t.length > TAG_MAX)) throw new Error(`Tag name too long`);
  if ((data.links ?? []).length > LINKS_MAX) throw new Error(`Too many links`);
  if ((data.marginalia ?? []).length > MARG_MAX) throw new Error(`Too many marginalia`);
}

type RawNote = {
  _id: { toString(): string } | string;
  title?: string;
  body?: string;
  tags?: string[];
  links?: string[];
  marginalia?: Array<{ _id: string; text: string; createdAt: number }>;
  pinned?: boolean;
  wordCount?: number;
  createdAt: number;
  updatedAt: number;
};

const computeWc = (s: string) => s.trim() ? s.split(/\s+/).filter(Boolean).length : 0;

type WcCursor    = { wc: number; id: string };
type AlphaCursor = { title: string; id: string };

function encodeWcCursor(wc: number, id: string): string {
  return Buffer.from(JSON.stringify({ wc, id })).toString("base64url");
}
function encodeAlphaCursor(title: string, id: string): string {
  return Buffer.from(JSON.stringify({ title, id })).toString("base64url");
}
function decodeWcCursor(cursor: string): WcCursor | null {
  try {
    const d = JSON.parse(Buffer.from(cursor, "base64url").toString());
    if (typeof d.wc === "number" && typeof d.id === "string" && mongoose.isValidObjectId(d.id)) return d;
    return null;
  } catch { return null; }
}
function decodeAlphaCursor(cursor: string): AlphaCursor | null {
  try {
    const d = JSON.parse(Buffer.from(cursor, "base64url").toString());
    if (typeof d.title === "string" && typeof d.id === "string" && mongoose.isValidObjectId(d.id)) return d;
    return null;
  } catch { return null; }
}

function toNote(doc: RawNote): NoteData {
  return {
    id: (doc._id as { toString(): string }).toString(),
    title: doc.title ?? "",
    body: doc.body ?? "",
    tags: doc.tags ?? [],
    links: doc.links ?? [],
    marginalia: (doc.marginalia ?? []).map(m => ({
      id: m._id as string,
      text: m.text,
      createdAt: m.createdAt,
    })),
    pinned: doc.pinned ?? false,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

async function requireUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

const PAGE_SIZE = 20;

export type NotesPage = { notes: NoteData[]; nextCursor: string | null };

/* ── Notes ── */

export async function getNotes(cursor?: string, sort: string = "newest"): Promise<NotesPage> {
  const userId = await requireUser();
  if (!VALID_SORTS.has(sort)) sort = "newest";
  await connectToDatabase();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let rawPage: any[];
  let nextCursor: string | null = null;

  if (sort === "wc") {
    const parsed = cursor ? decodeWcCursor(cursor) : null;
    if (cursor && !parsed) throw new Error("Invalid cursor");
    const query: Record<string, unknown> = { userId };
    if (parsed) {
      query.$or = [
        { wordCount: { $lt: parsed.wc } },
        { wordCount: parsed.wc, _id: { $lt: new mongoose.Types.ObjectId(parsed.id) } },
      ];
    }
    const docs = await NoteModel.find(query).sort({ wordCount: -1, _id: -1 }).limit(PAGE_SIZE + 1).lean();
    const hasMore = docs.length > PAGE_SIZE;
    rawPage = hasMore ? docs.slice(0, PAGE_SIZE) : docs;
    if (hasMore) {
      const last = rawPage[rawPage.length - 1];
      nextCursor = encodeWcCursor(last.wordCount ?? 0, last._id.toString());
    }

  } else if (sort === "alpha") {
    const parsed = cursor ? decodeAlphaCursor(cursor) : null;
    if (cursor && !parsed) throw new Error("Invalid cursor");
    const query: Record<string, unknown> = { userId };
    if (parsed) {
      query.$or = [
        { title: { $gt: parsed.title } },
        { title: parsed.title, _id: { $gt: new mongoose.Types.ObjectId(parsed.id) } },
      ];
    }
    const docs = await NoteModel.find(query).sort({ title: 1, _id: 1 }).limit(PAGE_SIZE + 1).lean();
    const hasMore = docs.length > PAGE_SIZE;
    rawPage = hasMore ? docs.slice(0, PAGE_SIZE) : docs;
    if (hasMore) {
      const last = rawPage[rawPage.length - 1];
      nextCursor = encodeAlphaCursor(last.title ?? "", last._id.toString());
    }

  } else {
    if (cursor && !mongoose.isValidObjectId(cursor)) throw new Error("Invalid cursor");
    const ascending = sort === "oldest";
    const query: Record<string, unknown> = { userId };
    if (cursor) {
      query._id = ascending
        ? { $gt: new mongoose.Types.ObjectId(cursor) }
        : { $lt: new mongoose.Types.ObjectId(cursor) };
    }
    const docs = await NoteModel.find(query).sort({ _id: ascending ? 1 : -1 }).limit(PAGE_SIZE + 1).lean();
    const hasMore = docs.length > PAGE_SIZE;
    rawPage = hasMore ? docs.slice(0, PAGE_SIZE) : docs;
    if (hasMore) nextCursor = rawPage[rawPage.length - 1]._id.toString();
  }

  return { notes: rawPage.map(toNote), nextCursor };
}

export async function createNote(
  data: Pick<NoteData, "title" | "body">
): Promise<NoteData> {
  const userId = await requireUser();
  validateNote(data);
  await connectToDatabase();
  const now = Date.now();
  const doc = await NoteModel.create({
    userId,
    title: data.title ?? "",
    body: data.body ?? "",
    tags: [],
    links: [],
    marginalia: [],
    pinned: false,
    wordCount: computeWc(data.body ?? ""),
    createdAt: now,
    updatedAt: now,
  });
  return toNote(doc.toObject());
}

export async function updateNote(
  id: string,
  data: Omit<NoteData, "id" | "createdAt" | "updatedAt">
): Promise<void> {
  if (!mongoose.isValidObjectId(id)) throw new Error("Invalid note ID");
  const userId = await requireUser();
  validateNote(data);
  await connectToDatabase();
  await NoteModel.updateOne(
    { _id: id, userId },
    {
      $set: {
        title: data.title,
        body: data.body,
        tags: data.tags,
        links: data.links,
        marginalia: data.marginalia.map(m => ({ _id: m.id, text: m.text, createdAt: m.createdAt })),
        pinned: data.pinned ?? false,
        wordCount: computeWc(data.body ?? ""),
        updatedAt: Date.now(),
      },
    }
  );
}

export async function deleteNote(id: string): Promise<void> {
  if (!mongoose.isValidObjectId(id)) throw new Error("Invalid note ID");
  const userId = await requireUser();
  await connectToDatabase();
  await NoteModel.deleteOne({ _id: id, userId });
}

/* ── User prefs ── */

export async function getPrefs(): Promise<PrefsData> {
  const userId = await requireUser();
  await connectToDatabase();
  const doc = await UserPrefsModel.findOne({ userId }).lean();
  if (!doc) return { sort: "newest", flatCards: false, wcGoal: 200, customTags: [] };
  return {
    sort: doc.sort ?? "newest",
    flatCards: doc.flatCards ?? false,
    wcGoal: doc.wcGoal ?? 200,
    customTags: (doc.customTags ?? []).map(t => ({ name: t.name, color: t.color })),
  };
}

export async function updatePrefs(prefs: PrefsData): Promise<void> {
  validatePrefs(prefs);
  const userId = await requireUser();
  await connectToDatabase();
  await UserPrefsModel.updateOne(
    { userId },
    { $set: { sort: prefs.sort, flatCards: prefs.flatCards, wcGoal: prefs.wcGoal, customTags: prefs.customTags } },
    { upsert: true }
  );
}
