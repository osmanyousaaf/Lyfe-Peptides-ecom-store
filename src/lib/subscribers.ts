// Newsletter subscribers. Server only. Emails are unique regardless of case.
import { db } from "./db";
import type { Geo } from "./geo";

export type Subscriber = {
  id: number;
  email: string;
  source: string;
  createdAt: string;
  unsubscribedAt: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
};
type Row = {
  id: number;
  email: string;
  source: string;
  created_at: string;
  unsubscribed_at: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
};

const toSub = (r: Row): Subscriber => ({
  id: r.id,
  email: r.email,
  source: r.source,
  createdAt: r.created_at,
  unsubscribedAt: r.unsubscribed_at,
  country: r.country ?? null,
  region: r.region ?? null,
  city: r.city ?? null,
});

// adds the address, or re-activates it if it had unsubscribed; reports whether it was already active
export function subscribe(email: string, source = "newsletter", geo?: Geo): { already: boolean } {
  const clean = email.trim().toLowerCase();
  const existing = db().prepare("SELECT * FROM subscribers WHERE email = ?").get(clean) as Row | undefined;
  if (existing) {
    if (existing.unsubscribed_at) db().prepare("UPDATE subscribers SET unsubscribed_at = NULL WHERE id = ?").run(existing.id);
    return { already: !existing.unsubscribed_at };
  }
  db()
    .prepare("INSERT INTO subscribers (email, source, country, region, city) VALUES (?, ?, ?, ?, ?)")
    .run(clean, source, geo?.country ?? null, geo?.region ?? null, geo?.city ?? null);
  return { already: false };
}

export function listSubscribers(filter: "active" | "unsubscribed" | "all" = "all", q = ""): Subscriber[] {
  const where =
    filter === "active" ? "unsubscribed_at IS NULL" : filter === "unsubscribed" ? "unsubscribed_at IS NOT NULL" : "1 = 1";
  const rows = db()
    .prepare(`SELECT * FROM subscribers WHERE ${where} AND (? = '' OR email LIKE ?) ORDER BY created_at DESC, id DESC`)
    .all(q.trim(), `%${q.trim()}%`) as Row[];
  return rows.map(toSub);
}

export function subscriberCounts(): { active: number; unsubscribed: number } {
  const r = db()
    .prepare(
      "SELECT SUM(unsubscribed_at IS NULL) AS active, SUM(unsubscribed_at IS NOT NULL) AS unsubscribed FROM subscribers"
    )
    .get() as { active: number | null; unsubscribed: number | null };
  return { active: r.active ?? 0, unsubscribed: r.unsubscribed ?? 0 };
}

export function setUnsubscribed(id: number, unsubscribed: boolean) {
  db()
    .prepare(`UPDATE subscribers SET unsubscribed_at = ${unsubscribed ? "datetime('now')" : "NULL"} WHERE id = ?`)
    .run(id);
}

export function deleteSubscriber(id: number) {
  db().prepare("DELETE FROM subscribers WHERE id = ?").run(id);
}
