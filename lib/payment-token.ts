import { createHmac, timingSafeEqual } from "crypto";

const TOKEN_TTL_MS = 1000 * 60 * 60 * 48; // 48 hours

export interface PaymentTokenPayload {
  sessionId: string;
  exp: number;
}

export function getPaymentSigningSecret(): string | null {
  return (
    process.env.PAYMENT_TOKEN_SECRET ??
    process.env.STRIPE_WEBHOOK_SECRET ??
    process.env.STRIPE_SECRET_KEY ??
    null
  );
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

export function signPaymentToken(sessionId: string, secret: string) {
  const payload: PaymentTokenPayload = {
    sessionId,
    exp: Date.now() + TOKEN_TTL_MS
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");
  return `${encodedPayload}.${signature}`;
}

export function verifyPaymentToken(token: string, secret: string): PaymentTokenPayload | null {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expected = createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== signatureBuffer.length) return null;
  if (!timingSafeEqual(expectedBuffer, signatureBuffer)) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as PaymentTokenPayload;
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function shouldBypassPayment(): boolean {
  return process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_DEV_UNLOCK === "true";
}
