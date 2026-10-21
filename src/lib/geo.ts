// Where a request came from: country, province/state and city. Server only.
// Uses the host's geo headers when present (Cloudflare, Vercel), otherwise an offline
// lookup of the visitor's IP. The IP itself is never stored.
import geoip from "geoip-lite";

export type Geo = { country: string | null; region: string | null; city: string | null };

const NONE: Geo = { country: null, region: null, city: null };

function clientIp(h: Headers): string | null {
  const raw = h.get("cf-connecting-ip") || h.get("x-real-ip") || h.get("x-forwarded-for")?.split(",")[0];
  const ip = raw?.trim().replace(/^::ffff:/, "");
  return ip || null;
}

const isPrivate = (ip: string) =>
  ip === "::1" || ip === "127.0.0.1" || /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|fc|fd|fe80)/i.test(ip);

export function geoFromHeaders(h: Headers): Geo {
  const cfCountry = h.get("cf-ipcountry");
  const vCountry = h.get("x-vercel-ip-country");
  if (vCountry) {
    return {
      country: vCountry,
      region: h.get("x-vercel-ip-country-region"),
      city: decodeURIComponent(h.get("x-vercel-ip-city") ?? "") || null,
    };
  }
  const ip = clientIp(h);
  if (ip && !isPrivate(ip)) {
    const hit = geoip.lookup(ip);
    if (hit) return { country: hit.country || cfCountry || null, region: hit.region || null, city: hit.city || null };
  }
  if (cfCountry && cfCountry !== "XX") return { ...NONE, country: cfCountry };
  return NONE;
}

const PROVINCES: Record<string, string> = {
  AB: "Alberta", BC: "British Columbia", MB: "Manitoba", NB: "New Brunswick", NL: "Newfoundland and Labrador",
  NS: "Nova Scotia", NT: "Northwest Territories", NU: "Nunavut", ON: "Ontario", PE: "Prince Edward Island",
  QC: "Quebec", SK: "Saskatchewan", YT: "Yukon",
};

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

export function countryName(code: string | null | undefined): string {
  if (!code) return "Unknown";
  try {
    return regionNames.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

// "Ontario", "California" or the raw code; Canadian provinces are spelled out
export function regionName(country: string | null | undefined, region: string | null | undefined): string {
  if (!region) return "";
  if (country === "CA") return PROVINCES[region] ?? region;
  return region;
}

// "Toronto, Ontario, Canada" style label for admin tables; "Local / unknown" when nothing matched
export function placeLabel(g: { country?: string | null; region?: string | null; city?: string | null }): string {
  if (!g.country) return "Local / unknown";
  return [g.city, regionName(g.country, g.region), countryName(g.country)].filter(Boolean).join(", ");
}

// 🇨🇦 from "CA"
export function flag(code: string | null | undefined): string {
  if (!code || code.length !== 2) return "🌐";
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0)));
}
