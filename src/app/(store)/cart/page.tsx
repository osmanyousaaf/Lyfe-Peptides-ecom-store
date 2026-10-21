"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { startCheckout } from "@/lib/checkout";
import { CouponField, FreeShipping, Stepper, useCouponPreview } from "@/components/CartDrawer";
import { isUpload } from "@/lib/img";
import { useSite } from "@/lib/site-context";
import { ArrowRight, BagIcon, LockIcon, TrashIcon } from "@/components/icons";

export default function CartPage() {
  const { lines, setQty, remove, subtotalCents, count, coupon } = useCart();
  const promo = useCouponPreview();
  const { freeShipCents } = useSite();
  const net = subtotalCents - promo.discountCents;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkout() {
    setLoading(true);
    setError(null);
    const err = await startCheckout(lines, coupon?.code);
    if (err) {
      setError(err);
      setLoading(false);
    }
  }

  if (count === 0) {
    return (
      <div className="wrap section flex flex-col items-center text-center">
        <span className="grid h-24 w-24 place-items-center rounded-full bg-surface">
          <BagIcon className="float h-10 w-10 text-navy" />
        </span>
        <h1 className="head mt-6 text-navy">Your cart is empty</h1>
        <p className="mb-8 mt-2 max-w-[40ch] text-muted">
          Add a compound from the catalog and it will wait here for you.
        </p>
        <Link href="/shop" className="btn btn-solid shine rounded-full">Browse the catalog <ArrowRight className="h-4 w-4" /></Link>
      </div>
    );
  }

  return (
    <div className="wrap pb-10 pt-14 md:pt-20">
      <h1 className="display mb-10 text-navy">
        Your cart <span className="num text-faint">({count})</span>
      </h1>
      <div className="grid gap-10 md:grid-cols-12 md:gap-x-8">
        <ul className="flex flex-col gap-4 md:col-span-7">
          {lines.map((l, i) => (
            <li key={l.key} className="rise group grid grid-cols-[96px_1fr] gap-5 rounded-2xl border border-line p-4" style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}>
              <div className="relative aspect-square overflow-hidden rounded-xl bg-surface">
                <Image src={l.image} alt="" fill sizes="96px" unoptimized={isUpload(l.image)} className="blend object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
              <div className="flex flex-col">
                <Link href={`/product/${l.slug}`} className="ulink self-start font-bold text-navy">
                  {l.name}
                </Link>
                {l.variantLabel && <span className="mt-1 self-start rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold text-muted">{l.variantLabel}</span>}
                <span className="num mt-1 text-small text-muted">{formatPrice(l.unitPriceCents)} each</span>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                  <div className="flex items-center gap-4">
                    <Stepper qty={l.qty} dec={() => setQty(l.key, l.qty - 1)} inc={() => setQty(l.key, l.qty + 1)} />
                    <button onClick={() => remove(l.key)} className="grid h-9 w-9 place-items-center rounded-full text-faint transition hover:bg-red-50 hover:text-red-600" aria-label={`Remove ${l.name}`}>
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="num text-lg font-extrabold text-navy">{formatPrice(l.unitPriceCents * l.qty)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-3xl border border-line bg-surface p-6 md:sticky md:top-36 md:col-span-5 md:col-start-8 lg:col-span-4 lg:col-start-9">
          <h2 className="lead mb-4 text-navy">Order summary</h2>
          <div className="mb-5"><FreeShipping subtotalCents={net} /></div>
          <div className="mb-5"><CouponField promo={promo} /></div>
          <dl className="flex flex-col gap-3 text-small">
            <Row k="Subtotal" v={formatPrice(subtotalCents)} />
            {promo.discountCents > 0 && <Row k={`Discount (${coupon?.code ?? ""})`} v={`−${formatPrice(promo.discountCents)}`} />}
            <Row k="Shipping" v={net >= freeShipCents ? "Free" : "Added at checkout"} />
            <Row k="Tax" v="Added at checkout" />
          </dl>
          <div className="mt-6 flex items-baseline justify-between">
            <span className="font-medium">Total before tax</span>
            <span className="num lead">{formatPrice(net)}</span>
          </div>
          {error && <p className="mt-4 text-small text-accent-deep">{error}</p>}
          <button onClick={checkout} disabled={loading} className="btn btn-solid shine mt-6 h-14 w-full rounded-2xl text-base">
            {loading ? "Opening checkout…" : <><LockIcon className="h-4 w-4" /> Check out securely</>}
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
