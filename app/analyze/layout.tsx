import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Analyze Statement | StopOverpaying.io",
  description:
    "Upload a CSV or PDF bank statement to analyze recurring bills locally and preview savings in minutes."
};

export default function AnalyzeLayout({ children }: { children: ReactNode }) {
  return children;
}
