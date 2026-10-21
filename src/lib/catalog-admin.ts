// Catalog writes for the admin: products, variants and stock. Server only.
import { db, json } from "./db";
import type { Attribute } from "./types";

export type VariantInput = {
  id?: number | null;
  attrs: Record<string, string>;
  priceCents: number;
  sku?: string | null;
  stock?: number | null;
};

export type ProductInput = {
  name: string;
  slug: string;
  status: "published" | "draft";
  categories: string[];
  tags: string[];
  shortDescription: string;
  description: string;
  images: string[];
  type: "simple" | "variable";
  priceCents: number;
  compareAtCents: number | null;
  sku: string | null;
  stock: number | null;
  lowStockAt: number;
  inStock: boolean;
  featured: number;
  attributes: Attribute[];
  variants: VariantInput[];
};

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\+/g, " plus ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const isInt = (n: unknown, min = 0) => typeof n === "number" && Number.isInteger(n) && n >= min;
const IMG = /^\/(products|uploads)\/[A-Za-z0-9._-]+$/;

// Trims and checks a raw editor payload. Returns the cleaned input or field errors.
export function validateProduct(
  raw: unknown,
  id?: number
): { ok: true; input: ProductInput } | { ok: false; errors: Record<string, string> } {
  const r = (raw ?? {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};
  const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const list = (v: unknown, max = 30) =>
    Array.isArray(v) ? [...new Set(v.map((x) => str(x, 60)).filter(Boolean))].slice(0, max) : [];
  const cents = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? Math.round(v) : NaN);
  const optInt = (v: unknown) => (v === null || v === undefined || v === "" ? null : Number(v));

  const name = str(r.name, 120);
  if (!name) errors.name = "Give the product a name.";
  const slug = slugify(str(r.slug, 100) || name);
  if (!slug) errors.slug = "Add a URL slug.";
  else {
    const clash = db().prepare("SELECT id FROM products WHERE slug = ?").get(slug) as { id: number } | undefined;
    if (clash && clash.id !== id) errors.slug = "Another product already uses this slug.";
  }

  const type = r.type === "variable" ? "variable" : "simple";
  const images = (Array.isArray(r.images) ? r.images : []).map((x) => str(x, 200)).filter((x) => IMG.test(x));
  if (!images.length) errors.images = "Add at least one image.";

  const priceCents = cents(r.priceCents);
  const compare = r.compareAtCents == null || r.compareAtCents === "" ? null : cents(r.compareAtCents);
  const stock = optInt(r.stock);
  const lowStockAt = Number(r.lowStockAt ?? 5);
  if (type === "simple") {
    if (!isInt(priceCents, 1)) errors.priceCents = "Enter a price above $0.";
    if (compare !== null && (!isInt(compare, 1) || compare <= priceCents)) errors.compareAtCents = "Compare-at must be higher than the price.";
    if (stock !== null && !isInt(stock)) errors.stock = "Stock must be a whole number, 0 or more.";
  }
  if (!isInt(lowStockAt)) errors.lowStockAt = "Use a whole number.";

  // attributes and variants
  const attributes: Attribute[] = [];
  const variants: VariantInput[] = [];
  if (type === "variable") {
    for (const a of Array.isArray(r.attributes) ? r.attributes : []) {
      const aa = a as Record<string, unknown>;
      const aname = str(aa.name, 40);
      const options = list(aa.options, 20);
      if (aname && options.length) attributes.push({ name: aname, options });
    }
    if (!attributes.length) errors.attributes = "Add at least one option, like Package or Strength.";
    const seen = new Set<string>();
    for (const v of Array.isArray(r.variants) ? r.variants : []) {
      const vv = v as Record<string, unknown>;
      const attrs: Record<string, string> = {};
      for (const a of attributes) {
        const val = str((vv.attrs as Record<string, unknown> | undefined)?.[a.name], 60);
        if (a.options.includes(val)) attrs[a.name] = val;
      }
      if (Object.keys(attrs).length !== attributes.length) continue; // stale combination from removed options
      const key = JSON.stringify(attrs);
      if (seen.has(key)) continue;
      seen.add(key);
      const p = cents(vv.priceCents);
      const s = optInt(vv.stock);
      if (!isInt(p, 1)) errors.variants = "Every variant needs a price above $0.";
      if (s !== null && !isInt(s)) errors.variants = "Variant stock must be a whole number, 0 or more.";
      variants.push({
        id: isInt(vv.id, 1) ? (vv.id as number) : null,
        attrs,
        priceCents: p,
        sku: str(vv.sku, 60) || null,
        stock: s,
      });
    }
    if (!variants.length && !errors.attributes) errors.variants = "Generate at least one variant.";
  }

  const featured = Number(r.featured ?? 0);
  if (!isInt(featured)) errors.featured = "Use a whole number.";

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    input: {
      name,
      slug,
      status: r.status === "draft" ? "draft" : "published",
      categories: list(r.categories, 10),
      tags: list(r.tags, 12),
      shortDescription: typeof r.shortDescription === "string" ? r.shortDescription.slice(0, 4000) : "",
      description: typeof r.description === "string" ? r.description.slice(0, 40000) : "",
      images,
      type,
      priceCents: type === "variable" ? Math.min(...variants.map((v) => v.priceCents)) : priceCents,
      compareAtCents: type === "simple" ? compare : null,
      sku: str(r.sku, 60) || null,
      stock: type === "simple" ? stock : null,
      lowStockAt,
      inStock: r.inStock !== false,
      featured,
      attributes,
      variants,
    },
  };
}

const variantLabel = (attrs: Record<string, string>) =>
  Object.entries(attrs)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");

// Creates (no id) or updates a product. Existing variant ids are kept so carts stay valid.
export function saveProduct(input: ProductInput, id?: number): number {
  const d = db();
  return d.transaction(() => {
    const row = {
      slug: input.slug,
      name: input.name,
      category: input.categories[0] ?? "",
      categories: json(input.categories),
      tags: json(input.tags),
      image: input.images[0],
      images: json(input.images),
      in_stock: input.inStock ? 1 : 0,
      type: input.type,
      short_description: input.shortDescription,
      description: input.description,
      price_cents: input.priceCents,
      compare_at_cents: input.compareAtCents,
      attributes: json(input.type === "variable" ? input.attributes : []),
      stock: input.stock,
      low_stock_at: input.lowStockAt,
      sku: input.sku,
      status: input.status,
      featured: input.featured,
    };
    let pid = id;
    if (pid) {
      d.prepare(
        `UPDATE products SET slug=@slug, name=@name, category=@category, categories=@categories, tags=@tags, image=@image,
         images=@images, in_stock=@in_stock, type=@type, short_description=@short_description, description=@description,
         price_cents=@price_cents, compare_at_cents=@compare_at_cents, attributes=@attributes, stock=@stock,
         low_stock_at=@low_stock_at, sku=@sku, status=@status, featured=@featured, updated_at=datetime('now') WHERE id=@id`
      ).run({ ...row, id: pid });
    } else {
      const sort = (d.prepare("SELECT COALESCE(MAX(sort), 0) + 1 AS n FROM products").get() as { n: number }).n;
      pid = Number(
        d.prepare(
          `INSERT INTO products (slug, name, category, categories, tags, image, images, in_stock, type, short_description,
           description, price_cents, compare_at_cents, attributes, stock, low_stock_at, sku, status, featured, sort)
           VALUES (@slug, @name, @category, @categories, @tags, @image, @images, @in_stock, @type, @short_description,
           @description, @price_cents, @compare_at_cents, @attributes, @stock, @low_stock_at, @sku, @status, @featured, @sort)`
        ).run({ ...row, sort }).lastInsertRowid
      );
    }

    // variants: update kept ids, insert new ones, drop the rest
    const existing = new Set(
      (d.prepare("SELECT id FROM variants WHERE product_id = ?").all(pid) as { id: number }[]).map((v) => v.id)
    );
    const keep = new Set<number>();
    const upd = d.prepare("UPDATE variants SET price_cents=?, attrs=?, label=?, stock=?, sku=?, sort=? WHERE id=? AND product_id=?");
    const ins = d.prepare("INSERT INTO variants (product_id, price_cents, attrs, label, stock, sku, sort) VALUES (?, ?, ?, ?, ?, ?, ?)");
    if (input.type === "variable") {
      input.variants.forEach((v, i) => {
        const args = [v.priceCents, json(v.attrs), variantLabel(v.attrs), v.stock ?? null, v.sku ?? null, i] as const;
        if (v.id && existing.has(v.id)) {
          upd.run(...args, v.id, pid);
          keep.add(v.id);
        } else ins.run(pid, ...args);
      });
    }
    const del = d.prepare("DELETE FROM variants WHERE id = ?");
    for (const vid of existing) if (!keep.has(vid)) del.run(vid);
    return pid!;
  })();
}

export function setProductStatus(id: number, status: "published" | "draft") {
  db().prepare("UPDATE products SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, id);
}

export function deleteProduct(id: number) {
  db().prepare("DELETE FROM products WHERE id = ?").run(id);
}

// copies a product as a draft with a fresh slug and new variant ids
export function duplicateProduct(id: number): number | null {
  const d = db();
  const p = d.prepare("SELECT * FROM products WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!p) return null;
  return d.transaction(() => {
    let slug = `${p.slug}-copy`;
    for (let n = 2; d.prepare("SELECT 1 FROM products WHERE slug = ?").get(slug); n++) slug = `${p.slug}-copy-${n}`;
    const sort = (d.prepare("SELECT COALESCE(MAX(sort), 0) + 1 AS n FROM products").get() as { n: number }).n;
    const cols = Object.keys(p).filter((k) => !["id", "slug", "name", "status", "featured", "sort", "created_at", "updated_at"].includes(k));
    const newId = Number(
      d.prepare(
        `INSERT INTO products (${cols.join(", ")}, slug, name, status, featured, sort)
         VALUES (${cols.map((c) => `@${c}`).join(", ")}, @slug, @name, 'draft', 0, @sort)`
      ).run({ ...p, slug, name: `${p.name} (copy)`, sort }).lastInsertRowid
    );
    d.prepare(
      `INSERT INTO variants (product_id, price_cents, attrs, label, stock, sku, sort)
       SELECT ?, price_cents, attrs, label, stock, sku, sort FROM variants WHERE product_id = ? ORDER BY sort, id`
    ).run(newId, id);
    return newId;
  })();
}

// ---- stock ----

export type StockTarget = { kind: "product" | "variant"; id: number };

const table = (t: StockTarget) => (t.kind === "variant" ? "variants" : "products");

// null stops tracking; a number sets units on hand
export function setStock(t: StockTarget, stock: number | null) {
  db().prepare(`UPDATE ${table(t)} SET stock = ? WHERE id = ?`).run(stock === null ? null : Math.max(0, Math.floor(stock)), t.id);
}

export function adjustStock(t: StockTarget, delta: number) {
  db().prepare(`UPDATE ${table(t)} SET stock = MAX(0, COALESCE(stock, 0) + ?) WHERE id = ?`).run(Math.trunc(delta), t.id);
}

export function setLowStockAt(productId: number, n: number) {
  db().prepare("UPDATE products SET low_stock_at = ? WHERE id = ?").run(Math.max(0, Math.floor(n)), productId);
}

export function restock(targets: StockTarget[], qty: number) {
  db().transaction(() => targets.forEach((t) => adjustStock(t, qty)))();
}
