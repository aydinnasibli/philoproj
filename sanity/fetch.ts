import { cacheLife, cacheTag } from "next/cache";
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
  "use cache";
  cacheLife("weeks");
  for (const tag of tags) cacheTag(tag);

  const data = await sanityClient.fetch<T>(query, params);
  return { data };
}
