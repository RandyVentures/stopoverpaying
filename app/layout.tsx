import "./globals.css";

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, Space_Grotesk } from "next/font/google";

const bodyFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body"
});

const headingFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-heading"
});

export const metadata: Metadata = {
  title: "StopOverpaying.io",
  description:
    "Spot recurring bills fast, uncover savings, and keep your statement private with client-side analysis.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://stopoverpaying.io"),
  openGraph: {
    title: "StopOverpaying.io",
    description:
      "Spot recurring bills fast, uncover savings, and keep your statement private with client-side analysis.",
    type: "website",
    url: "/",
    siteName: "StopOverpaying.io"
  },
  twitter: {
    card: "summary",
    title: "StopOverpaying.io",
    description:
      "Spot recurring bills fast, uncover savings, and keep your statement private with client-side analysis."
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${headingFont.variable}`}>
      <body className="min-h-screen bg-mist font-body text-ink">
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-br from-sea/25 via-sand/20 to-transparent blur-3xl" />
          <div className="absolute bottom-0 right-0 h-[420px] w-[420px] translate-x-1/3 rounded-full bg-gradient-to-br from-coral/20 via-sand/20 to-transparent blur-3xl" />
        </div>
        {children}
      </body>
    </html>
  );
}
