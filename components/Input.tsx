import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border border-slate/20 bg-white/80 px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-sea/60 focus:ring-2 focus:ring-sea/30",
        className
      )}
      {...props}
    />
  );
}
