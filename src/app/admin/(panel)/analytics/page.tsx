import Link from "next/link";
import type { Metadata } from "next";
import { Card, PageHeader } from "@/components/admin/ui";
import LivePanel from "@/components/admin/analytics/LivePanel";
import TrafficChart from "@/components/admin/analytics/TrafficChart";
import { BarList, Delta, FunnelChart, ProvinceMap } from "@/components/admin/analytics/Parts";
import { isRange, report, type RangeKey } from "@/lib/analytics";
import { countryName, flag, liveData, regionName } from "@/lib/analytics-view";

export const metadata: Metadata = { title: "Analytics" };

const RANGE_LABEL: Record<RangeKey, string> = { "24h": "24 hours", "7d": "7 days", "30d": "30 days", "90d": "90 days" };

const minutes = (ms: number) => {
  if (!ms) return "—";
  const s = Math.round(ms / 1000);
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
};

const EVENT_NAMES: Record<string, string> = {
  add_to_cart: "Add to cart",
  checkout: "Checkout",
  product_click: "Product",
  outbound: "Outbound link",
  social: "Social link",
  search: "Search",
  signup: "Sign-up",
};

function Kpi({ label, value, delta, hint }: { label: string; value: string; delta: React.ReactNode; hint?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 sm:p-5" title={hint}>
      <p className="text-xs font-bold uppercase tracking-wider text-faint">{label}</p>
      <p className="num mt-2 text-[1.625rem] font-extrabold leading-none tracking-tight text-navy sm:text-[1.875rem]">{value}</p>
      <p className="mt-2">{delta}</p>
    </div>
  );
}

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const r = (await searchParams).range;
  const range: RangeKey = isRange(r) ? r : "7d";
  const a = report(range);
  const live = liveData();
  const { now, before } = a;

  const provinceCounts = Object.fromEntries(a.provinces.map((p) => [p.label, p.value]));
  const canada = a.countries.find((c) => c.code === "CA")?.value ?? 0;
  const known = a.countries.filter((c) => c.code).reduce((n, c) => n + c.value, 0);

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Who is on the site, where they come from and what they do. First-party and cookie-free: no IP addresses are stored."
        actions={
          <div className="flex items-center gap-1 rounded-xl bg-white p-1 ring-1 ring-line" role="group" aria-label="Date range">
            {(Object.keys(RANGE_LABEL) as RangeKey[]).map((k) => (
              <Link
                key={k}
                href={k === "7d" ? "/admin/analytics" : `/admin/analytics?range=${k}`}
                aria-current={k === range ? "true" : undefined}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${k === range ? "bg-navy text-white" : "text-muted hover:text-navy"}`}
              >
                {k}
              </Link>
            ))}
          </div>
        }
      />

      {/* live + headline numbers */}
      <div className="mb-5 grid gap-4 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <LivePanel initial={live} />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          <Kpi label="Visitors" value={now.visitors.toLocaleString("en-CA")} delta={<Delta now={now.visitors} before={before.visitors} />} hint="Unique browsers" />
          <Kpi label="Page views" value={now.views.toLocaleString("en-CA")} delta={<Delta now={now.views} before={before.views} />} />
          <Kpi label="Clicks" value={now.clicks.toLocaleString("en-CA")} delta={<Delta now={now.clicks} before={before.clicks} />} hint="Buttons and links people pressed" />
          <Kpi label="Visits" value={now.sessions.toLocaleString("en-CA")} delta={<Delta now={now.sessions} before={before.sessions} />} hint="A visit ends after 30 idle minutes" />
          <Kpi
            label="Time on page"
            value={minutes(now.avgTimeMs)}
            delta={<Delta now={now.avgTimeMs} before={before.avgTimeMs} />}
            hint="Average time a page stays open and visible"
          />
          <Kpi
            label="Bounce rate"
            value={now.sessions ? `${Math.round(now.bounceRate * 100)}%` : "—"}
            delta={<Delta now={now.bounceRate} before={before.bounceRate} lowerIsBetter />}
            hint="Visits that saw only one page"
          />
        </div>
      </div>

      <Card title={`Traffic, last ${RANGE_LABEL[range]}`} className="mb-5">
        <TrafficChart data={a.series} hourly={range === "24h"} />
      </Card>

      {/* geography */}
      <Card
        title="Where visitors come from"
        actions={
          known > 0 ? (
            <span className="text-xs text-muted">
              <span className="num font-bold text-navy">{Math.round((canada / known) * 100)}%</span> from Canada
            </span>
          ) : null
        }
        className="mb-5"
        pad={false}
      >
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div className="border-b border-line p-5 lg:border-b-0 lg:border-r">
            <p className="mb-3 text-sm font-bold text-navy">Canada by province</p>
            <ProvinceMap counts={provinceCounts} />
            <div className="mt-4">
              <BarList
                rows={a.provinces.map((p) => ({ key: p.label, label: regionName("CA", p.label), value: p.value }))}
                empty="Provinces appear once Canadian visitors arrive."
              />
            </div>
          </div>
          <div className="grid content-start">
            <div className="border-b border-line">
              <p className="px-5 pt-5 text-sm font-bold text-navy">Countries</p>
              <BarList
                rows={a.countries.map((c) => ({
                  key: c.code || "unknown",
                  label: (
                    <>
                      <span className="mr-2" aria-hidden>{flag(c.code)}</span>
                      {c.code ? countryName(c.code) : "Local / unknown"}
                    </>
                  ),
                  value: c.value,
                }))}
                empty="No visits yet. Local test traffic shows as “Local / unknown”."
              />
            </div>
            <div className="border-b border-line">
              <p className="px-5 pt-5 text-sm font-bold text-navy">Cities</p>
              <BarList
                rows={a.cities.map((c) => ({
                  key: `${c.label}-${c.code}-${c.country}`,
                  label: (
                    <>
                      <span className="mr-2" aria-hidden>{flag(c.country)}</span>
                      {c.label}
                    </>
                  ),
                  sub: regionName(c.country, c.code),
                  value: c.value,
                }))}
                empty="Cities appear when a visitor's location can be looked up."
              />
            </div>
            <div>
              <p className="px-5 pt-5 text-sm font-bold text-navy">United States by state</p>
              <BarList rows={a.states.map((s) => ({ key: s.label, label: s.label, value: s.value }))} empty="No US visitors in this period." />
            </div>
          </div>
        </div>
      </Card>

      <div className="mb-5 grid gap-5 xl:grid-cols-2">
        <Card title="Top pages" pad={false}>
          <BarList
            rows={a.pages.map((p) => ({ key: p.label, label: p.label, value: p.value, sub: `${p.sub} visitor${p.sub === 1 ? "" : "s"}`, title: p.label }))}
            empty="Pages people open will be ranked here."
          />
        </Card>
        <Card title="What people click" pad={false}>
          <BarList
            rows={a.clicks.map((c, i) => {
              const cut = c.label.indexOf("|");
              const [type, label] = cut > 0 ? [c.label.slice(0, cut), c.label.slice(cut + 1)] : ["click", c.label];
              return {
                key: `${c.label}-${i}`,
                label: (
                  <>
                    {type !== "click" && (
                      <span className="mr-2 rounded-full bg-accent/10 px-2 py-0.5 text-[0.6875rem] font-bold text-accent-deep">{EVENT_NAMES[type] ?? type}</span>
                    )}
                    {label || "—"}
                  </>
                ),
                value: c.value,
                sub: `${c.sub} people`,
              };
            })}
            empty="Add-to-cart presses, checkout, product cards, social links and other buttons are counted here."
          />
        </Card>
      </div>

      <div className="mb-5 grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Card title="From visit to order">
          <FunnelChart steps={a.funnel} />
          <p className="mt-3 text-xs text-muted">Unique visitors at each step. Orders count paid orders in the same period.</p>
        </Card>
        <Card title="Traffic sources" pad={false}>
          <BarList
            rows={a.sources.map((s) => ({ key: s.label, label: s.label, value: s.value, sub: "visits" }))}
            empty="Google, Instagram, TikTok and other referrers show here. Typed-in or bookmarked visits count as Direct."
          />
          {a.campaigns.length > 0 && (
            <div className="border-t border-line">
              <p className="px-5 pt-4 text-xs font-bold uppercase tracking-wider text-faint">Campaigns (UTM)</p>
              <BarList rows={a.campaigns.map((c) => ({ key: c.label, label: c.label, value: c.value }))} empty="" />
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Card title="Devices" pad={false}>
          <BarList rows={a.devices.map((d) => ({ key: d.label, label: d.label, value: d.value }))} empty="No visits yet." />
        </Card>
        <Card title="Browsers" pad={false}>
          <BarList rows={a.browsers.map((d) => ({ key: d.label, label: d.label, value: d.value }))} empty="No visits yet." />
        </Card>
        <Card title="Operating systems" pad={false}>
          <BarList rows={a.os.map((d) => ({ key: d.label, label: d.label, value: d.value }))} empty="No visits yet." />
        </Card>
      </div>
    </>
  );
}
