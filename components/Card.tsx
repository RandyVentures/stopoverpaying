import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-3xl border border-slate/20 bg-white/70 p-6 shadow-soft-xl", className)}
      {...props}
    />
  );
}
