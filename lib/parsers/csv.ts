import { Transaction } from "@/lib/types";

const dateKeys = [
  "date",
  "posting date",
  "transaction date",
  "trans date",
  "posted",
  "posted date"
];

const merchantKeys = [
  "description",
  "merchant",
  "payee",
  "name",
  "transaction description",
  "details",
  "memo"
];

const amountKeys = [
  "amount",
  "debit",
  "withdrawal",
  "charge",
  "credit",
  "deposit"
];

function findKey(row: Record<string, string>, keys: string[]) {
  const entries = Object.keys(row).map((key) => ({
    original: key,
    lower: key.toLowerCase()
  }));

  for (const entry of entries) {
    if (keys.includes(entry.lower)) return entry.original;
    if (keys.some((key) => entry.lower.includes(key))) return entry.original;
  }

  return null;
}

function parseAmount(raw: string, row: Record<string, string>) {
  const cleaned = raw.replace(/[^0-9.-]+/g, "");
  const value = Number.parseFloat(cleaned);

  const debitKey = Object.keys(row).find((key) =>
    key.toLowerCase().includes("debit")
  );
  const creditKey = Object.keys(row).find((key) =>
    key.toLowerCase().includes("credit")
  );

  if (!Number.isFinite(value)) return 0;

  if (debitKey && row[debitKey]) return Math.abs(value);
  if (creditKey && row[creditKey]) return Math.abs(value) * -1;

  return value;
}

function hasFieldMatch(fields: string[], keys: string[]) {
  return fields.some((field) => {
    const lower = field.toLowerCase();
    return keys.includes(lower) || keys.some((key) => lower.includes(key));
  });
}

export async function parseCsvTransactions(csvText: string): Promise<Transaction[]> {
  const Papa = (await import("papaparse")).default;
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true
  });

  if (parsed.errors.length) {
    throw new Error("CSV_PARSE_ERROR");
  }

  const fields = parsed.meta.fields ?? [];
  const hasDate = hasFieldMatch(fields, dateKeys);
  const hasMerchant = hasFieldMatch(fields, merchantKeys);
  const hasAmount = hasFieldMatch(fields, amountKeys);

  if (!hasDate || !hasMerchant || !hasAmount) {
    throw new Error("CSV_MISSING_COLUMNS");
  }

  return parsed.data
    .map((row) => {
      const dateKey = findKey(row, dateKeys);
      const merchantKey = findKey(row, merchantKeys);
      const amountKey = findKey(row, amountKeys);

      if (!dateKey || !merchantKey || !amountKey) return null;

      const date = new Date(row[dateKey]);
      const merchant = row[merchantKey] || "";
      const amount = parseAmount(row[amountKey] || "", row);

      if (!merchant || Number.isNaN(date.getTime())) return null;

      return {
        date,
        merchant: merchant.trim(),
        amount: Math.abs(amount),
        category: row["Category"] || row["category"],
        raw: JSON.stringify(row)
      } satisfies Transaction;
    })
    .filter((value): value is Transaction => Boolean(value));
}
