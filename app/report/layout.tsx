import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Savings Report | StopOverpaying.io",
  description:
    "View your personalized savings report with matched services, alternatives, and negotiation scripts."
};

export default function ReportLayout({ children }: { children: ReactNode }) {
  return children;
}
