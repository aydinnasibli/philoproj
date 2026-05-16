import { connectToDatabase } from "@/lib/mongoose";
import RateLimitModel from "@/lib/models/RateLimit";

export async function checkRateLimit(
  userId: string,
  action: string,
  maxRequests: number,
  windowMs: number
): Promise<void> {
  await connectToDatabase();
  const key = `${userId}:${action}`;
  const windowCutoff = new Date(Date.now() - windowMs);

  // Atomic: if within the current window, increment count; otherwise start a new window.
  // Using an aggregation pipeline update so the conditional branch is a single round-trip.
  const doc = await RateLimitModel.findOneAndUpdate(
    { key },
    [
      {
        $set: {
          windowStart: {
            $cond: {
              if: { $gt: ["$windowStart", windowCutoff] },
              then: "$windowStart",
              else: "$$NOW",
            },
          },
          count: {
            $cond: {
              if: { $gt: ["$windowStart", windowCutoff] },
              then: { $add: ["$count", 1] },
              else: 1,
            },
          },
        },
      },
    ],
    { upsert: true, new: true }
  );

  if (doc.count > maxRequests) {
    throw new Error("Too many requests — please slow down.");
  }
}
