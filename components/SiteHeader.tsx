import Link from "next/link";

import { Button } from "@/components/Button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/40 bg-white/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-ink">
          StopOverpaying
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-slate md:flex">
          <Link href="/#how">How it works</Link>
          <Link href="/#preview">Preview</Link>
          <Link href="/#faq">FAQ</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/analyze" className="hidden text-sm text-slate md:inline-flex">
            Free scan
          </Link>
          <Link href="/analyze">
            <Button variant="secondary">Start analysis</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
