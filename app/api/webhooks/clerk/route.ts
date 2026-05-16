import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongoose";
import NoteModel from "@/lib/models/Note";
import UserPrefsModel from "@/lib/models/UserPrefs";
import UserModel from "@/lib/models/User";

const MAX_WEBHOOK_BYTES = 65_536;

export async function POST(req: NextRequest) {
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_WEBHOOK_BYTES) {
    return new Response("Payload too large", { status: 413 });
  }

  let evt: Awaited<ReturnType<typeof verifyWebhook>>;
  try {
    evt = await verifyWebhook(req, { signingSecret: process.env.CLERK_WEBHOOK_SECRET });
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Invalid webhook", { status: 400 });
  }

  try {
    await connectToDatabase();

    if (evt.type === "user.created" || evt.type === "user.updated") {
      const { id, email_addresses, primary_email_address_id, first_name, last_name, image_url } = evt.data;
      const primaryEmail =
        email_addresses?.find((e) => e.id === primary_email_address_id)?.email_address ??
        email_addresses?.[0]?.email_address ??
        "";

      await UserModel.updateOne(
        { clerkId: id },
        {
          $setOnInsert: { clerkId: id, createdAt: Date.now() },
          $set: {
            email: primaryEmail,
            firstName: first_name ?? "",
            lastName: last_name ?? "",
            imageUrl: image_url ?? "",
          },
        },
        { upsert: true }
      );
    }

    if (evt.type === "user.deleted") {
      const { id } = evt.data;
      if (!id) return new Response(null, { status: 200 });

      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          await UserModel.deleteOne({ clerkId: id }, { session });
          await NoteModel.deleteMany({ userId: id }, { session });
          await UserPrefsModel.deleteOne({ userId: id }, { session });
        });
      } finally {
        await session.endSession();
      }
    }
  } catch (err) {
    console.error("Webhook DB operation failed:", err);
    return new Response("Internal server error", { status: 500 });
  }

  return new Response(null, { status: 200 });
}
