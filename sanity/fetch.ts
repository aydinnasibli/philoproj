import { sanityClient } from "./client";

export async function sanityFetch<T = unknown>({
  query,
  params = {},
  tags = [],
}: {
  query: string;
  params?: Record<string, unknown>;
  tags?: string[];
}): Promise<{ data: T }> {
  const data = await sanityClient.fetch<T>(query, params, {
    next: {
      tags,
      revalidate: 60, // 1 week fallback — webhook revalidation handles instant updates
    },
  });
  return { data };
}
