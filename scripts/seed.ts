/**
 * One-time seed script — imports all mock data into Sanity.
 * Run once after creating your Sanity project:
 *   npx ts-node --project tsconfig.json scripts/seed.ts
 */

import { createClient } from "@sanity/client";
import { ERAS, PHILOSOPHERS, SCHOOLS } from "../lib/mockData";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01",
  token:      process.env.SANITY_API_TOKEN,
  useCdn:     false,
});

async function seed() {
  console.log("🌱 Seeding Sanity...\n");

  // ── 1. Eras ──────────────────────────────────────────────────────────────
  console.log("Creating eras...");
  const eraIdMap: Record<string, string> = {};

  for (const era of ERAS) {
    const doc = await client.createOrReplace({
      _type: "era",
      _id:   `era-${era.slug}`,
      title:       era.title,
      slug:        { _type: "slug", current: era.slug },
      startYear:   era.startYear,
      endYear:     era.endYear,
      description: era.description,
    });
    eraIdMap[era._id] = doc._id;
    console.log(`  ✓ ${era.title}`);
  }

  // ── 2. Philosophers (no references yet — avoid circular deps) ────────────
  console.log("\nCreating philosophers (pass 1)...");
  const philIdMap: Record<string, string> = {};

  for (const p of PHILOSOPHERS) {
    const sanityId = `philosopher-${p.slug}`;
    await client.createOrReplace({
      _type: "philosopher",
      _id:   sanityId,
      name:         p.name,
      slug:         { _type: "slug", current: p.slug },
      era:          { _type: "reference", _ref: eraIdMap[p.eraId] ?? `era-${p.eraId}` },
      birthYear:    p.birthYear,
      deathYear:    p.deathYear,
      hookQuote:    p.hookQuote,
      coreBranch:   p.coreBranch,
      networkX:     p.networkX,
      networkY:     p.networkY,
      shortSummary: p.shortSummary,
      fullBiography:p.fullBiography,
      avatarUrl:    p.avatarUrl,
      importantWorks: p.importantWorks,
      keyTakeaways: p.keyTakeaways,
    });
    philIdMap[p._id] = sanityId;
    console.log(`  ✓ ${p.name}`);
  }

  // ── 3. Philosophers (pass 2 — patch in references) ───────────────────────
  console.log("\nPatching philosopher references...");

  for (const p of PHILOSOPHERS) {
    const sanityId = philIdMap[p._id];
    const patch: Record<string, unknown> = {};

    if (p.mentorIds?.length) {
      patch.mentors = p.mentorIds
        .filter((id) => philIdMap[id])
        .map((id) => ({ _type: "reference", _ref: philIdMap[id], _key: id }));
    }
    if (p.studentIds?.length) {
      patch.students = p.studentIds
        .filter((id) => philIdMap[id])
        .map((id) => ({ _type: "reference", _ref: philIdMap[id], _key: id }));
    }
    const influences = (p as { influencedByIds?: { id: string; strength: string }[] }).influencedByIds;
    if (influences?.length) {
      patch.influencedBy = influences
        .filter((i) => philIdMap[i.id])
        .map((i, idx) => ({
          _key: `inf-${idx}`,
          philosopher: { _type: "reference", _ref: philIdMap[i.id] },
          strength: i.strength,
        }));
    }

    if (Object.keys(patch).length) {
      await client.patch(sanityId).set(patch).commit();
      console.log(`  ✓ ${p.name} refs`);
    }
  }

  // ── 4. Schools ───────────────────────────────────────────────────────────
  console.log("\nCreating schools...");
  const schoolIdMap: Record<string, string> = {};

  for (const s of SCHOOLS) {
    const sanityId = `school-${s.slug}`;
    await client.createOrReplace({
      _type: "school",
      _id:   sanityId,
      title:       s.title,
      slug:        { _type: "slug", current: s.slug },
      eraRange:    s.eraRange,
      description: s.description,
      coreIdeas:   s.coreIdeas,
      philosophers: s.philosopherIds
        .filter((id) => philIdMap[id])
        .map((id, idx) => ({ _type: "reference", _ref: philIdMap[id], _key: `p-${idx}` })),
    });
    schoolIdMap[s._id] = sanityId;
    console.log(`  ✓ ${s.title}`);
  }

  // ── 5. Schools — patch influence references ───────────────────────────────
  console.log("\nPatching school influence references...");

  for (const s of SCHOOLS) {
    const sanityId = schoolIdMap[s._id];
    const patch: Record<string, unknown> = {};

    if (s.influencedByIds?.length) {
      patch.influencedBy = s.influencedByIds
        .filter((id) => schoolIdMap[id])
        .map((id, idx) => ({ _type: "reference", _ref: schoolIdMap[id], _key: `by-${idx}` }));
    }
    if (s.influencedToIds?.length) {
      patch.influencedTo = s.influencedToIds
        .filter((id) => schoolIdMap[id])
        .map((id, idx) => ({ _type: "reference", _ref: schoolIdMap[id], _key: `to-${idx}` }));
    }

    if (Object.keys(patch).length) {
      await client.patch(sanityId).set(patch).commit();
      console.log(`  ✓ ${s.title} refs`);
    }
  }

  console.log("\n✅ Seed complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
