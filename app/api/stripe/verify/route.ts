import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2023-10-16"
});

import {
  getPaymentSigningSecret,
  signPaymentToken,
  verifyPaymentToken
} from "@/lib/payment-token";

export async function GET(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ paid: false, error: "Stripe key missing" }, { status: 500 });
  }

  const signingSecret = getPaymentSigningSecret();
  if (!signingSecret) {
    return NextResponse.json({ paid: false, error: "Signing secret missing" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");
  const token = searchParams.get("token");

  if (token) {
    const payload = verifyPaymentToken(token, signingSecret);
    if (!payload) {
      return NextResponse.json({ paid: false }, { status: 401 });
    }
    return NextResponse.json({ paid: true });
  }

  if (!sessionId) {
    return NextResponse.json({ paid: false, error: "Missing session_id" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ paid: false }, { status: 402 });
    }

    const signedToken = signPaymentToken(sessionId, signingSecret);

    return NextResponse.json({ paid: true, token: signedToken });
  } catch {
    return NextResponse.json({ paid: false }, { status: 500 });
  }
}
