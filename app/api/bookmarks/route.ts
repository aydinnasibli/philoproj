import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Bookmark } from "@/lib/models/Bookmark";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const type = req.nextUrl.searchParams.get("type");

  await connectToDatabase();
  const query = type ? { clerkUserId: userId, type } : { clerkUserId: userId };
  const bookmarks = await Bookmark.find(query).sort({ createdAt: -1 }).lean();
  return NextResponse.json(bookmarks);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type, slug } = await req.json();
  if (!type || !slug) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  await connectToDatabase();
  const bookmark = await Bookmark.findOneAndUpdate(
    { clerkUserId: userId, type, slug },
    { clerkUserId: userId, type, slug },
    { upsert: true, new: true }
  );
  return NextResponse.json(bookmark, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type, slug } = await req.json();
  if (!type || !slug) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  await connectToDatabase();
  await Bookmark.findOneAndDelete({ clerkUserId: userId, type, slug });
  return NextResponse.json({ success: true });
}
