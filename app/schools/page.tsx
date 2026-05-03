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
      <div style={{ minHeight: "100vh", background: "var(--parchment)", paddingLeft: 80 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 48px 96px" }}>
          <div style={{ marginBottom: 56 }}>
            <h1 style={{
              fontFamily: "var(--font-serif)", fontStyle: "italic",
              fontSize: "clamp(2.2rem, 4vw, 3.2rem)", fontWeight: 400,
              color: "var(--ink)", lineHeight: 1.1, letterSpacing: "-0.01em",
              margin: 0,
            }}>
              Schools of Thought
            </h1>
            <div style={{ height: 1, background: "linear-gradient(to right, rgba(132,84,0,0.2), transparent)", marginTop: 24 }} />
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 2,
          }}>
            {schools.map(school => (
              <SchoolCard key={school._id} school={school} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
