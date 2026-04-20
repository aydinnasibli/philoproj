import { getPhilosopherBySlug, type FullPhilosopher } from "@/lib/mockData";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProfileHero from "@/components/profile/ProfileHero";
import LearningHighlight from "@/components/profile/LearningHighlight";
import ContextSidebar from "@/components/profile/ContextSidebar";

export { type FullPhilosopher };

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = getPhilosopherBySlug(slug);
  if (!p) return { title: "Not Found" };
  return {
    title: p.name,
    description: p.shortSummary ?? `Explore the philosophy of ${p.name}.`,
  };
}

export default async function PhilosopherPage({ params }: Props) {
  const { slug } = await params;
  const philosopher = getPhilosopherBySlug(slug);
  if (!philosopher) notFound();

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "3rem 2.5rem" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: "4rem",
          alignItems: "start",
        }}
      >
        {/* Main content */}
        <article>
          <ProfileHero philosopher={philosopher} />

          {/* Full Biography */}
          <section style={{ marginTop: "3rem" }}>
            <h2
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--accent)",
                marginBottom: "1.5rem",
              }}
            >
              Biography
            </h2>
            <div className="prose-body">
              {philosopher.fullBiography.split("\n\n").map((para, i) => (
                <p key={i} style={{ marginBottom: "1.25rem" }}>
                  {para}
                </p>
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

        {/* Sticky Sidebar */}
        <aside style={{ position: "sticky", top: "88px" }}>
          <ContextSidebar philosopher={philosopher} />
        </aside>
      </div>
    </div>
  );
}
