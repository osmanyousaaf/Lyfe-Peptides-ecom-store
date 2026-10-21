import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import ManualOrderForm, { type PickProduct } from "@/components/admin/sales/ManualOrderForm";
import { adminListProducts } from "@/lib/products";
import { createManualOrder } from "../actions";

export const metadata: Metadata = { title: "New order" };

export default function NewOrderPage() {
  const products: PickProduct[] = adminListProducts().map((p) => ({
    id: p.id,
    name: p.name,
    image: p.image,
    priceCents: p.priceCents,
    stock: p.stock ?? null,
    draft: p.status === "draft",
    variants: p.type === "variable" ? p.variants.map((v) => ({ id: v.id, label: Object.values(v.attrs).join(" · "), priceCents: v.priceCents, stock: v.stock ?? null })) : [],
  }));
  return (
    <>
      <PageHeader
        back={{ href: "/admin/orders", label: "Orders" }}
        title="New manual order"
        description="For phone, email or e-transfer orders. Prices come from the catalog."
      />
      <ManualOrderForm products={products} action={createManualOrder} />
    </>
  );
}
