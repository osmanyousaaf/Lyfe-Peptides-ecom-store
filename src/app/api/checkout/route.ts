import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { checkCoupon } from "@/lib/coupons";
import { currentCustomerId } from "@/lib/customer-session";
import { getAccount } from "@/lib/customers";
import { geoFromHeaders } from "@/lib/geo";
import { stripeClient } from "@/lib/orders";
import { packCart, priceLines } from "@/lib/pricing";
import { getSettings } from "@/lib/settings";

export async function POST(req: Request) {
  const stripe = stripeClient();
  if (!stripe) {
    return NextResponse.json(
      { error: "Checkout isn't switched on yet. Add STRIPE_SECRET_KEY to .env.local to take payments." },
      { status: 500 }
    );
  }

  let body: { lines?: unknown; coupon?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "The order could not be read." }, { status: 400 });
  }

  // Price every line from the catalog; never from the request.
  const priced = priceLines(body.lines);
  if (!priced.ok) return NextResponse.json({ error: priced.error }, { status: 400 });

  // personal codes only work for the signed-in customer they were issued to
  const customerId = await currentCustomerId();
  const account = customerId ? getAccount(customerId) : undefined;
  const code = typeof body.coupon === "string" ? body.coupon.trim().slice(0, 40) : "";
  const coupon = code ? checkCoupon(code, priced.subtotalCents, { customerEmail: account?.email }) : null;
  const geo = geoFromHeaders(req.headers);
  if (coupon && !coupon.ok) return NextResponse.json({ error: coupon.error, couponError: true }, { status: 400 });

  const settings = getSettings();
  const publicBase = process.env.NEXT_PUBLIC_SITE_URL;
  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = priced.lines.map((l) => ({
    quantity: l.qty,
    price_data: {
      currency: "cad",
      unit_amount: l.unitPriceCents,
      product_data: {
        name: l.variantLabel ? `${l.name}, ${l.variantLabel.replace(/ · /g, ", ")}` : l.name,
        ...(publicBase && l.image ? { images: [`${publicBase}${l.image}`] } : {}),
      },
    },
  }));

  // free shipping is judged on the subtotal after the discount
  const afterDiscount = priced.subtotalCents - (coupon?.ok ? coupon.discountCents : 0);
  const free = afterDiscount >= settings.freeShipCents;
  const shipping: Stripe.Checkout.SessionCreateParams.ShippingOption = {
    shipping_rate_data: {
      type: "fixed_amount",
      display_name: free ? "Canada Post, free shipping" : "Canada Post",
      fixed_amount: { amount: free ? 0 : settings.flatShipCents, currency: "cad" },
      delivery_estimate: { minimum: { unit: "business_day", value: 1 }, maximum: { unit: "business_day", value: 5 } },
    },
  };

  const origin = process.env.NEXT_PUBLIC_SITE_URL || req.headers.get("origin") || "http://localhost:3000";

  try {
    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;
    if (coupon?.ok) {
      // a one-off Stripe coupon mirrors the store's code, so Stripe shows and charges the same discount
      const c = coupon.coupon;
      const stripeCoupon = await stripe.coupons.create({
        duration: "once",
        name: c.code,
        max_redemptions: 1,
        ...(c.kind === "percent" ? { percent_off: Math.min(100, c.value) } : { amount_off: c.value, currency: "cad" }),
      });
      discounts = [{ coupon: stripeCoupon.id }];
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      discounts,
      shipping_options: [shipping],
      shipping_address_collection: { allowed_countries: ["CA"] },
      phone_number_collection: { enabled: true },
      ...(account ? { customer_email: account.email } : {}),
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      metadata: {
        source: "lyfepeptidescanada-storefront",
        ...(coupon?.ok ? { coupon: coupon.coupon.code } : {}),
        ...(account ? { customer_id: String(account.id) } : {}),
        ...(geo.country ? { geo_country: geo.country, geo_region: geo.region ?? "", geo_city: (geo.city ?? "").slice(0, 100) } : {}),
        ...packCart(priced.lines),
      },
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Stripe error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
