// Prices a cart from the catalog. Shoppers send only what they picked; prices never come from the client.
// Server only.
import { adminGetProduct, getProduct } from "./products";

export type IncomingLine = { slug?: unknown; productId?: unknown; variantId?: unknown; qty?: unknown };

export type PricedLine = {
  productId: number;
  variantId: number | null;
  slug: string;
  name: string;
  variantLabel: string | null;
  image: string;
  unitPriceCents: number;
  qty: number;
};

export const MAX_QTY = 50;
export const MAX_LINES = 60;

export type Priced = { ok: true; lines: PricedLine[]; subtotalCents: number } | { ok: false; error: string };

// `admin` prices drafts too (manual orders) and skips the stock check so staff can back-order.
export function priceLines(incoming: unknown, { admin = false } = {}): Priced {
  if (!Array.isArray(incoming) || incoming.length === 0) return { ok: false, error: "The cart is empty." };
  if (incoming.length > MAX_LINES) return { ok: false, error: "That's too many lines for one order." };

  const lines: PricedLine[] = [];
  for (const raw of incoming as IncomingLine[]) {
    const product =
      admin && raw.productId != null
        ? adminGetProduct(Number(raw.productId))
        : typeof raw.slug === "string"
          ? getProduct(raw.slug)
          : undefined;
    const qty = Number(raw.qty);
    if (!product || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
      return { ok: false, error: "An item in the cart is no longer available. Remove it and try again." };
    }
    if (!admin && !product.inStock) return { ok: false, error: `${product.name} is sold out. Remove it and try again.` };

    let unit = product.priceCents;
    let variantId: number | null = null;
    let variantLabel: string | null = null;
    if (product.type === "variable") {
      const v = product.variants.find((x) => x.id === Number(raw.variantId));
      if (!v) return { ok: false, error: `Choose an option for ${product.name} before checking out.` };
      if (!admin && v.stock != null && v.stock < qty) {
        return { ok: false, error: `Only ${v.stock} left of ${product.name} (${Object.values(v.attrs).join(", ")}).` };
      }
      unit = v.priceCents;
      variantId = v.id;
      variantLabel = Object.values(v.attrs).join(" · ");
    } else if (!admin && product.stock != null && product.stock < qty) {
      return { ok: false, error: `Only ${product.stock} left of ${product.name}.` };
    }

    const existing = lines.find((l) => l.productId === product.id && l.variantId === variantId);
    if (existing) existing.qty += qty;
    else
      lines.push({
        productId: product.id,
        variantId,
        slug: product.slug,
        name: product.name,
        variantLabel,
        image: product.image,
        unitPriceCents: unit,
        qty,
      });
  }
  return { ok: true, lines, subtotalCents: lines.reduce((n, l) => n + l.unitPriceCents * l.qty, 0) };
}

// ---- carrying the cart through Stripe metadata (50 keys × 500 chars) ----

// each line as "productId:variantId:qty:unitCents", packed into as few 500-char keys as needed
export function packCart(lines: PricedLine[]): Record<string, string> {
  const out: Record<string, string> = {};
  let key = 0;
  let cur = "";
  for (const l of lines) {
    const part = `${l.productId}:${l.variantId ?? 0}:${l.qty}:${l.unitPriceCents}`;
    if (cur && cur.length + 1 + part.length > 500) {
      out[`cart_${key++}`] = cur;
      cur = "";
    }
    cur = cur ? `${cur},${part}` : part;
  }
  if (cur) out[`cart_${key}`] = cur;
  return out;
}

export type PackedLine = { productId: number; variantId: number | null; qty: number; unitPriceCents: number };

export function unpackCart(meta: Record<string, string> | null | undefined): PackedLine[] {
  if (!meta) return [];
  return Object.keys(meta)
    .filter((k) => /^cart_\d+$/.test(k))
    .sort((a, b) => Number(a.slice(5)) - Number(b.slice(5)))
    .flatMap((k) => meta[k].split(","))
    .map((part) => part.split(":").map(Number))
    .filter((n) => n.length === 4 && n.every(Number.isFinite))
    .map(([productId, variantId, qty, unitPriceCents]) => ({ productId, variantId: variantId || null, qty, unitPriceCents }));
}
