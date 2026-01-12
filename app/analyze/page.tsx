"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { buildAnonymizedPatterns } from "@/lib/anonymize";
import { STORAGE_KEYS } from "@/lib/constants";
import { matchRecurringCharges } from "@/lib/matching";
import { findRecurringCharges } from "@/lib/recurring";
import { buildSavingsReport } from "@/lib/report";
import { clearExpired, clearStorage, loadWithExpiry, saveWithExpiry } from "@/lib/storage";
import { findSubscriptionByName } from "@/lib/subscriptions";
import type { MatchedService, SavingsReport, Transaction } from "@/lib/types";
import { formatCurrency, sortBy } from "@/lib/utils";

interface AiMatch {
  index: number;
  service_name: string | null;
  confidence: number;
}

const STRIPE_PRICE = "$5";
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const NETWORK_TIMEOUT_MS = 15000;
const CSV_EXAMPLE = `Date,Description,Amount
2024-06-03,Spotify,10.99
2024-06-12,Netflix,15.49
2024-06-18,AT&T Mobility,85.00`;

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs = NETWORK_TIMEOUT_MS
) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function mergeAiMatches(matches: MatchedService[], ai: AiMatch[]) {
  return matches.map((match, index) => {
    const suggestion = ai.find((item) => item.index === index);
    if (!suggestion?.service_name) return match;
    const found = findSubscriptionByName(suggestion.service_name);
    if (!found) return match;
    return {
      recurring: match.recurring,
      subscription: found.item,
      category: found.category,
      matchConfidence: Math.max(match.matchConfidence, suggestion.confidence)
    };
  });
}

export default function AnalyzePage() {
  const [status, setStatus] = useState<"idle" | "parsing" | "done" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);
  const [showCsvExample, setShowCsvExample] = useState(false);
  const [report, setReport] = useState<SavingsReport | null>(null);
  const [matches, setMatches] = useState<MatchedService[]>([]);
  const [aiUsed, setAiUsed] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [checkoutStatus, setCheckoutStatus] = useState<"idle" | "loading" | "error">(
    "idle"
  );
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    clearExpired([
      STORAGE_KEYS.report,
      STORAGE_KEYS.matches,
      STORAGE_KEYS.recurring,
      STORAGE_KEYS.preview,
      STORAGE_KEYS.paid
    ]);

    const storedReport = loadWithExpiry<SavingsReport>(STORAGE_KEYS.report);
    const storedMatches = loadWithExpiry<MatchedService[]>(STORAGE_KEYS.matches);

    if (storedReport) {
      setReport(storedReport);
      setMatches(storedMatches ?? []);
      setStatus("done");
    }
  }, []);

  const topOpportunities = useMemo(() => {
    if (!report) return [];
    return sortBy(report.items, (item) => item.annualSavings).slice(0, 5);
  }, [report]);

  const handleFile = async (file: File) => {
    setStatus("parsing");
    setError(null);
    setShowCsvExample(false);
    setAiUsed(false);
    setAiMessage(null);

    let transactions: Transaction[] = [];
    const fileName = file.name.toLowerCase();
    const isCsv = fileName.endsWith(".csv");
    const isPdf = fileName.endsWith(".pdf");

    if (file.size > MAX_UPLOAD_BYTES) {
      setStatus("error");
      setError("That file is over 10MB. Please export a smaller statement.");
      return;
    }

    try {
      if (isCsv) {
        const text = await file.text();
        const { parseCsvTransactions } = await import("@/lib/parsers/csv");
        transactions = await parseCsvTransactions(text);
      } else if (isPdf) {
        const { parsePdfTransactions } = await import("@/lib/parsers/pdf");
        transactions = await parsePdfTransactions(file);
      } else {
        setStatus("error");
        setError("That file type is not supported. Please upload a CSV or PDF.");
        return;
      }
    } catch {
      setStatus("error");
      if (isCsv) {
        setError("We couldn't read that CSV. Check the column headers and try again.");
        setShowCsvExample(true);
      } else {
        setError("We couldn't read that PDF statement. Try exporting a fresh copy.");
      }
      return;
    }

    if (!transactions.length) {
      setStatus("error");
      setError("We couldn't find any transactions in that file. Try another export.");
      if (isCsv) {
        setShowCsvExample(true);
      }
      return;
    }

    const recurring = findRecurringCharges(transactions);
    if (!recurring.length) {
      setStatus("error");
      setError(
        "No recurring charges detected. Try a longer date range or another account."
      );
      return;
    }
    let nextMatches = matchRecurringCharges(recurring);

    try {
      setAiMessage("Checking anonymized patterns with Claude...");
      const patterns = buildAnonymizedPatterns(recurring);
      const response = await fetchWithTimeout(
        "/api/claude",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ patterns })
        },
        NETWORK_TIMEOUT_MS
      );
      if (response.ok) {
        const payload = (await response.json()) as { matches?: AiMatch[] };
        if (payload.matches?.length) {
          nextMatches = mergeAiMatches(nextMatches, payload.matches);
          setAiUsed(true);
          setAiMessage("Claude improved the merchant matches.");
        } else {
          setAiUsed(false);
          setAiMessage("Claude returned no matches. Using local fuzzy matching.");
        }
      } else {
        setAiUsed(false);
        setAiMessage("Claude unavailable. Using local fuzzy matching.");
      }
    } catch (error) {
      setAiUsed(false);
      if (error instanceof DOMException && error.name === "AbortError") {
        setAiMessage("Claude check timed out. Using local fuzzy matching.");
      } else {
        setAiMessage("Claude unavailable. Using local fuzzy matching.");
      }
    }

    const nextReport = buildSavingsReport(nextMatches);
    if (nextReport.items.length === 0) {
      setMatches(nextMatches);
      setStatus("error");
      setError(
        "We found recurring charges but could not match them to known services yet."
      );
      return;
    }

    saveWithExpiry(STORAGE_KEYS.report, nextReport);
    saveWithExpiry(STORAGE_KEYS.matches, nextMatches);
    saveWithExpiry(STORAGE_KEYS.recurring, recurring);

    setMatches(nextMatches);
    setReport(nextReport);
    setStatus("done");
  };

  const handleCheckout = async () => {
    setCheckoutStatus("loading");
    setCheckoutError(null);

    try {
      const response = await fetchWithTimeout(
        "/api/stripe/checkout",
        {
          method: "POST"
        },
        NETWORK_TIMEOUT_MS
      );
      if (!response.ok) {
        setCheckoutStatus("error");
        setCheckoutError("Checkout failed. Please try again.");
        return;
      }

      const payload = (await response.json()) as {
        url?: string;
        sessionId?: string;
      };
      const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

      if (publishableKey && payload.sessionId) {
        const { loadStripe } = await import("@stripe/stripe-js");
        const stripe = await loadStripe(publishableKey);
        const result = await stripe?.redirectToCheckout({ sessionId: payload.sessionId });
        if (result?.error) {
          setCheckoutStatus("error");
          setCheckoutError(result.error.message ?? "Stripe checkout failed.");
        }
        return;
      }

      if (payload.url) {
        window.location.href = payload.url;
        return;
      }

      setCheckoutStatus("error");
      setCheckoutError("Checkout could not be started. Missing session details.");
    } catch (error) {
      setCheckoutStatus("error");
      if (error instanceof DOMException && error.name === "AbortError") {
        setCheckoutError("Network timed out. Please try again.");
      } else {
        setCheckoutError("Checkout failed. Please try again.");
      }
    }
  };

  const handleClear = () => {
    clearStorage([
      STORAGE_KEYS.report,
      STORAGE_KEYS.matches,
      STORAGE_KEYS.recurring,
      STORAGE_KEYS.preview,
      STORAGE_KEYS.paid
    ]);
    setReport(null);
    setMatches([]);
    setStatus("idle");
    setAiUsed(false);
    setAiMessage(null);
    setError(null);
    setShowCsvExample(false);
    setCheckoutStatus("idle");
    setCheckoutError(null);
  };

  const aiCopy =
    aiMessage ??
    (aiUsed
      ? "Claude matched anonymized patterns to services in the database."
      : "Local fuzzy matching used. Claude can improve matches with an API key.");

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <Badge>Private analysis</Badge>
            <h1 className="font-heading text-4xl font-semibold leading-tight text-ink md:text-5xl">
              Upload a statement. We find the bills you can shrink.
            </h1>
            <p className="text-lg text-slate">
              CSV and PDF parsing happens entirely in your browser. We only send
              anonymized patterns to Claude, never raw transactions.
            </p>
            <div className="rounded-3xl border border-dashed border-slate/30 bg-white/70 p-6">
              <input
                className="w-full text-sm text-slate"
                type="file"
                accept=".csv,.pdf"
                disabled={status === "parsing"}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void handleFile(file);
                  }
                }}
              />
              <p className="mt-3 text-xs text-slate">
                Supported banks: Chase, Bank of America, Capital One, Amex, Wells
                Fargo. Use 2-3 months of statements for best results. Max file size
                10MB.
              </p>
            </div>
            {status === "parsing" && (
              <Card className="bg-white/80">
                <p className="text-sm text-slate">Parsing statement and detecting patterns...</p>
                <div className="mt-4 animate-pulse space-y-3">
                  <div className="h-3 w-2/3 rounded-full bg-slate/20" />
                  <div className="h-3 w-full rounded-full bg-slate/20" />
                  <div className="h-3 w-5/6 rounded-full bg-slate/20" />
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="h-16 rounded-2xl bg-slate/10" />
                    <div className="h-16 rounded-2xl bg-slate/10" />
                  </div>
                </div>
              </Card>
            )}
            {status === "error" && error && (
              <Card className="border-coral/30 bg-white/80">
                <p className="text-sm text-coral">{error}</p>
                {showCsvExample && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate">
                      Example CSV format
                    </p>
                    <pre className="whitespace-pre-wrap rounded-2xl bg-slate/10 p-3 text-[11px] text-slate">
                      {CSV_EXAMPLE}
                    </pre>
                    <p className="text-xs text-slate">
                      Column names can vary, but we need date, description, and amount.
                    </p>
                  </div>
                )}
              </Card>
            )}
            {status === "done" && report && (
              <Card className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate">
                      Potential annual savings
                    </p>
                    <p className="font-heading text-3xl">
                      {formatCurrency(report.totalPotentialSavings)}
                    </p>
                    <p className="mt-1 text-xs text-slate">
                      Found {formatCurrency(report.totalPotentialSavings)} / year in potential savings.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      variant="secondary"
                      onClick={handleCheckout}
                      disabled={checkoutStatus === "loading"}
                    >
                      {checkoutStatus === "loading"
                        ? "Opening checkout..."
                        : `Unlock full report (${STRIPE_PRICE})`}
                    </Button>
                    <Link href="/report" className="text-sm text-slate underline">
                      View report
                    </Link>
                  </div>
                </div>
                {checkoutError && (
                  <p className="text-sm text-coral" role="alert">
                    {checkoutError}
                  </p>
                )}
                <div className="grid gap-3 md:grid-cols-2">
                  {topOpportunities.map((item) => (
                    <div
                      key={`${item.service}-${item.category}`}
                      className="rounded-2xl border border-slate/10 bg-white/80 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-ink">{item.service}</p>
                        <span className="text-sm text-sea">
                          {formatCurrency(item.annualSavings)} / yr
                        </span>
                      </div>
                      <p className="text-xs text-slate">{item.category}</p>
                      <p className="mt-2 text-xs text-slate">
                        Best move: {item.bestOption?.method}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate">
                  <span>{aiCopy}</span>
                  <button
                    className="text-xs font-semibold uppercase tracking-[0.2em] text-slate"
                    onClick={handleClear}
                  >
                    Clear data
                  </button>
                </div>
              </Card>
            )}
          </div>
          <div className="space-y-6">
            <Card className="pattern-grid space-y-4">
              <h2 className="font-heading text-2xl">What happens next</h2>
              <ul className="space-y-3 text-sm text-slate">
                <li>We detect recurring charges and normalize merchant names.</li>
                <li>We match your bills to 70+ services and savings options.</li>
                <li>You pay once to unlock the full savings report and scripts.</li>
              </ul>
            </Card>
            <Card className="space-y-3">
              <h3 className="font-heading text-xl">How to export a CSV</h3>
              <ol className="list-decimal space-y-2 pl-5 text-sm text-slate">
                <li>Log into your bank and open your transactions or activity view.</li>
                <li>Select a 60-90 day date range for best recurring detection.</li>
                <li>Click export or download, then choose CSV.</li>
                <li>Save the file and upload it here.</li>
              </ol>
              <p className="text-xs text-slate">
                PDF exports work too, but CSVs tend to be faster and more accurate.
              </p>
            </Card>
            <Card className="space-y-3">
              <h3 className="font-heading text-xl">Privacy-first processing</h3>
              <p className="text-sm text-slate">
                All parsing runs locally. We only store results in your browser
                for 48 hours. No database, no account required.
              </p>
              <ul className="text-xs text-slate">
                <li>Raw transactions never hit our servers.</li>
                <li>Patterns sent to Claude include only merchant + amount.</li>
                <li>Delete your data anytime with one click.</li>
              </ul>
            </Card>
            {matches.length > 0 && (
              <Card className="space-y-3">
                <h3 className="font-heading text-xl">Recurring charges found</h3>
                <ul className="space-y-2 text-sm text-slate">
                  {matches.slice(0, 6).map((match) => (
                    <li key={match.recurring.normalizedName}>
                      {match.subscription?.name ?? match.recurring.merchant} -
                      {" "}
                      {formatCurrency(match.recurring.averageAmount)}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-slate">
                  Unlock the full report to see every service and negotiation
                  script.
                </p>
              </Card>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
