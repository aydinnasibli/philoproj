import { getSchoolsWithPhilosophers } from "@/lib/mockData";
import SchoolsCanvas from "@/components/lineage/SchoolsCanvas";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lineage",
  description:
    "Trace the living lineage of Western philosophical thought — from the Socratic method through Rationalism, Empiricism, and Existentialism to Analytic Philosophy.",
};

export default function LineagePage() {
  const schools = getSchoolsWithPhilosophers();
  return <SchoolsCanvas schools={schools} />;
}
