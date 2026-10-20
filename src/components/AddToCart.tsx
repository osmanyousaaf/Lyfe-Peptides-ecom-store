"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import type { Product, Variant } from "@/lib/types";
import { Stepper } from "./CartDrawer";

export default function AddToCart({ product }: { product: Product }) {
  const { add } = useCart();
  const variable = product.type === "variable";
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const available = (attr: string, value: string) =>
    product.variants.some(
      (v) =>
        v.attrs[attr] === value &&
        Object.entries(picked).every(([k, val]) => k === attr || v.attrs[k] === val)
    );

  const variant: Variant | undefined = useMemo(() => {
    if (!variable || !product.attributes.every((a) => picked[a.name])) return undefined;
    return product.variants.find((v) =>
      Object.entries(picked).every(([k, val]) => v.attrs[k] === val)
    );
  }, [variable, product, picked]);

  const unit = variable ? variant?.priceCents ?? product.priceMin ?? product.priceCents : product.priceCents;
  const ready = !variable || Boolean(variant);
  const canBuy = ready && product.inStock;

  function addToCart() {
    if (!canBuy) return;
    add(
      {
        key: `${product.id}:${variant?.id ?? "base"}`,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.image,
        variantId: variant?.id,
        variantLabel: variant ? Object.values(variant.attrs).join(" · ") : undefined,
        unitPriceCents: unit,
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="flex flex-col gap-8">
      <p className="num flex items-baseline gap-3">
        {variable && !variant && <span className="text-small text-muted">From</span>}
        <span className="head">
          {formatPrice(unit)}
        </span>
        <span className="text-small text-muted">CAD</span>
      </p>

      {variable &&
        product.attributes.map((attr) => (
          <fieldset key={attr.name}>
            <legend className="mb-3 text-small font-medium">{attr.name}</legend>
            <div className="flex flex-wrap gap-2">
              {attr.options.map((opt) => {
                const on = picked[attr.name] === opt;
                const ok = available(attr.name, opt);
                return (
                  <button
                    key={opt}
                    disabled={!ok && !on}
                    aria-pressed={on}
                    onClick={() => setPicked((s) => ({ ...s, [attr.name]: opt }))}
                    className={`min-h-[44px] px-4 text-small transition-colors duration-150 active:translate-y-px ${
                      on
                        ? "rounded-lg border border-navy bg-navy text-white"
                        : ok
                          ? "rounded-lg border border-line bg-white text-ink hover:border-navy"
                          : "cursor-not-allowed rounded-lg border border-line bg-surface text-faint line-through"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}

      <div className="flex items-stretch gap-3">
        <Stepper qty={qty} dec={() => setQty((q) => Math.max(1, q - 1))} inc={() => setQty((q) => q + 1)} />
        <button onClick={addToCart} disabled={!canBuy} className="btn btn-solid flex-1">
          {added
            ? "Added to cart"
            : !product.inStock
              ? "Sold out"
              : !ready
                ? `Choose ${product.attributes.map((a) => a.name.toLowerCase()).join(" and ")}`
                : "Add to cart"}
        </button>
      </div>

      {!product.inStock && (
        <p className="text-muted">This compound is out of stock for now. Check back soon.</p>
      )}
    </div>
  );
}
