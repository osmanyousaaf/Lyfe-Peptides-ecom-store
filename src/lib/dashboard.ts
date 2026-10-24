import { getAllProducts } from "./products";
import { readAll, sampleOn } from "./store";
import type { CartSnapshot, ContactMessage, Order, Subscriber, ViewEvent } from "./analytics-types";

// Turns the raw records into everything the admin panel shows, for a date range.

export const PROVINCE_NAMES: Record<string, string> = {
  ON: "Ontario", BC: "British Columbia", AB: "Alberta", QC: "Quebec", MB: "Manitoba", SK: "Saskatchewan",
  NS: "Nova Scotia", NB: "New Brunswick", NL: "Newfoundland and Labrador", PE: "Prince Edward Island",
  YT: "Yukon", NT: "Northwest Territories", NU: "Nunavut",
};
export const provinceName = (code: string) => PROVINCE_NAMES[code] ?? (code === "Unknown" || !code ? "Unknown" : code);

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
export const countryName = (code: string) => {
  if (!code || code === "Unknown") return "Unknown";
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
};

const SOURCE_NAMES: [RegExp, string][] = [
  [/google\./, "Google"], [/bing\./, "Bing"], [/duckduckgo/, "DuckDuckGo"], [/instagram/, "Instagram"], [/facebook|fb\./, "Facebook"],
  [/reddit/, "Reddit"], [/tiktok/, "TikTok"], [/t\.co|twitter|x\.com/, "X"], [/youtube/, "YouTube"],
];
export const sourceName = (ref: string) => (!ref ? "Direct" : SOURCE_NAMES.find(([re]) => re.test(ref))?.[1] ?? ref);

const DAY = 864e5;
const dayKey = (t: number) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const countBy = <T,>(rows: T[], key: (r: T) => string, val: (r: T) => number = () => 1) => {
  const m = new Map<string, number>();
  for (const r of rows) m.set(key(r), (m.get(key(r)) ?? 0) + val(r));
  return [...m.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
};
const pct = (now: number, before: number) => (before === 0 ? (now === 0 ? 0 : null) : (now - before) / before);

export type CartRow = CartSnapshot & { status: "Active" | "Abandoned" | "Purchased"; items: number };

export async function loadAll() {
  const [events, carts, orders, subscribers, contact] = await Promise.all([
    readAll<ViewEvent>("events"),
    readAll<CartSnapshot>("carts"),
    readAll<Order>("orders"),
    readAll<Subscriber>("subscribers"),
    readAll<ContactMessage>("contact"),
  ]);
  return { events, carts, orders, subscribers, contact, sample: await sampleOn() };
}

export async function dashboard(days: number) {
  const all = await loadAll();
  const now = Date.now();
  // whole calendar days, so the KPI totals match the daily charts exactly
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const from = today.getTime() - (days - 1) * DAY;
  const prevFrom = from - days * DAY;
  const t = (r: { at: string }) => Date.parse(r.at);
  const inRange = <T extends { at: string }>(rows: T[], a = from, b = now) => rows.filter((r) => t(r) >= a && t(r) <= b);

  const views = inRange(all.events).filter((e) => e.t === "view");
  const checkouts = inRange(all.events).filter((e) => e.t === "checkout");
  const orders = inRange(all.orders);
  const signups = inRange(all.subscribers);
  const prevViews = inRange(all.events, prevFrom, from).filter((e) => e.t === "view");
  const prevOrders = inRange(all.orders, prevFrom, from);
  const prevSignups = inRange(all.subscribers, prevFrom, from);

  const visitors = new Set(views.map((e) => e.vid));
  const prevVisitors = new Set(prevViews.map((e) => e.vid)).size;
  const revenue = orders.reduce((s, o) => s + o.totalCents, 0);
  const prevRevenue = prevOrders.reduce((s, o) => s + o.totalCents, 0);
  const aov = orders.length ? revenue / orders.length : 0;
  const prevAov = prevOrders.length ? prevRevenue / prevOrders.length : 0;
  const conv = visitors.size ? orders.length / visitors.size : 0;
  const prevConv = prevVisitors ? prevOrders.length / prevVisitors : 0;

  // daily series
  const keys: string[] = [];
  for (let i = days - 1; i >= 0; i--) keys.push(dayKey(now - i * DAY));
  const series = (rows: { at: string }[], val: (r: never) => number = () => 1) => {
    const m = new Map(keys.map((k) => [k, 0]));
    for (const r of rows) {
      const k = dayKey(t(r));
      if (m.has(k)) m.set(k, m.get(k)! + val(r as never));
    }
    return keys.map((k) => ({ x: k, y: m.get(k)! }));
  };
  const visitorSeries = (() => {
    const m = new Map(keys.map((k) => [k, new Set<string>()]));
    for (const e of views) m.get(dayKey(t(e)))?.add(e.vid);
    return keys.map((k) => ({ x: k, y: m.get(k)!.size }));
  })();

  // first touch per visitor in range: source, device, region
  const first = new Map<string, ViewEvent>();
  for (const e of views) if (!first.has(e.vid)) first.set(e.vid, e);
  const firsts = [...first.values()];

  // funnel
  const productViewers = new Set(views.filter((e) => e.path.startsWith("/product/")).map((e) => e.vid));
  const carters = new Set(inRange(all.carts).filter((c) => c.lines.length).map((c) => c.vid));
  const checkoutVids = new Set(checkouts.map((e) => e.vid));
  const funnel = [
    { label: "Visited the store", value: visitors.size },
    { label: "Viewed a product", value: productViewers.size },
    { label: "Added to cart", value: carters.size },
    { label: "Started checkout", value: checkoutVids.size },
    { label: "Purchased", value: orders.length },
  ];

  // products
  const sold = new Map<string, { qty: number; revenue: number }>();
  for (const o of orders) for (const i of o.items) {
    const base = i.name.split(",")[0].trim();
    const cur = sold.get(base) ?? { qty: 0, revenue: 0 };
    sold.set(base, { qty: cur.qty + i.qty, revenue: cur.revenue + i.amountCents });
  }
  const productViews = countBy(views.filter((e) => e.path.startsWith("/product/")), (e) => e.path.slice(9));
  const carts = latestCarts(all.carts, all.orders, now);
  const inCarts = new Map<string, number>();
  for (const c of carts.filter((c) => c.status !== "Purchased")) for (const l of c.lines) inCarts.set(l.slug, (inCarts.get(l.slug) ?? 0) + l.qty);
  const products = getAllProducts().map((p) => {
    const s = sold.get(p.name) ?? { qty: 0, revenue: 0 };
    const v = productViews.find((x) => x.label === p.slug)?.value ?? 0;
    return { slug: p.slug, name: p.name, category: p.category, image: p.image, inStock: p.inStock, priceCents: p.priceMin ?? p.priceCents, views: v, units: s.qty, revenue: s.revenue, inCarts: inCarts.get(p.slug) ?? 0 };
  });

  // activity feed
  const activity = [
    ...all.orders.slice(-15).map((o) => ({ kind: "order" as const, at: o.at, text: `${o.name || o.email || "A customer"} placed ${o.number}`, value: o.totalCents, where: provinceName(o.province) })),
    ...all.subscribers.slice(-10).map((s) => ({ kind: "signup" as const, at: s.at, text: `${s.email} joined the list`, value: 0, where: s.source === "welcome-popup" ? "Welcome pop-up" : "Newsletter" })),
    ...carts.filter((c) => c.status === "Abandoned").slice(0, 8).map((c) => ({ kind: "cart" as const, at: c.at, text: `Cart left with ${c.items} item${c.items === 1 ? "" : "s"}`, value: c.subtotalCents, where: provinceName(c.region) })),
    ...all.contact.slice(-8).map((m) => ({ kind: "message" as const, at: m.at, text: `${m.name}: ${m.topic}`, value: 0, where: m.email })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 14);

  const liveVisitors = new Set(all.events.filter((e) => now - t(e) < 5 * 60e3).map((e) => e.vid)).size;
  const openCarts = carts.filter((c) => c.status !== "Purchased");

  return {
    sample: all.sample,
    days,
    kpis: {
      revenue: { value: revenue, change: pct(revenue, prevRevenue), series: series(orders, (o: Order) => o.totalCents) },
      orders: { value: orders.length, change: pct(orders.length, prevOrders.length), series: series(orders) },
      aov: { value: aov, change: pct(aov, prevAov) },
      visitors: { value: visitors.size, change: pct(visitors.size, prevVisitors), series: visitorSeries },
      conversion: { value: conv, change: pct(conv, prevConv) },
      signups: { value: signups.length, change: pct(signups.length, prevSignups.length), series: series(signups) },
      pageviews: { value: views.length },
      live: liveVisitors,
      abandonedValue: openCarts.filter((c) => c.status === "Abandoned").reduce((s, c) => s + c.subtotalCents, 0),
      abandoned: openCarts.filter((c) => c.status === "Abandoned").length,
      activeCarts: openCarts.filter((c) => c.status === "Active").length,
      discounts: orders.reduce((s, o) => s + o.discountCents, 0),
      promoOrders: orders.filter((o) => o.promo || o.discountCents > 0).length,
    },
    revenueSeries: series(orders, (o: Order) => o.totalCents),
    visitorSeries,
    funnel,
    provinces: countBy(orders, (o) => o.province, (o) => o.totalCents).map((r) => ({ ...r, label: provinceName(r.label), orders: orders.filter((o) => provinceName(o.province) === provinceName(r.label)).length })),
    visitorProvinces: countBy(firsts.filter((e) => e.country === "CA" || e.country === "Unknown"), (e) => provinceName(e.region)),
    countries: countBy(firsts, (e) => countryName(e.country)),
    sources: countBy(firsts, (e) => sourceName(e.ref)),
    devices: countBy(firsts, (e) => e.device),
    pages: countBy(views, (e) => e.path).slice(0, 10),
    topProducts: [...products].sort((a, b) => b.revenue - a.revenue).filter((p) => p.revenue > 0).slice(0, 8),
    products,
    inventory: {
      total: products.length,
      inStock: products.filter((p) => p.inStock).length,
      soldOut: products.filter((p) => !p.inStock).length,
      byCategory: countBy(products, (p) => p.category),
    },
    carts,
    orders: [...orders].reverse(),
    subscribers: [...all.subscribers].reverse(),
    signupSources: countBy(signups, (s) =>
      s.source.endsWith("+google") ? "Google sign-in" : s.source === "welcome-popup" ? "Welcome pop-up" : s.source === "newsletter" ? "Newsletter band" : s.source
    ),
    messages: [...all.contact].reverse(),
    activity,
  };
}

// The latest cart per visitor (last 30 days), with whether it was bought, is still active or was abandoned.
function latestCarts(snaps: CartSnapshot[], orders: Order[], now: number): CartRow[] {
  const latest = new Map<string, CartSnapshot>();
  for (const s of snaps) {
    const cur = latest.get(s.vid);
    if (!cur || s.at > cur.at) latest.set(s.vid, s);
  }
  const ordered = new Map<string, string>();
  for (const o of orders) if (o.vid && (!ordered.get(o.vid) || o.at > ordered.get(o.vid)!)) ordered.set(o.vid, o.at);
  return [...latest.values()]
    .filter((c) => c.lines.length && now - Date.parse(c.at) < 30 * DAY)
    .map((c) => {
      const bought = ordered.get(c.vid);
      const status: CartRow["status"] = bought && bought >= c.at ? "Purchased" : now - Date.parse(c.at) < 30 * 60e3 ? "Active" : "Abandoned";
      return { ...c, status, items: c.lines.reduce((s, l) => s + l.qty, 0) };
    })
    .sort((a, b) => b.at.localeCompare(a.at));
}

export type Dashboard = Awaited<ReturnType<typeof dashboard>>;
