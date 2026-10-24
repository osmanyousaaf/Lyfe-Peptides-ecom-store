import { dashboard } from "@/lib/dashboard";
import { BarList, Kpi, SERIES, TrendChart } from "@/components/admin/charts";
import { Card, Empty, PageHeader, money, rangeOf, timeAgo } from "@/components/admin/ui";

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const days = rangeOf((await searchParams).range);
  const d = await dashboard(days);

  // customers = unique emails across paid orders
  const byEmail = new Map<string, { email: string; name: string; orders: number; spent: number; last: string; province: string }>();
  for (const o of d.orders) {
    const cur = byEmail.get(o.email) ?? { email: o.email, name: o.name, orders: 0, spent: 0, last: o.at, province: o.province };
    byEmail.set(o.email, { ...cur, orders: cur.orders + 1, spent: cur.spent + o.totalCents, last: o.at > cur.last ? o.at : cur.last });
  }
  const customers = [...byEmail.values()].sort((a, b) => b.spent - a.spent);
  const repeat = customers.filter((c) => c.orders > 1).length;

  return (
    <>
      <PageHeader title="Customers" sub={`Buyers and newsletter sign-ups over the last ${days} days`} sample={d.sample} />
      <div className="space-y-6 px-5 pb-12 pt-4 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi label="Customers" value={customers.length} f="int" hint="Unique buyers in the period" />
          <Kpi label="Repeat customers" value={repeat} f="int" hint={customers.length ? `${((repeat / customers.length) * 100).toFixed(0)}% ordered more than once` : "—"} />
          <Kpi label="Newsletter sign-ups" value={d.kpis.signups.value} f="int" change={d.kpis.signups.change} series={d.kpis.signups.series} />
          <Kpi label="Total subscribers" value={d.subscribers.length} f="int" hint="All time" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
          <TrendChart title="Sign-ups" data={d.kpis.signups.series} f="int" color={SERIES.navy} />
          <Card title="Where sign-ups come from">
            <BarList items={d.signupSources} f="int" empty="No sign-ups yet" />
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card title="Top customers" sub="By spend in the period">
            {customers.length ? (
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-[#8d99ab]">
                  <tr>
                    <th className="pb-2 font-semibold">Customer</th>
                    <th className="pb-2 text-right font-semibold">Orders</th>
                    <th className="pb-2 text-right font-semibold">Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef1f5]">
                  {customers.slice(0, 15).map((c) => (
                    <tr key={c.email}>
                      <td className="py-2.5">
                        <span className="block font-semibold text-[#12233f]">{c.name || c.email}</span>
                        <span className="block text-xs text-[#8d99ab]">{c.email} · {c.province} · last order {timeAgo(c.last)}</span>
                      </td>
                      <td className="num py-2.5 text-right text-[#12233f]">{c.orders}</td>
                      <td className="num py-2.5 text-right font-bold text-[#12233f]">{money(c.spent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <Empty text="Customers appear here after their first order." />
            )}
          </Card>
          <Card title="Latest subscribers" sub={`${d.subscribers.length} on the list`}>
            {d.subscribers.length ? (
              <ul className="divide-y divide-[#eef1f5] text-sm">
                {d.subscribers.slice(0, 15).map((s) => (
                  <li key={s.email + s.at} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="truncate font-semibold text-[#12233f]">{s.email}</span>
                    <span className="shrink-0 text-xs text-[#8d99ab]">
                      {s.source === "welcome-popup" ? "Pop-up" : "Newsletter"} · {timeAgo(s.at)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty text="No subscribers yet." />
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
