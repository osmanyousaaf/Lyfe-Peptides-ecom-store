import type { Metadata } from "next";
import ProductEditor from "@/components/admin/catalog/ProductEditor";
import { PageHeader } from "@/components/admin/ui";
import { adminListProducts } from "@/lib/products";
import { saveProductAction } from "../actions";

export const metadata: Metadata = { title: "New product" };

export default function NewProductPage() {
  const categories = [...new Set(adminListProducts().flatMap((p) => p.categories))].sort();
  return (
    <>
      <PageHeader title="New product" description="Starts as a draft until you set it live." back={{ href: "/admin/products", label: "Products" }} />
      <ProductEditor action={saveProductAction} categorySuggestions={categories} />
    </>
  );
}
