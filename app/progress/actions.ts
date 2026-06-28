"use server";

import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/db/mongoose";
import UserProgress from "@/db/models/UserProgress";
import { checkRateLimit } from "@/lib/rateLimit";

async function requireUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

export async function trackPhilosopherView(philosopherId: string, slug: string): Promise<void> {
  const userId = await requireUser();
  await connectToDatabase();
  const now = Date.now();

  const result = await UserProgress.updateOne(
    { userId, "viewedPhilosophers.philosopherId": philosopherId },
    { $inc: { "viewedPhilosophers.$.viewCount": 1 }, $set: { "viewedPhilosophers.$.lastViewedAt": now, "stats.lastActiveAt": now } },
  );

  if (result.matchedCount === 0) {
    await UserProgress.updateOne(
      { userId },
      {
        $push: { viewedPhilosophers: { philosopherId, slug, firstViewedAt: now, viewCount: 1, lastViewedAt: now } },
        $inc: { "stats.totalPhilosophersViewed": 1 },
        $set: { "stats.lastActiveAt": now },
      },
      { upsert: true },
    );
  }
}

export async function markStepComplete(
  pathSlug: string,
  stepIndex: number,
  totalSteps: number,
): Promise<{ completed: true }> {
  if (typeof pathSlug !== "string" || pathSlug.trim().length === 0) {
    throw new Error("Invalid pathSlug");
  }
  if (!Number.isInteger(totalSteps) || totalSteps <= 0) {
    throw new Error("Invalid totalSteps");
  }
  if (!Number.isInteger(stepIndex) || stepIndex < 0 || stepIndex >= totalSteps) {
    throw new Error("Invalid stepIndex");
  }

  const userId = await requireUser();
  await checkRateLimit(`${userId}:markStep`, 60, 60);
  await connectToDatabase();
  const now = Date.now();

  await UserProgress.updateOne(
    { userId },
    {
      $addToSet: { completedPathSteps: { pathSlug, stepIndex, completedAt: now } },
      $set: { "stats.lastActiveAt": now },
    },
    { upsert: true },
  );

  const doc = await UserProgress.findOne({ userId }).lean();
  const completedForPath = new Set(
    (doc?.completedPathSteps ?? [])
      .filter((s) => s.pathSlug === pathSlug)
      .map((s) => s.stepIndex),
  );

  let allComplete = true;
  for (let i = 0; i < totalSteps; i++) {
    if (!completedForPath.has(i)) {
      allComplete = false;
      break;
    }
  }

  if (allComplete) {
    const alreadyCompleted = (doc?.completedPaths ?? []).some((p) => p.pathSlug === pathSlug);
    if (!alreadyCompleted) {
      await UserProgress.updateOne(
        { userId, "completedPaths.pathSlug": { $ne: pathSlug } },
        {
          $addToSet: { completedPaths: { pathSlug, completedAt: now } },
          $inc: { "stats.totalPathsCompleted": 1 },
          $set: { "stats.lastActiveAt": now },
        },
      );
    }
  }

  return { completed: true };
}

export async function getPathProgress(pathSlug: string): Promise<{ completedSteps: number[] }> {
  const { userId } = await auth();
  if (!userId) return { completedSteps: [] };

  await connectToDatabase();
  const doc = await UserProgress.findOne({ userId }).lean();
  if (!doc) return { completedSteps: [] };

  const completedSteps = (doc.completedPathSteps ?? [])
    .filter((s) => s.pathSlug === pathSlug)
    .map((s) => s.stepIndex);

  return { completedSteps };
}

