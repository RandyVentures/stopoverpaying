const STORAGE_TTL_MS = 1000 * 60 * 60 * 48;

interface StoredValue<T> {
  value: T;
  expiresAt: number;
}

export function saveWithExpiry<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  const payload: StoredValue<T> = {
    value,
    expiresAt: Date.now() + STORAGE_TTL_MS
  };
  window.localStorage.setItem(key, JSON.stringify(payload));
}

export function loadWithExpiry<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredValue<T>;
    if (Date.now() > parsed.expiresAt) {
      window.localStorage.removeItem(key);
      return null;
    }
    return parsed.value;
  } catch {
    return null;
  }
}

export function clearExpired(keys: string[]) {
  if (typeof window === "undefined") return;
  keys.forEach((key) => {
    loadWithExpiry(key);
  });
}

export function clearStorage(keys: string[]) {
  if (typeof window === "undefined") return;
  keys.forEach((key) => window.localStorage.removeItem(key));
}
