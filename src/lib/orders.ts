import Stripe from "stripe";
import { append, readAll } from "./store";
import type { Order } from "./analytics-types";

// Records a paid Stripe Checkout session as an order, once. Called from the success page
// (via /api/orders/confirm) and from the Stripe webhook; whichever arrives first wins.
export async function recordStripeSession(sessionId: string): Promise<Order | null> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return null;

  const existing = (await readAll<Order>("orders")).find((o) => o.id === sessionId);
  if (existing) return existing;

  const stripe = new Stripe(key);
  const s = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["line_items", "discounts.coupon"] });
  if (s.payment_status !== "paid") return null;

  // re-check after the network round trip, in case the webhook recorded it meanwhile
  if ((await readAll<Order>("orders")).some((o) => o.id === sessionId)) return null;

  const addr = s.collected_information?.shipping_details?.address ?? s.customer_details?.address;
  const order: Order = {
    id: s.id,
    number: "LY-" + s.id.slice(-8).toUpperCase(),
    email: s.customer_details?.email ?? "",
    name: s.customer_details?.name ?? "",
    totalCents: s.amount_total ?? 0,
    subtotalCents: s.amount_subtotal ?? 0,
    discountCents: s.total_details?.amount_discount ?? 0,
    currency: (s.currency ?? "cad").toUpperCase(),
    items: (s.line_items?.data ?? []).map((li) => ({ name: li.description ?? "Item", qty: li.quantity ?? 1, amountCents: li.amount_total })),
    province: addr?.state ?? "Unknown",
    city: addr?.city ?? "",
    country: addr?.country ?? "CA",
    vid: s.client_reference_id ?? undefined,
    at: new Date((s.created ?? Date.now() / 1000) * 1000).toISOString(),
  };
  await append("orders", order);
  return order;
}
