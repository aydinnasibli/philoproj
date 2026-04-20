import { getErasWithPhilosophers } from "@/lib/mockData";
import EraGrid from "@/components/lineage/EraGrid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lineage",
  description: "Explore philosophical eras and the thinkers who shaped them.",
};

export default function LineagePage() {
  const eras = getErasWithPhilosophers();
  return <EraGrid eras={eras} />;
}
