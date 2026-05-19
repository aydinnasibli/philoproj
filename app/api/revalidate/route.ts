import { parseBody } from "next-sanity/webhook";
import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";

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

    if (!body?._type) {
      return new Response("Bad request", { status: 400 });
    }

    revalidateTag(body._type, "max");
    return Response.json({ revalidated: true, type: body._type });
  } catch (err) {
    console.error(err);
    return new Response("Internal server error", { status: 500 });
  }
}
