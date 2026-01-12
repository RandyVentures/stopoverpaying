import { bestAliasMatch, normalizeMerchant, similarity } from "@/lib/fuzzy";
import { getSubscriptionsDatabase } from "@/lib/subscriptions";
import type { MatchedService, RecurringCharge } from "@/lib/types";

const MIN_SCORE = 0.78;

export function matchRecurringCharges(recurring: RecurringCharge[]): MatchedService[] {
  const database = getSubscriptionsDatabase();
  const results: MatchedService[] = [];

  const categories = Object.entries(database.categories);

  for (const charge of recurring) {
    const normalizedMerchant = normalizeMerchant(charge.merchant);
    let best: MatchedService | null = null;

    for (const [categoryKey, category] of categories) {
      for (const item of category.items) {
        const aliasMatch = bestAliasMatch(normalizedMerchant, [
          item.name,
          ...item.aliases
        ]);
        const nameScore = similarity(
          normalizeMerchant(item.name),
          normalizedMerchant
        );
        const score = Math.max(aliasMatch.score, nameScore);

        if (!best || score > best.matchConfidence) {
          best = {
            recurring: charge,
            subscription: item,
            category,
            matchConfidence: score
          };
        }
      }
    }

    if (best && best.matchConfidence >= MIN_SCORE) {
      results.push(best);
    } else {
      results.push({
        recurring: charge,
        matchConfidence: best?.matchConfidence ?? 0
      });
    }
  }

  return results;
}
