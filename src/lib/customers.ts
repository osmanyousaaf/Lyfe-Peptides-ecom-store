// Customer accounts: Google sign-in upserts, the sign-up reward code, and account reads. Server only.
import { randomInt } from "node:crypto";
import { db } from "./db";
import { findCoupon, type Coupon, couponState } from "./coupons";
import { formatPrice } from "./format";
import type { Geo } from "./geo";
import { sendMail } from "./mail";
import { getSettings } from "./settings";

export type Account = {
  id: number;
  email: string;
  name: string;
  picture: string;
  provider: string;
  country: string | null;
  region: string | null;
  city: string | null;
  createdAt: string;
  lastLoginAt: string | null;
  signupCouponId: number | null;
};

type Row = {
  id: number;
  email: string;
  name: string;
  picture: string;
  google_sub: string | null;
  provider: string;
  signup_coupon_id: number | null;
  country: string | null;
  region: string | null;
  city: string | null;
  created_at: string;
  last_login_at: string | null;
};

const toAccount = (r: Row): Account => ({
  id: r.id,
  email: r.email,
  name: r.name,
  picture: r.picture,
  provider: r.provider,
  country: r.country,
  region: r.region,
  city: r.city,
  createdAt: r.created_at,
  lastLoginAt: r.last_login_at,
  signupCouponId: r.signup_coupon_id,
});

export function getAccount(id: number): Account | undefined {
  const r = db().prepare("SELECT * FROM customers WHERE id = ?").get(id) as Row | undefined;
  return r ? toAccount(r) : undefined;
}

export function getAccountByEmail(email: string): Account | undefined {
  const r = db().prepare("SELECT * FROM customers WHERE email = ? COLLATE NOCASE").get(email.trim()) as Row | undefined;
  return r ? toAccount(r) : undefined;
}

export type Profile = { sub: string | null; email: string; name: string; picture: string; provider: "google" | "dev" };

// Finds the customer by Google id, then by email (linking it), or creates one. `created` is true on first sign-up.
export function upsertCustomer(p: Profile, geo: Geo): { account: Account; created: boolean } {
  const email = p.email.trim().toLowerCase();
  return db().transaction(() => {
    const bySub = p.sub ? (db().prepare("SELECT * FROM customers WHERE google_sub = ?").get(p.sub) as Row | undefined) : undefined;
    const existing = bySub ?? (db().prepare("SELECT * FROM customers WHERE email = ? COLLATE NOCASE").get(email) as Row | undefined);
    if (existing) {
      db()
        .prepare(
          `UPDATE customers SET name = COALESCE(NULLIF(?, ''), name), picture = COALESCE(NULLIF(?, ''), picture),
            google_sub = COALESCE(google_sub, ?), last_login_at = datetime('now') WHERE id = ?`
        )
        .run(p.name, p.picture, p.sub, existing.id);
      return { account: getAccount(existing.id)!, created: false };
    }
    const res = db()
      .prepare(
        `INSERT INTO customers (email, name, picture, google_sub, provider, country, region, city, last_login_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
      )
      .run(email, p.name || email.split("@")[0], p.picture, p.sub, p.provider, geo.country, geo.region, geo.city);
    return { account: getAccount(Number(res.lastInsertRowid))!, created: true };
  })();
}

// ---- the sign-up reward ----

export const SIGNUP_CODE_DAYS = 90;
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O or 1/I

function newCode(percent: number): string {
  for (;;) {
    const tail = Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
    const code = `LYFE${percent}-${tail}`;
    if (!findCoupon(code)) return code;
  }
}

// Creates the customer's one-time personal code (once per account) and returns it.
export function ensureSignupCoupon(account: Account): Coupon {
  if (account.signupCouponId) {
    const r = db().prepare("SELECT code FROM coupons WHERE id = ?").get(account.signupCouponId) as { code: string } | undefined;
    const c = r && findCoupon(r.code);
    if (c) return c;
  }
  const percent = Math.min(100, Math.max(1, Math.round(getSettings().signupDiscountPercent || 10)));
  const code = newCode(percent);
  const expires = new Date(Date.now() + SIGNUP_CODE_DAYS * 86400_000).toISOString().slice(0, 10);
  return db().transaction(() => {
    const res = db()
      .prepare(
        `INSERT INTO coupons (code, kind, value, max_uses, expires_at, active, note, customer_email, kind_source)
         VALUES (?, 'percent', ?, 1, ?, 1, ?, ?, 'signup')`
      )
      .run(code, percent, expires, `Sign-up reward for ${account.email}`, account.email);
    db().prepare("UPDATE customers SET signup_coupon_id = ? WHERE id = ?").run(Number(res.lastInsertRowid), account.id);
    return findCoupon(code)!;
  })();
}

export function signupCoupon(account: Account): (Coupon & { state: ReturnType<typeof couponState> }) | null {
  if (!account.signupCouponId) return null;
  const r = db().prepare("SELECT code FROM coupons WHERE id = ?").get(account.signupCouponId) as { code: string } | undefined;
  const c = r ? findCoupon(r.code) : undefined;
  return c ? { ...c, state: couponState(c) } : null;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);

// The welcome email with the code in big type. Never throws.
export async function sendSignupEmail(account: Account, coupon: Coupon) {
  const site = getSettings();
  const base = (process.env.NEXT_PUBLIC_SITE_URL || site.url).replace(/\/$/, "");
  const first = account.name.split(" ")[0] || "there";
  const expires = coupon.expiresAt
    ? new Date(`${coupon.expiresAt}T12:00:00Z`).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })
    : null;
  const shop = `${base}/shop?code=${encodeURIComponent(coupon.code)}`;

  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#f4f7fb;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:32px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#13294b;border-radius:24px;overflow:hidden;">
<tr><td style="padding:36px 36px 8px;font-family:Helvetica,Arial,sans-serif;color:#ffffff;">
<p style="margin:0;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#f26a21;font-weight:bold;">Lyfe Peptides</p>
<h1 style="margin:18px 0 8px;font-family:Helvetica,Arial,sans-serif;font-weight:800;font-size:32px;line-height:1.1;color:#ffffff;">Welcome, ${esc(first)}.<br><span style="color:#f26a21;">Here&rsquo;s ${coupon.value}% off.</span></h1>
<p style="margin:0;font-size:15px;line-height:1.6;color:#c9d3e0;">Thanks for creating your Lyfe account. Your personal code takes ${coupon.value}% off your next order. It works once, and only when you&rsquo;re signed in with this Google account.</p>
</td></tr>
<tr><td style="padding:24px 36px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:18px;">
<tr><td align="center" style="padding:26px 16px;font-family:Helvetica,Arial,sans-serif;">
<p style="margin:0 0 8px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#5b6b82;font-weight:bold;">Your code</p>
<p style="margin:0;font-family:'Courier New',monospace;font-size:34px;letter-spacing:4px;font-weight:bold;color:#13294b;">${esc(coupon.code)}</p>
${expires ? `<p style="margin:10px 0 0;font-size:13px;color:#5b6b82;">Valid until ${esc(expires)}</p>` : ""}
</td></tr></table>
</td></tr>
<tr><td align="center" style="padding:0 36px 32px;">
<a href="${esc(shop)}" style="display:inline-block;background:#f26a21;color:#ffffff;text-decoration:none;font-family:Helvetica,Arial,sans-serif;font-weight:bold;font-size:15px;padding:15px 30px;border-radius:999px;">Shop now &rarr;</a>
<p style="margin:14px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#8d99ab;">Already in your cart when you&rsquo;re signed in. Free shipping over ${esc(formatPrice(site.freeShipCents))}.</p>
</td></tr>
<tr><td style="padding:20px 36px;border-top:1px solid #1d3b68;font-family:Helvetica,Arial,sans-serif;font-size:11px;line-height:1.6;color:#8d99ab;">
For research purposes only. Not for human consumption. Products are sold as laboratory reference materials and are not approved by Health Canada for personal use.<br>
${esc(site.name)} &middot; ${esc(site.email)}
</td></tr>
</table>
</td></tr></table></body></html>`;

  const text = [
    `Welcome to ${site.name}, ${first}!`,
    ``,
    `Your personal code: ${coupon.code}`,
    `${coupon.value}% off your next order. One use, only while signed in with this Google account.${expires ? ` Valid until ${expires}.` : ""}`,
    ``,
    `Shop now: ${shop}`,
    ``,
    `For research purposes only. Not for human consumption.`,
  ].join("\n");

  return sendMail({ to: account.email, subject: `Your ${coupon.value}% off code: ${coupon.code}`, html, text, kind: "signup-code" });
}

// ---- account page ----

export type AccountOrder = {
  id: number;
  number: string;
  status: string;
  totalCents: number;
  createdAt: string;
  carrier: string | null;
  trackingNumber: string | null;
  items: { name: string; variantLabel: string | null; qty: number; image: string; slug: string }[];
};

export function accountOrders(account: Account): AccountOrder[] {
  const orders = db()
    .prepare(
      `SELECT id, number, status, total_cents, created_at, carrier, tracking_number FROM orders
       WHERE customer_id = ? OR email = ? COLLATE NOCASE ORDER BY created_at DESC LIMIT 100`
    )
    .all(account.id, account.email) as {
    id: number;
    number: string;
    status: string;
    total_cents: number;
    created_at: string;
    carrier: string | null;
    tracking_number: string | null;
  }[];
  const items = db().prepare("SELECT name, variant_label, qty, image, slug FROM order_items WHERE order_id = ?");
  return orders.map((o) => ({
    id: o.id,
    number: o.number,
    status: o.status,
    totalCents: o.total_cents,
    createdAt: o.created_at,
    carrier: o.carrier,
    trackingNumber: o.tracking_number,
    items: (items.all(o.id) as { name: string; variant_label: string | null; qty: number; image: string; slug: string }[]).map((i) => ({
      name: i.name,
      variantLabel: i.variant_label,
      qty: i.qty,
      image: i.image,
      slug: i.slug,
    })),
  }));
}

// ---- admin ----

export function listAccounts(): Account[] {
  return (db().prepare("SELECT * FROM customers ORDER BY created_at DESC").all() as Row[]).map(toAccount);
}

export type EmailLog = { id: number; to: string; subject: string; kind: string; status: string; error: string | null; createdAt: string };

export function emailLogFor(email: string, n = 20): EmailLog[] {
  return (
    db()
      .prepare("SELECT * FROM emails WHERE to_email = ? COLLATE NOCASE ORDER BY id DESC LIMIT ?")
      .all(email, n) as { id: number; to_email: string; subject: string; kind: string; status: string; error: string | null; created_at: string }[]
  ).map((r) => ({ id: r.id, to: r.to_email, subject: r.subject, kind: r.kind, status: r.status, error: r.error, createdAt: r.created_at }));
}

export function signupsSince(days: number): number {
  return (db().prepare("SELECT COUNT(*) AS n FROM customers WHERE created_at >= datetime('now', ?)").get(`-${days} days`) as { n: number }).n;
}
