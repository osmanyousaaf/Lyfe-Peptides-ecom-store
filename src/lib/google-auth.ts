// "Continue with Google" (OpenID Connect, authorization code + PKCE) and the shared sign-in finish. Server only.
import { createHash, randomBytes } from "node:crypto";
import { geoFromHeaders } from "./geo";
import { ensureSignupCoupon, sendSignupEmail, upsertCustomer, type Profile } from "./customers";
import { setCustomerCookie } from "./customer-session";

export const OAUTH_COOKIE = "lyfe_oauth";

export function googleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

// development-only stand-in so the flow can be tried before Google is set up; never in production
export function devSignInAllowed(): boolean {
  return process.env.NODE_ENV !== "production" && !googleConfigured();
}

export function siteOrigin(req: Request): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin).replace(/\/$/, "");
}

export const redirectUri = (req: Request) => `${siteOrigin(req)}/api/auth/google/callback`;

// only same-site paths, never "//evil.com" or "/\evil.com"
export function safeNext(raw: string | null | undefined, fallback = "/account"): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return fallback;
  if (raw.startsWith("/api/") || raw.startsWith("/admin")) return fallback;
  return raw.slice(0, 300);
}

const b64url = (b: Buffer) => b.toString("base64url");

export function newOAuthState() {
  const verifier = b64url(randomBytes(32));
  return {
    state: b64url(randomBytes(16)),
    nonce: b64url(randomBytes(16)),
    verifier,
    challenge: b64url(createHash("sha256").update(verifier).digest()),
  };
}

export function googleAuthUrl(req: Request, s: { state: string; nonce: string; challenge: string }): string {
  const u = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  u.search = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri(req),
    response_type: "code",
    scope: "openid email profile",
    state: s.state,
    nonce: s.nonce,
    code_challenge: s.challenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();
  return u.toString();
}

type IdClaims = { iss?: string; aud?: string; sub?: string; nonce?: string; exp?: number };

// Exchanges the code and returns the verified Google profile, or an error message.
export async function googleProfile(req: Request, code: string, verifier: string, nonce: string): Promise<Profile | { error: string }> {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri(req),
      grant_type: "authorization_code",
      code_verifier: verifier,
    }),
  });
  if (!tokenRes.ok) return { error: "Google didn't accept the sign-in. Please try again." };
  const tokens = (await tokenRes.json()) as { access_token?: string; id_token?: string };
  if (!tokens.access_token || !tokens.id_token) return { error: "Google sign-in was incomplete." };

  // the ID token came straight from Google over TLS, so its claims can be read without a signature check
  let claims: IdClaims;
  try {
    claims = JSON.parse(Buffer.from(tokens.id_token.split(".")[1], "base64url").toString("utf8"));
  } catch {
    return { error: "Google sign-in was incomplete." };
  }
  const issOk = claims.iss === "https://accounts.google.com" || claims.iss === "accounts.google.com";
  if (!issOk || claims.aud !== process.env.GOOGLE_CLIENT_ID || claims.nonce !== nonce || !claims.sub || (claims.exp ?? 0) * 1000 < Date.now()) {
    return { error: "That Google sign-in couldn't be verified." };
  }

  const infoRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!infoRes.ok) return { error: "Couldn't read your Google profile." };
  const info = (await infoRes.json()) as { sub?: string; email?: string; email_verified?: boolean; name?: string; picture?: string };
  if (info.sub !== claims.sub || !info.email) return { error: "Couldn't read your Google profile." };
  if (!info.email_verified) return { error: "Your Google email address isn't verified yet." };

  return { sub: info.sub, email: info.email, name: (info.name ?? "").slice(0, 120), picture: (info.picture ?? "").slice(0, 500), provider: "google" };
}

// Signs the customer in; on their first sign-up also issues and emails the reward code.
// Returns where to send them next.
export async function finishSignIn(req: Request, profile: Profile, next: string): Promise<string> {
  const { account, created } = upsertCustomer(profile, geoFromHeaders(req.headers));
  await setCustomerCookie(account.id);
  if (!created && account.signupCouponId) return next;
  const coupon = ensureSignupCoupon(account);
  await sendSignupEmail(account, coupon);
  return `/account/welcome?next=${encodeURIComponent(next)}`;
}
