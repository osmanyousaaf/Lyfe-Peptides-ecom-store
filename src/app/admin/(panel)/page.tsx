import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Card, EmptyState, PageHeader, formatDate } from "@/components/admin/ui";
import RevenueChart from "@/components/admin/sales/RevenueChart";
import StatusBadge from "@/components/admin/sales/StatusBadge";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { isUpload } from "@/lib/img";
import { recentOrders, salesSummary, statusCounts } from "@/lib/orders";
import { adminListProducts } from "@/lib/products";
import { glance } from "@/lib/analytics";
import { countryName, flag, liveData, regionName } from "@/lib/analytics-view";
import LivePanel from "@/components/admin/analytics/LivePanel";

export const metadata: Metadata = { title: "Dashboard" };

const RANGES = [7, 30, 90] as const;

// signed change vs the previous period; up is good for every metric here
function Delta({ now, before }: { now: number; before: number }) {
  if (now === 0 && before === 0) return <span className="text-xs text-faint">No change</span>;
  if (before === 0) return <span className="text-xs font-semibold text-green">▲ New vs previous period</span>;
  const pct = Math.round(((now - before) / before) * 100);
  const up = pct >= 0;
  return (
    <span className={`text-xs font-semibold ${up ? "text-green" : "text-red-600"}`}>
      {up ? "▲" : "▼"} {Math.abs(pct)}% <span className="font-normal text-muted">vs previous period</span>
    </span>
  );
}

function Tile({ label, value, delta }: { label: string; value: string; delta: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <p className="text-sm font-semibold text-muted">{label}</p>
      <p className="mt-2 text-[1.875rem] font-extrabold leading-none tracking-tight text-navy">{value}</p>
      <p className="mt-2">{delta}</p>
    </div>
  );
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const r = Number((await searchParams).range);
  const days = (RANGES as readonly number[]).includes(r) ? r : 30;
  const s = salesSummary(days);
  const counts = statusCounts();
  const toFulfil = counts.paid + counts.processing;
  const recent = recentOrders(6);
  const newMessages = (db().prepare("SELECT COUNT(*) AS n FROM messages WHERE status = 'new'").get() as { n: number }).n;
  const newSubs = (db().prepare("SELECT COUNT(*) AS n FROM subscribers WHERE unsubscribed_at IS NULL AND created_at >= datetime('now', ?)").get(`-${days} days`) as { n: number }).n;

  // tracked stock at or below each product's alert level, variants listed separately
  const low = adminListProducts().flatMap((p) => {
    const at = p.lowStockAt ?? 5;
    if (p.type === "variable")
      return p.variants
        .filter((v) => v.stock != null && v.stock <= at)
        .map((v) => ({ key: `v${v.id}`, id: p.id, name: p.name, sub: Object.values(v.attrs).join(" · "), stock: v.stock!, image: p.image }));
    return p.stock != null && p.stock <= at ? [{ key: `p${p.id}`, id: p.id, name: p.name, sub: "", stock: p.stock, image: p.image }] : [];
  });
  low.sort((a, b) => a.stock - b.stock);

  const traffic = glance(days);
  const liveNow = liveData();

  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Toronto", weekday: "long", month: "long", day: "numeric" });

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={today}
        actions={
          <>
            <Link href="/admin/orders/new" className="btn btn-line btn-sm">+ Manual order</Link>
            <Link href="/admin/coupons/new" className="btn btn-line btn-sm">+ Coupon</Link>
            <Link href="/admin/products" className="btn btn-navy btn-sm">Manage products</Link>
          </>
        }
      />

      {/* to-do strip */}
      {(toFulfil > 0 || newMessages > 0 || low.length > 0) && (
        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          {[
            { n: toFulfil, label: toFulfil === 1 ? "order to fulfil" : "orders to fulfil", href: "/admin/orders?status=paid", tone: "bg-accent text-white" },
            { n: newMessages, label: newMessages === 1 ? "new message" : "new messages", href: "/admin/messages", tone: "bg-navy text-white" },
            { n: low.length, label: low.length === 1 ? "item low on stock" : "items low on stock", href: "/admin/inventory", tone: "bg-red-600 text-white" },
          ]
            .filter((t) => t.n > 0)
            .map((t) => (
              <Link key={t.href} href={t.href} className="group flex items-center gap-3 rounded-2xl border border-line bg-white p-4 transition hover:border-navy/30 hover:shadow-sm">
                <span className={`num grid h-10 min-w-10 place-items-center rounded-xl px-2 text-lg font-extrabold ${t.tone}`}>{t.n}</span>
                <span className="flex-1 text-sm font-semibold text-navy">{t.label}</span>
                <span className="text-muted transition group-hover:translate-x-0.5 group-hover:text-navy">→</span>
              </Link>
            ))}
        </div>
      )}

      {/* traffic at a glance */}
      <Link
        href="/admin/analytics"
        className="group mb-5 grid gap-4 rounded-2xl border border-line bg-white p-4 transition hover:border-navy/30 hover:shadow-sm sm:grid-cols-[auto_1fr_1fr_auto] sm:items-center sm:gap-6 sm:px-5"
      >
        <LivePanel initial={liveNow} compact />
        <span className="flex items-baseline gap-2 sm:border-l sm:border-line sm:pl-6">
          <span className="num text-xl font-extrabold text-navy">{traffic.visitors.toLocaleString("en-CA")}</span>
          <span className="text-sm text-muted">visitors, last {days} days</span>
          <Delta now={traffic.visitors} before={traffic.visitorsBefore} />
        </span>
        <span className="flex items-center gap-2 text-sm text-muted sm:border-l sm:border-line sm:pl-6">
          {traffic.topRegion ? (
            <>
              <span aria-hidden>{flag(traffic.topRegion.country)}</span>
              Top region:
              <span className="font-bold text-navy">
                {regionName(traffic.topRegion.country, traffic.topRegion.label)}, {countryName(traffic.topRegion.country)}
              </span>
            </>
          ) : (
            "Regions appear as visitors arrive"
          )}
        </span>
        <span className="text-sm font-semibold text-accent-deep transition group-hover:translate-x-0.5">Analytics →</span>
      </Link>

      {/* range filter: one row above everything it scopes */}
      <div className="mb-4 flex items-center gap-1 rounded-xl bg-white p-1 ring-1 ring-line sm:inline-flex" role="group" aria-label="Date range">
        {RANGES.map((d) => (
          <Link
            key={d}
            href={d === 30 ? "/admin" : `/admin?range=${d}`}
            aria-current={d === days ? "true" : undefined}
            className={`flex-1 rounded-lg px-4 py-1.5 text-center text-sm font-semibold transition sm:flex-none ${
              d === days ? "bg-navy text-white" : "text-muted hover:text-navy"
            }`}
          >
            Last {d} days
          </Link>
        ))}
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Tile label="Revenue" value={formatPrice(s.current.revenueCents)} delta={<Delta now={s.current.revenueCents} before={s.previous.revenueCents} />} />
        <Tile label="Orders" value={String(s.current.orders)} delta={<Delta now={s.current.orders} before={s.previous.orders} />} />
        <Tile label="Average order" value={formatPrice(s.current.aovCents)} delta={<Delta now={s.current.aovCents} before={s.previous.aovCents} />} />
        <Tile label="Items sold" value={String(s.current.items)} delta={<Delta now={s.current.items} before={s.previous.items} />} />
      </div>

      <Card title={`Revenue per day, last ${days} days`} className="mb-5">
        <RevenueChart data={s.series} />
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <Card title="Recent orders" actions={<Link href="/admin/orders" className="text-sm font-semibold text-accent-deep">View all</Link>} pad={false}>
          {recent.length === 0 ? (
            <EmptyState
              title="No orders yet"
              text="When a customer pays through Stripe, the order lands here with its items and shipping address. You can also enter one by hand."
              action={<Link href="/admin/orders/new" className="btn btn-navy btn-sm">Create a manual order</Link>}
            />
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/orders/${o.id}`} className="flex items-center gap-3 px-5 py-3 transition hover:bg-surface/60">
                    <span className="min-w-0 flex-1">
                      <span className="num block text-sm font-bold text-navy">{o.number}</span>
                      <span className="block truncate text-xs text-muted">
                        {o.name || o.email} · {formatDate(o.createdAt, true)}
                      </span>
                    </span>
                    <StatusBadge status={o.status} />
                    <span className="num w-24 text-right text-sm font-bold text-navy">{formatPrice(o.totalCents)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="grid content-start gap-5">
          <Card title="Top products" pad={false}>
            {s.top.length === 0 ? (
              <p className="px-5 py-6 text-sm text-muted">Best sellers for the period show up after the first sale.</p>
            ) : (
              <ol className="divide-y divide-line">
                {s.top.map((t, i) => (
                  <li key={`${t.slug}-${i}`} className="flex items-center gap-3 px-5 py-2.5">
                    <span className="num w-4 text-xs font-bold text-faint">{i + 1}</span>
                    <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-surface">
                      {t.image && <Image src={t.image} alt="" fill sizes="36px" unoptimized={isUpload(t.image)} className="object-cover mix-blend-multiply" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-navy">{t.name}</span>
                      <span className="text-xs text-muted">{t.qty} sold</span>
                    </span>
                    <span className="num text-sm font-bold text-navy">{formatPrice(t.revenue)}</span>
                  </li>
                ))}
              </ol>
            )}
          </Card>

          <Card title="Low stock" actions={<Link href="/admin/inventory" className="text-sm font-semibold text-accent-deep">Inventory</Link>} pad={false}>
            {low.length === 0 ? (
              <p className="px-5 py-6 text-sm text-muted">Nothing is running low. Products only alert when their stock is tracked.</p>
            ) : (
              <ul className="divide-y divide-line">
                {low.slice(0, 6).map((l) => (
                  <li key={l.key} className="flex items-center gap-3 px-5 py-2.5">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-navy">{l.name}</span>
                      {l.sub && <span className="text-xs text-muted">{l.sub}</span>}
                    </span>
                    <span className={`num rounded-full px-2 py-0.5 text-xs font-bold ${l.stock === 0 ? "bg-red-50 text-red-700" : "bg-accent/10 text-accent-deep"}`}>
                      {l.stock === 0 ? "Out" : `${l.stock} left`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Audience">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Link href="/admin/messages" className="rounded-xl bg-surface p-3 hover:bg-surface-2">
                <span className="num block text-xl font-extrabold text-navy">{newMessages}</span>
                <span className="text-muted">unread messages</span>
              </Link>
              <Link href="/admin/subscribers" className="rounded-xl bg-surface p-3 hover:bg-surface-2">
                <span className="num block text-xl font-extrabold text-navy">{newSubs}</span>
                <span className="text-muted">new subscribers</span>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
