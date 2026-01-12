import { normalizeMerchant } from "@/lib/fuzzy";
import { clamp } from "@/lib/utils";
import type { Frequency, RecurringCharge, Transaction } from "@/lib/types";

function daysBetween(a: Date, b: Date) {
  const diff = Math.abs(a.getTime() - b.getTime());
  return diff / (1000 * 60 * 60 * 24);
}

function detectFrequency(intervals: number[]): Frequency {
  if (!intervals.length) return "unknown";
  const avg = intervals.reduce((sum, value) => sum + value, 0) / intervals.length;

  if (avg >= 25 && avg <= 35) return "monthly";
  if (avg >= 80 && avg <= 110) return "quarterly";
  if (avg >= 330 && avg <= 400) return "annual";
  return "unknown";
}

function confidenceScore(occurrences: number, intervals: number[], frequency: Frequency) {
  if (frequency === "unknown") return 0;
  const base = occurrences >= 3 ? 0.7 : 0.5;
  const spread = intervals.length
    ? Math.max(...intervals) - Math.min(...intervals)
    : 30;
  const stability = clamp(1 - spread / 20, 0, 1);
  return clamp(base + stability * 0.3, 0, 0.98);
}

export function findRecurringCharges(transactions: Transaction[]): RecurringCharge[] {
  const grouped = new Map<string, Transaction[]>();

  for (const tx of transactions) {
    if (tx.amount <= 0) continue;
    const normalized = normalizeMerchant(tx.merchant);
    if (!grouped.has(normalized)) grouped.set(normalized, []);
    grouped.get(normalized)?.push(tx);
  }

  const recurring: RecurringCharge[] = [];

  for (const [normalized, items] of grouped.entries()) {
    if (items.length < 2) continue;
    const sorted = [...items].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
    const intervals: number[] = [];
    for (let i = 1; i < sorted.length; i += 1) {
      intervals.push(daysBetween(sorted[i - 1].date, sorted[i].date));
    }

    const frequency = detectFrequency(intervals);
    if (frequency === "unknown") continue;

    const averageAmount =
      sorted.reduce((sum, tx) => sum + tx.amount, 0) / sorted.length;

    recurring.push({
      merchant: sorted[0].merchant,
      normalizedName: normalized,
      averageAmount,
      frequency,
      occurrences: sorted,
      confidence: confidenceScore(sorted.length, intervals, frequency)
    });
  }

  return recurring.sort((a, b) => b.confidence - a.confidence);
}
