import { NextResponse } from "next/server";
import { Anthropic } from "@anthropic-ai/sdk";

import { claudeRateLimiter, getClientIdentifier, createRateLimitResponse } from "@/lib/rate-limit";
import { LIMITS } from "@/lib/constants";
import type { SavingsOption } from "@/lib/types";
import { getPaymentSigningSecret, shouldBypassPayment, verifyPaymentToken } from "@/lib/payment-token";

export const runtime = "nodejs";

const MODEL = process.env.CLAUDE_MODEL ?? "claude-3-5-sonnet-latest";

type ActionType = "cancel" | "downgrade";

interface ActionPlan {
  title: string;
  steps: string[];
  link?: string | null;
  script?: string | null;
  note?: string | null;
}

function safeJsonParse(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
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
  const clientId = getClientIdentifier(request);
  const rateLimitResult = claudeRateLimiter.check(clientId);

  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult);
  }

  if (!shouldBypassPayment()) {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const signingSecret = getPaymentSigningSecret();

    if (!token || !signingSecret) {
      return NextResponse.json({ error: "Payment required." }, { status: 401 });
    }

    const payload = verifyPaymentToken(token, signingSecret);
    if (!payload) {
      return NextResponse.json({ error: "Payment required." }, { status: 401 });
    }
  }

  const { service, action, option } = (await request.json()) as {
    service?: string;
    action?: ActionType;
    option?: SavingsOption;
  };

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Claude API key missing." },
      { status: 500 }
    );
  }

  if (!service || !action) {
    return NextResponse.json({ error: "Missing inputs" }, { status: 400 });
  }

  const system =
    "You are a subscription assistant. Generate a short, safe action plan in JSON only.";
  const user = `Create a ${action} plan for the service below. Keep steps short and practical.

Service: ${service}
Action: ${action === "cancel" ? "Cancel the subscription" : "Lower the bill (downgrade/renegotiate/switch)"}

Option details (if any):
${option ? JSON.stringify(option) : "none"}

Requirements:
- Output JSON only in this shape:
{"title":"...","steps":["..."],"link":null,"script":null,"note":null}
- Include 3-5 steps.
- Always include a login step before account changes.
- If a link is provided in the option, reuse it; otherwise null.
- Use the option's negotiation_script/instructions when relevant, but keep text concise.
`;

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: Math.min(LIMITS.CLAUDE_MAX_TOKENS, 600),
      system,
      messages: [{ role: "user", content: user }]
    });

    const text = response.content[0]?.text ?? "";
    const parsed = safeJsonParse(text) as ActionPlan | null;

    if (parsed && Array.isArray(parsed.steps)) {
      return NextResponse.json({ plan: parsed });
    }

    return NextResponse.json({ plan: null });
  } catch {
    return NextResponse.json(
      { error: "Claude request failed." },
      { status: 500 }
    );
  }
}
