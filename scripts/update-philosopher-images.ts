/**
 * One-time migration — fetches the canonical, cached thumbnail URL for each
 * philosopher from the Wikipedia REST API and writes it back to Sanity.
 *
 * Why: Wikipedia's CDN only serves pre-generated thumbnail sizes. Arbitrary
 * sizes (like the 440px thumbnails previously stored) return HTTP 400. The
 * REST API returns the size Wikipedia itself uses, which is always cached.
 *
 * Run:
 *   npm run update-philosopher-images
 *
 * Safe to re-run — only patches records where the URL has actually changed.
 */

import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2025-03-04",
  token:      process.env.SANITY_API_TOKEN,
  useCdn:     false,
});

// Wikipedia article titles for each philosopher document.
// Maps Sanity document _id → English Wikipedia article title.
const WIKIPEDIA_ARTICLES: Record<string, string> = {
  "philosopher-anaxagoras":     "Anaxagoras",
  "philosopher-anaximander":    "Anaximander",
  "philosopher-antisthenes":    "Antisthenes",
  "philosopher-aquinas":        "Thomas Aquinas",
  "philosopher-aristotle":      "Aristotle",
  "philosopher-augustine":      "Augustine of Hippo",
  "philosopher-averroes":       "Averroes",
  "philosopher-descartes":      "René Descartes",
  "philosopher-hegel":          "Georg Wilhelm Friedrich Hegel",
  "philosopher-hume":           "David Hume",
  "philosopher-kant":           "Immanuel Kant",
  "philosopher-locke":          "John Locke",
  "philosopher-marcus-aurelius":"Marcus Aurelius",
  "philosopher-nietzsche":      "Friedrich Nietzsche",
  "philosopher-plato":          "Plato",
  "philosopher-plotinus":       "Plotinus",
  "philosopher-socrates":       "Socrates",
  "philosopher-spinoza":        "Baruch Spinoza",
  "philosopher-wittgenstein":   "Ludwig Wittgenstein",
};

const WIKI_UA = "PhiloProj/1.0 (https://github.com/AydinNasibli/philoproj; aydinnasibli7@gmail.com)";

interface WikiSummary {
  thumbnail?: { source: string; width: number; height: number };
  originalimage?: { source: string; width: number; height: number };
}

async function fetchWikipediaThumbnail(articleTitle: string): Promise<string> {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(articleTitle)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": WIKI_UA, "Accept": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Wikipedia API returned HTTP ${res.status} for "${articleTitle}"`);
  }

  const data = (await res.json()) as WikiSummary;

  if (!data.thumbnail?.source) {
    throw new Error(`No thumbnail in Wikipedia response for "${articleTitle}"`);
  }

  return data.thumbnail.source;
}

async function verifyUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": WIKI_UA },
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function run() {
  const philosophers = await client.fetch<{ _id: string; name: string; avatarUrl: string }[]>(
    `*[_type == "philosopher"]{ _id, name, avatarUrl } | order(name asc)`
  );

  console.log(`Found ${philosophers.length} philosopher(s) in Sanity.\n`);

  let updated = 0;
  let skipped = 0;
  let failed  = 0;

  for (const phil of philosophers) {
    const wikiTitle = WIKIPEDIA_ARTICLES[phil._id];

    if (!wikiTitle) {
      console.warn(`  ⚠  No Wikipedia mapping for "${phil.name}" (${phil._id}) — skipping`);
      skipped++;
      continue;
    }

    let thumbUrl: string;
    try {
      thumbUrl = await fetchWikipediaThumbnail(wikiTitle);
    } catch (err) {
      console.error(`  ✗  ${phil.name}: ${(err as Error).message}`);
      failed++;
      continue;
    }

    // Skip if the URL is already correct
    if (phil.avatarUrl === thumbUrl) {
      console.log(`  –  ${phil.name}: already up to date`);
      skipped++;
      continue;
    }

    // Verify the new URL actually resolves before writing
    const accessible = await verifyUrl(thumbUrl);
    if (!accessible) {
      console.error(`  ✗  ${phil.name}: Wikipedia URL not reachable — ${thumbUrl}`);
      failed++;
      continue;
    }

    try {
      await client.patch(phil._id).set({ avatarUrl: thumbUrl }).commit();
      console.log(`  ✓  ${phil.name}: ${thumbUrl}`);
      updated++;
    } catch (err) {
      console.error(`  ✗  ${phil.name}: Sanity write failed — ${(err as Error).message}`);
      failed++;
    }

    // Polite delay between Wikipedia API calls
    await new Promise((r) => setTimeout(r, 150));
  }

  console.log(`\nDone — ${updated} updated, ${skipped} skipped, ${failed} failed.`);

  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error("\nFatal error:", err);
  process.exit(1);
});
