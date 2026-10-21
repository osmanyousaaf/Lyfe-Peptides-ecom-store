import { checkCoupon } from "@/lib/coupons";
import { currentCustomerId } from "@/lib/customer-session";
import { getAccount } from "@/lib/customers";
import { priceLines } from "@/lib/pricing";

// at most 20 checks a minute per address, so codes can't be guessed by brute force
const hits = new Map<string, { n: number; reset: number }>();

// POST { code, lines } → { ok, code, label, discountCents, subtotalCents } or { ok: false, error }
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const h = hits.get(ip);
  if (h && h.reset > now && h.n >= 20) return Response.json({ ok: false, error: "Too many tries. Wait a minute." }, { status: 429 });
  hits.set(ip, h && h.reset > now ? { n: h.n + 1, reset: h.reset } : { n: 1, reset: now + 60_000 });

  const body = (await req.json().catch(() => null)) as { code?: unknown; lines?: unknown } | null;
  const code = typeof body?.code === "string" ? body.code.trim().slice(0, 40) : "";
  if (!code) return Response.json({ ok: false, error: "Enter a code." }, { status: 400 });

  const priced = priceLines(body?.lines);
  if (!priced.ok) return Response.json({ ok: false, error: priced.error }, { status: 400 });

  const customerId = await currentCustomerId();
  const c = checkCoupon(code, priced.subtotalCents, { customerEmail: customerId ? getAccount(customerId)?.email : null });
  if (!c.ok) return Response.json({ ok: false, error: c.error });
  return Response.json({ ok: true, code: c.coupon.code, label: c.label, discountCents: c.discountCents, subtotalCents: priced.subtotalCents });
}
