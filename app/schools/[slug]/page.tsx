import { getSchoolBySlug, getSchoolSlugs } from "@/lib/sanity/queries";
import { safeJsonLd } from "@/lib/json-ld";
import SchoolDetail from "@/components/schools/SchoolDetail";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://thelivingmanuscript.com";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getSchoolSlugs();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const school = await getSchoolBySlug(slug);
  if (!school) return { title: "Not Found" };

  const description = school.description || `Explore the ${school.title} school of philosophy.`;
  const url = `${BASE}/schools/${school.slug}`;

  return {
    title: school.title,
    description,
    alternates: { canonical: `/schools/${school.slug}` },
    openGraph: {
      title: school.title,
      description,
      type: "website",
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: school.title,
      description,
    },
  };
}

export default async function SchoolPage({ params }: Props) {
  const { slug } = await params;
  const school = await getSchoolBySlug(slug);
  if (!school) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        name: school.title,
        description: school.description || undefined,
        url: `${BASE}/schools/${school.slug}`,
        ...(school.eraRange && { foundingDate: school.eraRange }),
        ...(school.philosophers.length > 0 && {
          member: school.philosophers.map((p) => ({
            "@type": "Person",
            name: p.name,
            url: `${BASE}/philosophers/${p.slug}`,
          })),
        }),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home",    item: BASE },
          { "@type": "ListItem", position: 2, name: "Schools", item: `${BASE}/schools` },
          { "@type": "ListItem", position: 3, name: school.title, item: `${BASE}/schools/${school.slug}` },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <SchoolDetail school={school} />
    </>
  );
}
