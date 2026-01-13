import { NextResponse } from "next/server";
import { Anthropic } from "@anthropic-ai/sdk";

import database from "@/data/subscriptions.json";
import type { SubscriptionsDatabase } from "@/lib/types";
import { claudeRateLimiter, getClientIdentifier, createRateLimitResponse } from "@/lib/rate-limit";
import { LIMITS } from "@/lib/constants";

export const runtime = "nodejs";

const MODEL = process.env.CLAUDE_MODEL ?? "claude-3-5-sonnet-latest";

function buildCatalog() {
  const db = database as SubscriptionsDatabase;
  return Object.values(db.categories).flatMap((category) =>
    category.items.map((item) => ({
      name: item.name,
      aliases: item.aliases,
      category: category.label
    }))
  );
}

function safeJsonParse(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    const arrayMatch = raw.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]);
      } catch {
        return null;
      }
    }

    const objectMatch = raw.match(/\{[\s\S]*\}/);
    if (!objectMatch) return null;
    try {
      return JSON.parse(objectMatch[0]);
    } catch {
      return null;
    }
  }
}

export async function POST(request: Request) {
  // Rate limiting
  const clientId = getClientIdentifier(request);
  const rateLimitResult = claudeRateLimiter.check(clientId);
  
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult);
  }

  const { patterns } = (await request.json()) as { patterns?: string[] };

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { matches: [], error: "Claude API key missing." },
      { status: 500 }
    );
  }

  if (!patterns?.length) {
    return NextResponse.json({ matches: [] });
  }

  const clipped = patterns.slice(0, LIMITS.MAX_PATTERNS_PER_REQUEST);
  const catalog = buildCatalog();

  const system =
    "You are a subscription matching engine. Match each pattern to the best service in the catalog. Return JSON only.";
  const user = `Patterns (use index):\n${clipped
    .map((pattern, index) => `${index}: ${pattern}`)
    .join("\n")}\n\nCatalog (service name with aliases):\n${catalog
    .map((item) => `${item.name} | aliases: ${item.aliases.join(", ")}`)
    .join("\n")}\n\nReturn JSON array: [{"index":0,"service_name":"Netflix","confidence":0.92}] Use null if no match.`;

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: LIMITS.CLAUDE_MAX_TOKENS,
      system,
      messages: [{ role: "user", content: user }]
    });

    const text = response.content[0]?.text ?? "";
    const parsed = safeJsonParse(text);

    if (Array.isArray(parsed)) {
      return NextResponse.json({ matches: parsed });
    }

    return NextResponse.json({ matches: [] });
  } catch (error) {
    return NextResponse.json(
      { matches: [], error: "Claude request failed." },
      { status: 500 }
    );
  }
}
