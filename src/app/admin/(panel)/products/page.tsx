import Image from "next/image";
import Link from "next/link";
import { dashboard } from "@/lib/dashboard";
import { BarList, Kpi, SERIES } from "@/components/admin/charts";
import { Card, PageHeader, Pill, money, rangeOf } from "@/components/admin/ui";

const SORTS = { revenue: "Revenue", units: "Units sold", views: "Views", inCarts: "In carts" } as const;
type SortKey = keyof typeof SORTS;

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ range?: string; sort?: string; stock?: string }> }) {
  const { range, sort = "revenue", stock = "all" } = await searchParams;
  const days = rangeOf(range);
  const d = await dashboard(days);
  const key: SortKey = sort in SORTS ? (sort as SortKey) : "revenue";
  const rows = d.products
    .filter((p) => (stock === "in" ? p.inStock : stock === "out" ? !p.inStock : true))
    .sort((a, b) => b[key] - a[key] || a.name.localeCompare(b.name));
  const unitsSold = d.products.reduce((s, p) => s + p.units, 0);
  const viewsTotal = d.products.reduce((s, p) => s + p.views, 0);
  const qs = (o: Record<string, string>) => "?" + new URLSearchParams({ range: String(days), sort: key, stock, ...o }).toString();

  return (
    <>
      <PageHeader title="Products" sub={`Catalogue performance over the last ${days} days`} sample={d.sample} />
      <div className="space-y-6 px-5 pb-12 pt-4 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi label="Products" value={d.inventory.total} f="int" hint={`${d.inventory.inStock} in stock · ${d.inventory.soldOut} sold out`} />
          <Kpi label="Units sold" value={unitsSold} f="int" hint="Across all orders in the period" />
          <Kpi label="Product page views" value={viewsTotal} f="int" hint="Views of /product pages" />
          <Kpi label="Units sitting in carts" value={d.products.reduce((s, p) => s + p.inCarts, 0)} f="int" hint="In active or abandoned carts" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Best sellers" sub="Units sold">
            <BarList items={[...d.products].sort((a, b) => b.units - a.units).filter((p) => p.units).map((p) => ({ label: p.name, value: p.units }))} f="int" color={SERIES.orange} empty="No sales yet" />
          </Card>
          <Card title="Most viewed" sub="Product page views">
            <BarList items={[...d.products].sort((a, b) => b.views - a.views).filter((p) => p.views).map((p) => ({ label: p.name, value: p.views }))} f="int" empty="No product views yet" />
          </Card>
        </div>

        <Card
          title={`All products (${rows.length})`}
          action={
            <div className="flex flex-wrap gap-2 text-sm">
              {[
                ["all", "All"],
                ["in", "In stock"],
                ["out", "Sold out"],
              ].map(([v, l]) => (
                <Link key={v} href={qs({ stock: v })} className={`rounded-lg px-3 py-1.5 font-semibold ${stock === v ? "bg-[#12233f] text-white" : "bg-[#f1f4f8] text-[#5b6b82]"}`}>
                  {l}
                </Link>
              ))}
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-[#8d99ab]">
                <tr>
                  <th className="pb-3 font-semibold">Product</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Price</th>
                  {(Object.keys(SORTS) as SortKey[]).map((s) => (
                    <th key={s} className="pb-3 text-right font-semibold">
                      <Link href={qs({ sort: s })} className={key === s ? "text-[#12233f]" : "hover:text-[#12233f]"}>
                        {SORTS[s]} {key === s ? "↓" : ""}
                      </Link>
                    </th>
                  ))}
                  <th className="pb-3 text-right font-semibold">Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef1f5]">
                {rows.map((p) => (
                  <tr key={p.slug}>
                    <td className="py-2.5">
                      <Link href={`/product/${p.slug}`} target="_blank" className="flex items-center gap-3">
                        <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-[#eef1f5]">
                          <Image src={p.image} alt="" fill sizes="44px" className="blend object-cover" />
                        </span>
                        <span>
                          <span className="block font-semibold text-[#12233f] hover:underline">{p.name}</span>
                          <span className="block text-xs text-[#8d99ab]">{p.category}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="py-2.5"><Pill status={p.inStock ? "In stock" : "Sold out"} /></td>
                    <td className="num py-2.5 text-[#5b6b82]">{money(p.priceCents)}</td>
                    <td className="num py-2.5 text-right font-bold text-[#12233f]">{money(p.revenue)}</td>
                    <td className="num py-2.5 text-right text-[#12233f]">{p.units}</td>
                    <td className="num py-2.5 text-right text-[#12233f]">{p.views}</td>
                    <td className="num py-2.5 text-right text-[#12233f]">{p.inCarts}</td>
                    <td className="num py-2.5 text-right text-[#5b6b82]">{p.views ? ((p.units / p.views) * 100).toFixed(1) + "%" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-[#8d99ab]">Stock status and prices come from the product catalogue (src/data/products.json).</p>
        </Card>
      </div>
    </>
  );
}
