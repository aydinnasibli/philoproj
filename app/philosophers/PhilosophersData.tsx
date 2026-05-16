import { getPhilosophersAlpha } from "@/lib/sanity/queries";
import DirectoryList from "@/components/archive/DirectoryList";
import { safeJsonLd } from "@/lib/json-ld";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://thelivingmanuscript.com";
const DESCRIPTION =
  "A complete alphabetical directory of Western philosophical thinkers — from Thales to Wittgenstein.";

export default async function PhilosophersData() {
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
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <DirectoryList philosophers={philosophers} />
    </>
  );
}
