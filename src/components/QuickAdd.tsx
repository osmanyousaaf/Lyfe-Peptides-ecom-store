"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/types";

export default function QuickAdd({ product }: { product: Product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        add({
          key: `${product.id}:base`,
          productId: product.id,
          slug: product.slug,
          name: product.name,
          image: product.image,
          unitPriceCents: product.priceCents,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 1600);
      }}
      className="btn btn-navy btn-sm w-full"
    >
      {added ? "Added" : "Add to cart"}
    </button>
  );
}
