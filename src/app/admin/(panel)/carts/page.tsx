import Link from "next/link";
import { dashboard, provinceName } from "@/lib/dashboard";
import { Kpi } from "@/components/admin/charts";
import { Card, Empty, PageHeader, Pill, money, timeAgo } from "@/components/admin/ui";

const TABS = ["All", "Active", "Abandoned", "Purchased"] as const;

export default async function CartsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "All" } = await searchParams;
  const d = await dashboard(30);
  const tab = (TABS as readonly string[]).includes(status) ? status : "All";
  const carts = tab === "All" ? d.carts : d.carts.filter((c) => c.status === tab);
  const of = (s: string) => d.carts.filter((c) => c.status === s);
  const value = (rows: typeof d.carts) => rows.reduce((s, c) => s + c.subtotalCents, 0);
  const recovered = of("Purchased").length;
  const total = d.carts.length;

  return (
    <>
      <PageHeader title="Carts" sub="Every cart from the last 30 days: still shopping, left behind, or bought" sample={d.sample} range={false} />
      <div className="space-y-6 px-5 pb-12 pt-4 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi label="Active right now" value={of("Active").length} f="int" hint={`${money(value(of("Active")))} in carts, updated in the last 30 min`} />
          <Kpi label="Abandoned carts" value={of("Abandoned").length} f="int" hint={`${money(value(of("Abandoned")))} left behind`} />
          <Kpi label="Carts that became orders" value={recovered} f="int" hint={`${money(value(of("Purchased")))} bought`} />
          <Kpi label="Cart-to-order rate" value={total ? recovered / total : 0} f="pct" hint={`${total} carts in 30 days`} />
        </div>

        <Card
          title="Carts"
          sub="Status updates live: Active means changed in the last 30 minutes"
          action={
            <div className="flex flex-wrap gap-2 text-sm">
              {TABS.map((t) => (
                <Link key={t} href={`/admin/carts?status=${t}`} className={`rounded-lg px-3 py-1.5 font-semibold ${tab === t ? "bg-[#12233f] text-white" : "bg-[#f1f4f8] text-[#5b6b82]"}`}>
                  {t} <span className="num opacity-70">{t === "All" ? total : of(t).length}</span>
                </Link>
              ))}
            </div>
          }
        >
          {carts.length ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {carts.slice(0, 120).map((c) => (
                <article key={c.vid} className="rounded-xl border border-[#e4e8ef] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <Pill status={c.status} />
                    <span className="text-xs text-[#8d99ab]">{timeAgo(c.at)}</span>
                  </div>
                  <ul className="mt-3 space-y-1 text-sm">
                    {c.lines.map((l) => (
                      <li key={l.slug + (l.variantLabel ?? "")} className="flex justify-between gap-3">
                        <span className="truncate text-[#12233f]">
                          {l.qty} × {l.name}
                          {l.variantLabel && <span className="text-[#8d99ab]"> · {l.variantLabel}</span>}
                        </span>
                        <span className="num shrink-0 text-[#5b6b82]">{money(l.qty * l.unitPriceCents)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex items-center justify-between border-t border-[#eef1f5] pt-3 text-sm">
                    <span className="text-[#8d99ab]">{provinceName(c.region)}{c.city ? ` · ${c.city}` : ""}</span>
                    <span className="num font-bold text-[#12233f]">{money(c.subtotalCents)}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <Empty text="No carts here yet." />
          )}
          <p className="mt-4 text-xs text-[#8d99ab]">
            Carts are anonymous: there&rsquo;s no email until checkout. To send abandoned-cart emails, connect Stripe Checkout&rsquo;s recovery
            emails or an email tool.
          </p>
        </Card>
      </div>
    </>
  );
}
