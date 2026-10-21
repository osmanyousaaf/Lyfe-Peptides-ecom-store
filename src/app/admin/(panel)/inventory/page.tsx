import type { Metadata } from "next";
import InventoryTable, { type InvRow } from "@/components/admin/catalog/InventoryTable";
import { PageHeader, Stat } from "@/components/admin/ui";
import { adminListProducts } from "@/lib/products";

export const metadata: Metadata = { title: "Inventory" };

export default function InventoryPage() {
  const rows: InvRow[] = adminListProducts().flatMap((p): InvRow[] => {
    const base = { productId: p.id, name: p.name, image: p.image, lowStockAt: p.lowStockAt ?? 5, status: p.status ?? "published", onSale: p.inStock || p.type === "variable" };
    return p.type === "variable"
      ? p.variants.map((v, i) => ({
          ...base,
          key: `v${v.id}`,
          kind: "variant" as const,
          id: v.id,
          variant: Object.values(v.attrs).join(" · "),
          sku: v.sku ?? null,
          stock: v.stock ?? null,
          first: i === 0,
          count: p.variants.length,
        }))
      : [{ ...base, key: `p${p.id}`, kind: "product" as const, id: p.id, variant: null, sku: p.sku ?? null, stock: p.stock ?? null, first: true, count: 1 }];
  });

  const tracked = rows.filter((r) => r.stock !== null);
  const out = tracked.filter((r) => r.stock === 0).length;
  const low = tracked.filter((r) => r.stock! > 0 && r.stock! <= r.lowStockAt).length;

  return (
    <>
      <PageHeader title="Inventory" description="Units on hand for every product and variant. Paid orders take stock out automatically." />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Units on hand" value={tracked.reduce((n, r) => n + (r.stock ?? 0), 0).toLocaleString("en-CA")} sub={`${tracked.length} tracked items`} />
        <Stat label="Low stock" value={low} tone={low ? "accent" : "navy"} sub="At or below alert level" />
        <Stat label="Out of stock" value={out} tone={out ? "accent" : "navy"} sub="Shown as sold out" />
        <Stat label="Not tracked" value={rows.length - tracked.length} sub="Never sell out on their own" />
      </div>
      <InventoryTable rows={rows} />
    </>
  );
}
