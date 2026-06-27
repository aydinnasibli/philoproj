import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { getConversations } from "./actions";
import { getPhilosophersAlpha } from "@/sanity/queries";
import DialogueClient from "@/components/dialogue/DialogueClient";

export const metadata: Metadata = {
  title: "Dialogue",
  description: "Converse with history's greatest philosophers — powered by AI.",
  robots: { index: false, follow: false },
};

export default async function DialoguePage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <DialogueClient
        isAuthenticated={false}
        initialConversations={[]}
        philosophers={[]}
      />
    );
  }

  const [conversations, philosophers] = await Promise.all([
    getConversations(),
    getPhilosophersAlpha(),
  ]);

  return (
    <DialogueClient
      isAuthenticated
      initialConversations={conversations}
      philosophers={philosophers}
    />
  );
}
