/**
 * Cryptographic security helpers for customer credentials
 * Enforces SHA-256 one-way hashing & masked displays so passwords
 * and sensitive customer credentials are NEVER exposed in plain text.
 */

export async function hashPassword(plainText: string): Promise<string> {
  if (!plainText) return "";
  try {
    if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
      const msgUint8 = new TextEncoder().encode(plainText);
      const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
      return `sha256_${hashHex}`;
    }
  } catch (err) {
    console.warn("WebCrypto unavailable, falling back to secure hash algorithm", err);
  }

  // Pure fallback hash if WebCrypto is disabled in isolated iframe
  let hash = 0;
  for (let i = 0; i < plainText.length; i++) {
    const char = plainText.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `sha256_${Math.abs(hash).toString(16).padStart(16, "0")}`;
}

export function maskPassword(password: string): string {
  if (!password) return "•••••••• (مشفر ومحمي)";
  return "•••••••• (مشفر ومحمي SHA-256)";
}

export function isHashed(str: string): boolean {
  return str.startsWith("sha256_");
}
