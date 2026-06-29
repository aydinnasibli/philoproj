"use server";

import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/db/mongoose";
import ConversationModel from "@/db/models/Conversation";
import { checkRateLimit } from "@/lib/rateLimit";

/* ── Serialisable types shared with client ── */
export type MessageData = {
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: number;
};

export type ConversationData = {
  id: string;
  philosopherSlug: string;
  philosopherName: string;
  messages: MessageData[];
  createdAt: number;
  updatedAt: number;
};

export type ConversationListItem = {
  id: string;
  philosopherSlug: string;
  philosopherName: string;
  messageCount: number;
  updatedAt: number;
};

async function requireUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

export async function getConversations(): Promise<ConversationListItem[]> {
  const userId = await requireUser();
  await connectToDatabase();
  const docs = await ConversationModel.find({ userId })
    .sort({ updatedAt: -1 })
    .limit(50)
    .select("philosopherSlug philosopherName messages updatedAt")
    .lean();

  return docs.map((d) => ({
    id: (d._id as mongoose.Types.ObjectId).toString(),
    philosopherSlug: d.philosopherSlug,
    philosopherName: d.philosopherName,
    messageCount: d.messages?.length ?? 0,
    updatedAt: d.updatedAt,
  }));
}

export async function getConversation(id: string): Promise<ConversationData | null> {
  if (!mongoose.isValidObjectId(id)) throw new Error("Invalid conversation ID");
  const userId = await requireUser();
  await connectToDatabase();
  const doc = await ConversationModel.findOne({ _id: id, userId }).lean();
  if (!doc) return null;

  return {
    id: (doc._id as mongoose.Types.ObjectId).toString(),
    philosopherSlug: doc.philosopherSlug,
    philosopherName: doc.philosopherName,
    messages: (doc.messages ?? []).map((m) => ({
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    })),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function createConversation(
  philosopherSlug: string,
  philosopherName: string
): Promise<ConversationData> {
  const userId = await requireUser();
  await checkRateLimit(`${userId}:createConversation`, 20, 3600, { failOpen: true });
  if (!philosopherSlug || !philosopherName) throw new Error("Missing philosopher data");
  if (philosopherSlug.length > 200 || philosopherName.length > 200)
    throw new Error("Invalid philosopher data");

  await connectToDatabase();
  const now = Date.now();
  const doc = await ConversationModel.create({
    userId,
    philosopherSlug,
    philosopherName,
    messages: [],
    createdAt: now,
    updatedAt: now,
  });

  return {
    id: (doc._id as mongoose.Types.ObjectId).toString(),
    philosopherSlug: doc.philosopherSlug,
    philosopherName: doc.philosopherName,
    messages: [],
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function deleteConversation(id: string): Promise<void> {
  if (!mongoose.isValidObjectId(id)) throw new Error("Invalid conversation ID");
  const userId = await requireUser();
  await connectToDatabase();
  const result = await ConversationModel.deleteOne({ _id: id, userId });
  if (result.deletedCount === 0) throw new Error("Conversation not found");
}
