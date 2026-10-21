import type Stripe from "stripe";
import { recordStripeSession, stripeClient } from "@/lib/orders";

// Stripe calls this when a checkout completes. Point a webhook at /api/stripe/webhook
// (or run `stripe listen --forward-to localhost:3000/api/stripe/webhook`) and set STRIPE_WEBHOOK_SECRET.
export async function POST(req: Request) {
  const stripe = stripeClient();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return Response.json({ error: "Stripe webhooks aren't configured." }, { status: 503 });

  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig ?? "", secret);
  } catch {
    return Response.json({ error: "Bad signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    try {
      await recordStripeSession(event.data.object.id);
    } catch (e) {
      // a 500 makes Stripe retry later
      console.error("Could not record Stripe session", e);
      return Response.json({ error: "Could not record the order" }, { status: 500 });
    }
  }
  return Response.json({ received: true });
}
