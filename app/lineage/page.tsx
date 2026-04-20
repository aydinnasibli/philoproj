import { getLineageNodes } from "@/lib/mockData";
import LineageCanvas from "@/components/lineage/LineageCanvas";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lineage",
  description: "Trace the lineage of Western philosophy — mentors, students, and the transmission of ideas across eras.",
};

export default function LineagePage() {
  const nodes = getLineageNodes();
  return <LineageCanvas nodes={nodes} />;
}
