import { Suspense } from "react";
import type { Metadata } from "next";
import ShopClient from "@/components/ShopClient";
import { getAllProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse research-grade peptides and accessories. Filter by research goal, third-party verified, shipped from Canada.",
};

export default function ShopPage() {
  const products = getAllProducts();
  return (
    <Suspense fallback={<div className="wrap py-20 text-muted">Loading the catalog…</div>}>
      <ShopClient products={products} />
    </Suspense>
  );
}
