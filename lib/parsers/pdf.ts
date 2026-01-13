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
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
    const loadingTask = pdfjs.getDocument({ data: buffer });
    const pdf = await loadingTask.promise;

    let text = "";
    for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
      const page = await pdf.getPage(pageIndex);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .filter(Boolean)
        .join(" ");
      text += `${pageText}\n`;
    }

    return parseText(text);
  } catch {
    return [];
  }
}
