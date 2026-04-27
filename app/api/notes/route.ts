import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Note } from "@/lib/models/Note";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const philosopherSlug = req.nextUrl.searchParams.get("philosopherSlug");

  await connectToDatabase();
  const query = philosopherSlug
    ? { clerkUserId: userId, philosopherSlug }
    : { clerkUserId: userId };

  const notes = await Note.find(query).sort({ createdAt: -1 }).lean();
  return NextResponse.json(notes);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { philosopherSlug, content } = await req.json();
  if (!philosopherSlug || !content?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  await connectToDatabase();
  const note = await Note.create({ clerkUserId: userId, philosopherSlug, content: content.trim() });
  return NextResponse.json(note, { status: 201 });
}
