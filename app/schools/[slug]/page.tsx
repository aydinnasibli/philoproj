import { getSchoolsWithPhilosophers } from "@/lib/mockData";
import SchoolDetail from "@/components/schools/SchoolDetail";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return getSchoolsWithPhilosophers().map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const school = getSchoolsWithPhilosophers().find(s => s.slug === slug);
  return { title: school?.title ?? "School" };
}

export default async function SchoolPage({ params }: Props) {
  const { slug } = await params;
  const school = getSchoolsWithPhilosophers().find(s => s.slug === slug);
  if (!school) notFound();
  return <SchoolDetail school={school} />;
}
