/**
 * Stripe checkout orchestration.
 * Handles payment flow logic separate from UI components.
 */

export type CheckoutStatus = 'idle' | 'loading' | 'error' | 'success';

export interface CheckoutResult {
  success: boolean;
  error?: string;
}

const NETWORK_TIMEOUT_MS = 15000;

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs = NETWORK_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timeoutId);
  }
}

/**
 * Initiate Stripe checkout session.
 * Returns success/error result.
 */
export async function initiateCheckout(): Promise<CheckoutResult> {
  try {
    const response = await fetchWithTimeout(
      '/api/stripe/checkout',
      { method: 'POST' },
      NETWORK_TIMEOUT_MS
    );

    if (!response.ok) {
      return {
        success: false,
        error: 'Checkout failed. Please try again.',
      };
    }

    const payload = (await response.json()) as {
      url?: string;
      sessionId?: string;
    };

    // Try client-side redirect first (better UX)
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (publishableKey && payload.sessionId) {
      const { loadStripe } = await import('@stripe/stripe-js');
      const stripe = await loadStripe(publishableKey);
      const result = await stripe?.redirectToCheckout({
        sessionId: payload.sessionId,
      });

      if (result?.error) {
        return {
          success: false,
          error: result.error.message ?? 'Stripe checkout failed.',
        };
      }

      return { success: true };
    }

    // Fallback to server-side redirect URL
    if (payload.url) {
      window.location.href = payload.url;
      return { success: true };
    }

    return {
      success: false,
      error: 'Checkout could not be started. Missing session details.',
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return {
        success: false,
        error: 'Network timed out. Please try again.',
      };
    }

    return {
      success: false,
      error: 'Checkout failed. Please try again.',
    };
  }
}
