// Discount codes: lookup, validation against a subtotal, and admin reads. Server only.
import { db } from "./db";
import { formatPrice } from "./format";

export type Coupon = {
  id: number;
  code: string;
  kind: "percent" | "amount";
  /** percent: 1–100; amount: cents */
  value: number;
  minSubtotalCents: number;
  maxUses: number | null;
  uses: number;
  startsAt: string | null;
  expiresAt: string | null;
  active: boolean;
  note: string;
  createdAt: string;
  /** personal codes (e.g. the sign-up reward) only work for this customer */
  customerEmail: string | null;
  /** "manual" for codes made in the admin, "signup" for account rewards */
  source: string;
};

type CouponRow = {
  id: number;
  code: string;
  kind: string;
  value: number;
  min_subtotal_cents: number;
  max_uses: number | null;
  uses: number;
  starts_at: string | null;
  expires_at: string | null;
  active: number;
  note: string;
  created_at: string;
  customer_email: string | null;
  kind_source: string | null;
};

const toCoupon = (r: CouponRow): Coupon => ({
  id: r.id,
  code: r.code,
  kind: r.kind === "amount" ? "amount" : "percent",
  value: r.value,
  minSubtotalCents: r.min_subtotal_cents,
  maxUses: r.max_uses,
  uses: r.uses,
  startsAt: r.starts_at,
  expiresAt: r.expires_at,
  active: r.active === 1,
  note: r.note,
  createdAt: r.created_at,
  customerEmail: r.customer_email,
  source: r.kind_source ?? "manual",
});

export function listCoupons(): Coupon[] {
  return (db().prepare("SELECT * FROM coupons ORDER BY active DESC, created_at DESC").all() as CouponRow[]).map(toCoupon);
}

export function getCoupon(id: number): Coupon | undefined {
  const r = db().prepare("SELECT * FROM coupons WHERE id = ?").get(id) as CouponRow | undefined;
  return r ? toCoupon(r) : undefined;
}

export function findCoupon(code: string): Coupon | undefined {
  const r = db().prepare("SELECT * FROM coupons WHERE code = ? COLLATE NOCASE").get(code.trim()) as CouponRow | undefined;
  return r ? toCoupon(r) : undefined;
}

export const normalizeCode = (code: string) => code.trim().toUpperCase().replace(/\s+/g, "");

// dates are stored as YYYY-MM-DD and apply for the whole day
const today = () => new Date().toISOString().slice(0, 10);

export function couponState(c: Coupon): "active" | "disabled" | "scheduled" | "expired" | "used up" {
  if (!c.active) return "disabled";
  if (c.startsAt && c.startsAt > today()) return "scheduled";
  if (c.expiresAt && c.expiresAt < today()) return "expired";
  if (c.maxUses != null && c.uses >= c.maxUses) return "used up";
  return "active";
}

export function discountFor(c: Coupon, subtotalCents: number): number {
  const off = c.kind === "percent" ? Math.round((subtotalCents * Math.min(100, c.value)) / 100) : c.value;
  return Math.max(0, Math.min(off, subtotalCents));
}

export function describeCoupon(c: Coupon): string {
  return c.kind === "percent" ? `${c.value}% off` : `${formatPrice(c.value)} off`;
}

export type CouponCheck =
  | { ok: true; coupon: Coupon; discountCents: number; label: string }
  | { ok: false; error: string };

// Checks a shopper's code against a server-priced subtotal.
// `customerEmail` is the signed-in customer (or the order's email for admin orders); personal codes need it to match.
export function checkCoupon(code: string, subtotalCents: number, opts: { customerEmail?: string | null } = {}): CouponCheck {
  const c = code.trim() ? findCoupon(code) : undefined;
  if (!c) return { ok: false, error: "That code isn't valid." };
  if (c.customerEmail && c.customerEmail.toLowerCase() !== (opts.customerEmail ?? "").trim().toLowerCase()) {
    return {
      ok: false,
      error: opts.customerEmail
        ? "That code belongs to a different account."
        : "That code is personal. Sign in with the Google account it was sent to.",
    };
  }
  const state = couponState(c);
  if (state === "scheduled") return { ok: false, error: "That code isn't active yet." };
  if (state === "expired") return { ok: false, error: "That code has expired." };
  if (state !== "active") return { ok: false, error: "That code is no longer available." };
  if (subtotalCents < c.minSubtotalCents) {
    return { ok: false, error: `This code needs a subtotal of ${formatPrice(c.minSubtotalCents)} or more.` };
  }
  return { ok: true, coupon: c, discountCents: discountFor(c, subtotalCents), label: describeCoupon(c) };
}
