import { NextResponse } from "next/server";
import Stripe from "stripe";

import { CHECKOUT_PRICE } from "@/lib/constants";
import { checkoutRateLimiter, getClientIdentifier, createRateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2023-10-16"
});

export async function POST(request: Request) {
  // Rate limiting
  const clientId = getClientIdentifier(request);
  const rateLimitResult = checkoutRateLimiter.check(clientId);
  
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult);
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe key missing" }, { status: 500 });
  }

  const envSiteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_DOMAIN;
  const normalizedSiteUrl = envSiteUrl
    ? envSiteUrl.startsWith("http")
      ? envSiteUrl
      : `https://${envSiteUrl}`
    : null;
  const origin =
    request.headers.get("origin") ?? normalizedSiteUrl ?? "http://localhost:3000";
  const successUrl = `${origin}/report?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${origin}/analyze`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(CHECKOUT_PRICE * 100),
            product_data: {
              name: "StopOverpaying savings report",
              description: "Full report with savings options and scripts"
            }
          }
        }
      ],
      success_url: successUrl,
      cancel_url: cancelUrl
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch {
    return NextResponse.json({ error: "Stripe checkout failed" }, { status: 500 });
  }
}
