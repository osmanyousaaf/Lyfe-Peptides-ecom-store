// Research notes for the blog. Bodies are structured blocks, rendered by components/blog/PostBody.
// Articles are short: a summary, a few animated key points, a wrap-up.
// Inline **bold** is supported inside text.
// Posts live in the database (seeded from data/blog-seed.ts) so the admin can edit them. Server only.
import { db, parse } from "./db";
import type { MiniAnim } from "./blog-mini";

export type { MiniAnim } from "./blog-mini";

export type AnimKey = "vial" | "pen" | "hplc" | "coa" | "storage";

export type Block =
  | { type: "summary"; text: string }
  | { type: "point"; title: string; text: string; anim: MiniAnim }
  | { type: "h2"; id: string; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "callout"; tone: "note" | "tip" | "warn"; title: string; text: string }
  | { type: "figure"; anim: AnimKey; caption: string }
  | { type: "table"; head: string[]; rows: string[][] };

export type Post = {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  date: string;
  updated?: string;
  readMinutes: number;
  category: string;
  anim: AnimKey;
  keywords: string[];
  products: string[];
  body: Block[];
  status?: "published" | "draft";
};

type PostRow = {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  date: string;
  updated: string | null;
  read_minutes: number;
  category: string;
  anim: string;
  keywords: string;
  products: string;
  body: string;
  status: string;
};

const ANIMS: AnimKey[] = ["vial", "pen", "hplc", "coa", "storage"];

function toPost(r: PostRow): Post {
  return {
    slug: r.slug,
    title: r.title,
    description: r.description,
    excerpt: r.excerpt,
    date: r.date,
    updated: r.updated ?? undefined,
    readMinutes: r.read_minutes,
    category: r.category,
    anim: ANIMS.includes(r.anim as AnimKey) ? (r.anim as AnimKey) : "vial",
    keywords: parse<string[]>(r.keywords, []),
    products: parse<string[]>(r.products, []),
    body: parse<Block[]>(r.body, []),
    status: r.status === "draft" ? "draft" : "published",
  };
}

// every post, drafts included, newest first (admin)
export function adminListPosts(): Post[] {
  return (db().prepare("SELECT * FROM posts ORDER BY date DESC").all() as PostRow[]).map(toPost);
}

export function adminGetPost(slug: string): Post | undefined {
  const r = db().prepare("SELECT * FROM posts WHERE slug = ?").get(slug) as PostRow | undefined;
  return r ? toPost(r) : undefined;
}

export function getAllPosts(): Post[] {
  return (db().prepare("SELECT * FROM posts WHERE status = 'published' ORDER BY date DESC").all() as PostRow[]).map(toPost);
}

export function getPost(slug: string): Post | undefined {
  const r = db().prepare("SELECT * FROM posts WHERE status = 'published' AND slug = ?").get(slug) as PostRow | undefined;
  return r ? toPost(r) : undefined;
}

export function getPostCategories(): string[] {
  return [...new Set(getAllPosts().map((p) => p.category))];
}

export function relatedPosts(post: Post, n = 3): Post[] {
  const others = getAllPosts().filter((p) => p.slug !== post.slug);
  return [...others.filter((p) => p.category === post.category), ...others.filter((p) => p.category !== post.category)].slice(0, n);
}

export function formatPostDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
}
