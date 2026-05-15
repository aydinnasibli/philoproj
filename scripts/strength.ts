/**
 * One-time migration — writes strength values to existing mentor/student
 * relationships in Sanity, replacing plain references with {philosopher, strength} objects.
 *
 * Run once:
 *   npx ts-node --project tsconfig.json scripts/strength.ts
 */

import { createClient } from "@sanity/client";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2025-03-04",
  token:      process.env.SANITY_API_TOKEN,
  useCdn:     false,
});

type Strength = "strong" | "medium" | "weak";

// Previously hardcoded in LINEAGE_STRENGTH on the frontend.
// Keys are [mentor-slug, student-slug], value is the strength.
const STUDENT_STRENGTH: Record<string, Record<string, Strength>> = {
  "socrates":  { "plato": "strong", "antisthenes": "medium" },
  "plato":     { "aristotle": "strong" },
  "descartes": { "spinoza": "strong" },
  "locke":     { "hume": "strong" },
  "hume":      { "kant": "strong" },
  "kant":      { "nietzsche": "medium" },
  "nietzsche": { "wittgenstein": "medium" },
};

// All mentor relationships default to strong (direct pedagogical bond).
// Add overrides here if needed.
const MENTOR_STRENGTH: Record<string, Record<string, Strength>> = {};

type SanityPhilosopher = {
  _id: string;
  slug: string;
  mentors: ({ _type: "reference"; _ref: string; _key?: string } | { philosopher: { _ref: string }; strength: string; _key?: string })[];
  students: ({ _type: "reference"; _ref: string; _key?: string } | { philosopher: { _ref: string }; strength: string; _key?: string })[];
};

async function run() {
  console.log("Fetching philosophers from Sanity...\n");

  const philosophers: SanityPhilosopher[] = await client.fetch(
    `*[_type == "philosopher"]{ _id, "slug": slug.current, mentors, students }`
  );

  // Build a lookup: _id → slug
  const idToSlug = new Map(philosophers.map((p) => [p._id, p.slug]));

  let updated = 0;

  for (const p of philosophers) {
    const patch: Record<string, unknown> = {};

    // ── Mentors ──────────────────────────────────────────────────────────────
    if (p.mentors?.length) {
      patch.mentors = p.mentors.map((m, idx) => {
        const ref = "_ref" in m ? m._ref : (m as { philosopher: { _ref: string } }).philosopher._ref;
        const mentorSlug = idToSlug.get(ref) ?? "";
        const strength: Strength =
          MENTOR_STRENGTH[mentorSlug]?.[p.slug] ??
          MENTOR_STRENGTH[p.slug]?.[mentorSlug] ??
          "strong";
        return {
          _key: m._key ?? `men-${idx}`,
          philosopher: { _type: "reference", _ref: ref },
          strength,
        };
      });
    }

    // ── Students ─────────────────────────────────────────────────────────────
    if (p.students?.length) {
      patch.students = p.students.map((s, idx) => {
        const ref = "_ref" in s ? s._ref : (s as { philosopher: { _ref: string } }).philosopher._ref;
        const studentSlug = idToSlug.get(ref) ?? "";
        const strength: Strength =
          STUDENT_STRENGTH[p.slug]?.[studentSlug] ?? "strong";
        return {
          _key: s._key ?? `stu-${idx}`,
          philosopher: { _type: "reference", _ref: ref },
          strength,
        };
      });
    }

    if (Object.keys(patch).length) {
      await client.patch(p._id).set(patch).commit();
      console.log(`  ✓ ${p.slug}`);
      updated++;
    }
  }

  console.log(`\nDone — updated ${updated} philosopher(s).`);
}

run().catch((err) => { console.error(err); process.exit(1); });
