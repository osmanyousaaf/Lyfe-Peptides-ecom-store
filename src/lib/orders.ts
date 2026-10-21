// Orders: creation (Stripe or manual), status changes with stock movement, and the reads behind
// the admin's orders, customers and dashboard pages. Server only.
import Stripe from "stripe";
import { db, json, parse } from "./db";
import { applyOrderStock } from "./inventory";
import { adminGetProduct } from "./products";
import { unpackCart, type PricedLine } from "./pricing";

export const STATUSES = ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"] as const;
export type OrderStatus = (typeof STATUSES)[number];

// orders in these states have taken stock off the shelf
const HOLDS_STOCK: OrderStatus[] = ["paid", "processing", "shipped", "delivered"];
// orders in these states count as revenue
export const REVENUE_STATUSES: OrderStatus[] = ["paid", "processing", "shipped", "delivered"];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending payment",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export type Address = {
  name?: string;
  line1?: string;
  line2?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
};

export type OrderItem = {
  id: number;
  productId: number | null;
  variantId: number | null;
  slug: string;
  name: string;
  variantLabel: string | null;
  image: string;
  unitPriceCents: number;
  qty: number;
};

export type OrderEvent = { id: number; type: string; message: string; createdAt: string };

export type Order = {
  id: number;
  number: string;
  stripeSessionId: string | null;
  stripePaymentIntent: string | null;
  status: OrderStatus;
  email: string;
  name: string;
  phone: string;
  address: Address;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
  couponCode: string | null;
  carrier: string | null;
  trackingNumber: string | null;
  notes: string;
  source: "stripe" | "manual";
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  shippedAt: string | null;
  itemCount: number;
  /** the signed-in account that placed it, if any */
  customerId: number | null;
  /** where the order came from (request location, else the shipping province) */
  country: string | null;
  region: string | null;
  city: string | null;
};

export type OrderDetail = Order & { items: OrderItem[]; events: OrderEvent[] };

type OrderRow = {
  id: number;
  number: string;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  status: string;
  email: string;
  name: string;
  phone: string;
  shipping_address: string;
  subtotal_cents: number;
  discount_cents: number;
  shipping_cents: number;
  tax_cents: number;
  total_cents: number;
  currency: string;
  coupon_code: string | null;
  carrier: string | null;
  tracking_number: string | null;
  notes: string;
  source: string;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  item_count?: number;
  customer_id?: number | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
};

const isStatus = (s: string): s is OrderStatus => (STATUSES as readonly string[]).includes(s);

function toOrder(r: OrderRow): Order {
  return {
    id: r.id,
    number: r.number,
    stripeSessionId: r.stripe_session_id,
    stripePaymentIntent: r.stripe_payment_intent,
    status: isStatus(r.status) ? r.status : "paid",
    email: r.email,
    name: r.name,
    phone: r.phone,
    address: parse<Address>(r.shipping_address, {}),
    subtotalCents: r.subtotal_cents,
    discountCents: r.discount_cents,
    shippingCents: r.shipping_cents,
    taxCents: r.tax_cents,
    totalCents: r.total_cents,
    currency: r.currency,
    couponCode: r.coupon_code,
    carrier: r.carrier,
    trackingNumber: r.tracking_number,
    notes: r.notes,
    source: r.source === "manual" ? "manual" : "stripe",
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    paidAt: r.paid_at,
    shippedAt: r.shipped_at,
    itemCount: r.item_count ?? 0,
    customerId: r.customer_id ?? null,
    country: r.country ?? null,
    region: r.region ?? null,
    city: r.city ?? null,
  };
}

const ITEM_COUNT = "(SELECT COALESCE(SUM(qty), 0) FROM order_items i WHERE i.order_id = o.id) AS item_count";

function nextNumber(): string {
  const r = db().prepare("SELECT MAX(CAST(SUBSTR(number, 4) AS INTEGER)) AS n FROM orders WHERE number LIKE 'LP-%'").get() as {
    n: number | null;
  };
  return `LP-${Math.max(1000, r.n ?? 1000) + 1}`;
}

function addEvent(orderId: number, type: string, message: string) {
  db().prepare("INSERT INTO order_events (order_id, type, message) VALUES (?, ?, ?)").run(orderId, type, message);
}

const stockLines = (orderId: number) =>
  (db().prepare("SELECT product_id, variant_id, qty FROM order_items WHERE order_id = ?").all(orderId) as {
    product_id: number | null;
    variant_id: number | null;
    qty: number;
  }[]).map((r) => ({ productId: r.product_id, variantId: r.variant_id, qty: r.qty }));

// ---- create ----

export type NewOrder = {
  status: OrderStatus;
  email: string;
  name: string;
  phone?: string;
  address: Address;
  lines: PricedLine[];
  discountCents?: number;
  shippingCents?: number;
  taxCents?: number;
  couponCode?: string | null;
  notes?: string;
  source: "stripe" | "manual";
  stripeSessionId?: string | null;
  stripePaymentIntent?: string | null;
  /** override the computed total (Stripe reports the exact amount charged) */
  totalCents?: number;
  /** the signed-in account; when missing, an account with the same email is linked */
  customerId?: number | null;
  /** request location; when missing, the shipping province is used */
  geo?: { country: string | null; region: string | null; city: string | null } | null;
};

export function createOrder(o: NewOrder): number {
  const subtotal = o.lines.reduce((n, l) => n + l.unitPriceCents * l.qty, 0);
  const discount = o.discountCents ?? 0;
  const shipping = o.shippingCents ?? 0;
  const tax = o.taxCents ?? 0;
  const total = o.totalCents ?? Math.max(0, subtotal - discount + shipping + tax);
  const paid = HOLDS_STOCK.includes(o.status);
  const email = o.email.trim().toLowerCase();
  const geo =
    o.geo?.country
      ? o.geo
      : { country: o.address.country || (o.address.province ? "CA" : null), region: o.address.province || null, city: o.address.city || null };

  return db().transaction(() => {
    const number = nextNumber();
    const customerId =
      o.customerId ??
      (email ? ((db().prepare("SELECT id FROM customers WHERE email = ? COLLATE NOCASE").get(email) as { id: number } | undefined)?.id ?? null) : null);
    const res = db()
      .prepare(
        `INSERT INTO orders (number, stripe_session_id, stripe_payment_intent, status, email, name, phone, shipping_address,
          subtotal_cents, discount_cents, shipping_cents, tax_cents, total_cents, coupon_code, notes, source,
          customer_id, country, region, city, paid_at, shipped_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ${paid ? "datetime('now')" : "NULL"}, ${
           o.status === "shipped" || o.status === "delivered" ? "datetime('now')" : "NULL"
         })`
      )
      .run(
        number,
        o.stripeSessionId ?? null,
        o.stripePaymentIntent ?? null,
        o.status,
        email,
        o.name.trim(),
        o.phone?.trim() ?? "",
        json(o.address),
        subtotal,
        discount,
        shipping,
        tax,
        total,
        o.couponCode ?? null,
        o.notes ?? "",
        o.source,
        customerId,
        geo.country,
        geo.region,
        geo.city
      );
    const id = Number(res.lastInsertRowid);
    const ins = db().prepare(
      `INSERT INTO order_items (order_id, product_id, variant_id, slug, name, variant_label, image, unit_price_cents, qty)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const l of o.lines) ins.run(id, l.productId || null, l.variantId, l.slug, l.name, l.variantLabel, l.image, l.unitPriceCents, l.qty);

    addEvent(
      id,
      "created",
      o.source === "stripe" ? "Order placed and paid through Stripe Checkout." : `Manual order created as ${STATUS_LABEL[o.status].toLowerCase()}.`
    );
    if (paid) applyOrderStock(stockLines(id), -1);
    if (o.couponCode) db().prepare("UPDATE coupons SET uses = uses + 1 WHERE code = ? COLLATE NOCASE").run(o.couponCode);
    return id;
  })();
}

// ---- Stripe ----

export function stripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  return key ? new Stripe(key) : null;
}

// Records a completed Checkout Session as an order. Safe to call more than once (webhook + success page).
// Returns the order id, or null when the session isn't paid yet or Stripe isn't configured.
export async function recordStripeSession(sessionId: string): Promise<number | null> {
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return null;
  const existing = db().prepare("SELECT id FROM orders WHERE stripe_session_id = ?").get(sessionId) as { id: number } | undefined;
  if (existing) return existing.id;

  const stripe = stripeClient();
  if (!stripe) return null;
  const s = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["line_items"] });
  if (s.payment_status !== "paid" && s.payment_status !== "no_payment_required") return null;

  // rebuild items from our own metadata; fall back to Stripe's line items for anything we can't match
  const packed = unpackCart(s.metadata);
  // productId 0 marks a line we couldn't match to the catalog; it's stored as NULL
  const lines: PricedLine[] = packed.map((p) => {
    const product = adminGetProduct(p.productId);
    const variant = product?.variants.find((v) => v.id === p.variantId);
    return {
      productId: p.productId,
      variantId: p.variantId,
      slug: product?.slug ?? "",
      name: product?.name ?? "Deleted product",
      variantLabel: variant ? Object.values(variant.attrs).join(" · ") : null,
      image: product?.image ?? "",
      unitPriceCents: p.unitPriceCents,
      qty: p.qty,
    };
  });
  if (!lines.length) {
    for (const li of s.line_items?.data ?? []) {
      lines.push({
        productId: 0,
        variantId: null,
        slug: "",
        name: li.description ?? "Item",
        variantLabel: null,
        image: "",
        unitPriceCents: li.price?.unit_amount ?? Math.round(li.amount_subtotal / Math.max(1, li.quantity ?? 1)),
        qty: li.quantity ?? 1,
      });
    }
  }

  const ship = s.collected_information?.shipping_details;
  const cust = s.customer_details;
  const addr = ship?.address ?? cust?.address;
  const pi = typeof s.payment_intent === "string" ? s.payment_intent : s.payment_intent?.id ?? null;

  try {
    return createOrder({
      status: "paid",
      email: cust?.email ?? "",
      name: ship?.name ?? cust?.name ?? "",
      phone: cust?.phone ?? "",
      address: {
        name: ship?.name ?? cust?.name ?? "",
        line1: addr?.line1 ?? "",
        line2: addr?.line2 ?? "",
        city: addr?.city ?? "",
        province: addr?.state ?? "",
        postalCode: addr?.postal_code ?? "",
        country: addr?.country ?? "CA",
      },
      lines,
      discountCents: s.total_details?.amount_discount ?? 0,
      shippingCents: s.total_details?.amount_shipping ?? 0,
      taxCents: s.total_details?.amount_tax ?? 0,
      totalCents: s.amount_total ?? undefined,
      couponCode: s.metadata?.coupon || null,
      customerId: Number(s.metadata?.customer_id) || null,
      geo: s.metadata?.geo_country
        ? { country: s.metadata.geo_country, region: s.metadata.geo_region || null, city: s.metadata.geo_city || null }
        : null,
      source: "stripe",
      stripeSessionId: s.id,
      stripePaymentIntent: pi,
    });
  } catch (e) {
    // the webhook and the success page can race; the unique session id makes the second one a no-op
    const again = db().prepare("SELECT id FROM orders WHERE stripe_session_id = ?").get(sessionId) as { id: number } | undefined;
    if (again) return again.id;
    throw e;
  }
}

// ---- updates ----

export function setStatus(id: number, next: OrderStatus, note?: string): boolean {
  const o = getOrder(id);
  if (!o || o.status === next) return false;
  db().transaction(() => {
    const was = HOLDS_STOCK.includes(o.status);
    const now = HOLDS_STOCK.includes(next);
    if (was && !now) applyOrderStock(stockLines(id), 1);
    if (!was && now) applyOrderStock(stockLines(id), -1);
    db()
      .prepare(
        `UPDATE orders SET status = ?, updated_at = datetime('now'),
          paid_at = CASE WHEN ? AND paid_at IS NULL THEN datetime('now') ELSE paid_at END,
          shipped_at = CASE WHEN ? AND shipped_at IS NULL THEN datetime('now') ELSE shipped_at END
         WHERE id = ?`
      )
      .run(next, now ? 1 : 0, next === "shipped" || next === "delivered" ? 1 : 0, id);
    const stock = was && !now ? " Stock returned to inventory." : !was && now ? " Stock taken from inventory." : "";
    addEvent(id, "status", `${STATUS_LABEL[o.status]} → ${STATUS_LABEL[next]}.${stock}${note ? ` ${note}` : ""}`);
  })();
  return true;
}

export function setTracking(id: number, carrier: string, tracking: string) {
  db()
    .prepare("UPDATE orders SET carrier = ?, tracking_number = ?, updated_at = datetime('now') WHERE id = ?")
    .run(carrier || null, tracking || null, id);
  addEvent(id, "tracking", tracking ? `Tracking added: ${carrier || "Carrier"} ${tracking}.` : "Tracking removed.");
}

export function setNotes(id: number, notes: string) {
  db().prepare("UPDATE orders SET notes = ?, updated_at = datetime('now') WHERE id = ?").run(notes, id);
}

export function setCustomer(id: number, c: { email: string; name: string; phone: string; address: Address }) {
  db()
    .prepare("UPDATE orders SET email = ?, name = ?, phone = ?, shipping_address = ?, updated_at = datetime('now') WHERE id = ?")
    .run(c.email.trim().toLowerCase(), c.name.trim(), c.phone.trim(), json(c.address), id);
  addEvent(id, "customer", "Customer and shipping details edited.");
}

export function logEvent(id: number, type: string, message: string) {
  addEvent(id, type, message);
}

export function deleteOrder(id: number) {
  const o = getOrder(id);
  if (!o) return;
  db().transaction(() => {
    if (HOLDS_STOCK.includes(o.status)) applyOrderStock(stockLines(id), 1);
    db().prepare("DELETE FROM orders WHERE id = ?").run(id);
  })();
}

// ---- reads ----

export function getOrder(id: number): OrderDetail | undefined {
  const r = db().prepare(`SELECT o.*, ${ITEM_COUNT} FROM orders o WHERE o.id = ?`).get(id) as OrderRow | undefined;
  if (!r) return undefined;
  const items = (db().prepare("SELECT * FROM order_items WHERE order_id = ? ORDER BY id").all(id) as {
    id: number;
    product_id: number | null;
    variant_id: number | null;
    slug: string;
    name: string;
    variant_label: string | null;
    image: string;
    unit_price_cents: number;
    qty: number;
  }[]).map((i) => ({
    id: i.id,
    productId: i.product_id,
    variantId: i.variant_id,
    slug: i.slug,
    name: i.name,
    variantLabel: i.variant_label,
    image: i.image,
    unitPriceCents: i.unit_price_cents,
    qty: i.qty,
  }));
  const events = (db().prepare("SELECT * FROM order_events WHERE order_id = ? ORDER BY created_at DESC, id DESC").all(id) as {
    id: number;
    type: string;
    message: string;
    created_at: string;
  }[]).map((e) => ({ id: e.id, type: e.type, message: e.message, createdAt: e.created_at }));
  return { ...toOrder(r), items, events };
}

export function getOrderBySession(sessionId: string): OrderDetail | undefined {
  const r = db().prepare("SELECT id FROM orders WHERE stripe_session_id = ?").get(sessionId) as { id: number } | undefined;
  return r ? getOrder(r.id) : undefined;
}

export type OrderFilter = { status?: string; q?: string; from?: string; to?: string; email?: string };

function where(f: OrderFilter): { sql: string; args: unknown[] } {
  const parts: string[] = [];
  const args: unknown[] = [];
  if (f.status && isStatus(f.status)) {
    parts.push("o.status = ?");
    args.push(f.status);
  }
  if (f.email) {
    parts.push("o.email = ?");
    args.push(f.email.toLowerCase());
  }
  if (f.q?.trim()) {
    const like = `%${f.q.trim().toLowerCase()}%`;
    parts.push("(LOWER(o.number) LIKE ? OR o.email LIKE ? OR LOWER(o.name) LIKE ?)");
    args.push(like, like, like);
  }
  // dates are YYYY-MM-DD in Toronto time; stored timestamps are UTC
  if (f.from && /^\d{4}-\d{2}-\d{2}$/.test(f.from)) {
    parts.push("datetime(o.created_at, '-5 hours') >= ?");
    args.push(`${f.from} 00:00:00`);
  }
  if (f.to && /^\d{4}-\d{2}-\d{2}$/.test(f.to)) {
    parts.push("datetime(o.created_at, '-5 hours') <= ?");
    args.push(`${f.to} 23:59:59`);
  }
  return { sql: parts.length ? `WHERE ${parts.join(" AND ")}` : "", args };
}

export function listOrders(f: OrderFilter, page = 1, perPage = 25): { orders: Order[]; total: number } {
  const w = where(f);
  const total = (db().prepare(`SELECT COUNT(*) AS n FROM orders o ${w.sql}`).get(...w.args) as { n: number }).n;
  const rows = db()
    .prepare(`SELECT o.*, ${ITEM_COUNT} FROM orders o ${w.sql} ORDER BY o.created_at DESC, o.id DESC LIMIT ? OFFSET ?`)
    .all(...w.args, perPage, (Math.max(1, page) - 1) * perPage) as OrderRow[];
  return { orders: rows.map(toOrder), total };
}

export function allOrdersForExport(f: OrderFilter): OrderDetail[] {
  const w = where(f);
  const ids = db().prepare(`SELECT o.id FROM orders o ${w.sql} ORDER BY o.created_at DESC`).all(...w.args) as { id: number }[];
  return ids.map((r) => getOrder(r.id)!).filter(Boolean);
}

export function statusCounts(f: Omit<OrderFilter, "status"> = {}): Record<OrderStatus | "all", number> {
  const w = where(f);
  const rows = db().prepare(`SELECT o.status, COUNT(*) AS n FROM orders o ${w.sql} GROUP BY o.status`).all(...w.args) as {
    status: string;
    n: number;
  }[];
  const out = Object.fromEntries([...STATUSES.map((s) => [s, 0]), ["all", 0]]) as Record<OrderStatus | "all", number>;
  for (const r of rows) {
    if (isStatus(r.status)) out[r.status] = r.n;
    out.all += r.n;
  }
  return out;
}

// ---- customers (aggregated by email) ----

export type Customer = {
  email: string;
  name: string;
  phone: string;
  orders: number;
  spentCents: number;
  firstOrder: string;
  lastOrder: string;
  subscribed: boolean;
  city: string;
  province: string;
};

const REVENUE_IN = `(${REVENUE_STATUSES.map((s) => `'${s}'`).join(",")})`;

export function listCustomers(q = ""): Customer[] {
  const like = `%${q.trim().toLowerCase()}%`;
  const rows = db()
    .prepare(
      `SELECT o.email,
        (SELECT name FROM orders x WHERE x.email = o.email ORDER BY created_at DESC LIMIT 1) AS name,
        (SELECT phone FROM orders x WHERE x.email = o.email AND phone != '' ORDER BY created_at DESC LIMIT 1) AS phone,
        (SELECT shipping_address FROM orders x WHERE x.email = o.email ORDER BY created_at DESC LIMIT 1) AS addr,
        COUNT(*) AS orders,
        COALESCE(SUM(CASE WHEN o.status IN ${REVENUE_IN} THEN o.total_cents ELSE 0 END), 0) AS spent,
        MIN(o.created_at) AS first_order, MAX(o.created_at) AS last_order,
        EXISTS(SELECT 1 FROM subscribers s WHERE s.email = o.email AND s.unsubscribed_at IS NULL) AS subscribed
       FROM orders o
       WHERE o.email != '' ${q.trim() ? "AND (o.email LIKE ? OR LOWER(o.name) LIKE ?)" : ""}
       GROUP BY o.email
       ORDER BY last_order DESC`
    )
    .all(...(q.trim() ? [like, like] : [])) as {
    email: string;
    name: string | null;
    phone: string | null;
    addr: string | null;
    orders: number;
    spent: number;
    first_order: string;
    last_order: string;
    subscribed: number;
  }[];
  return rows.map((r) => {
    const a = parse<Address>(r.addr, {});
    return {
      email: r.email,
      name: r.name ?? "",
      phone: r.phone ?? "",
      orders: r.orders,
      spentCents: r.spent,
      firstOrder: r.first_order,
      lastOrder: r.last_order,
      subscribed: r.subscribed === 1,
      city: a.city ?? "",
      province: a.province ?? "",
    };
  });
}

export function getCustomer(email: string): Customer | undefined {
  return listCustomers().find((c) => c.email === email.toLowerCase());
}

// ---- dashboard ----

export type DayPoint = { day: string; revenueCents: number; orders: number };

// YYYY-MM-DD in Toronto for a JS date
export const torontoDay = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "America/Toronto" });

export function salesSummary(days: number) {
  const now = new Date();
  const dayList: string[] = [];
  for (let i = days - 1; i >= 0; i--) dayList.push(torontoDay(new Date(now.getTime() - i * 86400_000)));
  const start = dayList[0];
  const prevStart = torontoDay(new Date(now.getTime() - (2 * days - 1) * 86400_000));

  // created_at is UTC; shift to Toronto (EST, close enough for daily buckets) before taking the date
  const localDay = "date(datetime(o.created_at, '-5 hours'))";
  const totals = (from: string, to: string) =>
    db()
      .prepare(
        `SELECT COUNT(*) AS orders, COALESCE(SUM(o.total_cents), 0) AS revenue,
          COALESCE(SUM((SELECT SUM(qty) FROM order_items i WHERE i.order_id = o.id)), 0) AS items
         FROM orders o WHERE o.status IN ${REVENUE_IN} AND ${localDay} >= ? AND ${localDay} < ?`
      )
      .get(from, to) as { orders: number; revenue: number; items: number };

  const cur = totals(start, "9999-12-31");
  const prev = totals(prevStart, start);

  const byDay = new Map(
    (db()
      .prepare(
        `SELECT ${localDay} AS day, COUNT(*) AS orders, SUM(o.total_cents) AS revenue
         FROM orders o WHERE o.status IN ${REVENUE_IN} AND ${localDay} >= ? GROUP BY day`
      )
      .all(start) as { day: string; orders: number; revenue: number }[]).map((r) => [r.day, r])
  );
  const series: DayPoint[] = dayList.map((day) => ({
    day,
    revenueCents: byDay.get(day)?.revenue ?? 0,
    orders: byDay.get(day)?.orders ?? 0,
  }));

  const top = db()
    .prepare(
      `SELECT i.name, i.slug, i.image, SUM(i.qty) AS qty, SUM(i.qty * i.unit_price_cents) AS revenue
       FROM order_items i JOIN orders o ON o.id = i.order_id
       WHERE o.status IN ${REVENUE_IN} AND ${localDay} >= ?
       GROUP BY i.product_id, i.name ORDER BY revenue DESC LIMIT 5`
    )
    .all(start) as { name: string; slug: string; image: string; qty: number; revenue: number }[];

  return {
    current: { revenueCents: cur.revenue, orders: cur.orders, items: cur.items, aovCents: cur.orders ? Math.round(cur.revenue / cur.orders) : 0 },
    previous: { revenueCents: prev.revenue, orders: prev.orders, items: prev.items, aovCents: prev.orders ? Math.round(prev.revenue / prev.orders) : 0 },
    series,
    top,
  };
}

export function recentOrders(n = 6): Order[] {
  return (db().prepare(`SELECT o.*, ${ITEM_COUNT} FROM orders o ORDER BY o.created_at DESC, o.id DESC LIMIT ?`).all(n) as OrderRow[]).map(toOrder);
}

// ---- carriers ----

export const CARRIERS = ["Canada Post", "Purolator", "UPS", "FedEx"] as const;

export function trackingUrl(carrier: string | null, num: string | null): string | null {
  if (!num) return null;
  const n = encodeURIComponent(num);
  switch (carrier) {
    case "Canada Post":
      return `https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=${n}`;
    case "Purolator":
      return `https://www.purolator.com/en/shipping/tracker?pin=${n}`;
    case "UPS":
      return `https://www.ups.com/track?tracknum=${n}`;
    case "FedEx":
      return `https://www.fedex.com/fedextrack/?trknbr=${n}`;
    default:
      return null;
  }
}
