// First-party traffic analytics: writes from /api/track, reads for the admin. Server only.
// No IP addresses are stored; visitors are random ids the browser made up.
import { db } from "./db";
import type { Geo } from "./geo";

// ---------- writing ----------

export type Ua = { device: string; browser: string; os: string };

export const BOT_RE =
  /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|embedly|fetch|curl|wget|python|axios|node|go-http|java\/|httpclient|monitor|uptime/i;

export function parseUa(ua: string): Ua {
  const device = /iPad|Tablet|PlayBook|Silk|Android(?!.*Mobile)/i.test(ua)
    ? "Tablet"
    : /Mobi|iPhone|iPod|Android.*Mobile|Windows Phone/i.test(ua)
      ? "Mobile"
      : "Desktop";
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\/|Opera/.test(ua)
      ? "Opera"
      : /SamsungBrowser/.test(ua)
        ? "Samsung Internet"
        : /Firefox|FxiOS/.test(ua)
          ? "Firefox"
          : /CriOS|Chrome|Chromium/.test(ua)
            ? "Chrome"
            : /Safari/.test(ua)
              ? "Safari"
              : "Other";
  const os = /iPhone|iPad|iPod/.test(ua)
    ? "iOS"
    : /Android/.test(ua)
      ? "Android"
      : /CrOS/.test(ua)
        ? "ChromeOS"
        : /Windows/.test(ua)
          ? "Windows"
          : /Mac OS X|Macintosh/.test(ua)
            ? "macOS"
            : /Linux/.test(ua)
              ? "Linux"
              : "Other";
  return { device, browser, os };
}

const SOURCES: [RegExp, string][] = [
  [/(^|\.)google\./, "Google"],
  [/(^|\.)bing\.com$/, "Bing"],
  [/duckduckgo\.com$/, "DuckDuckGo"],
  [/(^|\.)yahoo\./, "Yahoo"],
  [/instagram\.com$/, "Instagram"],
  [/(^|\.)(facebook|fb)\.com$|fb\.me$/, "Facebook"],
  [/tiktok\.com$/, "TikTok"],
  [/youtube\.com$|youtu\.be$/, "YouTube"],
  [/(^|\.)(t\.co|twitter\.com|x\.com)$/, "X"],
  [/reddit\.com$/, "Reddit"],
  [/linkedin\.com$|lnkd\.in$/, "LinkedIn"],
  [/pinterest\./, "Pinterest"],
  [/chatgpt\.com$|openai\.com$/, "ChatGPT"],
  [/perplexity\.ai$/, "Perplexity"],
];

// where a session came from: a UTM source wins, then the referring site, else Direct
export function sourceOf(referrer: string, utmSource: string | null, ownHost: string): string {
  if (utmSource) {
    const u = utmSource.toLowerCase();
    const named = SOURCES.find(([re]) => re.test(`${u}.com`) || re.test(u));
    return named ? named[1] : utmSource.slice(0, 40);
  }
  if (!referrer) return "Direct";
  let host = "";
  try {
    host = new URL(referrer).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "Direct";
  }
  if (!host || host === ownHost.replace(/^www\./, "")) return "Direct";
  return SOURCES.find(([re]) => re.test(host))?.[1] ?? host;
}

export type ViewInput = {
  visitorId: string;
  sessionId: string;
  path: string;
  title: string;
  referrer: string;
  source: string;
  utm: { source: string | null; medium: string | null; campaign: string | null };
  geo: Geo;
  ua: Ua;
};

// the first view of a session is the one that decides its traffic source
export function isNewSession(sessionId: string): boolean {
  return !db().prepare("SELECT 1 FROM page_views WHERE session_id = ? LIMIT 1").get(sessionId);
}

export function recordView(v: ViewInput) {
  db()
    .prepare(
      `INSERT INTO page_views (visitor_id, session_id, path, title, referrer, source, utm_source, utm_medium, utm_campaign,
        country, region, city, device, browser, os)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      v.visitorId, v.sessionId, v.path, v.title, v.referrer, v.source, v.utm.source, v.utm.medium, v.utm.campaign,
      v.geo.country, v.geo.region, v.geo.city, v.ua.device, v.ua.browser, v.ua.os
    );
  touchPresence(v.visitorId, v.sessionId, v.path, v.geo, v.ua.device);
}

export function touchPresence(visitorId: string, sessionId: string, path: string, geo: Geo, device: string) {
  db()
    .prepare(
      `INSERT INTO presence (visitor_id, session_id, path, country, region, city, device, last_seen)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(visitor_id) DO UPDATE SET session_id = excluded.session_id, path = excluded.path,
         country = excluded.country, region = excluded.region, city = excluded.city, device = excluded.device,
         last_seen = excluded.last_seen`
    )
    .run(visitorId, sessionId, path, geo.country, geo.region, geo.city, device);
}

export function leavePresence(visitorId: string) {
  db().prepare("DELETE FROM presence WHERE visitor_id = ?").run(visitorId);
}

// time on page arrives when the tab hides; it lands on that visitor's latest view of the page
export function recordDuration(visitorId: string, sessionId: string, path: string, ms: number) {
  db()
    .prepare(
      `UPDATE page_views SET duration_ms = MAX(duration_ms, ?) WHERE id = (
         SELECT id FROM page_views WHERE visitor_id = ? AND session_id = ? AND path = ? ORDER BY id DESC LIMIT 1)`
    )
    .run(Math.min(ms, 30 * 60_000), visitorId, sessionId, path);
}

export function recordEvent(e: { visitorId: string; sessionId: string; type: string; label: string; path: string; geo: Geo }) {
  db()
    .prepare("INSERT INTO events (visitor_id, session_id, type, label, path, country, region) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .run(e.visitorId, e.sessionId, e.type, e.label, e.path, e.geo.country, e.geo.region);
}

let lastPrune = 0;
// drop stale presence hourly-ish and raw history past 400 days
export function maybePrune() {
  const now = Date.now();
  if (now - lastPrune < 10 * 60_000) return;
  lastPrune = now;
  db().prepare("DELETE FROM presence WHERE last_seen < datetime('now', '-1 hour')").run();
  db().prepare("DELETE FROM page_views WHERE created_at < datetime('now', '-400 days')").run();
  db().prepare("DELETE FROM events WHERE created_at < datetime('now', '-400 days')").run();
}

// ---------- reading ----------

export const RANGES = { "24h": 24, "7d": 24 * 7, "30d": 24 * 30, "90d": 24 * 90 } as const;
export type RangeKey = keyof typeof RANGES;
export const isRange = (r: string | undefined): r is RangeKey => !!r && r in RANGES;

// "now minus h hours" window, optionally shifted back one whole period for comparison
const win = (hours: number, previous = false) =>
  previous
    ? { from: `-${hours * 2} hours`, to: `-${hours} hours` }
    : { from: `-${hours} hours`, to: "+0 seconds" };
const WHERE = "created_at >= datetime('now', ?) AND created_at < datetime('now', ?)";

export type Kpis = {
  visitors: number;
  sessions: number;
  views: number;
  pagesPerSession: number;
  avgTimeMs: number;
  bounceRate: number;
  clicks: number;
};

function kpis(hours: number, previous: boolean): Kpis {
  const w = win(hours, previous);
  const base = db()
    .prepare(
      `SELECT COUNT(DISTINCT visitor_id) AS visitors, COUNT(DISTINCT session_id) AS sessions, COUNT(*) AS views,
              AVG(NULLIF(duration_ms, 0)) AS avg_ms
       FROM page_views WHERE ${WHERE}`
    )
    .get(w.from, w.to) as { visitors: number; sessions: number; views: number; avg_ms: number | null };
  const bounce = db()
    .prepare(
      `SELECT COUNT(*) AS n, SUM(c = 1) AS single FROM (
         SELECT session_id, COUNT(*) AS c FROM page_views WHERE ${WHERE} GROUP BY session_id)`
    )
    .get(w.from, w.to) as { n: number; single: number | null };
  const clicks = db()
    .prepare(`SELECT COUNT(*) AS n FROM events WHERE ${WHERE}`)
    .get(w.from, w.to) as { n: number };
  return {
    visitors: base.visitors,
    sessions: base.sessions,
    views: base.views,
    pagesPerSession: base.sessions ? base.views / base.sessions : 0,
    avgTimeMs: Math.round(base.avg_ms ?? 0),
    bounceRate: bounce.n ? (bounce.single ?? 0) / bounce.n : 0,
    clicks: clicks.n,
  };
}

// Toronto's current offset from UTC, in hours (−4 in summer, −5 in winter)
function torontoOffsetHours(): number {
  const now = new Date();
  const local = new Date(now.toLocaleString("en-US", { timeZone: "America/Toronto" }));
  const utc = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
  return Math.round((local.getTime() - utc.getTime()) / 3600_000);
}

export type TrafficPoint = { key: string; label: string; visitors: number; views: number };

// hourly buckets for 24 hours, daily otherwise, in Toronto time, with empty buckets filled in
function series(hours: number): TrafficPoint[] {
  const off = torontoOffsetHours();
  const shift = `${off >= 0 ? "+" : ""}${off} hours`;
  const hourly = hours <= 24;
  const fmt = hourly ? "%Y-%m-%d %H" : "%Y-%m-%d";
  const rows = db()
    .prepare(
      `SELECT strftime('${fmt}', created_at, ?) AS k, COUNT(DISTINCT visitor_id) AS visitors, COUNT(*) AS views
       FROM page_views WHERE created_at >= datetime('now', ?) GROUP BY k`
    )
    .all(shift, `-${hours} hours`) as { k: string; visitors: number; views: number }[];
  const byKey = new Map(rows.map((r) => [r.k, r]));

  const out: TrafficPoint[] = [];
  const nowLocal = Date.now() + off * 3600_000;
  const steps = hourly ? 24 : hours / 24;
  for (let i = steps - 1; i >= 0; i--) {
    const t = new Date(nowLocal - i * (hourly ? 3600_000 : 86400_000));
    const iso = t.toISOString();
    const key = hourly ? `${iso.slice(0, 10)} ${iso.slice(11, 13)}` : iso.slice(0, 10);
    const label = hourly
      ? new Date(`${iso.slice(0, 13)}:00:00Z`).toLocaleTimeString("en-CA", { hour: "numeric", timeZone: "UTC" })
      : new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-CA", { month: "short", day: "numeric", timeZone: "UTC" });
    const r = byKey.get(key);
    out.push({ key, label, visitors: r?.visitors ?? 0, views: r?.views ?? 0 });
  }
  return out;
}

export type Row = { label: string; value: number; sub?: number; code?: string | null; country?: string | null };

function top(sql: string, hours: number, limit: number): Row[] {
  return db().prepare(sql).all(`-${hours} hours`, limit) as Row[];
}

export type Funnel = { step: string; value: number }[];

function funnel(hours: number): Funnel {
  const since = `-${hours} hours`;
  const one = (sql: string) => (db().prepare(sql).get(since) as { n: number }).n;
  return [
    { step: "Visited the site", value: one("SELECT COUNT(DISTINCT visitor_id) AS n FROM page_views WHERE created_at >= datetime('now', ?)") },
    {
      step: "Viewed a product",
      value: one("SELECT COUNT(DISTINCT visitor_id) AS n FROM page_views WHERE path LIKE '/product/%' AND created_at >= datetime('now', ?)"),
    },
    { step: "Added to cart", value: one("SELECT COUNT(DISTINCT visitor_id) AS n FROM events WHERE type = 'add_to_cart' AND created_at >= datetime('now', ?)") },
    { step: "Started checkout", value: one("SELECT COUNT(DISTINCT visitor_id) AS n FROM events WHERE type = 'checkout' AND created_at >= datetime('now', ?)") },
    {
      step: "Placed an order",
      value: one(
        "SELECT COUNT(*) AS n FROM orders WHERE status IN ('paid', 'processing', 'shipped', 'delivered') AND created_at >= datetime('now', ?)"
      ),
    },
  ];
}

export type Report = {
  range: RangeKey;
  hours: number;
  now: Kpis;
  before: Kpis;
  series: TrafficPoint[];
  pages: Row[];
  sources: Row[];
  campaigns: Row[];
  countries: Row[];
  provinces: Row[];
  states: Row[];
  cities: Row[];
  devices: Row[];
  browsers: Row[];
  os: Row[];
  clicks: Row[];
  funnel: Funnel;
};

export function report(range: RangeKey): Report {
  const hours = RANGES[range];
  const since = "created_at >= datetime('now', ?)";
  return {
    range,
    hours,
    now: kpis(hours, false),
    before: kpis(hours, true),
    series: series(hours),
    pages: top(
      `SELECT path AS label, COUNT(*) AS value, COUNT(DISTINCT visitor_id) AS sub FROM page_views WHERE ${since}
       GROUP BY path ORDER BY value DESC LIMIT ?`,
      hours,
      12
    ),
    sources: top(
      `SELECT source AS label, COUNT(DISTINCT session_id) AS value FROM page_views WHERE ${since} AND source != ''
       GROUP BY source ORDER BY value DESC LIMIT ?`,
      hours,
      10
    ),
    campaigns: top(
      `SELECT COALESCE(utm_campaign, '(none)') || ' · ' || COALESCE(utm_source, '?') || '/' || COALESCE(utm_medium, '?') AS label,
              COUNT(DISTINCT session_id) AS value
       FROM page_views WHERE ${since} AND (utm_campaign IS NOT NULL OR utm_source IS NOT NULL)
       GROUP BY label ORDER BY value DESC LIMIT ?`,
      hours,
      8
    ),
    countries: top(
      `SELECT COALESCE(country, '') AS label, country AS code, COUNT(DISTINCT visitor_id) AS value FROM page_views WHERE ${since}
       GROUP BY country ORDER BY value DESC LIMIT ?`,
      hours,
      12
    ),
    provinces: top(
      `SELECT region AS label, region AS code, COUNT(DISTINCT visitor_id) AS value FROM page_views
       WHERE ${since} AND country = 'CA' AND region IS NOT NULL AND region != '' GROUP BY region ORDER BY value DESC LIMIT ?`,
      hours,
      13
    ),
    states: top(
      `SELECT region AS label, region AS code, COUNT(DISTINCT visitor_id) AS value FROM page_views
       WHERE ${since} AND country = 'US' AND region IS NOT NULL AND region != '' GROUP BY region ORDER BY value DESC LIMIT ?`,
      hours,
      10
    ),
    cities: top(
      `SELECT city AS label, country, region AS code, COUNT(DISTINCT visitor_id) AS value FROM page_views
       WHERE ${since} AND city IS NOT NULL AND city != '' GROUP BY city, region, country ORDER BY value DESC LIMIT ?`,
      hours,
      10
    ),
    devices: top(
      `SELECT device AS label, COUNT(DISTINCT visitor_id) AS value FROM page_views WHERE ${since} GROUP BY device ORDER BY value DESC LIMIT ?`,
      hours,
      5
    ),
    browsers: top(
      `SELECT browser AS label, COUNT(DISTINCT visitor_id) AS value FROM page_views WHERE ${since} GROUP BY browser ORDER BY value DESC LIMIT ?`,
      hours,
      6
    ),
    os: top(
      `SELECT os AS label, COUNT(DISTINCT visitor_id) AS value FROM page_views WHERE ${since} GROUP BY os ORDER BY value DESC LIMIT ?`,
      hours,
      6
    ),
    clicks: top(
      `SELECT CASE type WHEN 'click' THEN label ELSE type || '|' || label END AS label, COUNT(*) AS value,
              COUNT(DISTINCT visitor_id) AS sub
       FROM events WHERE ${since} GROUP BY type, events.label ORDER BY value DESC LIMIT ?`,
      hours,
      12
    ),
    funnel: funnel(hours),
  };
}

export type LiveVisitor = {
  path: string;
  country: string | null;
  region: string | null;
  city: string | null;
  device: string;
  secondsAgo: number;
};

export type Live = { count: number; visitors: LiveVisitor[]; pages: Row[]; viewsLast30m: number };

// visitors whose tab pinged in the last two minutes (the heartbeat runs every 20 seconds)
export function live(): Live {
  const rows = db()
    .prepare(
      `SELECT path, country, region, city, device,
              CAST((julianday('now') - julianday(last_seen)) * 86400 AS INTEGER) AS secondsAgo
       FROM presence WHERE last_seen >= datetime('now', '-2 minutes') ORDER BY last_seen DESC LIMIT 50`
    )
    .all() as LiveVisitor[];
  const count = (db().prepare("SELECT COUNT(*) AS n FROM presence WHERE last_seen >= datetime('now', '-2 minutes')").get() as { n: number }).n;
  const pages = new Map<string, number>();
  rows.forEach((r) => pages.set(r.path, (pages.get(r.path) ?? 0) + 1));
  const viewsLast30m = (db().prepare("SELECT COUNT(*) AS n FROM page_views WHERE created_at >= datetime('now', '-30 minutes')").get() as { n: number }).n;
  return {
    count,
    visitors: rows,
    pages: [...pages.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 6),
    viewsLast30m,
  };
}

// small summary for the dashboard strip
export function glance(days: number): { live: number; visitors: number; visitorsBefore: number; topRegion: Row | null } {
  const hours = days * 24;
  const v = (from: string, to: string) =>
    (db().prepare(`SELECT COUNT(DISTINCT visitor_id) AS n FROM page_views WHERE ${WHERE}`).get(from, to) as { n: number }).n;
  const topRegion =
    (db()
      .prepare(
        `SELECT region AS label, country, COUNT(DISTINCT visitor_id) AS value FROM page_views
         WHERE created_at >= datetime('now', ?) AND region IS NOT NULL AND region != ''
         GROUP BY country, region ORDER BY value DESC LIMIT 1`
      )
      .get(`-${hours} hours`) as Row | undefined) ?? null;
  return {
    live: live().count,
    visitors: v(`-${hours} hours`, "+0 seconds"),
    visitorsBefore: v(`-${hours * 2} hours`, `-${hours} hours`),
    topRegion,
  };
}
