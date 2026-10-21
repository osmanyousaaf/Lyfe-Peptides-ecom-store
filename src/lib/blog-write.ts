// Saving and deleting blog posts from the admin, with server-side cleaning of every field and block. Server only.
import { db, json } from "./db";
import type { AnimKey, Block, Post } from "./blog";
import { MINI_KEYS, type MiniAnim } from "./blog-mini";

export const ANIM_KEYS: AnimKey[] = ["vial", "pen", "hplc", "coa", "storage"];
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const strs = (v: unknown, maxItems: number, maxLen: number) =>
  (Array.isArray(v) ? v : []).map((x) => str(x, maxLen)).filter(Boolean).slice(0, maxItems);

// keep only well-formed blocks; give headings unique anchor ids
export function cleanBlocks(input: unknown): Block[] {
  const out: Block[] = [];
  const ids = new Set<string>();
  for (const raw of Array.isArray(input) ? input.slice(0, 300) : []) {
    const b = (raw ?? {}) as Record<string, unknown>;
    switch (b.type) {
      case "summary": {
        const text = str(b.text, 600);
        if (text) out.push({ type: "summary", text });
        break;
      }
      case "point": {
        const title = str(b.title, 140);
        const text = str(b.text, 900);
        const anim = MINI_KEYS.includes(b.anim as MiniAnim) ? (b.anim as MiniAnim) : "purity-peak";
        if (title || text) out.push({ type: "point", title, text, anim });
        break;
      }
      case "h2": {
        const text = str(b.text, 200);
        if (!text) break;
        let id = slugify(text) || "section";
        for (let n = 2; ids.has(id); n++) id = `${slugify(text) || "section"}-${n}`;
        ids.add(id);
        out.push({ type: "h2", id, text });
        break;
      }
      case "p": {
        const text = str(b.text, 6000);
        if (text) out.push({ type: "p", text });
        break;
      }
      case "ul":
      case "ol": {
        const items = strs(b.items, 60, 1200);
        if (items.length) out.push({ type: b.type, items });
        break;
      }
      case "callout": {
        const tone = b.tone === "tip" || b.tone === "warn" ? b.tone : "note";
        const title = str(b.title, 140);
        const text = str(b.text, 2500);
        if (title || text) out.push({ type: "callout", tone, title, text });
        break;
      }
      case "figure": {
        const anim = ANIM_KEYS.includes(b.anim as AnimKey) ? (b.anim as AnimKey) : "vial";
        out.push({ type: "figure", anim, caption: str(b.caption, 300) });
        break;
      }
      case "table": {
        const head = (Array.isArray(b.head) ? b.head : []).slice(0, 8).map((h) => str(h, 120));
        if (!head.length) break;
        const rows = (Array.isArray(b.rows) ? b.rows : [])
          .slice(0, 80)
          .map((r) => head.map((_, i) => str(Array.isArray(r) ? r[i] : "", 400)))
          .filter((r) => r.some(Boolean));
        out.push({ type: "table", head, rows });
        break;
      }
    }
  }
  return out;
}

export function wordCount(blocks: Block[]): number {
  const text = blocks
    .map((b) =>
      b.type === "ul" || b.type === "ol"
        ? b.items.join(" ")
        : b.type === "table"
          ? [...b.head, ...b.rows.flat()].join(" ")
          : b.type === "callout" || b.type === "point"
            ? `${b.title} ${b.text}`
            : b.type === "figure"
              ? b.caption
              : b.text
    )
    .join(" ");
  return text.split(/\s+/).filter(Boolean).length;
}

export type PostInput = Omit<Post, "body" | "updated"> & { body: unknown };

// Validates and saves. `original` is the slug being edited, or null for a new post.
export function savePost(original: string | null, raw: PostInput, validProducts: Set<string>):
  | { ok: true; slug: string }
  | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const title = str(raw.title, 160);
  const slug = str(raw.slug, 100) || slugify(title);
  const description = str(raw.description, 320);
  const excerpt = str(raw.excerpt, 600);
  const date = str(raw.date, 10);
  const category = str(raw.category, 60);
  const body = cleanBlocks(raw.body);
  const readMinutes = Math.round(Number(raw.readMinutes));

  if (title.length < 3) errors.title = "Give the post a title.";
  if (!SLUG_RE.test(slug)) errors.slug = "Use lowercase letters, numbers and dashes.";
  if (!DATE_RE.test(date) || Number.isNaN(Date.parse(date))) errors.date = "Pick a publish date.";
  if (!category) errors.category = "Pick or type a category.";
  if (!description) errors.description = "Write a meta description for search results.";
  if (!excerpt) errors.excerpt = "Write a short excerpt for the blog index.";
  if (!body.length) errors.body = "Add at least one block to the article.";
  if (!Number.isFinite(readMinutes) || readMinutes < 1 || readMinutes > 120) errors.readMinutes = "Between 1 and 120 minutes.";

  const taken = db().prepare("SELECT slug FROM posts WHERE slug = ?").get(slug) as { slug: string } | undefined;
  if (taken && slug !== original) errors.slug = "Another post already uses this slug.";
  if (original && !db().prepare("SELECT 1 FROM posts WHERE slug = ?").get(original)) errors.title = "This post no longer exists.";
  if (Object.keys(errors).length) return { ok: false, errors };

  const row = {
    slug,
    title,
    description,
    excerpt,
    date,
    read_minutes: readMinutes,
    category,
    anim: ANIM_KEYS.includes(raw.anim) ? raw.anim : "vial",
    keywords: json(strs(raw.keywords, 20, 60)),
    products: json(strs(raw.products, 8, 100).filter((s) => validProducts.has(s))),
    body: json(body),
    status: raw.status === "draft" ? "draft" : "published",
  };

  if (original) {
    db()
      .prepare(
        `UPDATE posts SET slug = @slug, title = @title, description = @description, excerpt = @excerpt, date = @date,
         updated = date('now'), read_minutes = @read_minutes, category = @category, anim = @anim, keywords = @keywords,
         products = @products, body = @body, status = @status, updated_at = datetime('now') WHERE slug = @original`
      )
      .run({ ...row, original });
  } else {
    db()
      .prepare(
        `INSERT INTO posts (slug, title, description, excerpt, date, read_minutes, category, anim, keywords, products, body, status)
         VALUES (@slug, @title, @description, @excerpt, @date, @read_minutes, @category, @anim, @keywords, @products, @body, @status)`
      )
      .run(row);
  }
  return { ok: true, slug };
}

export function deletePost(slug: string) {
  db().prepare("DELETE FROM posts WHERE slug = ?").run(slug);
}

export function setPostStatus(slug: string, status: "published" | "draft") {
  db().prepare("UPDATE posts SET status = ?, updated_at = datetime('now') WHERE slug = ?").run(status, slug);
}
