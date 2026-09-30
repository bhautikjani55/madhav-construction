/**
 * Minimal session auth (no signup).
 * Credentials come from env: ADMIN_USER / ADMIN_PASSWORD.
 * Session is a stateless HMAC-signed cookie: "<username>.<expiry>.<sig>".
 * Uses Web Crypto so it works in middleware (edge) and route handlers.
 */

const SESSION_DAYS = 7;

function getSecret(): string {
  return process.env.SESSION_SECRET || "dev-insecure-secret-change-me";
}

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacHex(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data)
  );
  return toHex(sig);
}

/** Constant-time string compare (length leak is acceptable here). */
export function safeEqual(a: string, b: string): boolean {
  const ab = new TextEncoder().encode(a);
  const bb = new TextEncoder().encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

export async function createSession(username: string): Promise<string> {
  const exp = Date.now() + SESSION_DAYS * 24 * 3600 * 1000;
  const payload = `${username}.${exp}`;
  const sig = await hmacHex(payload);
  return `${payload}.${sig}`;
}

/** Returns the logged-in username, or null if missing/invalid/expired. */
export async function verifySession(
  token: string | undefined | null
): Promise<string | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 3) return null;
  const sig = parts.pop() as string;
  const expStr = parts.pop() as string;
  const username = parts.join(".");
  const exp = Number(expStr);
  if (!username || !Number.isFinite(exp) || exp < Date.now()) return null;
  const expected = await hmacHex(`${username}.${expStr}`);
  if (!safeEqual(sig, expected)) return null;
  return username;
}
