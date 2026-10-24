import { append } from "@/lib/store";
import type { CartSnapshot, Geo, ViewEvent } from "@/lib/analytics-types";

// First-party analytics: page views, checkout starts and cart snapshots, sent by the storefront.
// Location comes from the hosting edge's geo headers (Vercel or Cloudflare); it reads "Unknown"
// on localhost. No cookies, no third parties; the visitor id is a random string kept in the browser.

const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit/i;
const hits = new Map<string, number[]>();

function geo(h: Headers): Geo {
  const dec = (v: string | null) => (v ? decodeURIComponent(v) : "");
  return {
    country: h.get("x-vercel-ip-country") || h.get("cf-ipcountry") || "Unknown",
    region: dec(h.get("x-vercel-ip-country-region")) || h.get("cf-region-code") || "Unknown",
    city: dec(h.get("x-vercel-ip-city")) || h.get("cf-ipcity") || "",
  };
}

function device(ua: string): ViewEvent["device"] {
  if (/ipad|tablet/i.test(ua)) return "Tablet";
  if (/mobi|iphone|android/i.test(ua)) return "Mobile";
  return "Desktop";
}

const str = (v: unknown, max: number) => String(v ?? "").slice(0, max);

export async function POST(req: Request) {
  const ua = req.headers.get("user-agent") ?? "";
  if (BOT.test(ua)) return new Response(null, { status: 204 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  const vid = str(body.vid, 40);
  if (!/^[a-z0-9-]{8,40}$/i.test(vid)) return new Response(null, { status: 400 });

  // at most 120 events a minute per visitor
  const now = Date.now();
  const recent = (hits.get(vid) ?? []).filter((t) => now - t < 60_000);
  if (recent.length >= 120) return new Response(null, { status: 429 });
  hits.set(vid, [...recent, now]);

  const at = new Date().toISOString();
  const g = geo(req.headers);

  if (body.t === "cart" && Array.isArray(body.lines)) {
    const lines = (body.lines as Record<string, unknown>[]).slice(0, 60).map((l) => ({
      name: str(l.name, 120),
      slug: str(l.slug, 120),
      qty: Math.max(0, Math.min(999, Number(l.qty) || 0)),
      unitPriceCents: Math.max(0, Number(l.unitPriceCents) || 0),
      variantLabel: l.variantLabel ? str(l.variantLabel, 80) : undefined,
    }));
    const snap: CartSnapshot = { vid, lines, subtotalCents: lines.reduce((s, l) => s + l.qty * l.unitPriceCents, 0), at, ...g };
    await append("carts", snap);
    return new Response(null, { status: 204 });
  }

  if (body.t === "view" || body.t === "checkout") {
    let ref = "";
    try {
      const r = new URL(str(body.ref, 500));
      if (r.host !== new URL(req.url).host) ref = r.host.replace(/^www\./, "");
    } catch {}
    const ev: ViewEvent = { t: body.t, vid, path: str(body.path, 200) || "/", ref, device: device(ua), at, ...g };
    await append("events", ev);
    return new Response(null, { status: 204 });
  }

  return new Response(null, { status: 400 });
}
