import { getPhilosophersAlpha } from "@/lib/mockData";
import DirectoryList from "@/components/archive/DirectoryList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Archive",
  description: "A complete alphabetical directory of Western philosophical thinkers.",
};

export default function ArchivePage() {
  const philosophers = getPhilosophersAlpha();
  return <DirectoryList philosophers={philosophers} />;
}
