"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import type { Product, Variant } from "@/lib/types";
import { CheckIcon, CloseIcon, PlusIcon } from "./icons";

// Card footer shared by every in-stock product: price on the left, one round cart
// button on the right. Products with options open a sheet inside the same card to
// pick them, instead of sending the shopper to a separate "Select options" link —
// so every card looks and behaves the same, whether it's a simple or variable product.
export default function QuickAdd({ product }: { product: Product }) {
  const { add } = useCart();
  const variable = product.type === "variable";
  const [sheet, setSheet] = useState(false);
  const [added, setAdded] = useState(false);
  const [picked, setPicked] = useState<Record<string, string>>(() => {
    const first = product.variants[0];
    return first ? { ...first.attrs } : {};
  });
  const sheetRef = useRef<HTMLDivElement>(null);

  const variant: Variant | undefined = useMemo(
    () => product.variants.find((v) => Object.entries(picked).every(([k, val]) => v.attrs[k] === val)),
    [product.variants, picked]
  );

  // keep the pick valid: switching one option can rule out the other
  const pick = (attr: string, value: string) => {
    const next = { ...picked, [attr]: value };
    const exact = product.variants.find((v) => Object.entries(next).every(([k, val]) => v.attrs[k] === val));
    const fallback = product.variants.find((v) => v.attrs[attr] === value);
    setPicked(exact ? next : fallback ? { ...fallback.attrs } : next);
  };

  const available = (attr: string, value: string) => product.variants.some((v) => v.attrs[attr] === value);

  useEffect(() => {
    if (!sheet) return;
    sheetRef.current?.querySelector<HTMLButtonElement>("[aria-pressed=true]")?.focus();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setSheet(false);
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [sheet]);

  const flash = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const addBase = () => {
    add({
      key: `${product.id}:base`,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      unitPriceCents: product.priceCents,
    });
    flash();
  };

  const addVariant = () => {
    if (!variant) return;
    add({
      key: `${product.id}:${variant.id}`,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      variantId: variant.id,
      variantLabel: Object.values(variant.attrs).join(" · "),
      unitPriceCents: variant.priceCents,
    });
    setSheet(false);
    flash();
  };

  const from = variable ? product.priceMin ?? product.priceCents : product.priceCents;

  return (
    <>
      <div className="flex items-end justify-between gap-2">
        <p className="num leading-tight">
          <span className="block text-[0.6875rem] font-semibold uppercase tracking-wider text-faint">
            {variable ? "From" : "Price"}
          </span>
          <span className="text-[1.0625rem] font-extrabold text-navy sm:text-lg">{formatPrice(from)}</span>
        </p>
        <button
          type="button"
          onClick={() => (variable ? setSheet(true) : addBase())}
          aria-label={variable ? `Choose options for ${product.name}` : `Add ${product.name} to cart`}
          aria-expanded={variable ? sheet : undefined}
          className={`group/add relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full px-0 text-white transition-all duration-300 ${
            added ? "bg-green" : "bg-navy hover:w-[7.25rem] hover:bg-accent focus-visible:w-[7.25rem] focus-visible:bg-accent"
          }`}
        >
          {added ? (
            <CheckIcon className="h-5 w-5" />
          ) : (
            <span className="flex items-center gap-2 whitespace-nowrap px-3 text-sm font-bold">
              <PlusIcon className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover/add:rotate-90" />
              <span className="hidden group-hover/add:inline group-focus-visible/add:inline">{variable ? "Options" : "Add"}</span>
            </span>
          )}
        </button>
      </div>

      {variable && (
        <div
          ref={sheetRef}
          role="dialog"
          aria-label={`${product.name} options`}
          aria-hidden={!sheet}
          inert={!sheet}
          className={`absolute inset-x-0 bottom-0 z-10 flex max-h-full flex-col rounded-b-xl border-t border-line bg-white/95 p-4 shadow-[0_-18px_40px_-24px_rgb(19_41_75/0.5)] backdrop-blur-md transition-all duration-300 ease-out ${
            sheet ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
          }`}
        >
          <div className="mb-3 flex items-start justify-between gap-2">
            <p className="text-sm font-bold leading-snug text-navy">{product.name}</p>
            <button type="button" onClick={() => setSheet(false)} className="-mr-1 -mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted hover:bg-surface" aria-label="Close options">
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="noscroll flex-1 overflow-y-auto">
            {product.attributes.map((attr) => (
              <fieldset key={attr.name} className="mb-3">
                <legend className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-faint">{attr.name}</legend>
                <div className="flex flex-wrap gap-1.5">
                  {attr.options.map((opt) => {
                    const on = picked[attr.name] === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        aria-pressed={on}
                        disabled={!available(attr.name, opt)}
                        onClick={() => pick(attr.name, opt)}
                        className={`min-h-[32px] rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                          on
                            ? "border-navy bg-navy text-white shadow-[0_6px_14px_-8px_rgb(19_41_75/0.8)]"
                            : "border-line bg-white text-ink hover:border-navy/50"
                        } disabled:cursor-not-allowed disabled:opacity-40`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>
          <button type="button" onClick={addVariant} disabled={!variant} className="btn btn-solid mt-1 h-11 min-h-0 w-full rounded-full text-sm">
            Add · <span className="num">{variant ? formatPrice(variant.priceCents) : "—"}</span>
          </button>
        </div>
      )}
    </>
  );
}
