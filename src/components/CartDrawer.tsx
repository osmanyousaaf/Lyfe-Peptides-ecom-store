"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { startCheckout } from "@/lib/checkout";
import { FREE_SHIP_CENTS } from "@/lib/discounts";
import { usePromo } from "@/lib/promo";

export default function CartDrawer() {
  const { lines, isOpen, close, setQty, subtotalCents, count } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { promo } = usePromo();
  const saving = promo ? Math.round((subtotalCents * promo.percent) / 100) : 0;

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
    const err = await startCheckout(lines, promo?.code);
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
          <button onClick={close} className="grid h-9 w-9 place-items-center rounded-full text-navy hover:bg-white" aria-label="Close cart">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col overflow-y-auto px-6 pb-6">
            {/* illustration: an orange-lit cart with vials peeking out */}
            <div className="relative mx-auto mt-6 grid h-52 w-52 place-items-center" aria-hidden>
              <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgb(242_106_18/0.22)_0%,rgb(242_106_18/0.08)_45%,transparent_70%)]" />
              <span className="absolute inset-6 rounded-full border-2 border-dashed border-accent/25 [animation:lyra-spin_30s_linear_infinite]" />
              <span className="absolute left-6 top-8 h-2.5 w-2.5 rounded-full bg-accent/70" />
              <span className="absolute bottom-10 right-5 h-2 w-2 rounded-full bg-navy/40" />
              <span className="absolute right-10 top-5 h-1.5 w-1.5 rounded-full bg-accent" />
              <div className="lyra relative">
                <Image src="/cutouts/bpc-157-10mg.png" alt="" width={320} height={722} className="absolute -top-12 left-[34px] h-16 w-auto -rotate-12 drop-shadow-md" />
                <Image src="/cutouts/lyfe-ghk-cu-100mg.png" alt="" width={345} height={657} className="absolute -top-10 left-[62px] h-14 w-auto rotate-[10deg] drop-shadow-md" />
                <svg viewBox="0 0 120 100" className="relative h-24 w-28 drop-shadow-[0_12px_14px_rgb(242_106_18/0.35)]">
                  <defs>
                    <linearGradient id="cart-body" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#ff9a4d" />
                      <stop offset="1" stopColor="#f26a12" />
                    </linearGradient>
                  </defs>
                  <path d="M6 10h14l6 12" fill="none" stroke="#13294b" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M24 22h88l-11 44H35z" fill="url(#cart-body)" />
                  <path d="M30 34h76M33 48h70" stroke="#fff" strokeOpacity="0.45" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="44" cy="84" r="9" fill="#13294b" />
                  <circle cx="92" cy="84" r="9" fill="#13294b" />
                  <circle cx="44" cy="84" r="3" fill="#fff" />
                  <circle cx="92" cy="84" r="3" fill="#fff" />
                </svg>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xl font-extrabold text-navy">Your cart is empty</p>
              <p className="mx-auto mt-1.5 max-w-[30ch] text-sm text-muted">
                Every vial ships with its certificate of analysis. Let&rsquo;s find what your research needs.
              </p>
              <Link href="/shop" onClick={close} className="btn btn-solid mt-5 w-full rounded-xl">
                Shop all products &rarr;
              </Link>
            </div>

            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Popular right now</p>
              <ul className="mt-3 grid grid-cols-3 gap-2.5">
                {[
                  { slug: "bpc-157-10-mg", name: "BPC-157", img: "/cutouts/bpc-157-10mg.png", w: 320, h: 722 },
                  { slug: "ghk-cu-100-mg", name: "GHK-Cu", img: "/cutouts/lyfe-ghk-cu-100mg.png", w: 345, h: 657 },
                  { slug: "nad-500-mg", name: "NAD+", img: "/cutouts/lyfe-nad-500mg.png", w: 329, h: 668 },
                ].map((p) => (
                  <li key={p.slug}>
                    <Link href={`/product/${p.slug}`} onClick={close} className="group flex flex-col items-center rounded-xl border border-line bg-white px-2 pb-2.5 pt-3 transition hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-[0_12px_24px_-16px_rgb(242_106_18/0.6)]">
                      <Image src={p.img} alt="" width={p.w} height={p.h} className="h-16 w-auto transition-transform group-hover:scale-105" />
                      <span className="mt-2 text-xs font-bold text-navy">{p.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 rounded-xl bg-[linear-gradient(120deg,#13294b,#1d3b68)] p-4 text-white">
              <p className="text-sm font-bold">Get 10% off your first order</p>
              <p className="mt-0.5 text-xs text-white/70">Join the newsletter for restocks and research notes.</p>
              <button
                type="button"
                onClick={() => {
                  close();
                  window.dispatchEvent(new Event("lyfe:open-welcome"));
                }}
                className="mt-3 rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-white hover:bg-[#dd5a06]"
              >
                Sign up
              </button>
            </div>

            <ul className="mt-5 grid grid-cols-2 gap-2 text-center text-[0.6875rem] font-semibold text-muted">
              <li className="rounded-lg bg-white px-2 py-2">Free shipping over $300</li>
              <li className="rounded-lg bg-white px-2 py-2">Same-day dispatch before 1 PM</li>
            </ul>
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
              {promo && (
                <div className="mb-2 flex items-baseline justify-between text-small">
                  <span className="font-semibold text-green">{promo.code} applied ({promo.percent}% off)</span>
                  <span className="num font-semibold text-green">−{formatPrice(saving)}</span>
                </div>
              )}
              <div className="mb-4 flex items-baseline justify-between">
                <span className="text-muted">Subtotal</span>
                <span className="num lead">{formatPrice(subtotalCents - saving)}</span>
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
