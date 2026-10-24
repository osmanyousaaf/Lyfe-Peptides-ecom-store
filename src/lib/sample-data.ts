import { getAllProducts } from "./products";
import { POSTS, postHref } from "./blog";
import type { CartSnapshot, ContactMessage, Order, Subscriber, ViewEvent } from "./analytics-types";
import type { Kind } from "./store";

// Generates ~60 days of clearly-labelled SAMPLE activity (every record has sample: true and
// example.com addresses) so the dashboard can be previewed before real traffic arrives.

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PROVINCES: [string, string, number][] = [
  ["ON", "Toronto", 38], ["BC", "Vancouver", 17], ["AB", "Calgary", 14], ["QC", "Montréal", 12], ["MB", "Winnipeg", 5],
  ["SK", "Saskatoon", 4], ["NS", "Halifax", 4], ["NB", "Moncton", 2], ["NL", "St. John's", 2], ["PE", "Charlottetown", 1], ["YT", "Whitehorse", 1],
];
const SOURCES: [string, number][] = [["", 40], ["google.com", 30], ["instagram.com", 12], ["reddit.com", 8], ["facebook.com", 5], ["bing.com", 3], ["tiktok.com", 2]];
const DEVICES: [ViewEvent["device"], number][] = [["Mobile", 58], ["Desktop", 36], ["Tablet", 6]];
const TOPICS = ["Product question", "Order issue", "Bulk order", "Documentation request", "Shipping & returns", "General inquiry"];
const MESSAGES = [
  "Do you have a COA for the latest GHK-Cu batch?",
  "Can I get pricing for 20 vials of BPC-157?",
  "My tracking hasn't updated in two days.",
  "Is the dual chamber pen available for Tesamorelin?",
  "Do you ship to the Yukon?",
  "Can I change the shipping address on my order?",
];

export function generateSample(): Record<Kind, object[]> {
  const r = rng(20261024);
  // weighted pick: the last element of each tuple is its weight
  const pick = <T extends readonly unknown[]>(items: T[]): T => {
    const w = (x: T) => x[x.length - 1] as number;
    const total = items.reduce((s, x) => s + w(x), 0);
    let n = r() * total;
    for (const x of items) if ((n -= w(x)) <= 0) return x;
    return items[0];
  };
  const products = getAllProducts().filter((p) => p.inStock);
  const pages = ["/", "/", "/shop", "/shop", "/about", "/documentation", "/contact", ...POSTS.map(postHref), ...getAllProducts().map((p) => `/product/${p.slug}`)];

  const events: ViewEvent[] = [];
  const carts: CartSnapshot[] = [];
  const orders: Order[] = [];
  const subscribers: Subscriber[] = [];
  const contact: ContactMessage[] = [];

  const now = Date.now();
  const DAYS = 60;
  let customer = 1000;
  for (let d = DAYS - 1; d >= 0; d--) {
    const dayStart = new Date(now - d * 864e5);
    dayStart.setHours(0, 0, 0, 0);
    const weekday = dayStart.getDay();
    const growth = 0.65 + 0.55 * ((DAYS - d) / DAYS);
    const weekly = weekday === 0 || weekday === 6 ? 0.78 : 1.06;
    const visitors = Math.round(95 * growth * weekly * (0.8 + r() * 0.4));
    const dayLength = d === 0 ? Math.max(1, (now - dayStart.getTime()) / 864e5) : 1;

    for (let v = 0; v < Math.round(visitors * dayLength); v++) {
      const vid = `sample-${d}-${v}-${Math.floor(r() * 1e6)}`;
      const [region, city] = pick(PROVINCES);
      const ref = pick(SOURCES)[0];
      const device = pick(DEVICES)[0];
      let t = dayStart.getTime() + (0.3 + r() * 0.68) * 864e5 * dayLength;
      if (t > now) t = now - r() * 3600e3;
      const geo = { country: "CA", region, city };
      const views = 1 + Math.floor(r() * r() * 6);
      for (let i = 0; i < views; i++) {
        events.push({ t: "view", vid, path: i === 0 ? pages[Math.floor(r() * 4)] : pages[Math.floor(r() * pages.length)], ref: i === 0 ? ref : "", device, at: new Date(t + i * 45e3).toISOString(), sample: true, ...geo });
      }
      if (r() < 0.045) subscribers.push({ email: `subscriber${customer++}@example.com`, source: r() < 0.6 ? "welcome-popup" : "newsletter", at: new Date(t + 60e3).toISOString(), sample: true });

      if (r() < 0.13) {
        const lines = Array.from({ length: 1 + Math.floor(r() * r() * 3) }, () => {
          const p = products[Math.floor(r() * products.length)];
          const unit = p.type === "variable" && p.variants[0] ? p.variants[0].priceCents : p.priceCents;
          return { name: p.name, slug: p.slug, qty: 1 + Math.floor(r() * r() * 3), unitPriceCents: unit };
        });
        const subtotal = lines.reduce((s, l) => s + l.qty * l.unitPriceCents, 0);
        const cartAt = t + views * 45e3;
        carts.push({ vid, lines, subtotalCents: subtotal, at: new Date(Math.min(cartAt, now - 60e3)).toISOString(), sample: true, ...geo });
        if (r() < 0.5) {
          events.push({ t: "checkout", vid, path: "/checkout", ref: "", device, at: new Date(cartAt + 90e3).toISOString(), sample: true, ...geo });
          if (r() < 0.62 && cartAt + 300e3 < now) {
            const promo = r() < 0.28 ? "WELCOME10" : undefined;
            const discount = promo ? Math.round(subtotal * 0.1) : 0;
            const n = customer++;
            orders.push({
              id: `cs_sample_${n}`,
              number: `LY-S${n}`,
              email: `customer${n}@example.com`,
              name: `Sample customer ${n}`,
              totalCents: subtotal - discount,
              subtotalCents: subtotal,
              discountCents: discount,
              currency: "CAD",
              items: lines.map((l) => ({ name: l.name, qty: l.qty, amountCents: l.qty * l.unitPriceCents })),
              province: region,
              city,
              country: "CA",
              promo,
              vid,
              at: new Date(cartAt + 300e3).toISOString(),
              sample: true,
            });
          }
        }
      }
    }
    if (r() < 0.45) {
      const n = customer++;
      contact.push({
        name: `Sample visitor ${n}`,
        email: `visitor${n}@example.com`,
        phone: "",
        topic: TOPICS[Math.floor(r() * TOPICS.length)],
        message: MESSAGES[Math.floor(r() * MESSAGES.length)],
        at: new Date(dayStart.getTime() + r() * 864e5 * dayLength).toISOString(),
        sample: true,
      });
    }
  }
  const byTime = (a: { at: string }, b: { at: string }) => a.at.localeCompare(b.at);
  return {
    events: events.sort(byTime),
    carts: carts.sort(byTime),
    orders: orders.sort(byTime),
    subscribers: subscribers.sort(byTime),
    contact: contact.sort(byTime),
  };
}
