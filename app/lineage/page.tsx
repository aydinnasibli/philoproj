import { getSchoolsWithPhilosophers } from "@/lib/mockData";
import SchoolsGrid from "@/components/lineage/SchoolsGrid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lineage",
  description:
    "Trace the living lineage of Western philosophical thought — from the Socratic method through Rationalism, Empiricism, and Existentialism to Analytic Philosophy.",
};

export default function LineagePage() {
  const schools = getSchoolsWithPhilosophers();
  return <SchoolsGrid schools={schools} />;
}
