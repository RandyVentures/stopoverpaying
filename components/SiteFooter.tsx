import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/40 bg-white/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-8 text-xs text-slate md:flex-row md:items-center md:justify-between">
        <span>StopOverpaying.io MVP. Privacy first, no raw data leaves your browser.</span>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>
          <Link href="/terms" className="underline">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
