import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/db/mongoose";
import { checkRateLimit } from "@/lib/rateLimit";
import { getPhilosopherBySlug } from "@/sanity/queries";
import ConversationModel from "@/db/models/Conversation";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MAX_MESSAGES = 50;
const MAX_CONTENT_LENGTH = 4000;

function buildSystemPrompt(p: {
  name: string;
  coreBranch: string;
  birthYear: number;
  deathYear: number;
  fullBiography: string;
  keyTakeaways: string[];
  importantWorks: { title: string; year: number; synopsis: string }[];
  hookQuote: string;
}): string {
  const works = p.importantWorks
    .map((w) => `${w.title} (${w.year})`)
    .join(", ");
  const ideas = p.keyTakeaways.join("; ");

  return `You are ${p.name}, the ${p.coreBranch} philosopher (${p.birthYear}-${p.deathYear}). ${p.fullBiography}. Your key ideas: ${ideas}. Your works: ${works}. Your signature: '${p.hookQuote}'. Respond fully in character as this philosopher would. Engage thoughtfully with the user's questions. Reference your actual works and ideas when relevant. Stay historically accurate. Keep responses concise (2-3 paragraphs max).`;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  await checkRateLimit(userId, "dialogue", 20, 3600_000);

  let body: { philosopherSlug: string; messages: ChatMessage[]; conversationId?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { philosopherSlug, messages, conversationId } = body;

  if (!philosopherSlug || typeof philosopherSlug !== "string") {
    return new Response(JSON.stringify({ error: "Missing philosopherSlug" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return new Response(JSON.stringify({ error: "Invalid messages" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  for (const msg of messages) {
    if (!msg.role || !msg.content || typeof msg.content !== "string") {
      return new Response(JSON.stringify({ error: "Invalid message format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (msg.content.length > MAX_CONTENT_LENGTH) {
      return new Response(JSON.stringify({ error: "Message too long" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (conversationId && !mongoose.isValidObjectId(conversationId)) {
    return new Response(JSON.stringify({ error: "Invalid conversationId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const philosopher = await getPhilosopherBySlug(philosopherSlug);
  if (!philosopher) {
    return new Response(JSON.stringify({ error: "Philosopher not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const systemPrompt = buildSystemPrompt(philosopher);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "OpenAI API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const model = process.env.OPENAI_MODEL || "gpt-5-mini";

  const openaiMessages = [
    { role: "system" as const, content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  let openaiRes: Response;
  try {
    openaiRes = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: openaiMessages,
        stream: true,
        max_tokens: 1024,
        temperature: 0.8,
      }),
    });
  } catch {
    return new Response(JSON.stringify({ error: "Failed to connect to OpenAI" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!openaiRes.ok) {
    const errorText = await openaiRes.text().catch(() => "Unknown error");
    return new Response(
      JSON.stringify({ error: "OpenAI API error", details: errorText }),
      { status: openaiRes.status, headers: { "Content-Type": "application/json" } }
    );
  }

  const openaiBody = openaiRes.body;
  if (!openaiBody) {
    return new Response(JSON.stringify({ error: "No response body from OpenAI" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  let fullContent = "";
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const reader = openaiBody.getReader();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === "data: [DONE]") {
              if (trimmed === "data: [DONE]") {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              }
              continue;
            }
            if (!trimmed.startsWith("data: ")) continue;

            const json = trimmed.slice(6);
            try {
              const parsed = JSON.parse(json);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                fullContent += delta;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`));
              }
            } catch {
              // skip malformed JSON chunks
            }
          }
        }

        // Process any remaining buffer
        if (buffer.trim()) {
          const trimmed = buffer.trim();
          if (trimmed === "data: [DONE]") {
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          } else if (trimmed.startsWith("data: ")) {
            try {
              const parsed = JSON.parse(trimmed.slice(6));
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                fullContent += delta;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`));
              }
            } catch {
              // skip
            }
          }
        }
      } catch (err) {
        controller.error(err);
        return;
      } finally {
        reader.releaseLock();
      }

      // Save to DB after stream completes
      if (fullContent && conversationId) {
        try {
          await connectToDatabase();
          const now = Date.now();
          await ConversationModel.updateOne(
            { _id: conversationId, userId },
            {
              $push: {
                messages: {
                  $each: [
                    // Save the latest user message
                    {
                      role: "user",
                      content: messages[messages.length - 1].content,
                      createdAt: now - 1,
                    },
                    // Save the assistant response
                    {
                      role: "assistant",
                      content: fullContent,
                      createdAt: now,
                    },
                  ],
                },
              },
              $set: { updatedAt: now },
            }
          );
        } catch {
          // DB save failure should not break the stream
        }
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
