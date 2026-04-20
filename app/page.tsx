import { getNetworkNodes } from "@/lib/mockData";
import NetworkCanvas from "@/components/network/NetworkCanvas";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Network",
  description: "Explore the philosophical network — nodes of thought connected by mentorship and tradition.",
};

export default function HomePage() {
  const philosophers = getNetworkNodes();
  return <NetworkCanvas philosophers={philosophers} />;
}
