import { getPhilosophersAlpha } from "@/lib/sanity/queries";
import DirectoryList from "@/components/archive/DirectoryList";

export default async function ArchiveData() {
  const philosophers = await getPhilosophersAlpha();
  return <DirectoryList philosophers={philosophers} />;
}
