import { getSchoolsWithPhilosophers, getAllSchoolSlugs } from "@/lib/sanity/queries";
import SchoolDetail from "@/components/schools/SchoolDetail";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getAllSchoolSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const schools = await getSchoolsWithPhilosophers();
  const school = schools.find((s) => s.slug === slug);
  return { title: school?.title ?? "School" };
}

export default async function SchoolPage({ params }: Props) {
  const { slug } = await params;
  const schools = await getSchoolsWithPhilosophers();
  const school = schools.find((s) => s.slug === slug);
  if (!school) notFound();
  return <SchoolDetail school={school} />;
}
