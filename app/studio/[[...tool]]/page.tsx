import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import StudioClient from "./StudioClient";

export default async function StudioPage() {
  await auth.protect();

  const adminEmails = (process.env.STUDIO_ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const user = await currentUser();
  const email =
    user?.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress ?? "";

  if (adminEmails.length === 0 || !adminEmails.includes(email)) {
    notFound();
  }

  return <StudioClient />;
}
