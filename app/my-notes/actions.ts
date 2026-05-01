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

function toNote(doc: InstanceType<typeof NoteModel>): NoteData {
  return {
    id:         (doc._id as { toString(): string }).toString(),
    title:      doc.title,
    body:       doc.body,
    tags:       doc.tags,
    links:      doc.links,
    marginalia: (doc.marginalia ?? []).map(m => ({
      id: m._id as string,
      text: m.text,
      createdAt: m.createdAt,
    })),
    pinned:    doc.pinned,
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
  return docs.map(doc => ({
    id:         (doc._id as { toString(): string }).toString(),
    title:      doc.title ?? "",
    body:       doc.body ?? "",
    tags:       doc.tags ?? [],
    links:      doc.links ?? [],
    marginalia: (doc.marginalia ?? []).map(m => ({
      id: m._id as string,
      text: m.text,
      createdAt: m.createdAt,
    })),
    pinned:    doc.pinned ?? false,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }));
}

export async function createNote(
  data: Pick<NoteData, "title" | "body">
): Promise<NoteData> {
  const userId = await requireUser();
  await connectToDatabase();
  const now = Date.now();
  const doc = await NoteModel.create({
    userId,
    title:     data.title ?? "",
    body:      data.body ?? "",
    tags:      [],
    links:     [],
    marginalia:[],
    pinned:    false,
    createdAt: now,
    updatedAt: now,
  });
  return toNote(doc);
}

export async function updateNote(
  id: string,
  data: Omit<NoteData, "id" | "createdAt">
): Promise<void> {
  const userId = await requireUser();
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
        updatedAt:  data.updatedAt ?? Date.now(),
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
    sort:       doc.sort ?? "newest",
    flatCards:  doc.flatCards ?? false,
    wcGoal:     doc.wcGoal ?? 200,
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
