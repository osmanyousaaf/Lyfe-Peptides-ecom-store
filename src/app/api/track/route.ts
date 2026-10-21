import { geoFromHeaders } from "@/lib/geo";
import { allow, clientIp } from "@/lib/rate-limit";
import {
  BOT_RE,
  isNewSession,
  leavePresence,
  maybePrune,
  parseUa,
  recordDuration,
  recordEvent,
  recordView,
  sourceOf,
  touchPresence,
} from "@/lib/analytics";

const ID_RE = /^[a-z0-9-]{8,64}$/i;
const EVENT_TYPES = new Set(["click", "add_to_cart", "checkout", "product_click", "outbound", "social", "search", "signup"]);

const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
const opt = (v: unknown, max: number) => {
  const s = str(v, max).trim();
  return s || null;
};

// a site path without its query string; admin pages are never counted
function cleanPath(v: unknown): string | null {
  const p = str(v, 300).split("?")[0].split("#")[0];
  if (!p.startsWith("/") || p.startsWith("/admin") || p.startsWith("/api/")) return null;
  return p;
}

// Public beacon for page views, time on page, clicks and live presence. Always answers 204.
export async function POST(req: Request) {
  const done = new Response(null, { status: 204 });
  const ua = req.headers.get("user-agent") ?? "";
  if (!ua || BOT_RE.test(ua)) return done;
  if (!allow(`track:${clientIp(req)}`, 240, 60_000)) return done;

  // sendBeacon posts text/plain, fetch posts JSON; read both the same way
  const raw = await req.text().catch(() => "");
  if (!raw || raw.length > 4000) return done;
  let b: Record<string, unknown>;
  try {
    b = JSON.parse(raw);
  } catch {
    return done;
  }
  if (!b || typeof b !== "object") return done;

  const visitorId = str(b.v, 64);
  const sessionId = str(b.s, 64);
  const path = cleanPath(b.p);
  if (!ID_RE.test(visitorId) || !ID_RE.test(sessionId) || !path) return done;

  const geo = geoFromHeaders(req.headers);
  const device = parseUa(ua);

  try {
    switch (b.t) {
      case "view": {
        const referrer = str(b.r, 500);
        const utm = { source: opt(b.us, 80), medium: opt(b.um, 80), campaign: opt(b.uc, 120) };
        const host = req.headers.get("host") ?? "";
        // a session's source is decided by its first page only
        const first = isNewSession(sessionId);
        recordView({
          visitorId,
          sessionId,
          path,
          title: str(b.ti, 200),
          referrer: first ? referrer : "",
          source: first ? sourceOf(referrer, utm.source, host) : "",
          utm,
          geo,
          ua: device,
        });
        break;
      }
      case "ping":
        touchPresence(visitorId, sessionId, path, geo, device.device);
        break;
      case "leave": {
        const ms = Number(b.d);
        if (Number.isFinite(ms) && ms > 0) recordDuration(visitorId, sessionId, path, ms);
        if (b.gone) leavePresence(visitorId);
        break;
      }
      case "event": {
        const type = str(b.e, 30);
        if (!EVENT_TYPES.has(type)) break;
        recordEvent({ visitorId, sessionId, type, label: str(b.l, 120).trim(), path, geo });
        break;
      }
    }
    maybePrune();
  } catch {
    // analytics must never break the store
  }
  return done;
}
