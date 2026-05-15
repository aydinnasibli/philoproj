/**
 * One-time migration — computes and stores wordCount for all notes that
 * predate the wordCount field. Safe to re-run; only touches documents
 * where the field is missing.
 *
 * Run:
 *   npm run backfill-wordcount
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import mongoose from "mongoose";
import { connectToDatabase } from "../lib/mongoose";
import NoteModel from "../lib/models/Note";

const computeWc = (s: string) =>
  s.trim() ? s.split(/\s+/).filter(Boolean).length : 0;

async function run() {
  await connectToDatabase();

  const notes = await NoteModel
    .find({ wordCount: { $exists: false } })
    .select("_id body")
    .lean();

  if (notes.length === 0) {
    console.log("Nothing to migrate — all notes already have wordCount.");
    await mongoose.disconnect();
    return;
  }

  console.log(`Backfilling ${notes.length} note(s)…`);

  const ops = notes.map((n) => ({
    updateOne: {
      filter: { _id: n._id },
      update: { $set: { wordCount: computeWc(n.body ?? "") } },
    },
  }));

  const result = await NoteModel.bulkWrite(ops, { ordered: false });
  console.log(`Done — ${result.modifiedCount} note(s) updated.`);

  await mongoose.disconnect();
}

run().catch((err) => { console.error(err); process.exit(1); });
