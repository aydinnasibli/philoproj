/**
 * One-time migration — patches existing school documents with canvas
 * position, startYear, and tagline fields that were previously hardcoded
 * in LineageCanvas.tsx.
 *
 * Run with:
 *   npm run migrate-schools
 */

import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2025-03-04",
  token:      process.env.SANITY_API_TOKEN,
  useCdn:     false,
});

const SCHOOL_DATA: Record<string, {
  networkX: number;
  networkY: number;
  startYear: number;
  tagline: string;
}> = {
  "socratic-method":     { networkX: 4,  networkY: 45, startYear: -470, tagline: "DIALECTIC ORIGIN"  },
  "platonism":           { networkX: 11, networkY: 28, startYear: -428, tagline: "THE REALM OF FORMS" },
  "aristotelianism":     { networkX: 18, networkY: 58, startYear: -384, tagline: "LOGIC & VIRTUE"     },
  "stoicism":            { networkX: 26, networkY: 38, startYear: -300, tagline: ""                   },
  "neoplatonism":        { networkX: 33, networkY: 60, startYear:  204, tagline: ""                   },
  "scholasticism":       { networkX: 40, networkY: 44, startYear: 1000, tagline: ""                   },
  "rationalism":         { networkX: 51, networkY: 24, startYear: 1596, tagline: "REASON SUPREME"     },
  "empiricism":          { networkX: 51, networkY: 68, startYear: 1632, tagline: "SENSATION & PROOF"  },
  "critical-philosophy": { networkX: 62, networkY: 40, startYear: 1724, tagline: "MIND'S FRONTIER"    },
  "german-idealism":     { networkX: 70, networkY: 22, startYear: 1770, tagline: ""                   },
  "existentialism":      { networkX: 77, networkY: 60, startYear: 1844, tagline: "BEING & VOID"       },
  "analytic-philosophy": { networkX: 88, networkY: 38, startYear: 1889, tagline: "LANGUAGE AS LIMIT"  },
};

async function migrate() {
  console.log("Fetching school documents from Sanity...\n");

  const schools = await client.fetch<{ _id: string; slug: { current: string } }[]>(
    `*[_type == "school"]{ _id, slug }`
  );

  console.log(`Found ${schools.length} schools.\n`);

  for (const school of schools) {
    const slug = school.slug?.current;
    const data = SCHOOL_DATA[slug];

    if (!data) {
      console.log(`  ⚠ No migration data for slug "${slug}" — skipping`);
      continue;
    }

    await client
      .patch(school._id)
      .set({
        networkX:  data.networkX,
        networkY:  data.networkY,
        startYear: data.startYear,
        ...(data.tagline ? { tagline: data.tagline } : {}),
      })
      .commit();

    console.log(`  ✓ Patched "${slug}" → x:${data.networkX} y:${data.networkY} year:${data.startYear}`);
  }

  console.log("\nMigration complete.");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
