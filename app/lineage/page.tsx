import type { Metadata } from "next";
import { Suspense } from "react";
import LineageData from "./LineageData";
import Loading from "./loading";

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

export default function LineagePage() {
  return (
    <Suspense fallback={<Loading />}>
      <LineageData />
    </Suspense>
  );
}
