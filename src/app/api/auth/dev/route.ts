import { NextResponse } from "next/server";
import { devSignInAllowed, finishSignIn, safeNext } from "@/lib/google-auth";

// Development only, and only while Google isn't configured: sign in as any email to try the account flow.
export async function POST(req: Request) {
  if (!devSignInAllowed()) return NextResponse.json({ error: "Not available." }, { status: 404 });
  const form = await req.formData().catch(() => null);
  const email = String(form?.get("email") ?? "").trim().toLowerCase();
  const name = String(form?.get("name") ?? "").trim().slice(0, 120);
  const next = safeNext(String(form?.get("next") ?? ""), "/account");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    const to = new URL("/account/signin", req.url);
    to.searchParams.set("next", next);
    to.searchParams.set("error", "Enter a valid email address.");
    return NextResponse.redirect(to, 303);
  }
  const to = await finishSignIn(req, { sub: null, email, name, picture: "", provider: "dev" }, next);
  return NextResponse.redirect(new URL(to, req.url), 303);
}
