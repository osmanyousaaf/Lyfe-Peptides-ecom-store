import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { OAUTH_COOKIE, finishSignIn, googleConfigured, googleProfile, safeNext } from "@/lib/google-auth";

// GET /api/auth/google/callback?code&state — Google sends the visitor back here
export async function GET(req: Request) {
  const url = new URL(req.url);
  const jar = await cookies();
  const raw = jar.get(OAUTH_COOKIE)?.value;
  jar.delete({ name: OAUTH_COOKIE, path: "/api/auth/google" });

  let saved: { state?: string; verifier?: string; nonce?: string; next?: string } = {};
  try {
    saved = raw ? JSON.parse(raw) : {};
  } catch {
    /* treated as missing */
  }
  const next = safeNext(saved.next, "/account");
  const fail = (reason: string) => {
    const to = new URL("/account/signin", req.url);
    to.searchParams.set("next", next);
    to.searchParams.set("error", reason);
    return NextResponse.redirect(to, 303);
  };

  if (!googleConfigured()) return fail("Google sign-in isn't set up yet.");
  if (url.searchParams.get("error")) return fail("Sign-in was cancelled.");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state || !saved.state || state !== saved.state || !saved.verifier || !saved.nonce) {
    return fail("That sign-in link expired. Please try again.");
  }

  try {
    const profile = await googleProfile(req, code, saved.verifier, saved.nonce);
    if ("error" in profile) return fail(profile.error);
    return NextResponse.redirect(new URL(await finishSignIn(req, profile, next), req.url), 303);
  } catch {
    return fail("Google couldn't be reached. Please try again.");
  }
}
