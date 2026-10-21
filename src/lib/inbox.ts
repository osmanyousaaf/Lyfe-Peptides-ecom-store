// Contact-form messages. Server only.
import { db } from "./db";
import type { Geo } from "./geo";

export const TOPICS = {
  order: "An order",
  product: "A product",
  coa: "A COA",
  wholesale: "Wholesale",
  other: "Something else",
} as const;
export type Topic = keyof typeof TOPICS;
export type MessageStatus = "new" | "read" | "archived";

export type Message = {
  id: number;
  topic: Topic;
  name: string;
  email: string;
  orderNumber: string;
  body: string;
  status: MessageStatus;
  createdAt: string;
  country: string | null;
  region: string | null;
  city: string | null;
};

type Row = {
  id: number;
  topic: string;
  name: string;
  email: string;
  order_number: string;
  body: string;
  status: string;
  created_at: string;
  country: string | null;
  region: string | null;
  city: string | null;
};

const toMessage = (r: Row): Message => ({
  id: r.id,
  topic: (r.topic in TOPICS ? r.topic : "other") as Topic,
  name: r.name,
  email: r.email,
  orderNumber: r.order_number,
  body: r.body,
  status: (["new", "read", "archived"].includes(r.status) ? r.status : "new") as MessageStatus,
  createdAt: r.created_at,
  country: r.country ?? null,
  region: r.region ?? null,
  city: r.city ?? null,
});

// geo is where the sender's request came from (looked up from the IP, which isn't kept)
export function createMessage(
  m: { topic: Topic; name: string; email: string; orderNumber: string; body: string },
  geo?: Geo
): number {
  const r = db()
    .prepare("INSERT INTO messages (topic, name, email, order_number, body, country, region, city) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .run(m.topic, m.name, m.email, m.orderNumber, m.body, geo?.country ?? null, geo?.region ?? null, geo?.city ?? null);
  return Number(r.lastInsertRowid);
}

export function listMessages(status: MessageStatus, q = ""): Message[] {
  const like = `%${q.trim()}%`;
  const rows = db()
    .prepare(
      `SELECT * FROM messages WHERE status = ? AND (? = '' OR name LIKE ? OR email LIKE ? OR body LIKE ? OR order_number LIKE ?)
       ORDER BY created_at DESC, id DESC LIMIT 500`
    )
    .all(status, q.trim(), like, like, like, like) as Row[];
  return rows.map(toMessage);
}

export function messageCounts(): Record<MessageStatus, number> {
  const rows = db().prepare("SELECT status, COUNT(*) AS n FROM messages GROUP BY status").all() as { status: string; n: number }[];
  const out: Record<MessageStatus, number> = { new: 0, read: 0, archived: 0 };
  for (const r of rows) if (r.status in out) out[r.status as MessageStatus] = r.n;
  return out;
}

export function getMessage(id: number): Message | undefined {
  const r = db().prepare("SELECT * FROM messages WHERE id = ?").get(id) as Row | undefined;
  return r ? toMessage(r) : undefined;
}

export function setMessageStatus(id: number, status: MessageStatus) {
  db().prepare("UPDATE messages SET status = ? WHERE id = ?").run(status, id);
}

export function deleteMessage(id: number) {
  db().prepare("DELETE FROM messages WHERE id = ?").run(id);
}
