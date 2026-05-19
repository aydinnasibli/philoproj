/**
 * Migration: convert school.philosophers from flat reference array
 * to array of objects { philosopher: ref, isKeyThinker: bool }
 *
 * Run with:  npx tsx scripts/migrate-school-philosophers.ts
 */

import { createClient } from "next-sanity";
import * as fs from "fs";
import * as path from "path";

// ── Load .env.local manually (no dotenv dependency needed) ───────────────────
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^([^#=\s][^=]*)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
  }
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset   = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token     = process.env.SANITY_API_TOKEN;

if (!projectId || !dataset || !token) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, or SANITY_API_TOKEN in .env.local");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2025-03-04",
  useCdn: false,
  token,
});

type RawRef = { _type: "reference"; _ref: string; _key?: string };
type RawPhilosopherEntry = RawRef | { _type: "object"; philosopher: RawRef; isKeyThinker: boolean; _key?: string };

type SchoolDoc = {
  _id: string;
  title: string;
  philosophers?: RawPhilosopherEntry[];
};

async function migrate() {
  const schools = await client.fetch<SchoolDoc[]>(
    `*[_type == "school"]{ _id, title, philosophers }`
  );

  console.log(`Found ${schools.length} schools.\n`);

  let migrated = 0;
  let skipped  = 0;

  for (const school of schools) {
    const entries = school.philosophers ?? [];

    if (entries.length === 0) {
      console.log(`  ${school.title}: no philosophers, skipping`);
      skipped++;
      continue;
    }

    // Check if already migrated (first entry is already an object with philosopher field)
    const firstEntry = entries[0] as RawPhilosopherEntry;
    if ("philosopher" in firstEntry) {
      console.log(`  ${school.title}: already migrated, skipping`);
      skipped++;
      continue;
    }

    // Convert flat references → objects
    const converted = entries.map((entry, i) => {
      const ref = entry as RawRef;
      return {
        _type: "object",
        _key: ref._key ?? `phil_${i}`,
        philosopher: { _type: "reference", _ref: ref._ref },
        isKeyThinker: false,
      };
    });

    await client.patch(school._id).set({ philosophers: converted }).commit();
    console.log(`  ✓ ${school.title}: migrated ${converted.length} philosopher(s)`);
    migrated++;
  }

  console.log(`\nDone. Migrated: ${migrated}, Skipped: ${skipped}`);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
