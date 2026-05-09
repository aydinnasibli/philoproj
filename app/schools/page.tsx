import type { Metadata } from "next";
import { getSchoolsWithPhilosophers } from "@/lib/sanity/queries";
import SchoolCard from "@/components/schools/SchoolCard";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://thelivingmanuscript.com";
const TITLE = "Schools of Thought";
const DESCRIPTION = "The great philosophical traditions of Western thought — from Stoicism and Platonism to Existentialism and Analytic Philosophy.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/schools" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    url: `${BASE}/schools`,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default async function SchoolsPage() {
  const schools = await getSchoolsWithPhilosophers();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Western Philosophy Schools of Thought",
    description: DESCRIPTION,
    url: `${BASE}/schools`,
    itemListElement: schools.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${BASE}/schools/${s.slug}`,
      name: s.title,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen pl-[80px]">
        <div className="max-w-[1100px] mx-auto px-12 pt-16 pb-24">
          <div className="mb-14">
            <h1 className="font-serif italic font-normal text-ink leading-[1.1] tracking-[-0.01em] m-0" style={{ fontSize: "clamp(2.2rem,4vw,3.2rem)" }}>
              Schools of Thought
            </h1>
            <div className="h-px bg-[linear-gradient(to_right,rgba(132,84,0,0.2),transparent)] mt-6" />
          </div>
          <div className="grid gap-[2px]" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
            {schools.map(school => (
              <SchoolCard key={school._id} school={school} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
