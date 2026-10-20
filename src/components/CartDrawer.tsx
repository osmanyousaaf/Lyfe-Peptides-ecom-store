"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { startCheckout } from "@/lib/checkout";

const FREE_SHIP_CENTS = 30000;

export default function CartDrawer() {
  const { lines, isOpen, close, setQty, subtotalCents, count } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  const remaining = Math.max(0, FREE_SHIP_CENTS - subtotalCents);
  const pct = Math.min(100, (subtotalCents / FREE_SHIP_CENTS) * 100);

  async function checkout() {
    setLoading(true);
    setError(null);
    const err = await startCheckout(lines);
    if (err) {
      setError(err);
      setLoading(false);
    }
  }

  return (
    <>
      <div
        onClick={close}
        className={`fixed inset-0 z-[90] bg-black/60 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden
      />
      <aside
        className={`fixed right-0 top-0 z-[91] flex h-full w-full max-w-md flex-col bg-surface transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Cart"
        aria-hidden={!isOpen}
      >
        <div className="flex items-baseline justify-between px-6 pb-4 pt-6">
          <h2 className="lead">
            Cart <span className="num text-muted">({count})</span>
          </h2>
          <button onClick={close} className="ulink text-small">
            Close
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col justify-center gap-6 px-6">
            <p className="text-muted">Nothing in the cart yet.</p>
            <Link href="/shop" onClick={close} className="btn btn-line self-start">
              Browse the catalog
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-2">
              <div className="mb-8">
                <p className="mb-2 text-small text-muted">
                  {remaining > 0
                    ? `${formatPrice(remaining)} more for free shipping`
                    : "Free shipping on this order"}
                </p>
                <div className="h-[5px] bg-surface-2">
                  <div
                    className="h-full bg-ink transition-[width] duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <ul className="flex flex-col gap-6">
                {lines.map((l) => (
                  <li key={l.key} className="grid grid-cols-[72px_1fr] gap-4">
                    <div className="exhibit relative aspect-[2/3]">
                      <Image src={l.image} alt="" fill sizes="72px" className="object-contain p-1" />
                    </div>
                    <div className="flex flex-col">
                      <Link
                        href={`/product/${l.slug}`}
                        onClick={close}
                        className="ulink self-start font-medium"
                      >
                        {l.name}
                      </Link>
                      {l.variantLabel && (
                        <span className="text-small text-muted">{l.variantLabel}</span>
                      )}
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <Stepper
                          qty={l.qty}
                          dec={() => setQty(l.key, l.qty - 1)}
                          inc={() => setQty(l.key, l.qty + 1)}
                        />
                        <span className="num font-medium">
                          {formatPrice(l.unitPriceCents * l.qty)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="px-6 pb-6 pt-4">
              <div className="mb-4 flex items-baseline justify-between">
                <span className="text-muted">Subtotal</span>
                <span className="num lead">{formatPrice(subtotalCents)}</span>
              </div>
              {error && <p className="mb-3 text-small text-accent-deep">{error}</p>}
              <button onClick={checkout} disabled={loading} className="btn btn-solid w-full">
                {loading ? "Opening checkout…" : "Check out"}
              </button>
              <p className="mt-3 text-center text-small text-muted">
                Tax and shipping are added at checkout
              </p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

export function Stepper({ qty, dec, inc }: { qty: number; dec: () => void; inc: () => void }) {
  return (
    <div className="flex items-center bg-surface-2">
      <button onClick={dec} className="grid h-10 w-10 place-items-center hover:bg-bg" aria-label="One fewer">
        −
      </button>
      <span className="num w-8 text-center">{qty}</span>
      <button onClick={inc} className="grid h-10 w-10 place-items-center hover:bg-bg" aria-label="One more">
        +
      </button>
    </div>
  );
}
