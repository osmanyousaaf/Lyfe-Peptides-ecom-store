import Stripe from "stripe";
import { recordStripeSession } from "@/lib/orders";

// Stripe webhook: records orders even if the customer closes the tab before the success page.
// In the Stripe dashboard, add an endpoint for https://<your-domain>/api/stripe/webhook listening to
// checkout.session.completed, and put its signing secret in STRIPE_WEBHOOK_SECRET.
export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!key || !secret) return new Response("Webhook not configured", { status: 501 });

  const sig = req.headers.get("stripe-signature") ?? "";
  let event: Stripe.Event;
  try {
    event = new Stripe(key).webhooks.constructEvent(await req.text(), sig, secret);
  } catch {
    return new Response("Bad signature", { status: 400 });
  }
  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    await recordStripeSession((event.data.object as Stripe.Checkout.Session).id);
  }
  return new Response(null, { status: 200 });
}
