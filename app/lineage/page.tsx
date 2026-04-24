import { getLineageNodes } from "@/lib/mockData";
import NetworkCanvas from "@/components/network/NetworkCanvas";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lineage",
  description: "Explore the living map of philosophical thought — nodes of ideas connected across time.",
};

export default function LineagePage() {
  const philosophers = getLineageNodes();
  return <NetworkCanvas philosophers={philosophers} />;
}
