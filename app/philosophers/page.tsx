import type { Metadata } from "next";
import { Suspense } from "react";
import PhilosophersData from "./PhilosophersData";
import Loading from "./loading";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://thelivingmanuscript.com";
const TITLE = "Philosophers";
const DESCRIPTION =
  "A complete alphabetical directory of Western philosophical thinkers — from Thales to Wittgenstein.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/philosophers" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    url: `${BASE}/philosophers`,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function PhilosophersPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PhilosophersData />
    </Suspense>
  );
}
