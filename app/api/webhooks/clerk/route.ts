import { headers } from "next/headers";
import { Webhook } from "svix";
import { connectToDatabase } from "@/lib/mongoose";
import NoteModel from "@/lib/models/Note";
import UserPrefsModel from "@/lib/models/UserPrefs";
import UserModel from "@/lib/models/User";

type ClerkUserEvent = {
  type: "user.created" | "user.updated" | "user.deleted";
  data: {
    id: string;
    email_addresses: { email_address: string; primary: boolean }[];
    first_name: string;
    last_name: string;
    image_url: string;
  };
};

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) return new Response("Missing CLERK_WEBHOOK_SECRET", { status: 500 });

  const headersList = await headers();
  const svixId        = headersList.get("svix-id");
  const svixTimestamp = headersList.get("svix-timestamp");
  const svixSignature = headersList.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const body = await req.text();
  let event: ClerkUserEvent;
  try {
    event = new Webhook(secret).verify(body, {
      "svix-id":        svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserEvent;
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  await connectToDatabase();
  const { id, email_addresses, first_name, last_name, image_url } = event.data;
  const primaryEmail = email_addresses?.find(e => e.primary)?.email_address ?? email_addresses?.[0]?.email_address ?? "";

  if (event.type === "user.created") {
    await UserModel.updateOne(
      { clerkId: id },
      {
        $setOnInsert: { clerkId: id, createdAt: Date.now() },
        $set: { email: primaryEmail, firstName: first_name ?? "", lastName: last_name ?? "", imageUrl: image_url ?? "" },
      },
      { upsert: true }
    );
  }

  if (event.type === "user.updated") {
    await UserModel.updateOne(
      { clerkId: id },
      { $set: { email: primaryEmail, firstName: first_name ?? "", lastName: last_name ?? "", imageUrl: image_url ?? "" } }
    );
  }

  if (event.type === "user.deleted") {
    await Promise.all([
      UserModel.deleteOne({ clerkId: id }),
      NoteModel.deleteMany({ userId: id }),
      UserPrefsModel.deleteOne({ userId: id }),
    ]);
  }

  return new Response(null, { status: 200 });
}
