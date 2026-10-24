"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { startCheckout } from "@/lib/checkout";
import { Stepper } from "@/components/CartDrawer";
import { FREE_SHIP_CENTS } from "@/lib/discounts";
import { openWelcome, usePromo } from "@/lib/promo";

export default function CartPage() {
  const { lines, setQty, remove, subtotalCents, count } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { promo, apply, clear } = usePromo();
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const saving = promo ? Math.round((subtotalCents * promo.percent) / 100) : 0;
  const remaining = Math.max(0, FREE_SHIP_CENTS - subtotalCents);

  async function checkout() {
    setLoading(true);
    setError(null);
    const err = await startCheckout(lines, promo?.code);
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

          {/* free shipping progress */}
          <div className="mb-6 rounded-xl bg-white p-4">
            <p className="text-small font-semibold text-navy">
              {remaining > 0 ? (
                <>
                  You&rsquo;re <span className="num text-accent-deep">{formatPrice(remaining)}</span> away from free shipping
                </>
              ) : (
                "You've unlocked free shipping"
              )}
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-[linear-gradient(90deg,#f26a12,#ff9a4d)] transition-all duration-500" style={{ width: `${Math.min(100, (subtotalCents / FREE_SHIP_CENTS) * 100)}%` }} />
            </div>
          </div>

          <dl className="flex flex-col gap-3 text-small">
            <Row k="Subtotal" v={formatPrice(subtotalCents)} />
            {promo && <Row k={`Discount (${promo.code})`} v={`−${formatPrice(saving)}`} />}
            <Row k="Shipping" v={subtotalCents >= FREE_SHIP_CENTS ? "Free" : "Added at checkout"} />
            <Row k="Tax" v="Added at checkout" />
          </dl>

          {/* promo code */}
          {promo ? (
            <p className="mt-5 flex items-center justify-between rounded-lg border border-green/30 bg-green/5 px-3 py-2 text-small">
              <span className="font-semibold text-green">{promo.code}: {promo.percent}% off applied</span>
              <button type="button" onClick={clear} className="text-muted underline">Remove</button>
            </p>
          ) : (
            <form
              className="mt-5"
              onSubmit={(e) => {
                e.preventDefault();
                setCodeError(apply(code) ? "" : "That code isn't valid.");
              }}
            >
              <label className="flex gap-2">
                <span className="sr-only">Promo code</span>
                <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Promo code" className="h-11 min-w-0 flex-1 rounded-lg border border-line bg-white px-3 text-small uppercase outline-none focus:border-navy" />
                <button type="submit" className="btn btn-navy btn-sm h-11">Apply</button>
              </label>
              {codeError && <p className="mt-1.5 text-small text-accent-deep">{codeError}</p>}
              <button type="button" onClick={openWelcome} className="mt-2 text-small font-semibold text-accent-deep hover:underline">
                No code? Sign up for 10% off
              </button>
            </form>
          )}

          <div className="mt-6 flex items-baseline justify-between">
            <span className="font-medium">Total before tax</span>
            <span className="num lead">{formatPrice(subtotalCents - saving)}</span>
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
