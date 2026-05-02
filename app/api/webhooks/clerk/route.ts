import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import NoteModel from "@/lib/models/Note";
import UserPrefsModel from "@/lib/models/UserPrefs";
import UserModel from "@/lib/models/User";

export async function POST(req: NextRequest) {
  let evt: Awaited<ReturnType<typeof verifyWebhook>>;
  try {
    evt = await verifyWebhook(req);
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Invalid webhook", { status: 400 });
  }

  await connectToDatabase();

  if (evt.type === "user.created" || evt.type === "user.updated") {
    const { id, email_addresses, primary_email_address_id, first_name, last_name, image_url } = evt.data;
    const primaryEmail =
      email_addresses?.find((e) => e.id === primary_email_address_id)?.email_address ??
      email_addresses?.[0]?.email_address ??
      "";

    if (evt.type === "user.created") {
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

    if (evt.type === "user.updated") {
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
  }

  if (evt.type === "user.deleted") {
    const { id } = evt.data;
    if (!id) return new Response(null, { status: 200 });
    await Promise.all([
      UserModel.deleteOne({ clerkId: id }),
      NoteModel.deleteMany({ userId: id }),
      UserPrefsModel.deleteOne({ userId: id }),
    ]);
  }

  return new Response(null, { status: 200 });
}
