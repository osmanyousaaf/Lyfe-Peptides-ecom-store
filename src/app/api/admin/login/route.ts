import { cookies } from "next/headers";
import { adminConfigured, COOKIE, newSession, passwordOk } from "@/lib/admin-auth";

const tries = new Map<string, number[]>();

export async function POST(req: Request) {
  if (!adminConfigured()) return Response.json({ error: "Set ADMIN_PASSWORD in .env.local first." }, { status: 503 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const now = Date.now();
  const recent = (tries.get(ip) ?? []).filter((t) => now - t < 15 * 60 * 1000);
  if (recent.length >= 8) return Response.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });

  let password = "";
  try {
    password = String((await req.json()).password ?? "");
  } catch {}
  if (!passwordOk(password)) {
    tries.set(ip, [...recent, now]);
    return Response.json({ error: "That password isn't right." }, { status: 401 });
  }
  tries.delete(ip);
  const s = newSession();
  (await cookies()).set(COOKIE, s.value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: s.maxAge,
  });
  return Response.json({ ok: true });
}

export async function DELETE() {
  (await cookies()).delete(COOKIE);
  return Response.json({ ok: true });
}
