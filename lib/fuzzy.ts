export function normalizeMerchant(name: string) {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function levenshtein(a: string, b: string) {
  if (a === b) return 0;
  const matrix = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}

export function similarity(a: string, b: string) {
  if (!a || !b) return 0;
  const distance = levenshtein(a, b);
  return 1 - distance / Math.max(a.length, b.length, 1);
}

export function bestAliasMatch(merchant: string, aliases: string[]) {
  const normalized = normalizeMerchant(merchant);
  let bestScore = 0;
  let bestAlias = "";

  for (const alias of aliases) {
    const normalizedAlias = normalizeMerchant(alias);
    const score = normalized.includes(normalizedAlias)
      ? 1
      : similarity(normalized, normalizedAlias);
    if (score > bestScore) {
      bestScore = score;
      bestAlias = alias;
    }
  }

  return { bestAlias, score: bestScore };
}
