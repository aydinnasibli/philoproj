import { getSchoolsWithPhilosophers } from "@/lib/sanity/queries";
import LineageCanvas from "@/components/lineage/LineageCanvas";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lineage",
  description:
    "Trace the living lineage of Western philosophical thought — from the Socratic method through Rationalism, Empiricism, and Existentialism to Analytic Philosophy.",
};

export default async function LineagePage() {
  const schools = await getSchoolsWithPhilosophers();
  return <LineageCanvas schools={schools} />;
}
