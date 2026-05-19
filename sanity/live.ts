import { createClient } from "next-sanity";
import { defineLive } from "next-sanity/live";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  useCdn: true,
  apiVersion: "2025-03-04",
});

const serverToken = process.env.SANITY_API_TOKEN;
if (!serverToken) throw new Error("Missing SANITY_API_TOKEN");

const browserToken = process.env.SANITY_API_READ_TOKEN;
if (!browserToken) throw new Error("Missing SANITY_API_READ_TOKEN");

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken,
  browserToken,
});
