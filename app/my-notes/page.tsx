import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { getNotes, getPrefs } from "./actions";
import MyNotesClient from "@/components/my-notes/MyNotesClient";

export const metadata: Metadata = {
  title: "My Notes",
  description: "Your personal philosophical journal.",
};

export default async function MyNotesPage() {
  const { userId } = await auth();

  if (!userId) {
    return <MyNotesClient initialNotes={[]} initialPrefs={null} />;
  }

  const [notes, prefs] = await Promise.all([getNotes(), getPrefs()]);
  return <MyNotesClient initialNotes={notes} initialPrefs={prefs} />;
}
