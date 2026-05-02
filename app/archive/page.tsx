import type { Metadata } from "next";
import { getPhilosophersAlpha } from "@/lib/sanity/queries";
import DirectoryList from "@/components/archive/DirectoryList";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://thelivingmanuscript.com";
const DESCRIPTION = "A complete alphabetical directory of Western philosophical thinkers — from Thales to Wittgenstein.";

export const metadata: Metadata = {
  title: "Archive",
  description: DESCRIPTION,
  // /archive and /philosophers serve identical content — point Google to the canonical.
  alternates: { canonical: "/philosophers" },
  openGraph: {
    title: "Archive",
    description: DESCRIPTION,
    type: "website",
    url: `${BASE}/archive`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Archive",
    description: DESCRIPTION,
  },
};

export default async function ArchivePage() {
  const philosophers = await getPhilosophersAlpha();
  return <DirectoryList philosophers={philosophers} />;
}
