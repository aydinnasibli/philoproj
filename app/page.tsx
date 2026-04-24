import { getLineageNodes } from "@/lib/mockData";
import NetworkCanvas from "@/components/lineage/NetworkCanvas";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Philosopher Network",
  description: "Explore the network of Western philosophers — mentors, students, and the transmission of ideas across eras.",
};

export default function HomePage() {
  const nodes = getLineageNodes();
  return <NetworkCanvas nodes={nodes} />;
}
