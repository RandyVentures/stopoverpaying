import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "StopOverpaying.io | Find and cut recurring bills",
  description:
    "Upload a CSV or PDF statement to spot recurring charges, see potential savings, and get negotiation scripts in minutes."
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto w-full max-w-6xl px-6 py-16">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-6">
              <Badge>Stop overpaying</Badge>
              <h1 className="font-heading text-4xl font-semibold leading-tight text-ink md:text-6xl">
                Find the bills you can shrink in one scan.
              </h1>
              <p className="text-lg text-slate">
                Upload your statement and see where your recurring money leaks
                live. We match services to cheaper options and negotiation scripts
                in minutes.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/analyze">
                  <Button variant="secondary">Start free analysis</Button>
                </Link>
                <span className="text-sm text-slate">
                  $7 one-time to unlock the full report
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-slate">
                <span>Client-side parsing only.</span>
                <span>No accounts or databases.</span>
                <span>Auto-delete after 48 hours.</span>
              </div>
            </div>
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-sea/10 via-white to-coral/10" />
              <div className="relative space-y-6">
                <p className="text-xs uppercase tracking-[0.2em] text-slate">
                  Live preview
                </p>
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate/10 bg-white/80 p-4">
                    <p className="text-sm font-semibold text-ink">Netflix</p>
                    <p className="text-xs text-slate">$15.49 monthly</p>
                    <p className="mt-2 text-xs text-sea">Save $102/year</p>
                  </div>
                  <div className="rounded-2xl border border-slate/10 bg-white/80 p-4">
                    <p className="text-sm font-semibold text-ink">Verizon Wireless</p>
                    <p className="text-xs text-slate">$85 monthly</p>
                    <p className="mt-2 text-xs text-sea">Save $720/year</p>
                  </div>
                  <div className="rounded-2xl border border-slate/10 bg-white/80 p-4">
                    <p className="text-sm font-semibold text-ink">Adobe Creative Cloud</p>
                    <p className="text-xs text-slate">$59.99 monthly</p>
                    <p className="mt-2 text-xs text-sea">Save $600/year</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section id="how" className="mx-auto w-full max-w-6xl px-6 py-16">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Upload statements",
                body: "CSV or PDF statements stay in your browser. We only read merchant, date, amount."
              },
              {
                title: "Detect recurring bills",
                body: "We find monthly, quarterly, and annual charges and normalize merchant names."
              },
              {
                title: "Get the savings plan",
                body: "See cheaper alternatives, negotiation scripts, and direct links in one report."
              }
            ].map((step) => (
              <Card key={step.title}>
                <p className="text-xs uppercase tracking-[0.2em] text-slate">
                  {step.title}
                </p>
                <p className="mt-3 text-sm text-slate">{step.body}</p>
              </Card>
            ))}
          </div>
        </section>

        <section id="preview" className="mx-auto w-full max-w-6xl px-6 py-16">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-5">
              <Badge>Preview</Badge>
              <h2 className="font-heading text-3xl">See the savings before you pay.</h2>
              <p className="text-sm text-slate">
                We show the top 3-5 opportunities for free. Unlock the full report
                for $7 to see every matched bill, total savings, and scripts.
              </p>
              <Link href="/analyze">
                <Button variant="primary">Try a free scan</Button>
              </Link>
            </div>
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-slate">
                  Potential annual savings
                </p>
                <span className="text-sm font-semibold text-sea">$1,284</span>
              </div>
              <div className="grid gap-3">
                {[
                  "Switch to Mint Mobile",
                  "Downgrade to ad-supported streaming",
                  "Renegotiate internet rate"
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-slate/10 bg-white/80 p-4"
                  >
                    <p className="text-sm font-semibold text-ink">{item}</p>
                    <p className="text-xs text-slate">Opportunity highlighted in preview.</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        <section id="faq" className="mx-auto w-full max-w-6xl px-6 py-16">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <Badge>FAQ</Badge>
              <h2 className="mt-4 font-heading text-3xl">Common questions</h2>
            </div>
            <div className="space-y-4">
              {[
                {
                  q: "Do you store my bank statement?",
                  a: "No. Parsing happens locally in your browser and we only keep results in localStorage for 48 hours."
                },
                {
                  q: "Do you sell my data?",
                  a: "No. We do not sell or rent data, and raw statements never leave your device."
                },
                {
                  q: "What data is sent to Claude?",
                  a: "Only anonymized patterns like MERCHANT $AMOUNT and frequency. No raw transaction lines."
                },
                {
                  q: "How accurate is the matching?",
                  a: "Most recurring bills are matched automatically, but we treat results as suggestions and show confidence."
                },
                {
                  q: "Which banks do you support?",
                  a: "Chase, Bank of America, Capital One, Amex, and Wells Fargo CSV and PDF exports."
                },
                {
                  q: "What happens after I pay?",
                  a: "You unlock the full report with every matched service, savings option, and negotiation script."
                },
                {
                  q: "What if I don't find savings?",
                  a: "You still get a full view of recurring spend and scripts; some statements simply have fewer opportunities."
                }
              ].map((item) => (
                <Card key={item.q}>
                  <p className="text-sm font-semibold text-ink">{item.q}</p>
                  <p className="mt-2 text-sm text-slate">{item.a}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 pb-20">
          <Card className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-heading text-2xl">Ready to stop overpaying?</h3>
              <p className="text-sm text-slate">
                Upload your statement and see your savings in minutes.
              </p>
            </div>
            <Link href="/analyze">
              <Button variant="secondary">Start free analysis</Button>
            </Link>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
