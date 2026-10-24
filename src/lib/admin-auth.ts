import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// Admin sign-in: one shared password (ADMIN_PASSWORD) and a signed, http-only session cookie.
// The cookie holds an expiry time plus an HMAC of it, keyed with ADMIN_SECRET, so it can't be forged.
export const COOKIE = "lyfe_admin";
const DAYS = 7;

const secret = () => process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "";
const sign = (v: string) => createHmac("sha256", secret()).update(v).digest("base64url");

function same(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export const adminConfigured = () => Boolean(process.env.ADMIN_PASSWORD);

export function passwordOk(input: string) {
  const pw = process.env.ADMIN_PASSWORD;
  return Boolean(pw) && same(input, pw!);
}

export function newSession() {
  const exp = String(Date.now() + DAYS * 864e5);
  return { value: `${exp}.${sign(exp)}`, maxAge: DAYS * 86400 };
}

export function validSession(value: string | undefined) {
  if (!value || !adminConfigured()) return false;
  const [exp, mac] = value.split(".");
  return Boolean(exp && mac) && Number(exp) > Date.now() && same(mac, sign(exp));
}

export async function isAdmin() {
  return validSession((await cookies()).get(COOKIE)?.value);
}
