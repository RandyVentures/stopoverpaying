import type { RecurringCharge } from "@/lib/types";

export function buildAnonymizedPatterns(recurring: RecurringCharge[]) {
  return recurring.map((charge) => {
    const amount = charge.averageAmount.toFixed(2);
    return `${charge.normalizedName} $${amount} - occurs ${charge.frequency} (${charge.occurrences.length} times)`;
  });
}
