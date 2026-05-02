import type { Metadata } from "next";
import { getSchoolsWithPhilosophers } from "@/lib/sanity/queries";
import LineageCanvas from "@/components/lineage/LineageCanvas";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://thelivingmanuscript.com";
const TITLE = "Lineage";
const DESCRIPTION =
  "Trace the living lineage of Western philosophical thought — from the Socratic method through Rationalism, Empiricism, and Existentialism to Analytic Philosophy.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/lineage" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    url: `${BASE}/lineage`,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default async function LineagePage() {
  const schools = await getSchoolsWithPhilosophers();
  return <LineageCanvas schools={schools} />;
}
