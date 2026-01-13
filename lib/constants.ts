export const CHECKOUT_PRICE = 5;

export const STORAGE_KEYS = {
  transactions: "sop.transactions",
  recurring: "sop.recurring",
  matches: "sop.matches",
  report: "sop.report",
  paidToken: "sop.paidToken",
  preview: "sop.preview"
} as const;

export const LIMITS = {
  /** Maximum patterns to send to Claude API per request */
  MAX_PATTERNS_PER_REQUEST: 60,
  /** Maximum tokens for Claude API response */
  CLAUDE_MAX_TOKENS: 1200,
  /** Network timeout for API requests (ms) */
  NETWORK_TIMEOUT_MS: 15_000,
  /** Storage TTL in hours */
  STORAGE_TTL_HOURS: 48,
  /** Maximum file upload size (bytes) */
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
} as const;

export const RATE_LIMITS = {
  /** Claude API: requests per minute */
  CLAUDE_REQUESTS_PER_MINUTE: 10,
  /** Stripe Checkout: requests per minute */
  CHECKOUT_REQUESTS_PER_MINUTE: 5,
  /** Rate limit window in milliseconds */
  WINDOW_MS: 60_000, // 1 minute
} as const;

export const STRIPE_DISPLAY_PRICE = "$5";
