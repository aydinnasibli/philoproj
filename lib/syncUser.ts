import { auth, currentUser } from "@clerk/nextjs/server";
import { connectToDatabase } from "./mongoose";
import UserModel from "./models/User";

export async function syncUser() {
  const { userId } = await auth();
  if (!userId) return;

  await connectToDatabase();

  const exists = await UserModel.exists({ clerkId: userId });
  if (exists) return;

  const user = await currentUser();
  if (!user) return;

  const primaryEmail =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress ?? "";

  await UserModel.updateOne(
    { clerkId: userId },
    {
      $setOnInsert: { clerkId: userId, createdAt: Date.now() },
      $set: {
        email: primaryEmail,
        username: user.username ?? "",
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        imageUrl: user.imageUrl ?? "",
      },
    },
    { upsert: true }
  );
}
