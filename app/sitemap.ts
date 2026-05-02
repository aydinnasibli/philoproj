import type { MetadataRoute } from "next";
import { sanityClient } from "@/lib/sanity/client";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://thelivingmanuscript.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [philosopherSlugs, schoolSlugs] = await Promise.all([
    sanityClient.fetch<{ slug: string; _updatedAt: string }[]>(
      `*[_type == "philosopher" && defined(slug.current)]{ "slug": slug.current, _updatedAt }`
    ),
    sanityClient.fetch<{ slug: string; _updatedAt: string }[]>(
      `*[_type == "school" && defined(slug.current)]{ "slug": slug.current, _updatedAt }`
    ),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,                   lastModified: new Date(), changeFrequency: "weekly",  priority: 1   },
    { url: `${BASE}/philosophers`, lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/schools`,      lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/lineage`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    // /archive omitted — its canonical points to /philosophers (duplicate content)
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

  return [...staticRoutes, ...philosopherRoutes, ...schoolRoutes];
}
