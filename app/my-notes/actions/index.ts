"use server";

import { auth } from "@clerk/nextjs/server";
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
const BODY_MAX  = 200_000;
const TAG_MAX   = 50;
const TAGS_MAX  = 20;
const LINKS_MAX = 100;
const MARG_MAX  = 200;

function validateNote(data: { title?: string; body?: string; tags?: string[]; links?: string[]; marginalia?: MarginaliaData[] }) {
  if ((data.title ?? "").length > TITLE_MAX) throw new Error(`Title exceeds ${TITLE_MAX} characters`);
  if ((data.body ?? "").length > BODY_MAX)   throw new Error(`Note body exceeds ${BODY_MAX} characters`);
  if ((data.tags ?? []).length > TAGS_MAX)   throw new Error(`Too many tags (max ${TAGS_MAX})`);
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
  createdAt: number;
  updatedAt: number;
};

function toNote(doc: RawNote): NoteData {
  return {
    id:         (doc._id as { toString(): string }).toString(),
    title:      doc.title      ?? "",
    body:       doc.body       ?? "",
    tags:       doc.tags       ?? [],
    links:      doc.links      ?? [],
    marginalia: (doc.marginalia ?? []).map(m => ({
      id: m._id as string,
      text: m.text,
      createdAt: m.createdAt,
    })),
    pinned:    doc.pinned    ?? false,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

async function requireUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

/* ── Notes ── */

export async function getNotes(): Promise<NoteData[]> {
  const userId = await requireUser();
  await connectToDatabase();
  const docs = await NoteModel.find({ userId }).sort({ createdAt: -1 }).lean();
  return docs.map(toNote);
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
    title:     data.title ?? "",
    body:      data.body  ?? "",
    tags:      [],
    links:     [],
    marginalia:[],
    pinned:    false,
    createdAt: now,
    updatedAt: now,
  });
  return toNote(doc.toObject());
}

export async function updateNote(
  id: string,
  data: Omit<NoteData, "id" | "createdAt" | "updatedAt">
): Promise<void> {
  const userId = await requireUser();
  validateNote(data);
  await connectToDatabase();
  await NoteModel.updateOne(
    { _id: id, userId },
    {
      $set: {
        title:      data.title,
        body:       data.body,
        tags:       data.tags,
        links:      data.links,
        marginalia: data.marginalia.map(m => ({ _id: m.id, text: m.text, createdAt: m.createdAt })),
        pinned:     data.pinned ?? false,
        updatedAt:  Date.now(),
      },
    }
  );
}

export async function deleteNote(id: string): Promise<void> {
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
    sort:       doc.sort      ?? "newest",
    flatCards:  doc.flatCards ?? false,
    wcGoal:     doc.wcGoal    ?? 200,
    customTags: (doc.customTags ?? []).map(t => ({ name: t.name, color: t.color })),
  };
}

export async function updatePrefs(prefs: PrefsData): Promise<void> {
  const userId = await requireUser();
  await connectToDatabase();
  await UserPrefsModel.updateOne(
    { userId },
    { $set: { sort: prefs.sort, flatCards: prefs.flatCards, wcGoal: prefs.wcGoal, customTags: prefs.customTags } },
    { upsert: true }
  );
}
