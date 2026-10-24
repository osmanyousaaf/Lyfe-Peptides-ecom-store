import { dashboard } from "@/lib/dashboard";
import { BarList, Kpi, SERIES, TrendChart } from "@/components/admin/charts";
import { Card, Empty, PageHeader, Pill, money, rangeOf, timeAgo } from "@/components/admin/ui";

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ range?: string; q?: string }> }) {
  const { range, q = "" } = await searchParams;
  const days = rangeOf(range);
  const d = await dashboard(days);
  const term = q.trim().toLowerCase();
  const orders = term
    ? d.orders.filter((o) => [o.number, o.name, o.email, o.province, o.city, ...o.items.map((i) => i.name)].join(" ").toLowerCase().includes(term))
    : d.orders;

  return (
    <>
      <PageHeader title="Orders" sub={`Paid orders over the last ${days} days`} sample={d.sample} />
      <div className="space-y-6 px-5 pb-12 pt-4 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi label="Revenue" value={d.kpis.revenue.value} f="money" change={d.kpis.revenue.change} />
          <Kpi label="Orders" value={d.kpis.orders.value} f="int" change={d.kpis.orders.change} />
          <Kpi label="Average order value" value={d.kpis.aov.value} f="money" change={d.kpis.aov.change} />
          <Kpi label="Discounts given" value={d.kpis.discounts} f="money" hint={`${d.kpis.promoOrders} orders used a code`} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
          <TrendChart title="Orders" data={d.kpis.orders.series} f="int" color={SERIES.navy} />
          <Card title="By province" sub="Revenue by shipping address">
            <BarList items={d.provinces} f="money" empty="No orders yet" />
          </Card>
        </div>

        <Card
          title={`All orders (${orders.length})`}
          action={
            <form className="flex gap-2">
              <input type="hidden" name="range" value={days} />
              <input name="q" defaultValue={q} placeholder="Search orders, customers, products" className="h-10 w-56 rounded-lg border border-[#e4e8ef] px-3 text-sm outline-none focus:border-[#12233f] sm:w-72" />
              <button className="rounded-lg bg-[#12233f] px-4 text-sm font-semibold text-white">Search</button>
            </form>
          }
        >
          {orders.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-[#8d99ab]">
                  <tr>
                    <th className="pb-3 font-semibold">Order</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Items</th>
                    <th className="pb-3 font-semibold">Ships to</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef1f5]">
                  {orders.slice(0, 200).map((o) => (
                    <tr key={o.id} className="align-top">
                      <td className="py-3 font-semibold text-[#12233f]">
                        {o.number}
                        <span className="block text-xs font-normal text-[#8d99ab]">{new Date(o.at).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" })}</span>
                      </td>
                      <td className="py-3">
                        <span className="block font-semibold text-[#12233f]">{o.name || "—"}</span>
                        <span className="block text-xs text-[#5b6b82]">{o.email}</span>
                      </td>
                      <td className="py-3 text-[#5b6b82]">
                        {o.items.map((i) => (
                          <span key={i.name} className="block">
                            {i.qty} × {i.name}
                          </span>
                        ))}
                      </td>
                      <td className="py-3 text-[#5b6b82]">
                        {o.city ? `${o.city}, ` : ""}
                        {o.province}
                      </td>
                      <td className="py-3">
                        <Pill status="Paid" />
                        {o.discountCents > 0 && <span className="mt-1 block text-xs text-[#9c3d06]">{o.promo ?? "Code"} −{money(o.discountCents)}</span>}
                      </td>
                      <td className="num py-3 text-right font-bold text-[#12233f]">
                        {money(o.totalCents)}
                        <span className="block text-xs font-normal text-[#8d99ab]">{timeAgo(o.at)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty text={term ? "No orders match that search." : "Orders appear here once customers check out through Stripe."} />
          )}
        </Card>
      </div>
    </>
  );
}
