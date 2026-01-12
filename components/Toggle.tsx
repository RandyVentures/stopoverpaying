import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

interface ToggleProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  pressed?: boolean;
}

export function Toggle({ className, pressed, ...props }: ToggleProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]",
        pressed
          ? "border-sea/50 bg-sea/10 text-sea"
          : "border-slate/20 bg-white/70 text-slate",
        className
      )}
      {...props}
    />
  );
}
