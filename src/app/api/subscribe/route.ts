import { append } from "@/lib/store";
import { WELCOME_CODE } from "@/lib/discounts";

// Newsletter / welcome-offer sign-ups. Each one is appended to data/subscribers.jsonl on the
// server (one JSON object per line) and the welcome code is returned. Swap the append for your
// email provider's API (Klaviyo, Mailchimp...) when one is connected.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Checks a Google ID token with Google: right audience (our client id), issuer, expiry and a
// verified email. Returns the email, or null.
async function verifyGoogle(credential: string): Promise<string | null> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId || credential.length > 4096) return null;
  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`, { cache: "no-store" });
    if (!res.ok) return null;
    const t = await res.json();
    const issuerOk = t.iss === "accounts.google.com" || t.iss === "https://accounts.google.com";
    const fresh = Number(t.exp) * 1000 > Date.now();
    if (t.aud !== clientId || !issuerOk || !fresh || t.email_verified !== "true" || typeof t.email !== "string") return null;
    return t.email.toLowerCase();
  } catch {
    return null;
  }
}
const hits = new Map<string, number[]>();

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60 * 60 * 1000);
  if (recent.length >= 10) return Response.json({ error: "Too many sign-ups. Please try again later." }, { status: 429 });
  hits.set(ip, [...recent, now]);

  let email = "";
  let source = "site";
  try {
    const body = await req.json();
    source = String(body.source ?? "site").slice(0, 30);
    if (typeof body.credential === "string") {
      const verified = await verifyGoogle(body.credential);
      if (!verified) return Response.json({ error: "Google sign-in couldn't be verified. Please use your email instead." }, { status: 401 });
      email = verified;
      source = `${source}+google`;
    } else {
      email = String(body.email ?? "").trim().toLowerCase();
    }
  } catch {}
  if (!EMAIL.test(email) || email.length > 200) {
    return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  try {
    await append("subscribers", { email, source, at: new Date().toISOString() });
  } catch {
    return Response.json({ error: "We couldn't save that just now. Please try again." }, { status: 500 });
  }

  return Response.json({ ok: true, code: WELCOME_CODE });
}
