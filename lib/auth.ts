/**
 * Edge-compatible cookie auth: HMAC-signed token containing an expiry.
 * The signing key is the configured AUTH_PASSWORD, so changing the password
 * automatically invalidates every previously-issued cookie.
 */

export const AUTH_COOKIE = "streamly_auth";
export const AUTH_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

const enc = new TextEncoder();

function bufToHex(buf: ArrayBuffer): string {
  const u8 = new Uint8Array(buf);
  let out = "";
  for (let i = 0; i < u8.length; i++) out += u8[i].toString(16).padStart(2, "0");
  return out;
}

function b64urlEncode(s: string): string {
  return btoa(s).replace(/=+$/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function b64urlDecode(s: string): string {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
}

async function hmacHex(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return bufToHex(sig);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export type AuthPayload = { exp: number };

export async function signAuthCookie(secret: string, ttlSeconds = AUTH_TTL_SECONDS): Promise<string> {
  const payload: AuthPayload = { exp: Date.now() + ttlSeconds * 1000 };
  const body = b64urlEncode(JSON.stringify(payload));
  const sig = await hmacHex(secret, body);
  return `${body}.${sig}`;
}

export async function verifyAuthCookie(token: string | undefined, secret: string): Promise<AuthPayload | null> {
  if (!token) return null;
  const dot = token.indexOf(".");
  if (dot < 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  let expected: string;
  try {
    expected = await hmacHex(secret, body);
  } catch {
    return null;
  }
  if (!timingSafeEqual(expected, sig)) return null;
  try {
    const json = b64urlDecode(body);
    const payload = JSON.parse(json) as AuthPayload;
    if (typeof payload?.exp !== "number") return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Allowlist `next` URLs to same-origin paths to prevent open redirects. */
export function safeNext(value: unknown): string {
  if (typeof value !== "string") return "/";
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return "/";
  return value;
}
