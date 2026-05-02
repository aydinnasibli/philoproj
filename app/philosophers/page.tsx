import type { Metadata } from "next";
import { getPhilosophersAlpha } from "@/lib/sanity/queries";
import DirectoryList from "@/components/archive/DirectoryList";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://thelivingmanuscript.com";
const TITLE = "Philosophers";
const DESCRIPTION = "A complete alphabetical directory of Western philosophical thinkers — from Thales to Wittgenstein.";

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

export default async function PhilosophersPage() {
  const philosophers = await getPhilosophersAlpha();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Western Philosophers Directory",
    description: DESCRIPTION,
    url: `${BASE}/philosophers`,
    itemListElement: philosophers.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${BASE}/philosophers/${p.slug}`,
      name: p.name,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DirectoryList philosophers={philosophers} />
    </>
  );
}
