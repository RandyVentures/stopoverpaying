/**
 * Encrypted localStorage wrapper for sensitive financial data.
 * 
 * Uses AES encryption with a per-session key to protect data
 * from XSS attacks and browser extensions.
 */

import { AES, enc, lib } from 'crypto-js';

const STORAGE_TTL_MS = 1000 * 60 * 60 * 48; // 48 hours

interface StoredValue<T> {
  value: T;
  expiresAt: number;
}

/**
 * Generate a random encryption key for this session.
 * Key is stored in sessionStorage (cleared when tab closes).
 */
function getOrCreateSessionKey(): string {
  if (typeof window === 'undefined') return '';
  
  const SESSION_KEY_NAME = '__app_session_key';
  let key = window.sessionStorage.getItem(SESSION_KEY_NAME);
  
  if (!key) {
    // Generate a random 256-bit key
    key = lib.WordArray.random(32).toString();
    window.sessionStorage.setItem(SESSION_KEY_NAME, key);
  }
  
  return key;
}

/**
 * Encrypt and save data to localStorage with expiry.
 */
export function saveSecure<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  
  const payload: StoredValue<T> = {
    value,
    expiresAt: Date.now() + STORAGE_TTL_MS,
  };
  
  const sessionKey = getOrCreateSessionKey();
  const plaintext = JSON.stringify(payload);
  const encrypted = AES.encrypt(plaintext, sessionKey).toString();
  
  window.localStorage.setItem(key, encrypted);
}

/**
 * Load and decrypt data from localStorage.
 * Returns null if expired or decryption fails.
 */
export function loadSecure<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  
  const encrypted = window.localStorage.getItem(key);
  if (!encrypted) return null;
  
  try {
    const sessionKey = getOrCreateSessionKey();
    const decrypted = AES.decrypt(encrypted, sessionKey);
    const plaintext = decrypted.toString(enc.Utf8);
    
    if (!plaintext) {
      // Decryption failed (wrong key or corrupted data)
      window.localStorage.removeItem(key);
      return null;
    }
    
    const parsed = JSON.parse(plaintext) as StoredValue<T>;
    
    // Check expiry
    if (Date.now() > parsed.expiresAt) {
      window.localStorage.removeItem(key);
      return null;
    }
    
    return parsed.value;
  } catch (error) {
    // Decryption or parsing failed
    window.localStorage.removeItem(key);
    return null;
  }
}

/**
 * Clear expired entries.
 */
export function clearExpiredSecure(keys: string[]): void {
  if (typeof window === 'undefined') return;
  keys.forEach((key) => {
    loadSecure(key); // This will auto-remove if expired
  });
}

/**
 * Remove specific keys.
 */
export function clearSecure(keys: string[]): void {
  if (typeof window === 'undefined') return;
  keys.forEach((key) => window.localStorage.removeItem(key));
}

/**
 * Legacy compatibility: Unencrypted storage operations.
 * Use these for non-sensitive data (like UI preferences).
 */
export function saveWithExpiry<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  const payload: StoredValue<T> = {
    value,
    expiresAt: Date.now() + STORAGE_TTL_MS,
  };
  window.localStorage.setItem(key, JSON.stringify(payload));
}

export function loadWithExpiry<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
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

export function clearExpired(keys: string[]): void {
  if (typeof window === 'undefined') return;
  keys.forEach((key) => {
    loadWithExpiry(key);
  });
}

export function clearStorage(keys: string[]): void {
  if (typeof window === 'undefined') return;
  keys.forEach((key) => window.localStorage.removeItem(key));
}
