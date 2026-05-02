import { getPhilosopherBySlug, getPhilosopherSlugs } from "@/lib/sanity/queries";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProfileHero from "@/components/profile/ProfileHero";
import LearningHighlight from "@/components/profile/LearningHighlight";
import ContextSidebar from "@/components/profile/ContextSidebar";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://thelivingmanuscript.com";

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "96px 2.5rem 3rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "4rem", alignItems: "start" }}>
          <article>
            <ProfileHero philosopher={philosopher} />
            <section style={{ marginTop: "3rem" }}>
              <h2 style={{
                fontFamily: "var(--font-sans)", fontSize: "10px", fontWeight: 600,
                letterSpacing: "0.2em", textTransform: "uppercase",
                color: "var(--accent)", marginBottom: "1.5rem",
              }}>
                Biography
              </h2>
              <div className="prose-body">
                {philosopher.fullBiography.split("\n\n").map((para, i) => (
                  <p key={i} style={{ marginBottom: "1.25rem" }}>{para}</p>
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
          <aside style={{ position: "sticky", top: "88px" }}>
            <ContextSidebar philosopher={philosopher} />
          </aside>
        </div>
      </div>
    </>
  );
}
