import { getLearningPathBySlug, getLearningPathSlugs } from "@/sanity/queries";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PathDetail from "@/components/paths/PathDetail";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://thelivingmanuscript.com";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getLearningPathSlugs();
  return slugs.length > 0 ? slugs : [{ slug: "__placeholder__" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const path = await getLearningPathBySlug(slug);
  if (!path) return { title: "Not Found" };

  return {
    title: path.title,
    description: path.description,
    alternates: { canonical: `/paths/${path.slug}` },
    openGraph: {
      title: path.title,
      description: path.description,
      url: `${BASE}/paths/${path.slug}`,
    },
  };
}

export default async function LearningPathPage({ params }: Props) {
  const { slug } = await params;
  const path = await getLearningPathBySlug(slug);
  if (!path) notFound();

  return (
    <div className="px-4 md:px-10 pt-8 md:pt-16 pb-12">
      <PathDetail path={path} />
    </div>
  );
}
