"use server";

import { redirect } from "next/navigation";
import { requireAdmin, revalidateStore, type ActionResult } from "@/lib/admin-auth";
import {
  CARRIERS,
  STATUSES,
  STATUS_LABEL,
  createOrder,
  deleteOrder,
  getOrder,
  logEvent,
  setCustomer,
  setNotes,
  setStatus,
  setTracking,
  stripeClient,
  type Address,
  type OrderStatus,
} from "@/lib/orders";
import { checkCoupon } from "@/lib/coupons";
import { priceLines } from "@/lib/pricing";

const str = (f: FormData, k: string, max = 300) => String(f.get(k) ?? "").trim().slice(0, max);
const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const isStatus = (s: string): s is OrderStatus => (STATUSES as readonly string[]).includes(s);

function addressFrom(f: FormData): Address {
  return {
    name: str(f, "name", 120),
    line1: str(f, "line1", 200),
    line2: str(f, "line2", 200),
    city: str(f, "city", 100),
    province: str(f, "province", 60),
    postalCode: str(f, "postalCode", 20).toUpperCase(),
    country: str(f, "country", 2).toUpperCase() || "CA",
  };
}

// stock and revenue changed: rebuild product pages so stock badges stay honest
function refresh() {
  revalidateStore();
}

export async function changeStatus(_prev: ActionResult | undefined, f: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = Number(f.get("id"));
  const next = str(f, "status");
  if (!isStatus(next)) return { ok: false, message: "Pick a valid status." };
  const changed = setStatus(id, next);
  if (changed) refresh();
  return { ok: true, message: changed ? `Marked ${STATUS_LABEL[next].toLowerCase()}.` : "Status unchanged." };
}

export async function saveTracking(_prev: ActionResult | undefined, f: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = Number(f.get("id"));
  const carrier = str(f, "carrier", 40);
  const tracking = str(f, "tracking", 60).replace(/\s+/g, "");
  if (carrier && !(CARRIERS as readonly string[]).includes(carrier) && carrier !== "Other") {
    return { ok: false, message: "Pick a carrier from the list." };
  }
  const o = getOrder(id);
  if (!o) return { ok: false, message: "Order not found." };
  setTracking(id, carrier, tracking);
  // adding tracking to a paid order ships it
  if (tracking && (o.status === "paid" || o.status === "processing") && f.get("markShipped") === "on") {
    setStatus(id, "shipped");
    refresh();
    return { ok: true, message: "Tracking saved and order marked shipped." };
  }
  return { ok: true, message: tracking ? "Tracking saved." : "Tracking removed." };
}

export async function saveNotes(_prev: ActionResult | undefined, f: FormData): Promise<ActionResult> {
  await requireAdmin();
  setNotes(Number(f.get("id")), str(f, "notes", 4000));
  return { ok: true, message: "Notes saved." };
}

export async function saveCustomer(_prev: ActionResult | undefined, f: FormData): Promise<ActionResult> {
  await requireAdmin();
  const email = str(f, "email", 200).toLowerCase();
  if (!isEmail(email)) return { ok: false, errors: { email: "Enter a valid email." } };
  setCustomer(Number(f.get("id")), { email, name: str(f, "name", 120), phone: str(f, "phone", 40), address: addressFrom(f) });
  return { ok: true, message: "Customer details saved." };
}

export async function refundOrder(_prev: ActionResult | undefined, f: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = Number(f.get("id"));
  const o = getOrder(id);
  if (!o) return { ok: false, message: "Order not found." };
  if (o.status === "refunded") return { ok: false, message: "This order is already refunded." };

  const stripe = stripeClient();
  if (o.stripePaymentIntent && stripe) {
    try {
      const r = await stripe.refunds.create({ payment_intent: o.stripePaymentIntent });
      setStatus(id, "refunded", `Stripe refund ${r.id} (${r.status}).`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Stripe refused the refund.";
      logEvent(id, "refund_failed", `Stripe refund failed: ${msg}`);
      return { ok: false, message: msg };
    }
  } else {
    setStatus(id, "refunded", o.source === "manual" ? "Manual order, no card payment to refund." : "Marked refunded (no Stripe payment found).");
  }
  refresh();
  return { ok: true, message: "Order refunded and stock returned." };
}

export async function removeOrder(f: FormData) {
  await requireAdmin();
  deleteOrder(Number(f.get("id")));
  refresh();
  redirect("/admin/orders");
}

// Manual orders: lines arrive as JSON [{ productId, variantId, qty }]; prices come from the catalog.
export async function createManualOrder(_prev: ActionResult | undefined, f: FormData): Promise<ActionResult> {
  await requireAdmin();
  const errors: Record<string, string> = {};
  const email = str(f, "email", 200).toLowerCase();
  const name = str(f, "name", 120);
  const status = str(f, "status");
  if (!isEmail(email)) errors.email = "Enter a valid email.";
  if (!name) errors.name = "Enter the customer's name.";
  if (!isStatus(status) || status === "refunded") errors.status = "Pick a status.";

  let raw: unknown;
  try {
    raw = JSON.parse(String(f.get("lines") ?? "[]"));
  } catch {
    raw = [];
  }
  const priced = priceLines(raw, { admin: true });
  if (!priced.ok) errors.lines = priced.error === "The cart is empty." ? "Add at least one product." : priced.error;
  if (Object.keys(errors).length || !priced.ok) return { ok: false, errors, message: "Check the highlighted fields." };

  const dollars = (k: string) => {
    const n = Number(str(f, k, 20) || 0);
    return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : 0;
  };
  let discount = dollars("discount");
  const code = str(f, "coupon", 40);
  if (code) {
    const c = checkCoupon(code, priced.subtotalCents, { customerEmail: email });
    if (!c.ok) return { ok: false, errors: { coupon: c.error }, message: c.error };
    discount = c.discountCents;
  }

  const id = createOrder({
    status: status as OrderStatus,
    email,
    name,
    phone: str(f, "phone", 40),
    address: { ...addressFrom(f), name },
    lines: priced.lines,
    discountCents: Math.min(discount, priced.subtotalCents),
    shippingCents: dollars("shipping"),
    taxCents: dollars("tax"),
    couponCode: code ? code.toUpperCase() : null,
    notes: str(f, "notes", 4000),
    source: "manual",
  });
  refresh();
  return { ok: true, id, message: "Order created." };
}
