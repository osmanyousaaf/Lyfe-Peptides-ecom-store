import { subscribe } from "@/lib/subscribers";
import { geoFromHeaders } from "@/lib/geo";
import { allow, clientIp, EMAIL_RE } from "@/lib/rate-limit";

// Public newsletter sign-up.
export async function POST(req: Request) {
  if (!allow(`subscribe:${clientIp(req)}`, 8, 10 * 60_000)) {
    return Response.json({ error: "Too many tries. Try again in a few minutes." }, { status: 429 });
  }
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return Response.json({ error: "The request could not be read." }, { status: 400 });
  if (typeof body.website === "string" && body.website.trim()) return Response.json({ ok: true, already: false });

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return Response.json({ error: "That email address doesn't look right." }, { status: 400 });
  }
  const source = body.source === "footer" || body.source === "checkout" ? body.source : "newsletter";
  const { already } = subscribe(email, source, geoFromHeaders(req.headers));
  return Response.json({ ok: true, already });
}
