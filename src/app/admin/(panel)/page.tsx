import Link from "next/link";
import { dashboard } from "@/lib/dashboard";
import { BarList, Funnel, Kpi, SERIES, TrendChart } from "@/components/admin/charts";
import { Card, Empty, PageHeader, Pill, money, rangeOf, timeAgo } from "@/components/admin/ui";

const ACTIVITY_ICON = {
  order: "M6 7h12l-1 13H7zM9 7a3 3 0 0 1 6 0",
  signup: "M4 6h16v12H4zM4 7l8 6 8-6",
  cart: "M12 7v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18",
  message: "M4 5h16v11H9l-5 4z",
} as const;
const ACTIVITY_TINT = { order: "bg-[#e7f6ec] text-[#1f7a3d]", signup: "bg-[#e8f0fb] text-[#1f4f99]", cart: "bg-[#fff1e6] text-[#9a3f05]", message: "bg-[#f1ecfb] text-[#5b3fb0]" } as const;

export default async function AdminOverview({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const days = rangeOf((await searchParams).range);
  const d = await dashboard(days);
  const k = d.kpis;

  return (
    <>
      <PageHeader title="Overview" sub={`Your store over the last ${days} days`} sample={d.sample} />
      <div className="space-y-6 px-5 pb-12 pt-4 sm:px-8">
        {/* live strip */}
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#e4e8ef] bg-white px-4 py-2 text-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2f9a4a] opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#2f9a4a]" />
            </span>
            <strong className="num text-[#12233f]">{k.live}</strong> <span className="text-[#5b6b82]">on the site now</span>
          </span>
          <Link href="/admin/carts" className="inline-flex items-center gap-2 rounded-full border border-[#e4e8ef] bg-white px-4 py-2 text-sm hover:border-[#12233f]">
            <strong className="num text-[#12233f]">{k.activeCarts}</strong> <span className="text-[#5b6b82]">active carts</span>
          </Link>
          <Link href="/admin/carts" className="inline-flex items-center gap-2 rounded-full border border-[#e4e8ef] bg-white px-4 py-2 text-sm hover:border-[#12233f]">
            <strong className="num text-[#12233f]">{money(k.abandonedValue)}</strong> <span className="text-[#5b6b82]">in {k.abandoned} abandoned carts</span>
          </Link>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Kpi label="Revenue" value={k.revenue.value} f="money" change={k.revenue.change} series={k.revenue.series} color={SERIES.orange} />
          <Kpi label="Orders" value={k.orders.value} f="int" change={k.orders.change} series={k.orders.series} />
          <Kpi label="Average order value" value={k.aov.value} f="money" change={k.aov.change} />
          <Kpi label="Visitors" value={k.visitors.value} f="int" change={k.visitors.change} series={k.visitors.series} />
          <Kpi label="Conversion rate" value={k.conversion.value} f="pct" change={k.conversion.change} />
          <Kpi label="Newsletter sign-ups" value={k.signups.value} f="int" change={k.signups.change} series={k.signups.series} />
        </div>

        {/* trends: two single-series charts, never one dual-axis chart */}
        <div className="grid gap-6 xl:grid-cols-2">
          <TrendChart title="Revenue" data={d.revenueSeries} f="money" color={SERIES.orange} />
          <TrendChart title="Daily visitors" data={d.visitorSeries} f="int" color={SERIES.navy} total={d.kpis.visitors.value} totalLabel="unique visitors in this period" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card title="Conversion funnel" sub="Unique visitors at each step">
            <Funnel steps={d.funnel} />
          </Card>
          <Card title="Live activity" sub="The latest orders, sign-ups, carts and messages">
            {d.activity.length ? (
              <ul className="space-y-3">
                {d.activity.map((a, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${ACTIVITY_TINT[a.kind]}`} aria-hidden>
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={ACTIVITY_ICON[a.kind]} />
                      </svg>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-[#12233f]">{a.text}</span>
                      <span className="block truncate text-xs text-[#8d99ab]">{a.where}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      {a.value > 0 && <span className="num block font-bold text-[#12233f]">{money(a.value)}</span>}
                      <span className="block text-xs text-[#8d99ab]">{timeAgo(a.at)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty text="Activity shows up here as visitors shop." />
            )}
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <Card title="Top products" sub="By revenue">
            <BarList items={d.topProducts.map((p) => ({ label: p.name, value: p.revenue }))} f="money" color={SERIES.orange} empty="No sales in this period yet" />
          </Card>
          <Card title="Sales by province" sub="Revenue by shipping address">
            <BarList items={d.provinces} f="money" empty="No sales in this period yet" />
          </Card>
          <Card title="Traffic sources" sub="Where visitors came from">
            <BarList items={d.sources} f="int" empty="No visits in this period yet" />
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
          <Card title="Recent orders" action={<Link href="/admin/orders" className="text-sm font-semibold text-[#9c3d06] hover:underline">View all</Link>}>
            {d.orders.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-wider text-[#8d99ab]">
                    <tr>
                      <th className="pb-2 font-semibold">Order</th>
                      <th className="pb-2 font-semibold">Customer</th>
                      <th className="pb-2 font-semibold">Province</th>
                      <th className="pb-2 font-semibold">Status</th>
                      <th className="pb-2 text-right font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef1f5]">
                    {d.orders.slice(0, 6).map((o) => (
                      <tr key={o.id}>
                        <td className="py-2.5 font-semibold text-[#12233f]">{o.number}<span className="block text-xs font-normal text-[#8d99ab]">{timeAgo(o.at)}</span></td>
                        <td className="py-2.5 text-[#5b6b82]">{o.name || o.email}</td>
                        <td className="py-2.5 text-[#5b6b82]">{o.province}</td>
                        <td className="py-2.5"><Pill status="Paid" /></td>
                        <td className="num py-2.5 text-right font-bold text-[#12233f]">{money(o.totalCents)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty text="Orders appear here once customers check out." />
            )}
          </Card>
          <Card title="Inventory" sub={`${d.inventory.total} products in the catalogue`}>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#e7f6ec] p-4">
                <p className="num text-2xl font-extrabold text-[#1f7a3d]">{d.inventory.inStock}</p>
                <p className="text-xs font-semibold text-[#1f7a3d]">✓ In stock</p>
              </div>
              <div className="rounded-xl bg-[#fdecec] p-4">
                <p className="num text-2xl font-extrabold text-[#b42318]">{d.inventory.soldOut}</p>
                <p className="text-xs font-semibold text-[#b42318]">✕ Sold out</p>
              </div>
            </div>
            <div className="mt-5">
              <BarList items={d.inventory.byCategory} f="int" limit={6} />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
