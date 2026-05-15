import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { getNotes, getPrefs } from "./actions";
import MyNotesClient from "@/components/my-notes/MyNotesClient";

export const metadata: Metadata = {
  title: "My Notes",
  description: "Your personal philosophical journal.",
  robots: { index: false, follow: false },
};

export default async function MyNotesPage() {
  const { userId } = await auth();

  if (!userId) {
    return <MyNotesClient isAuthenticated={false} initialNotes={[]} initialCursor={null} initialPrefs={null} />;
  }

  const prefs = await getPrefs();
  const { notes, nextCursor } = await getNotes(undefined, prefs.sort);
  return <MyNotesClient isAuthenticated initialNotes={notes} initialCursor={nextCursor} initialPrefs={prefs} />;
}
