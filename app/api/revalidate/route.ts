import { parseBody } from "next-sanity/webhook";
import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";

type WebhookPayload = { _type: string; _id: string };

export async function POST(req: NextRequest) {
  try {
    const { body, isValidSignature } = await parseBody<WebhookPayload>(
      req,
      process.env.SANITY_WEBHOOK_SECRET,
    );

    if (isValidSignature === false) {
      return new Response("Invalid signature", { status: 401 });
    }

    const KNOWN_TYPES = ["philosopher", "era", "school"] as const;
    if (!body?._type || !KNOWN_TYPES.includes(body._type as typeof KNOWN_TYPES[number])) {
      return new Response("Bad request", { status: 400 });
    }

    revalidateTag(body._type, "max");
    return Response.json({ revalidated: true, type: body._type });
  } catch (err) {
    Sentry.captureException(err);
    return new Response("Internal server error", { status: 500 });
  }
}
