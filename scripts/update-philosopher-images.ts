/**
 * Curated portrait migration — writes a specific, hand-picked Wikimedia portrait
 * URL to each philosopher document in Sanity.
 *
 * Images are chosen for style consistency and quality (640px where available):
 *   - Classical oil paintings / engravings preferred
 *   - Raphael fresco details for Averroes
 *   - Authenticated marble busts where no painted portrait survives
 *     (Plato, Aristotle, Antisthenes, Marcus Aurelius, Plotinus)
 *
 * Run:
 *   npm run update-philosopher-images
 *
 * Safe to re-run — only patches records where the URL has actually changed.
 * Resolves any redirect URLs (e.g. Special:FilePath) before writing.
 */

import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2025-03-04",
  token:      process.env.SANITY_API_TOKEN,
  useCdn:     false,
});

const WIKI_UA = "PhiloProj/1.0 (https://github.com/AydinNasibli/philoproj; aydinnasibli7@gmail.com)";

// Curated Wikimedia portrait URLs via Special:FilePath?width=500.
// Using Special:FilePath rather than direct thumb URLs because Wikimedia only
// serves pre-cached thumbnail widths — which widths exist varies per image.
// Special:FilePath resolves to whatever pre-cached size is closest to the
// requested width, guaranteeing a valid URL. verifyAndResolve follows all
// redirects and stores the final upload.wikimedia.org URL in Sanity.
const PHILOSOPHER_IMAGES: Record<string, string> = {
  // — Painted portraits & engravings ——————————————————————————————————————————
  "philosopher-anaxagoras":
    // Lebiedzki / Rahl painted portrait
    "https://commons.wikimedia.org/wiki/Special:FilePath/Anaxagoras_Lebiedzki_Rahl.jpg?width=500",

  "philosopher-anaximander":
    // Attributed Pietro Bellotti oil painting
    "https://commons.wikimedia.org/wiki/Special:FilePath/Pietro_Bellotti_%28attr%29_Anaximander.jpg?width=500",

  "philosopher-aquinas":
    // Carlo Crivelli-style Dominican portrait
    "https://commons.wikimedia.org/wiki/Special:FilePath/St-thomas-aquinasFXD.jpg?width=500",

  "philosopher-augustine":
    // Philippe de Champaigne oil painting (1645–1650)
    "https://commons.wikimedia.org/wiki/Special:FilePath/Saint_Augustine_by_Philippe_de_Champaigne.jpg?width=500",

  "philosopher-averroes":
    // Raphael's School of Athens — individual portrait closeup
    "https://commons.wikimedia.org/wiki/Special:FilePath/Averroes_closeup.jpg?width=500",

  "philosopher-descartes":
    // Frans Hals oil portrait
    "https://commons.wikimedia.org/wiki/Special:FilePath/Frans_Hals_-_Portret_van_Ren%C3%A9_Descartes.jpg?width=500",

  "philosopher-hegel":
    // Jakob Schlesinger oil portrait (1831)
    "https://commons.wikimedia.org/wiki/Special:FilePath/Jakob_Schlesinger_-_Hegel_1831.jpg?width=500",

  "philosopher-hume":
    // Allan Ramsay oil portrait (1766)
    "https://commons.wikimedia.org/wiki/Special:FilePath/David_Hume_Ramsay.jpg?width=500",

  "philosopher-kant":
    // Johann Gottlieb Becker oil portrait
    "https://commons.wikimedia.org/wiki/Special:FilePath/Immanuel_Kant_-_Gemaelde_1.jpg?width=500",

  "philosopher-locke":
    // Godfrey Kneller oil portrait (Hermitage, 1697)
    "https://commons.wikimedia.org/wiki/Special:FilePath/Godfrey_Kneller_-_Portrait_of_John_Locke_%28Hermitage%29.jpg?width=500",

  "philosopher-nietzsche":
    // Canonical 1882 portrait photograph (sepia)
    "https://commons.wikimedia.org/wiki/Special:FilePath/Nietzsche187a.jpg?width=500",

  "philosopher-socrates":
    // Jean-Baptiste-Michel Dupréel engraving (1825) — portrait style
    "https://commons.wikimedia.org/wiki/Special:FilePath/Jean-Baptiste-Michel_Dupr%C3%A9el_S%C3%B3crates.jpg?width=500",

  "philosopher-spinoza":
    // Anonymous 17th-century oil portrait
    "https://commons.wikimedia.org/wiki/Special:FilePath/Spinoza.jpg?width=500",

  "philosopher-wittgenstein":
    // 1929 portrait photograph
    "https://commons.wikimedia.org/wiki/Special:FilePath/Ludwig_Wittgenstein_1929.jpg?width=500",

  // — Classical busts (no authenticated painted portrait survives) ————————————
  "philosopher-antisthenes":
    // Pio-Clementino marble bust, Vatican Museums
    "https://commons.wikimedia.org/wiki/Special:FilePath/Antisthenes_Pio-Clementino_Inv288.jpg?width=500",

  "philosopher-aristotle":
    // Altemps marble bust, Palazzo Altemps, Rome
    "https://commons.wikimedia.org/wiki/Special:FilePath/Aristotle_Altemps_Inv8575.jpg?width=500",

  "philosopher-marcus-aurelius":
    // Louvre marble portrait bust (161–169 AD)
    "https://commons.wikimedia.org/wiki/Special:FilePath/Marcus_Aurelius_Louvre_MR561_n01.jpg?width=500",

  "philosopher-plato":
    // Silanion marble bust, Musei Capitolini
    "https://commons.wikimedia.org/wiki/Special:FilePath/Plato_Silanion_Musei_Capitolini_MC1377.png?width=500",

  "philosopher-plotinus":
    // Ostia Antica marble portrait
    "https://commons.wikimedia.org/wiki/Special:FilePath/Plotinos.jpg?width=500",
};

/**
 * Verifies that a URL is reachable and returns the final URL after any redirects
 * (handles Special:FilePath → upload.wikimedia.org chains).
 *
 * Uses GET not HEAD: Wikimedia generates uncached thumbnail sizes on-demand
 * only for GET requests — HEAD returns 404 for sizes not yet in CDN cache.
 */
async function verifyAndResolve(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      method:   "GET",
      headers:  { "User-Agent": WIKI_UA },
      redirect: "follow",
    });
    await res.body?.cancel();
    if (!res.ok) return null;
    return res.url;
  } catch {
    return null;
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
    const targetUrl = PHILOSOPHER_IMAGES[phil._id];

    if (!targetUrl) {
      console.warn(`  ⚠  No portrait mapping for "${phil.name}" (${phil._id}) — skipping`);
      skipped++;
      continue;
    }

    const resolvedUrl = await verifyAndResolve(targetUrl);
    if (!resolvedUrl) {
      console.error(`  ✗  ${phil.name}: URL not reachable — ${targetUrl}`);
      failed++;
      continue;
    }

    if (phil.avatarUrl === resolvedUrl) {
      console.log(`  –  ${phil.name}: already up to date`);
      skipped++;
      continue;
    }

    try {
      await client.patch(phil._id).set({ avatarUrl: resolvedUrl }).commit();
      console.log(`  ✓  ${phil.name}: ${resolvedUrl}`);
      updated++;
    } catch (err) {
      console.error(`  ✗  ${phil.name}: Sanity write failed — ${(err as Error).message}`);
      failed++;
    }

    await new Promise((r) => setTimeout(r, 100));
  }

  console.log(`\nDone — ${updated} updated, ${skipped} skipped, ${failed} failed.`);

  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error("\nFatal error:", err);
  process.exit(1);
});
