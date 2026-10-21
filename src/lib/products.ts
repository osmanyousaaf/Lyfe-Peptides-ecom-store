// Catalog reads for the storefront and admin. Server only: rows come from the SQLite store.
import { db, parse } from "./db";
import type { Attribute, Product, Variant } from "./types";

export { GOALS } from "./goals";
export type { Goal } from "./goals";

type ProductRow = {
  id: number;
  slug: string;
  name: string;
  category: string;
  categories: string;
  tags: string;
  image: string;
  images: string;
  in_stock: number;
  type: string;
  short_description: string;
  description: string;
  price_cents: number;
  compare_at_cents: number | null;
  attributes: string;
  stock: number | null;
  low_stock_at: number;
  sku: string | null;
  status: string;
  featured: number;
  sort: number;
  needs_review: number;
  created_at: string;
  updated_at: string;
};

type VariantRow = {
  id: number;
  product_id: number;
  price_cents: number;
  attrs: string;
  label: string;
  stock: number | null;
  sku: string | null;
  sort: number;
};

const available = (stock: number | null) => stock === null || stock > 0;

function toProduct(r: ProductRow, vrows: VariantRow[]): Product {
  const variants: Variant[] = vrows.map((v) => ({
    id: v.id,
    priceCents: v.price_cents,
    attrs: parse<Record<string, string>>(v.attrs, {}),
    label: v.label,
    stock: v.stock,
    inStock: available(v.stock),
    sku: v.sku,
  }));
  const type = r.type === "variable" ? "variable" : "simple";
  const prices = variants.map((v) => v.priceCents);
  const inStock =
    r.in_stock === 1 && (type === "variable" ? variants.some((v) => v.inStock) : available(r.stock));
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    category: r.category,
    categories: parse<string[]>(r.categories, []),
    tags: parse<string[]>(r.tags, []),
    image: r.image,
    images: parse<string[]>(r.images, r.image ? [r.image] : []),
    inStock,
    type,
    shortDescription: r.short_description,
    description: r.description,
    needsReview: r.needs_review === 1,
    priceCents: type === "variable" && prices.length ? Math.min(...prices) : r.price_cents,
    priceMin: prices.length ? Math.min(...prices) : undefined,
    priceMax: prices.length ? Math.max(...prices) : undefined,
    variants,
    attributes: parse<Attribute[]>(r.attributes, []),
    stock: r.stock,
    lowStockAt: r.low_stock_at,
    sku: r.sku,
    compareAtCents: r.compare_at_cents,
    status: r.status === "draft" ? "draft" : "published",
    featured: r.featured,
    sort: r.sort,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function load(where: string, ...args: unknown[]): Product[] {
  const rows = db().prepare(`SELECT * FROM products ${where} ORDER BY sort, id`).all(...args) as ProductRow[];
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const vrows = db()
    .prepare(`SELECT * FROM variants WHERE product_id IN (${ids.map(() => "?").join(",")}) ORDER BY sort, id`)
    .all(...ids) as VariantRow[];
  const byProduct = new Map<number, VariantRow[]>();
  for (const v of vrows) byProduct.set(v.product_id, [...(byProduct.get(v.product_id) ?? []), v]);
  return rows.map((r) => toProduct(r, byProduct.get(r.id) ?? []));
}

// ---- storefront: published products only ----

export function getAllProducts(): Product[] {
  return load("WHERE status = 'published'");
}

export function getProduct(slug: string): Product | undefined {
  return load("WHERE status = 'published' AND slug = ?", slug)[0];
}

export function getFeaturedProducts(): Product[] {
  return load("WHERE status = 'published' AND featured > 0").sort((a, b) => (a.featured ?? 0) - (b.featured ?? 0));
}

export function getCategories(): string[] {
  const set = new Set<string>();
  getAllProducts().forEach((p) => p.categories.forEach((c) => set.add(c)));
  return [...set].sort();
}

export function getTags(): string[] {
  const set = new Set<string>();
  getAllProducts().forEach((p) => p.tags.forEach((t) => set.add(t)));
  return [...set];
}

export function productsByTag(tag: string): Product[] {
  return getAllProducts().filter((p) => p.tags.includes(tag));
}

export function productsByCategory(cat: string): Product[] {
  return getAllProducts().filter((p) => p.categories.includes(cat));
}

export function relatedProducts(product: Product, n = 4): Product[] {
  return getAllProducts()
    .filter(
      (p) =>
        p.slug !== product.slug &&
        (p.category === product.category || p.tags.some((t) => product.tags.includes(t)))
    )
    .slice(0, n);
}

// ---- admin: every product, drafts included ----

export function adminListProducts(): Product[] {
  return load("");
}

export function adminGetProduct(id: number): Product | undefined {
  return load("WHERE id = ?", id)[0];
}
