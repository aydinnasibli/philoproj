import type { Metadata } from "next";
import { getSchoolsList } from "@/sanity/queries";
import SchoolCard from "@/components/schools/SchoolCard";
import { safeJsonLd } from "@/lib/json-ld";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://thelivingmanuscript.com";
const TITLE = "Schools of Thought";
const DESCRIPTION =
  "The great philosophical traditions of Western thought: from Stoicism and Platonism to Existentialism and Analytic Philosophy.";

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
  const schools = await getSchoolsList();

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
    <div className="min-h-screen pl-0 md:pl-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <div className="max-w-[1100px] mx-auto px-4 md:px-12 pt-16 md:pt-16 pb-24 md:pb-24">
        <div className="mb-14">
          <h1 className="font-serif italic font-bold text-zinc-950 dark:text-stone-100 leading-tight tracking-[-0.01em] m-0 text-[clamp(2.2rem,4vw,3.2rem)]">
            Schools of Thought
          </h1>
          <div className="h-px bg-linear-to-r from-zinc-700/20 to-transparent mt-6" />
          <p className="font-serif text-sm leading-[1.8] text-slate-500 dark:text-stone-400 mt-5 max-w-[55ch] m-0">
            The great philosophical traditions of Western thought: from Stoicism and Platonism to Existentialism and Analytic Philosophy.
          </p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-0.5">
          {schools.map(school => (
            <SchoolCard key={school._id} school={school} />
          ))}
        </div>
      </div>
    </div>
  );
}
