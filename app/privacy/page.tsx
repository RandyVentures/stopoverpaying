import type { Metadata } from "next";

import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Privacy Policy | StopOverpaying.io",
  description:
    "How StopOverpaying.io handles your data: client-side analysis, no raw statement storage, and Stripe-secured payments."
};

const sections = [
  {
    title: "The short version",
    body: [
      "Your statement stays in your browser. We do not upload or store raw transaction files.",
      "We only send anonymized patterns (merchant + amount + cadence) to improve matching.",
      "Results live in your browser for 48 hours and then expire automatically.",
      "Payments are processed by Stripe. We never see or store your card details."
    ]
  },
  {
    title: "Information we process",
    body: [
      "Statement data: CSV or PDF files are read locally on your device to detect recurring charges.",
      "Anonymized patterns: When you use AI matching, we send masked patterns like MERCHANT $AMOUNT and frequency.",
      "Technical data: Basic site analytics (if enabled later) would include device and browser details."
    ]
  },
  {
    title: "How we use data",
    body: [
      "Provide the recurring charge analysis and savings report.",
      "Improve matching accuracy with anonymized patterns only.",
      "Support customer requests and maintain service quality."
    ]
  },
  {
    title: "What we do not do",
    body: [
      "We do not store raw statements on our servers.",
      "We do not sell or rent your data.",
      "We do not create user profiles or ad audiences."
    ]
  },
  {
    title: "Payments",
    body: [
      "Stripe processes payments on our behalf. Your card information is handled by Stripe.",
      "We receive confirmation that a payment succeeded so we can unlock your report."
    ]
  },
  {
    title: "Data retention",
    body: [
      "Reports are saved in your browser only and auto-delete after 48 hours.",
      "You can clear your local data anytime from the analyze page."
    ]
  },
  {
    title: "Your privacy rights (GDPR/CCPA)",
    body: [
      "You can ask what data we process, request deletion, or opt out of any analytics.",
      "Because data stays on your device, deletion is usually as simple as clearing local browser data.",
      "Contact us at support@stopoverpaying.io to exercise these rights."
    ]
  },
  {
    title: "Changes",
    body: [
      "If we update this policy, we will update the effective date below and keep language clear."
    ]
  }
];

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
        <Badge>Privacy policy</Badge>
        <h1 className="mt-4 font-heading text-4xl text-ink">
          We are privacy-first by design.
        </h1>
        <p className="mt-3 text-sm text-slate">
          Effective date: January 12, 2026
        </p>
        <div className="mt-10 space-y-6">
          {sections.map((section) => (
            <Card key={section.title} className="space-y-3">
              <h2 className="font-heading text-2xl">{section.title}</h2>
              <ul className="space-y-2 text-sm text-slate">
                {section.body.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
