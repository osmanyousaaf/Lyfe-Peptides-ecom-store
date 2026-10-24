import { recordStripeSession } from "@/lib/orders";

// Called by the checkout success page. The server looks the session up on Stripe itself and only
// records it if Stripe says it's paid, so this can't be used to create fake orders.
export async function POST(req: Request) {
  let id = "";
  try {
    id = String((await req.json()).sessionId ?? "");
  } catch {}
  try {
    const order = await recordStripeSession(id);
    return Response.json({ ok: Boolean(order) });
  } catch {
    return Response.json({ ok: false }, { status: 502 });
  }
}
