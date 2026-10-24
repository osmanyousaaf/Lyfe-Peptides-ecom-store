import { append } from "@/lib/store";

// Contact requests from the chat-style form on /contact. Each one is appended to
// data/contact.jsonl on the server. Connect an email or helpdesk service here to have them
// forwarded to info@lyfepeptidescanada.com automatically.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TOPICS = ["General inquiry", "Product question", "Order issue", "Bulk order", "Documentation request", "Shipping & returns"];
const hits = new Map<string, number[]>();

const clean = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60 * 60 * 1000);
  if (recent.length >= 8) return Response.json({ error: "You've sent a few messages already. Please email info@lyfepeptidescanada.com." }, { status: 429 });
  hits.set(ip, [...recent, now]);

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {}
  const entry = {
    name: clean(body.name, 100),
    email: clean(body.email, 200).toLowerCase(),
    phone: clean(body.phone, 40),
    topic: TOPICS.includes(String(body.topic)) ? String(body.topic) : "General inquiry",
    message: clean(body.message, 4000),
    at: new Date().toISOString(),
  };
  if (!entry.name || !EMAIL.test(entry.email) || entry.message.length < 2) {
    return Response.json({ error: "Name, a valid email and a message are needed." }, { status: 400 });
  }

  try {
    await append("contact", entry);
  } catch {
    return Response.json({ error: "We couldn't send that just now. Please email info@lyfepeptidescanada.com." }, { status: 500 });
  }
  return Response.json({ ok: true });
}
