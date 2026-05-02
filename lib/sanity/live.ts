import { createClient } from "next-sanity";
import { defineLive } from "next-sanity/live";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  useCdn: false,
  apiVersion: "2025-03-04",
});

const serverToken = process.env.SANITY_API_TOKEN;
if (!serverToken) throw new Error("Missing SANITY_API_TOKEN");

// SANITY_API_READ_TOKEN should be a Viewer-only token for better security.
// Falls back to SANITY_API_TOKEN if not set.
const browserToken = process.env.SANITY_API_READ_TOKEN ?? serverToken;

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken,
  browserToken,
});
