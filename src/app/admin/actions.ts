"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_DAYS, adminConfigured, checkPassword, createToken } from "@/lib/admin-session";

// at most 8 tries per address every 15 minutes
const tries = new Map<string, { n: number; reset: number }>();

export async function login(_prev: { error?: string } | undefined, form: FormData): Promise<{ error?: string }> {
  if (!adminConfigured()) return { error: "Set ADMIN_PASSWORD in .env.local, then restart the server." };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const t = tries.get(ip);
  if (t && t.reset > now && t.n >= 8) return { error: "Too many attempts. Try again in 15 minutes." };

  if (!checkPassword(String(form.get("password") ?? ""))) {
    tries.set(ip, t && t.reset > now ? { n: t.n + 1, reset: t.reset } : { n: 1, reset: now + 15 * 60_000 });
    return { error: "That password isn't right." };
  }
  tries.delete(ip);

  (await cookies()).set(SESSION_COOKIE, createToken()!, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
  const next = String(form.get("next") ?? "");
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}
