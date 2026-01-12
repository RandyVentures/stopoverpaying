"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Toggle } from "@/components/Toggle";
import { STORAGE_KEYS } from "@/lib/constants";
import { buildSavingsReport } from "@/lib/report";
import { clearExpired, loadWithExpiry, saveWithExpiry } from "@/lib/storage";
import type { MatchedService, SavingsReport } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

const STRIPE_PRICE = "$7";
const NETWORK_TIMEOUT_MS = 15000;

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

export default function ReportPage() {
  const [report, setReport] = useState<SavingsReport | null>(null);
  const [paid, setPaid] = useState(false);
  const [blurred, setBlurred] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<"idle" | "loading" | "error">(
    "idle"
  );
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    clearExpired([
      STORAGE_KEYS.report,
      STORAGE_KEYS.matches,
      STORAGE_KEYS.recurring,
      STORAGE_KEYS.preview,
      STORAGE_KEYS.paid
    ]);

    const paidFlag = loadWithExpiry<boolean>(STORAGE_KEYS.paid);
    const storedReport = loadWithExpiry<SavingsReport>(STORAGE_KEYS.report);
    const storedMatches = loadWithExpiry<MatchedService[]>(STORAGE_KEYS.matches);

    if (storedReport) {
      setReport(storedReport);
    } else if (storedMatches) {
      setReport(buildSavingsReport(storedMatches));
    }

    if (paidFlag) {
      setPaid(true);
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    const queryPaid = searchParams.get("paid");
    if (queryPaid === "true") {
      setPaid(true);
      saveWithExpiry(STORAGE_KEYS.paid, true);
    }
  }, [searchParams]);

  const grouped = useMemo(() => {
    if (!report) return [];
    const map = new Map<string, typeof report.items>();
    for (const item of report.items) {
      if (!map.has(item.category)) {
        map.set(item.category, []);
      }
      map.get(item.category)?.push(item);
    }
    return Array.from(map.entries());
  }, [report]);

  const previewItems = useMemo(() => {
    if (!report) return [];
    return [...report.items]
      .sort((a, b) => b.annualSavings - a.annualSavings)
      .slice(0, 3);
  }, [report]);

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

  if (!hydrated) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
          <Badge>Loading report</Badge>
          <h1 className="mt-4 font-heading text-3xl">Fetching your savings plan</h1>
          <p className="mt-3 text-sm text-slate">
            Checking local storage for your latest report.
          </p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
          <Badge>Report unavailable</Badge>
          <h1 className="mt-4 font-heading text-3xl">No report found yet</h1>
          <p className="mt-3 text-sm text-slate">
            Upload a statement to generate your savings report.
          </p>
          <Link href="/analyze" className="mt-6">
            <Button variant="secondary">Start free scan</Button>
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <section className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Badge>Full savings report</Badge>
            <h1 className="mt-3 font-heading text-3xl md:text-4xl">
              Your personalized savings plan
            </h1>
            <p className="mt-2 text-sm text-slate">
              Generated from your statement, stored locally for 48 hours.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 no-print">
            <Toggle pressed={blurred} onClick={() => setBlurred((value) => !value)}>
              {blurred ? "Show amounts" : "Privacy blur"}
            </Toggle>
            <Button variant="outline" onClick={() => window.print()}>
              Download PDF
            </Button>
          </div>
        </section>

        {!paid && (
          <Card className="mt-8 border-coral/30 bg-white/80">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate">
                  Potential savings
                </p>
                <p className="font-heading text-3xl">
                  {formatCurrency(report.totalPotentialSavings)} / year
                </p>
                <p className="mt-2 text-sm text-slate">
                  Unlock the full report and negotiation scripts for {STRIPE_PRICE}.
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={handleCheckout}
                disabled={checkoutStatus === "loading"}
              >
                {checkoutStatus === "loading"
                  ? "Opening checkout..."
                  : `Unlock full report (${STRIPE_PRICE})`}
              </Button>
            </div>
            {checkoutError && (
              <p className="mt-3 text-sm text-coral" role="alert">
                {checkoutError}
              </p>
            )}
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {previewItems.map((item) => (
                <div key={item.service} className="rounded-2xl border border-slate/10 bg-white/80 p-4">
                  <p className="text-sm font-semibold text-ink">{item.service}</p>
                  <p className="text-xs text-slate">{item.category}</p>
                  <p className="mt-2 text-xs text-slate">Best move: {item.bestOption?.method}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {paid ? (
          <section className={`mt-10 space-y-8 ${blurred ? "blur-sm" : ""}`}>
            {report.items.length === 0 ? (
              <Card className="border-slate/20 bg-white/80 text-sm text-slate">
                We did not find any recurring charges in this statement. Try uploading
                a longer date range or another bank export.
              </Card>
            ) : null}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-slate">
                  Annual spend detected
                </p>
                <p className="font-heading text-2xl">
                  {formatCurrency(report.totalCurrentAnnual)}
                </p>
              </Card>
              <Card className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-slate">
                  Potential savings
                </p>
                <p className="font-heading text-2xl">
                  {formatCurrency(report.totalPotentialSavings)}
                </p>
              </Card>
              <Card className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-slate">
                  Services matched
                </p>
                <p className="font-heading text-2xl">{report.items.length}</p>
              </Card>
            </div>

            {grouped.map(([category, items]) => (
              <Card key={category} className="space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate">{category}</p>
                  <h2 className="font-heading text-2xl">Savings playbook</h2>
                </div>
                <div className="space-y-5">
                  {items.map((item) => (
                    <div
                      key={`${category}-${item.service}`}
                      className="rounded-2xl border border-slate/10 bg-white/80 p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-lg font-semibold text-ink">{item.service}</p>
                          <p className="text-xs text-slate">
                            Current cost: {formatCurrency(item.currentCostMonthly)} / mo
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-sea">
                          Save {formatCurrency(item.annualSavings)} / year
                        </span>
                      </div>
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {item.options.map((option) => (
                          <div key={option.method} className="rounded-2xl border border-slate/10 bg-white/70 p-4">
                            <p className="text-sm font-semibold text-ink">{option.method}</p>
                            <p className="text-xs text-slate">
                              New price: {formatCurrency(option.new_price)} / mo
                            </p>
                            <p className="text-xs text-slate">
                              Saves {formatCurrency(option.savings_annual)} / year
                            </p>
                            <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-slate">
                              Effort: {option.effort}
                            </p>
                            {option.note && (
                              <p className="mt-2 text-xs text-slate">{option.note}</p>
                            )}
                            {option.instructions && (
                              <p className="mt-2 text-xs text-slate">{option.instructions}</p>
                            )}
                            {option.negotiation_script && (
                              <p className="mt-2 text-xs italic text-slate">
                                Script: {option.negotiation_script}
                              </p>
                            )}
                            {option.link && (
                              <Link
                                href={option.link}
                                className="mt-2 inline-flex text-xs font-semibold text-sea"
                                target="_blank"
                                rel="noreferrer"
                              >
                                Open link
                              </Link>
                            )}
                            {option.affiliate && (
                              <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-slate">
                                Affiliate partner
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </section>
        ) : (
          <Card className="mt-10 border-slate/20 bg-white/80 text-sm text-slate">
            Unlock the full report to see every matched service, pricing detail, and
            negotiation script.
          </Card>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
