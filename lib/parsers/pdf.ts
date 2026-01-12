import { Transaction } from "@/lib/types";

const linePattern =
  /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+(.+?)\s+(-?\$?\d[\d,]*\.\d{2})/;

function parseAmount(raw: string) {
  const cleaned = raw.replace(/[^0-9.-]+/g, "");
  const value = Number.parseFloat(cleaned);
  return Number.isFinite(value) ? Math.abs(value) : 0;
}

function parseText(text: string): Transaction[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(linePattern);
      if (!match) return null;
      const [, dateRaw, merchant, amountRaw] = match;
      const date = new Date(dateRaw);
      if (Number.isNaN(date.getTime())) return null;
      return {
        date,
        merchant: merchant.trim(),
        amount: parseAmount(amountRaw),
        raw: line
      } satisfies Transaction;
    })
    .filter((value): value is Transaction => Boolean(value));
}

export async function parsePdfTransactions(file: File): Promise<Transaction[]> {
  const buffer = await file.arrayBuffer();

  try {
    const pdfParseModule = await import("pdf-parse");
    const pdfParse = pdfParseModule.default;
    const data = await pdfParse(new Uint8Array(buffer));
    return parseText(data.text || "");
  } catch {
    return [];
  }
}
