// Signed customer sessions (separate cookie and key from the admin). Server only.
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const CUSTOMER_COOKIE = "lyfe_customer";
export const CUSTOMER_DAYS = 60;

function key(): string {
  const base = process.env.AUTH_SECRET || process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "";
  return createHash("sha256").update(`lyfe-customer:${base}`).digest("hex");
}

const sign = (payload: string) => createHmac("sha256", key()).update(payload).digest("base64url");

export function customerToken(customerId: number, now = Date.now()): string {
  const payload = `${customerId}.${now + CUSTOMER_DAYS * 86400_000}`;
  return `${payload}.${sign(payload)}`;
}

export function readCustomerToken(token: string | undefined | null, now = Date.now()): number | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [id, exp, sig] = parts;
  const want = Buffer.from(sign(`${id}.${exp}`));
  const got = Buffer.from(sig);
  if (want.length !== got.length || !timingSafeEqual(want, got) || Number(exp) <= now) return null;
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function currentCustomerId(): Promise<number | null> {
  return readCustomerToken((await cookies()).get(CUSTOMER_COOKIE)?.value);
}

export async function setCustomerCookie(customerId: number) {
  (await cookies()).set(CUSTOMER_COOKIE, customerToken(customerId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CUSTOMER_DAYS * 86400,
  });
}

export async function clearCustomerCookie() {
  (await cookies()).delete(CUSTOMER_COOKIE);
}
