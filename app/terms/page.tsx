import type { Metadata } from "next";

import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Terms of Service | StopOverpaying.io",
  description:
    "Simple terms for using StopOverpaying.io, including pricing, payment processing, and usage expectations."
};

const sections = [
  {
    title: "Using the service",
    body: [
      "StopOverpaying.io helps you identify recurring charges and possible savings opportunities.",
      "You are responsible for the accuracy of the data you upload and the decisions you make.",
      "Do not upload statements you do not have permission to use."
    ]
  },
  {
    title: "Payments and access",
    body: [
      "The preview is free. Unlocking the full report is a one-time payment.",
      "Payments are processed by Stripe. We never store your card details.",
      "If a payment fails, access to the full report will not be unlocked."
    ]
  },
  {
    title: "No refunds policy",
    body: [
      "Because reports are delivered instantly, payments are non-refundable.",
      "If you run into a technical problem, contact support and we will help."
    ]
  },
  {
    title: "Accuracy and disclaimers",
    body: [
      "We aim for high accuracy, but results are estimates and suggestions.",
      "We do not provide financial, legal, or tax advice.",
      "Always verify pricing and terms with the service provider."
    ]
  },
  {
    title: "Privacy and data handling",
    body: [
      "Your statement stays in your browser and is not stored on our servers.",
      "Reports are stored locally for 48 hours and then auto-delete.",
      "See the Privacy Policy for more details."
    ]
  },
  {
    title: "Changes to the service",
    body: [
      "We may update features or pricing over time.",
      "If terms change, we will update the effective date below."
    ]
  }
];

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
        <Badge>Terms of service</Badge>
        <h1 className="mt-4 font-heading text-4xl text-ink">
          Clear terms so you know what to expect.
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
