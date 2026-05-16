import { getSchoolsWithPhilosophers } from "@/lib/sanity/queries";
import SchoolCard from "@/components/schools/SchoolCard";
import { safeJsonLd } from "@/lib/json-ld";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://thelivingmanuscript.com";
const DESCRIPTION =
  "The great philosophical traditions of Western thought — from Stoicism and Platonism to Existentialism and Analytic Philosophy.";

export default async function SchoolsData() {
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
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-[2px]">
        {schools.map(school => (
          <SchoolCard key={school._id} school={school} />
        ))}
      </div>
    </>
  );
}
