"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { startCheckout } from "@/lib/checkout";
import { Stepper } from "@/components/CartDrawer";

export default function CartPage() {
  const { lines, setQty, remove, subtotalCents, count } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkout() {
    setLoading(true);
    setError(null);
    const err = await startCheckout(lines);
    if (err) {
      setError(err);
      setLoading(false);
    }
  }

  if (count === 0) {
    return (
      <div className="wrap section">
        <h1 className="display mb-6">The cart is empty</h1>
        <p className="mb-10 max-w-[40ch] text-muted">
          Add a compound from the catalog and it will wait here for you.
        </p>
        <Link href="/shop" className="btn btn-solid">Browse the catalog</Link>
      </div>
    );
  }

  return (
    <div className="wrap pb-10 pt-14 md:pt-20">
      <h1 className="display mb-14">
        Cart <span className="num text-muted">({count})</span>
      </h1>
      <div className="grid gap-14 md:grid-cols-12 md:gap-x-6">
        <ul className="flex flex-col gap-10 md:col-span-7">
          {lines.map((l) => (
            <li key={l.key} className="grid grid-cols-[96px_1fr] gap-5">
              <div className="exhibit relative aspect-[4/5]">
                <Image src={l.image} alt="" fill sizes="96px" className="object-cover" />
              </div>
              <div className="flex flex-col">
                <Link href={`/product/${l.slug}`} className="ulink self-start text-body font-medium">
                  {l.name}
                </Link>
                {l.variantLabel && <span className="text-muted">{l.variantLabel}</span>}
                <span className="num mt-1 text-small text-muted">{formatPrice(l.unitPriceCents)} each</span>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                  <div className="flex items-center gap-4">
                    <Stepper qty={l.qty} dec={() => setQty(l.key, l.qty - 1)} inc={() => setQty(l.key, l.qty + 1)} />
                    <button onClick={() => remove(l.key)} className="ulink text-small text-muted hover:text-ink">
                      Remove
                    </button>
                  </div>
                  <span className="num text-body">{formatPrice(l.unitPriceCents * l.qty)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit bg-surface p-7 md:col-span-4 md:col-start-9 md:sticky md:top-24">
          <h2 className="lead mb-6">Order summary</h2>
          <dl className="flex flex-col gap-3 text-small">
            <Row k="Subtotal" v={formatPrice(subtotalCents)} />
            <Row k="Shipping" v={subtotalCents >= 30000 ? "Free" : "Added at checkout"} />
            <Row k="Tax" v="Added at checkout" />
          </dl>
          <div className="mt-6 flex items-baseline justify-between">
            <span className="font-medium">Total before tax</span>
            <span className="num lead">{formatPrice(subtotalCents)}</span>
          </div>
          {error && <p className="mt-4 text-small text-accent-deep">{error}</p>}
          <button onClick={checkout} disabled={loading} className="btn btn-solid mt-6 w-full">
            {loading ? "Opening checkout…" : "Check out securely"}
          </button>
          <Link href="/shop" className="ulink mt-4 inline-block text-small">Keep browsing</Link>
        </aside>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{k}</dt>
      <dd className="num">{v}</dd>
    </div>
  );
}
