// Signed admin session tokens. No database or Next imports, so proxy.ts can use it too.
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "lyfe_admin";
export const SESSION_DAYS = 7;

function secret(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  // changing the password also signs everyone out
  return process.env.ADMIN_SECRET || createHash("sha256").update(`lyfe-admin:${pw}`).digest("hex");
}

const sign = (payload: string, key: string) => createHmac("sha256", key).update(payload).digest("base64url");

function same(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function checkPassword(attempt: string): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  const digest = (s: string) => createHash("sha256").update(s).digest("hex");
  return same(digest(attempt), digest(pw));
}

export function createToken(now = Date.now()): string | null {
  const key = secret();
  if (!key) return null;
  const exp = String(now + SESSION_DAYS * 86400_000);
  return `${exp}.${sign(exp, key)}`;
}

export function verifyToken(token: string | undefined | null, now = Date.now()): boolean {
  const key = secret();
  if (!key || !token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || !same(sig, sign(exp, key))) return false;
  return Number(exp) > now;
}
