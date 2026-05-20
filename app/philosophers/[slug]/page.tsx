import { getPhilosopherBySlug, getPhilosopherSlugs } from "@/sanity/queries";
import { safeJsonLd } from "@/lib/json-ld";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProfileHero from "@/components/profile/ProfileHero";
import LearningHighlight from "@/components/profile/LearningHighlight";
import ContextSidebar from "@/components/profile/ContextSidebar";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://thelivingmanuscript.com";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getPhilosopherSlugs();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPhilosopherBySlug(slug);
  if (!p) return { title: "Not Found" };

  const description = p.shortSummary ?? `Explore the philosophy of ${p.name}.`;
  const url = `${BASE}/philosophers/${p.slug}`;

  return {
    title: p.name,
    description,
    alternates: { canonical: `/philosophers/${p.slug}` },
    openGraph: {
      title: p.name,
      description,
      type: "profile",
      url,
      ...(p.avatarUrl && { images: [{ url: p.avatarUrl, alt: p.name }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: p.name,
      description,
      ...(p.avatarUrl && { images: [p.avatarUrl] }),
    },
  };
}

export default async function PhilosopherPage({ params }: Props) {
  const { slug } = await params;
  const philosopher = await getPhilosopherBySlug(slug);
  if (!philosopher) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        name: philosopher.name,
        description: philosopher.shortSummary || undefined,
        url: `${BASE}/philosophers/${philosopher.slug}`,
        ...(philosopher.avatarUrl && { image: philosopher.avatarUrl }),
        ...(philosopher.birthYear && { birthDate: String(philosopher.birthYear) }),
        ...(philosopher.deathYear && { deathDate: String(philosopher.deathYear) }),
        ...(philosopher.coreBranch && { knowsAbout: philosopher.coreBranch }),
        ...(philosopher.mentors.length > 0 && {
          mentor: philosopher.mentors.map((m) => ({
            "@type": "Person",
            name: m.name,
            url: `${BASE}/philosophers/${m.slug}`,
          })),
        }),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home",         item: BASE },
          { "@type": "ListItem", position: 2, name: "Philosophers", item: `${BASE}/philosophers` },
          { "@type": "ListItem", position: 3, name: philosopher.name, item: `${BASE}/philosophers/${philosopher.slug}` },
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
      <div className="max-w-[1400px] mx-auto px-4 md:px-10 pt-16 md:pt-24 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8 md:gap-16 items-start">
          <article>
            <ProfileHero philosopher={philosopher} />
            <section className="mt-12">
              <h2 className="font-sans text-sm font-semibold tracking-widest uppercase text-zinc-700 dark:text-zinc-400 mb-6">
                Biography
              </h2>
              <div className="font-sans text-base leading-[1.85] text-slate-500 dark:text-stone-400 max-w-[68ch]">
                {philosopher.fullBiography.split("\n\n").map((para, i) => (
                  <p key={i} className="mb-5">{para}</p>
                ))}
              </div>
            </section>
            {philosopher.importantWorks.length > 0 && (
              <LearningHighlight type="works" works={philosopher.importantWorks} />
            )}
            {philosopher.keyTakeaways.length > 0 && (
              <LearningHighlight type="takeaways" takeaways={philosopher.keyTakeaways} />
            )}
          </article>
          <aside className="sticky top-16 md:top-[88px]">
            <ContextSidebar philosopher={philosopher} />
          </aside>
        </div>
      </div>
    </>
  );
}
