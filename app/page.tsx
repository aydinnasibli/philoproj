import type { Metadata } from "next";
import { getLineageNodes } from "@/lib/sanity/queries";
import HomeClient from "./HomeClient";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://thelivingmanuscript.com";
const DESCRIPTION =
  "A living map of Western philosophical thought — trace the lineage, ideas, and connections of history's greatest thinkers.";

export const metadata: Metadata = {
  title: { absolute: "The Living Manuscript" },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: "The Living Manuscript",
    description: DESCRIPTION,
    type: "website",
    url: BASE,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Living Manuscript",
    description: DESCRIPTION,
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "The Living Manuscript",
  url: BASE,
  description: DESCRIPTION,
};

export default async function HomePage() {
  const nodes = await getLineageNodes();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <HomeClient nodes={nodes} />
    </>
  );
}
