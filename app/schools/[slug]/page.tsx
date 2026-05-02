import { getSchoolBySlug, getSchoolSlugs } from "@/lib/sanity/queries";
import SchoolDetail from "@/components/schools/SchoolDetail";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getSchoolSlugs();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const school = await getSchoolBySlug(slug);
  return { title: school?.title ?? "School" };
}

export default async function SchoolPage({ params }: Props) {
  const { slug } = await params;
  const school = await getSchoolBySlug(slug);
  if (!school) notFound();
  return <SchoolDetail school={school} />;
}
