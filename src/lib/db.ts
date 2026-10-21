// The store's database: a single SQLite file under DATA_DIR (default ./data).
// Server only. Opened once per process and migrated + seeded on first use.
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import seedProducts from "@/data/products.json";
import { SEED_POSTS } from "@/data/blog-seed";

export const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  categories TEXT NOT NULL DEFAULT '[]',
  tags TEXT NOT NULL DEFAULT '[]',
  image TEXT NOT NULL DEFAULT '',
  images TEXT NOT NULL DEFAULT '[]',
  in_stock INTEGER NOT NULL DEFAULT 1,
  type TEXT NOT NULL DEFAULT 'simple',
  short_description TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  price_cents INTEGER NOT NULL DEFAULT 0,
  compare_at_cents INTEGER,
  attributes TEXT NOT NULL DEFAULT '[]',
  stock INTEGER,
  low_stock_at INTEGER NOT NULL DEFAULT 5,
  sku TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  featured INTEGER NOT NULL DEFAULT 0,
  sort INTEGER NOT NULL DEFAULT 0,
  needs_review INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS variants (
  id INTEGER PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  price_cents INTEGER NOT NULL,
  attrs TEXT NOT NULL DEFAULT '{}',
  label TEXT NOT NULL DEFAULT '',
  stock INTEGER,
  sku TEXT,
  sort INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS variants_product ON variants(product_id);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent TEXT,
  status TEXT NOT NULL DEFAULT 'paid',
  email TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  shipping_address TEXT NOT NULL DEFAULT '{}',
  subtotal_cents INTEGER NOT NULL DEFAULT 0,
  discount_cents INTEGER NOT NULL DEFAULT 0,
  shipping_cents INTEGER NOT NULL DEFAULT 0,
  tax_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'cad',
  coupon_code TEXT,
  carrier TEXT,
  tracking_number TEXT,
  notes TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'stripe',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  paid_at TEXT,
  shipped_at TEXT
);
CREATE INDEX IF NOT EXISTS orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS orders_created ON orders(created_at);
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER,
  variant_id INTEGER,
  slug TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  variant_label TEXT,
  image TEXT NOT NULL DEFAULT '',
  unit_price_cents INTEGER NOT NULL,
  qty INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS order_items_order ON order_items(order_id);
CREATE TABLE IF NOT EXISTS order_events (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS coupons (
  id INTEGER PRIMARY KEY,
  code TEXT NOT NULL UNIQUE COLLATE NOCASE,
  kind TEXT NOT NULL DEFAULT 'percent',
  value INTEGER NOT NULL,
  min_subtotal_cents INTEGER NOT NULL DEFAULT 0,
  max_uses INTEGER,
  uses INTEGER NOT NULL DEFAULT 0,
  starts_at TEXT,
  expires_at TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS posts (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  excerpt TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL,
  updated TEXT,
  read_minutes INTEGER NOT NULL DEFAULT 5,
  category TEXT NOT NULL DEFAULT '',
  anim TEXT NOT NULL DEFAULT 'vial',
  keywords TEXT NOT NULL DEFAULT '[]',
  products TEXT NOT NULL DEFAULT '[]',
  body TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'published',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY,
  topic TEXT NOT NULL DEFAULT 'other',
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  order_number TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  source TEXT NOT NULL DEFAULT 'newsletter',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  unsubscribed_at TEXT
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name TEXT NOT NULL DEFAULT '',
  picture TEXT NOT NULL DEFAULT '',
  google_sub TEXT UNIQUE,
  provider TEXT NOT NULL DEFAULT 'google',
  signup_coupon_id INTEGER,
  country TEXT,
  region TEXT,
  city TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT
);

-- first-party analytics: no IP addresses are stored, only the looked-up region
CREATE TABLE IF NOT EXISTS page_views (
  id INTEGER PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  path TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  referrer TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT '',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  country TEXT,
  region TEXT,
  city TEXT,
  device TEXT NOT NULL DEFAULT '',
  browser TEXT NOT NULL DEFAULT '',
  os TEXT NOT NULL DEFAULT '',
  duration_ms INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS page_views_created ON page_views(created_at);
CREATE INDEX IF NOT EXISTS page_views_visitor ON page_views(visitor_id);
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  type TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  path TEXT NOT NULL DEFAULT '',
  value_cents INTEGER,
  country TEXT,
  region TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS events_created ON events(created_at);
CREATE INDEX IF NOT EXISTS events_type ON events(type);
CREATE TABLE IF NOT EXISTS presence (
  visitor_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  path TEXT NOT NULL,
  country TEXT,
  region TEXT,
  city TEXT,
  device TEXT NOT NULL DEFAULT '',
  last_seen TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS emails (
  id INTEGER PRIMARY KEY,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL,
  error TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

// columns added after launch; each runs once on databases created before it existed
const COLUMNS: [table: string, column: string, type: string][] = [
  ["coupons", "customer_email", "TEXT"],
  ["coupons", "kind_source", "TEXT NOT NULL DEFAULT 'manual'"],
  ["orders", "customer_id", "INTEGER"],
  ["orders", "country", "TEXT"],
  ["orders", "region", "TEXT"],
  ["orders", "city", "TEXT"],
  ["messages", "country", "TEXT"],
  ["messages", "region", "TEXT"],
  ["messages", "city", "TEXT"],
  ["subscribers", "country", "TEXT"],
  ["subscribers", "region", "TEXT"],
  ["subscribers", "city", "TEXT"],
];

function migrate(db: Database.Database) {
  for (const [table, column, type] of COLUMNS) {
    const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
    if (!cols.some((c) => c.name === column)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
  }
}

type SeedVariant = { id: number; priceCents: number; attrs: Record<string, string>; label: string };
type SeedProduct = {
  id: number;
  name: string;
  slug: string;
  category: string;
  categories: string[];
  tags: string[];
  image: string;
  images: string[];
  inStock: boolean;
  type: string;
  shortDescription: string;
  description: string;
  needsReview?: boolean;
  priceCents: number;
  variants: SeedVariant[];
  attributes: { name: string; options: string[] }[];
};

function seed(db: Database.Database) {
  const hasProducts = db.prepare("SELECT COUNT(*) AS n FROM products").get() as { n: number };
  if (hasProducts.n === 0) {
    const insP = db.prepare(`INSERT INTO products
      (id, slug, name, category, categories, tags, image, images, in_stock, type, short_description, description,
       price_cents, attributes, needs_review, sort, featured)
      VALUES (@id, @slug, @name, @category, @categories, @tags, @image, @images, @in_stock, @type, @short_description,
       @description, @price_cents, @attributes, @needs_review, @sort, @featured)`);
    const insV = db.prepare(
      "INSERT INTO variants (id, product_id, price_cents, attrs, label, sort) VALUES (?, ?, ?, ?, ?, ?)"
    );
    // the landing page's featured order
    const featured = [
      "5amino1mq-5-mg",
      "aod-9604-10-mg",
      "cjc-1295-ipamorelin-10-mg",
      "ghk-cu-100-mg",
      "hgh-10-iu",
      "nad-500-mg",
      "slupp-332-5-mg",
      "tb-500-bpc-157-10-mg-2",
    ];
    (seedProducts as unknown as SeedProduct[]).forEach((p, i) => {
      insP.run({
        id: p.id,
        slug: p.slug,
        name: p.name,
        category: p.category,
        categories: JSON.stringify(p.categories),
        tags: JSON.stringify(p.tags),
        image: p.image,
        images: JSON.stringify(p.images),
        in_stock: p.inStock ? 1 : 0,
        type: p.type,
        short_description: p.shortDescription,
        description: p.description,
        price_cents: p.priceCents,
        attributes: JSON.stringify(p.attributes),
        needs_review: p.needsReview ? 1 : 0,
        sort: i,
        featured: featured.includes(p.slug) ? featured.indexOf(p.slug) + 1 : 0,
      });
      p.variants.forEach((v, j) => insV.run(v.id, p.id, v.priceCents, JSON.stringify(v.attrs), v.label, j));
    });
  }

  const hasPosts = db.prepare("SELECT COUNT(*) AS n FROM posts").get() as { n: number };
  if (hasPosts.n === 0) {
    const insPost = db.prepare(`INSERT INTO posts
      (slug, title, description, excerpt, date, updated, read_minutes, category, anim, keywords, products, body)
      VALUES (@slug, @title, @description, @excerpt, @date, @updated, @read_minutes, @category, @anim, @keywords, @products, @body)`);
    for (const p of SEED_POSTS) {
      insPost.run({
        slug: p.slug,
        title: p.title,
        description: p.description,
        excerpt: p.excerpt,
        date: p.date,
        updated: p.updated ?? null,
        read_minutes: p.readMinutes,
        category: p.category,
        anim: p.anim,
        keywords: JSON.stringify(p.keywords),
        products: JSON.stringify(p.products),
        body: JSON.stringify(p.body),
      });
    }
  }
}

function open(): Database.Database {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const db = new Database(path.join(DATA_DIR, "lyfe.db"));
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");
  db.exec(SCHEMA);
  migrate(db);
  db.transaction(() => seed(db))();
  return db;
}

// survive dev hot reloads without opening a new handle each time
const g = globalThis as unknown as { __lyfeDb?: Database.Database };

export function db(): Database.Database {
  if (!g.__lyfeDb) g.__lyfeDb = open();
  return g.__lyfeDb;
}

// JSON column helpers
export const parse = <T>(s: string | null | undefined, fallback: T): T => {
  if (!s) return fallback;
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
};
export const json = (v: unknown) => JSON.stringify(v ?? null);
