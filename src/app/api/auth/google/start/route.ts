import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { OAUTH_COOKIE, devSignInAllowed, googleAuthUrl, googleConfigured, newOAuthState, safeNext } from "@/lib/google-auth";

// GET /api/auth/google/start?next=/account → Google's consent screen
export async function GET(req: Request) {
  const next = safeNext(new URL(req.url).searchParams.get("next"), "/account");
  if (!googleConfigured()) {
    const to = new URL("/account/signin", req.url);
    to.searchParams.set("next", next);
    if (!devSignInAllowed()) to.searchParams.set("unavailable", "1");
    return NextResponse.redirect(to, 303);
  }
  const s = newOAuthState();
  (await cookies()).set(OAUTH_COOKIE, JSON.stringify({ state: s.state, verifier: s.verifier, nonce: s.nonce, next }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/auth/google",
    maxAge: 600,
  });
  return NextResponse.redirect(googleAuthUrl(req, s), 303);
}
