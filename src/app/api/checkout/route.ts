import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getProduct } from "@/lib/products";
import { findDiscount, type Discount } from "@/lib/discounts";

type IncomingLine = { slug?: unknown; variantId?: unknown; qty?: unknown };

const MAX_QTY = 50;

export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "Checkout isn't switched on yet. Add STRIPE_SECRET_KEY to .env.local to take payments." },
      { status: 500 }
    );
  }

  let incoming: IncomingLine[];
  let discount: Discount | null = null;
  let vid: string | undefined;
  try {
    const body = await req.json();
    incoming = body.lines;
    discount = findDiscount(body.code);
    if (typeof body.vid === "string" && /^[a-z0-9-]{8,40}$/i.test(body.vid)) vid = body.vid;
  } catch {
    return NextResponse.json({ error: "The order could not be read." }, { status: 400 });
  }
  if (!Array.isArray(incoming) || incoming.length === 0 || incoming.length > 60) {
    return NextResponse.json({ error: "The cart is empty." }, { status: 400 });
  }

  // Price every line from the catalog; never from the request.
  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  for (const l of incoming) {
    const product = typeof l.slug === "string" ? getProduct(l.slug) : undefined;
    const qty = Number(l.qty);
    if (!product || !product.inStock || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
      return NextResponse.json(
        { error: "An item in the cart is no longer available. Remove it and try again." },
        { status: 400 }
      );
    }
    let unit = product.priceCents;
    let name = product.name;
    if (product.type === "variable") {
      const v = product.variants.find((x) => x.id === Number(l.variantId));
      if (!v) {
        return NextResponse.json(
          { error: `Choose an option for ${product.name} before checking out.` },
          { status: 400 }
        );
      }
      unit = v.priceCents;
      name = `${product.name}, ${Object.values(v.attrs).join(", ")}`;
    }
    const publicBase = process.env.NEXT_PUBLIC_SITE_URL;
    line_items.push({
      quantity: qty,
      price_data: {
        currency: "cad",
        unit_amount: unit,
        product_data: {
          name,
          ...(publicBase ? { images: [`${publicBase}${product.image}`] } : {}),
        },
      },
    });
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || req.headers.get("origin") || "http://localhost:3000";

  try {
    const stripe = new Stripe(key);
    // the coupon is created once on Stripe, with the code as its id, then reused
    let coupon: string | undefined;
    if (discount) {
      try {
        coupon = (await stripe.coupons.retrieve(discount.code)).id;
      } catch {
        coupon = (await stripe.coupons.create({ id: discount.code, percent_off: discount.percent, duration: "once", name: discount.label })).id;
      }
    }
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      ...(coupon ? { discounts: [{ coupon }] } : {}),
      ...(vid ? { client_reference_id: vid } : {}),
      shipping_address_collection: { allowed_countries: ["CA"] },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      metadata: { source: "lyfepeptidescanada-storefront" },
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Stripe error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
