import type { MetadataRoute } from "next";
import { sanityFetch } from "@/sanity/fetch";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://thelivingmanuscript.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ data: philosopherSlugs }, { data: schoolSlugs }, { data: pathSlugs }] = await Promise.all([
    sanityFetch<{ slug: string; _updatedAt: string }[]>({
      tags: ["philosopher"],
      query: `*[_type == "philosopher" && defined(slug.current)]{ "slug": slug.current, _updatedAt }`,
    }),
    sanityFetch<{ slug: string; _updatedAt: string }[]>({
      tags: ["school"],
      query: `*[_type == "school" && defined(slug.current)]{ "slug": slug.current, _updatedAt }`,
    }),
    sanityFetch<{ slug: string; _updatedAt: string }[]>({
      tags: ["learningPath"],
      query: `*[_type == "learningPath" && defined(slug.current)]{ "slug": slug.current, _updatedAt }`,
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,                   lastModified: new Date(), changeFrequency: "weekly",  priority: 1   },
    { url: `${BASE}/philosophers`, lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/schools`,      lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/lineage`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/paths`,        lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
  ];

  const philosopherRoutes: MetadataRoute.Sitemap = philosopherSlugs.map((p) => ({
    url: `${BASE}/philosophers/${p.slug}`,
    lastModified: new Date(p._updatedAt),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const schoolRoutes: MetadataRoute.Sitemap = schoolSlugs.map((s) => ({
    url: `${BASE}/schools/${s.slug}`,
    lastModified: new Date(s._updatedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const pathRoutes: MetadataRoute.Sitemap = pathSlugs.map((p) => ({
    url: `${BASE}/paths/${p.slug}`,
    lastModified: new Date(p._updatedAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...philosopherRoutes, ...schoolRoutes, ...pathRoutes];
}
