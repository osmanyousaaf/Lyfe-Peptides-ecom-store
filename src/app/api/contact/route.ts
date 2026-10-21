import { createMessage, TOPICS, type Topic } from "@/lib/inbox";
import { geoFromHeaders } from "@/lib/geo";
import { allow, clientIp, EMAIL_RE } from "@/lib/rate-limit";

const LIMITS = { name: 120, email: 200, order: 60, message: 1500 };

// Public contact form: stores the message in the admin inbox.
export async function POST(req: Request) {
  if (!allow(`contact:${clientIp(req)}`, 5, 10 * 60_000)) {
    return Response.json({ error: "Too many messages. Try again in a few minutes." }, { status: 429 });
  }
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return Response.json({ error: "The message could not be read." }, { status: 400 });

  // bots fill every field; people never see this one
  if (typeof body.company === "string" && body.company.trim()) return Response.json({ ok: true });

  const str = (k: string) => (typeof body[k] === "string" ? (body[k] as string).trim() : "");
  const topic = str("topic");
  const name = str("name");
  const email = str("email").toLowerCase();
  const order = str("order");
  const message = str("message");

  const errors: Record<string, string> = {};
  if (!(topic in TOPICS)) errors.topic = "Pick a topic.";
  if (name.length < 2 || name.length > LIMITS.name) errors.name = "Tell us your name.";
  if (!EMAIL_RE.test(email) || email.length > LIMITS.email) errors.email = "That email address doesn't look right.";
  if (order.length > LIMITS.order) errors.order = "That order number is too long.";
  if (message.length < 10 || message.length > LIMITS.message) errors.message = "Write between 10 and 1500 characters.";
  if (Object.keys(errors).length) return Response.json({ error: Object.values(errors)[0], errors }, { status: 400 });

  createMessage({ topic: topic as Topic, name, email, orderNumber: order, body: message }, geoFromHeaders(req.headers));
  return Response.json({ ok: true });
}
