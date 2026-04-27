import { getPhilosophersAlpha } from "@/lib/sanity/queries";
import DirectoryList from "@/components/archive/DirectoryList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Archive",
  description: "A complete alphabetical directory of Western philosophical thinkers.",
};

export default async function ArchivePage() {
  const philosophers = await getPhilosophersAlpha();
  return <DirectoryList philosophers={philosophers} />;
}
