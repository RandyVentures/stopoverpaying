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
import { STORAGE_KEYS, STRIPE_DISPLAY_PRICE } from "@/lib/constants";
import { buildSavingsReport } from "@/lib/report";
import { clearExpiredSecure, clearStorage, loadSecure, loadWithExpiry, saveWithExpiry } from "@/lib/secure-storage";
import type { MatchedService, SavingsOption, SavingsReport } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { initiateCheckout, type CheckoutStatus } from "@/lib/checkout";

type ActionType = "cancel" | "downgrade";

interface ActionPlan {
  title: string;
  steps: string[];
  link?: string | null;
  script?: string | null;
  note?: string | null;
}

export default function ReportPage() {
  const [report, setReport] = useState<SavingsReport | null>(null);
  const [paid, setPaid] = useState(false);
  const [blurred, setBlurred] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [paymentChecked, setPaymentChecked] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [checkoutStatus, setCheckoutStatus] = useState<CheckoutStatus>("idle");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const devUnlock = process.env.NEXT_PUBLIC_DEV_UNLOCK === "true";
  const [paidToken, setPaidToken] = useState<string | null>(null);
  const [actionPlans, setActionPlans] = useState<
    Record<string, { status: "idle" | "loading" | "ready" | "error"; plan?: ActionPlan }>
  >({});

  useEffect(() => {
    // Clear expired sensitive data (encrypted)
    clearExpiredSecure([
      STORAGE_KEYS.report,
      STORAGE_KEYS.matches,
      STORAGE_KEYS.recurring,
      STORAGE_KEYS.preview,
    ]);

    // Load sensitive data with encryption
    const storedReport = loadSecure<SavingsReport>(STORAGE_KEYS.report); // Sensitive: encrypted
    const storedMatches = loadSecure<MatchedService[]>(STORAGE_KEYS.matches); // Sensitive: encrypted

    if (storedReport) {
      setReport(storedReport);
    } else if (storedMatches) {
      setReport(buildSavingsReport(storedMatches));
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (devUnlock) {
      setPaid(true);
      setPaymentError(null);
      setPaymentChecked(true);
      return;
    }

    const sessionId = searchParams.get("session_id");
    const storedToken = loadWithExpiry<string>(STORAGE_KEYS.paidToken);
    setPaidToken(storedToken);

    const verifyPayment = async (params: { sessionId?: string; token?: string }) => {
      setPaymentChecked(false);
      setPaymentError(null);

      try {
        const query = new URLSearchParams();
        if (params.sessionId) query.set("session_id", params.sessionId);
        if (params.token) query.set("token", params.token);

        const response = await fetch(`/api/stripe/verify?${query.toString()}`);
        if (!response.ok) {
          clearStorage([STORAGE_KEYS.paidToken]);
          setPaid(false);
          setPaymentError("We couldn't verify your payment. Please try again.");
          return;
        }

        const payload = (await response.json()) as {
          paid?: boolean;
          token?: string;
        };

        if (payload.paid) {
          if (payload.token) {
            saveWithExpiry(STORAGE_KEYS.paidToken, payload.token);
            setPaidToken(payload.token);
          }
          setPaid(true);
          return;
        }

        clearStorage([STORAGE_KEYS.paidToken]);
        setPaid(false);
      } catch {
        clearStorage([STORAGE_KEYS.paidToken]);
        setPaid(false);
        setPaymentError("We couldn't verify your payment. Please try again.");
      } finally {
        setPaymentChecked(true);
      }
    };

    if (sessionId) {
      void verifyPayment({ sessionId });
      return;
    }

    if (storedToken) {
      void verifyPayment({ token: storedToken });
      return;
    }

    setPaymentError(null);
    setPaymentChecked(true);
  }, [searchParams, devUnlock]);

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

  const getActionOption = (
    action: ActionType,
    options: SavingsOption[],
    bestOption?: SavingsOption
  ) => {
    const normalized = options.map((option) => ({
      option,
      method: option.method.toLowerCase()
    }));

    if (action === "cancel") {
      const cancelMatch = normalized.find(({ method }) => method.includes("cancel"));
      return cancelMatch?.option ?? bestOption;
    }

    const downgradeMatch = normalized.find(({ method }) =>
      ["downgrade", "switch", "negotiate", "lower", "cheaper"].some((keyword) =>
        method.includes(keyword)
      )
    );

    return downgradeMatch?.option ?? bestOption;
  };

  const buildFallbackPlan = (
    action: ActionType,
    service: string,
    option?: SavingsOption
  ): ActionPlan => {
    const title =
      action === "cancel"
        ? `Cancel ${service}`
        : `Lower your ${service} bill`;

    const steps = [
      `Open your ${service} account in a new tab.`,
      action === "cancel"
        ? "Find the subscription or billing settings and choose cancel."
        : "Find plan options or billing settings and choose a lower-priced plan.",
      option?.instructions ??
        (action === "cancel"
          ? "Confirm the cancellation and save the confirmation screen."
          : "Confirm the change and save the confirmation screen."),
      "Keep the confirmation email or screenshot for your records."
    ];

    return {
      title,
      steps,
      link: option?.link ?? null,
      script: option?.negotiation_script ?? null,
      note: option?.note ?? null
    };
  };

  const handleActionPlan = async (
    action: ActionType,
    service: string,
    options: SavingsOption[],
    bestOption?: SavingsOption
  ) => {
    const key = `${service}-${action}`;
    if (!devUnlock && !paidToken) {
      setActionPlans((prev) => ({
        ...prev,
        [key]: { status: "error" }
      }));
      return;
    }
    const option = getActionOption(action, options, bestOption);
    const fallbackPlan = buildFallbackPlan(action, service, option);

    setActionPlans((prev) => ({
      ...prev,
      [key]: { status: "loading", plan: fallbackPlan }
    }));

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      if (paidToken) {
        headers.Authorization = `Bearer ${paidToken}`;
      }
      const response = await fetch("/api/claude/action", {
        method: "POST",
        headers,
        body: JSON.stringify({
          service,
          action,
          option
        })
      });

      if (response.status === 401 || response.status === 403) {
        setActionPlans((prev) => ({
          ...prev,
          [key]: { status: "error" }
        }));
        return;
      }

      if (!response.ok) {
        setActionPlans((prev) => ({
          ...prev,
          [key]: { status: "ready", plan: fallbackPlan }
        }));
        return;
      }

      const payload = (await response.json()) as {
        plan?: ActionPlan;
      };

      const mergedPlan: ActionPlan = {
        ...fallbackPlan,
        ...payload.plan,
        link: payload.plan?.link ?? fallbackPlan.link,
        script: payload.plan?.script ?? fallbackPlan.script,
        note: payload.plan?.note ?? fallbackPlan.note,
        steps: payload.plan?.steps?.length ? payload.plan.steps : fallbackPlan.steps
      };

      setActionPlans((prev) => ({
        ...prev,
        [key]: { status: "ready", plan: mergedPlan }
      }));
    } catch {
      setActionPlans((prev) => ({
        ...prev,
        [key]: { status: "error", plan: fallbackPlan }
      }));
    }
  };

  const handleCheckout = async () => {
    setCheckoutStatus("loading");
    setCheckoutError(null);

    const result = await initiateCheckout();

    if (!result.success) {
      setCheckoutStatus("error");
      setCheckoutError(result.error || "Checkout failed. Please try again.");
    }
  };

  if (!hydrated || !paymentChecked) {
    const statusCopy = paymentChecked
      ? "Checking local storage for your latest report."
      : "Verifying your payment status.";

    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
          <Badge>Loading report</Badge>
          <h1 className="mt-4 font-heading text-3xl">Fetching your savings plan</h1>
          <p className="mt-3 text-sm text-slate">{statusCopy}</p>
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
                  Unlock the full report and negotiation scripts for {STRIPE_DISPLAY_PRICE}.
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={handleCheckout}
                disabled={checkoutStatus === "loading"}
              >
                {checkoutStatus === "loading"
                  ? "Opening checkout..."
                  : `Unlock full report (${STRIPE_DISPLAY_PRICE})`}
              </Button>
            </div>
            {checkoutError && (
              <p className="mt-3 text-sm text-coral" role="alert">
                {checkoutError}
              </p>
            )}
            {paymentError && (
              <p className="mt-3 text-sm text-coral" role="alert">
                {paymentError}
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
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <Button
                          variant="secondary"
                          onClick={() =>
                            handleActionPlan("cancel", item.service, item.options, item.bestOption)
                          }
                        >
                          Cancel with AI
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            handleActionPlan("downgrade", item.service, item.options, item.bestOption)
                          }
                        >
                          Lower price with AI
                        </Button>
                      </div>
                      {(["cancel", "downgrade"] as const).map((actionType) => {
                        const key = `${item.service}-${actionType}`;
                        const action = actionPlans[key];
                        if (action?.status === "error" && !action.plan) {
                          return (
                            <div
                              key={key}
                              className="mt-4 rounded-2xl border border-coral/30 bg-white/90 p-4"
                            >
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-coral">
                                Payment required
                              </p>
                              <p className="mt-2 text-xs text-slate">
                                Unlock the full report to generate AI action plans.
                              </p>
                            </div>
                          );
                        }

                        if (!action?.plan) return null;
                        const actionLabel =
                          actionType === "cancel" ? "Cancel plan" : "Lower your bill";
                        return (
                          <div
                            key={key}
                            className="mt-4 rounded-2xl border border-sea/20 bg-white/90 p-4"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-slate">
                                  {actionLabel}
                                </p>
                                <p className="text-sm font-semibold text-ink">
                                  {action.plan.title}
                                </p>
                              </div>
                              {action.plan.link && (
                                <Link
                                  href={action.plan.link}
                                  className="text-xs font-semibold uppercase tracking-[0.2em] text-sea"
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Open site
                                </Link>
                              )}
                            </div>
                            <ol className="mt-3 list-decimal space-y-2 pl-5 text-xs text-slate">
                              {action.plan.steps.map((step, index) => (
                                <li key={`${key}-${index}`}>{step}</li>
                              ))}
                            </ol>
                            {action.status === "loading" && (
                              <p className="mt-3 text-xs text-slate">
                                Generating AI-assisted steps...
                              </p>
                            )}
                            {action.plan.script && (
                              <p className="mt-3 text-xs italic text-slate">
                                Script: {action.plan.script}
                              </p>
                            )}
                            {action.plan.note && (
                              <p className="mt-2 text-xs text-slate">
                                {action.plan.note}
                              </p>
                            )}
                            {action.status === "error" && (
                              <p className="mt-2 text-xs text-coral">
                                We couldn&apos;t generate an AI plan. Try again.
                              </p>
                            )}
                          </div>
                        );
                      })}
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
