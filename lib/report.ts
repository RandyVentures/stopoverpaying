import type { MatchedService, SavingsReport, SavingsReportItem } from "@/lib/types";

function annualize(amount: number, frequency: string) {
  switch (frequency) {
    case "monthly":
      return amount * 12;
    case "quarterly":
      return amount * 4;
    case "annual":
      return amount;
    default:
      return amount * 12;
  }
}

export function buildSavingsReport(matches: MatchedService[]): SavingsReport {
  const items: SavingsReportItem[] = [];
  let totalCurrentAnnual = 0;
  let totalPotentialSavings = 0;

  for (const match of matches) {
    const annualCost = annualize(
      match.recurring.averageAmount,
      match.recurring.frequency
    );
    totalCurrentAnnual += annualCost;

    if (!match.subscription || !match.category) {
      continue;
    }

    const options = match.subscription.savings_options;
    const bestOption = options.reduce((best, option) =>
      option.savings_annual > best.savings_annual ? option : best
    );

    const annualSavings = Math.max(bestOption.savings_annual, 0);
    totalPotentialSavings += annualSavings;

    items.push({
      service: match.subscription.name,
      category: match.category.label,
      currentCostMonthly: match.recurring.averageAmount,
      annualSavings,
      bestOption,
      options
    });
  }

  return {
    totalCurrentAnnual,
    totalPotentialSavings,
    items
  };
}
