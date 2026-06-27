"use server";

import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/db/mongoose";
import UserProgress from "@/db/models/UserProgress";

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

export async function markStepComplete(pathSlug: string, stepIndex: number, totalSteps: number): Promise<void> {
  const userId = await requireUser();
  await connectToDatabase();
  const now = Date.now();

  const existing = await UserProgress.findOne({
    userId,
    completedPathSteps: { $elemMatch: { pathSlug, stepIndex } },
  });
  if (existing) return;

  await UserProgress.updateOne(
    { userId },
    {
      $push: { completedPathSteps: { pathSlug, stepIndex, completedAt: now } },
      $set: { "stats.lastActiveAt": now },
    },
    { upsert: true },
  );

  const doc = await UserProgress.findOne({ userId }).lean();
  if (!doc) return;
  const stepsForPath = doc.completedPathSteps.filter(s => s.pathSlug === pathSlug);
  if (stepsForPath.length >= totalSteps) {
    const alreadyComplete = doc.completedPaths?.some(p => p.pathSlug === pathSlug);
    if (!alreadyComplete) {
      await UserProgress.updateOne(
        { userId },
        {
          $push: { completedPaths: { pathSlug, completedAt: now } },
          $inc: { "stats.totalPathsCompleted": 1 },
        },
      );
    }
  }
}

export async function getViewedPhilosopherIds(): Promise<string[]> {
  const { userId } = await auth();
  if (!userId) return [];
  await connectToDatabase();
  const doc = await UserProgress.findOne({ userId }).lean();
  if (!doc) return [];
  return doc.viewedPhilosophers.map(v => v.philosopherId);
}

export async function getProgress() {
  const { userId } = await auth();
  if (!userId) return null;
  await connectToDatabase();
  const doc = await UserProgress.findOne({ userId }).lean();
  if (!doc) return { viewedPhilosophers: [], completedPathSteps: [], completedPaths: [], stats: { totalPhilosophersViewed: 0, totalPathsCompleted: 0, streak: 0, lastActiveAt: 0 } };
  return {
    viewedPhilosophers: doc.viewedPhilosophers,
    completedPathSteps: doc.completedPathSteps,
    completedPaths: doc.completedPaths ?? [],
    stats: doc.stats ?? { totalPhilosophersViewed: 0, totalPathsCompleted: 0, streak: 0, lastActiveAt: 0 },
  };
}
