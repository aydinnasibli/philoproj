import { getLearningPathBySlug, getLearningPathSlugs } from "@/sanity/queries";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import PathDetail from "@/components/paths/PathDetail";
import { getPathProgress } from "@/app/progress/actions";

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

  const description = path.description || `Explore the "${path.title}" learning path.`;

  return {
    title: path.title,
    description,
    alternates: { canonical: `/paths/${path.slug}` },
    openGraph: {
      title: path.title,
      description,
      url: `${BASE}/paths/${path.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: path.title,
      description,
    },
  };
}

export default async function LearningPathPage({ params }: Props) {
  const { slug } = await params;
  const path = await getLearningPathBySlug(slug);
  if (!path) notFound();

  const { userId } = await auth();
  const isAuthenticated = Boolean(userId);
  const { completedSteps } = isAuthenticated
    ? await getPathProgress(slug)
    : { completedSteps: [] };

  return (
    <div className="px-4 md:px-10 pt-8 md:pt-16 pb-12">
      <PathDetail path={path} completedSteps={completedSteps} isAuthenticated={isAuthenticated} />
    </div>
  );
}
