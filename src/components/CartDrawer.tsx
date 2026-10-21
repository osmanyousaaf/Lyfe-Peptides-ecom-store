"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { previewCoupon, startCheckout } from "@/lib/checkout";
import { isUpload } from "@/lib/img";
import { useSite } from "@/lib/site-context";
import CartNudge from "./account/CartNudge";
import { ArrowRight, BagIcon, CloseIcon, LockIcon, MinusIcon, PlusIcon, ShieldIcon, TagIcon, TrashIcon, TruckIcon } from "./icons";

export default function CartDrawer() {
  const { lines, isOpen, close, setQty, remove, subtotalCents, count, coupon } = useCart();
  const promo = useCouponPreview();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panel = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  async function checkout() {
    setLoading(true);
    setError(null);
    const err = await startCheckout(lines, coupon?.code);
    if (err) {
      setError(err);
      setLoading(false);
    }
  }

  return (
    <>
      <div
        onClick={close}
        className={`fixed inset-0 z-[90] bg-navy-2/40 backdrop-blur-[3px] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden
      />
      <aside
        ref={panel}
        tabIndex={-1}
        className={`fixed inset-y-0 right-0 z-[91] flex w-full max-w-[440px] flex-col overflow-hidden bg-white shadow-[0_30px_80px_-20px_rgb(13_30_56/0.5)] outline-none transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] sm:inset-y-3 sm:right-3 sm:rounded-3xl ${
          isOpen ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-[105%] opacity-0"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Cart"
        inert={!isOpen}
      >
        <header className="flex items-center justify-between px-6 pb-4 pt-6">
          <h2 className="flex items-center gap-3 text-xl font-extrabold text-navy">
            Your cart
            <span className="num grid h-7 min-w-7 place-items-center rounded-full bg-navy px-2 text-xs font-bold text-white">{count}</span>
          </h2>
          <button onClick={close} className="grid h-10 w-10 place-items-center rounded-full bg-surface text-navy transition hover:rotate-90 hover:bg-surface-2" aria-label="Close cart">
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="relative grid h-24 w-24 place-items-center rounded-full bg-surface">
              <span className="absolute inset-0 animate-ping rounded-full bg-accent/10 [animation-duration:2.4s]" />
              <BagIcon className="float h-10 w-10 text-navy" />
            </span>
            <p className="mt-6 text-lg font-bold text-navy">Your cart is empty</p>
            <p className="mt-1 max-w-[30ch] text-sm text-muted">Every compound ships with its certificate of analysis.</p>
            <Link href="/shop" onClick={close} className="btn btn-solid shine group mt-7 rounded-full">
              Browse the catalog <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-3 px-6">
              <FreeShipping subtotalCents={subtotalCents - promo.discountCents} />
              <CartNudge />
            </div>

            <ul className="noscroll mt-4 flex flex-1 flex-col gap-3 overflow-y-auto px-6 pb-4">
              {lines.map((l, i) => (
                <li
                  key={l.key}
                  className="rise group grid grid-cols-[76px_1fr] gap-4 rounded-2xl border border-line p-3 transition hover:border-navy/20 hover:shadow-[0_10px_30px_-20px_rgb(19_41_75/0.6)]"
                  style={{ animationDelay: `${Math.min(i, 6) * 50}ms` }}
                >
                  <Link href={`/product/${l.slug}`} onClick={close} className="relative block aspect-square overflow-hidden rounded-xl bg-surface">
                    <Image src={l.image} alt="" fill sizes="76px" unoptimized={isUpload(l.image)} className="blend object-cover transition-transform duration-500 group-hover:scale-110" />
                  </Link>
                  <div className="flex min-w-0 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/product/${l.slug}`} onClick={close} className="ulink line-clamp-2 text-[0.9375rem] font-bold leading-snug text-navy">
                        {l.name}
                      </Link>
                      <button
                        onClick={() => remove(l.key)}
                        className="-mr-1 -mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full text-faint transition hover:bg-red-50 hover:text-red-600"
                        aria-label={`Remove ${l.name}`}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    {l.variantLabel && (
                      <span className="mt-1 self-start rounded-full bg-surface px-2 py-0.5 text-[0.6875rem] font-semibold text-muted">{l.variantLabel}</span>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <Stepper qty={l.qty} dec={() => setQty(l.key, l.qty - 1)} inc={() => setQty(l.key, l.qty + 1)} size="sm" />
                      <span className="num font-extrabold text-navy">{formatPrice(l.unitPriceCents * l.qty)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-line bg-surface/70 px-6 pb-6 pt-5 backdrop-blur">
              <CouponField promo={promo} />
              {promo.discountCents > 0 && (
                <div className="mt-3 flex items-baseline justify-between text-sm">
                  <span className="font-semibold text-muted">Discount</span>
                  <span className="num font-bold text-green">−{formatPrice(promo.discountCents)}</span>
                </div>
              )}
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-sm font-semibold text-muted">Subtotal</span>
                <span className="num text-2xl font-extrabold text-navy">{formatPrice(subtotalCents - promo.discountCents)}</span>
              </div>
              <p className="mt-0.5 text-xs text-faint">Tax and shipping are calculated at checkout</p>
              {error && <p className="mt-3 rounded-xl bg-accent/10 px-3 py-2 text-sm text-accent-deep">{error}</p>}
              <button onClick={checkout} disabled={loading} className="btn btn-solid shine group mt-4 h-14 w-full rounded-2xl text-base">
                {loading ? (
                  "Opening secure checkout…"
                ) : (
                  <>
                    <LockIcon className="h-4 w-4" /> Check out <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
              <div className="mt-3 flex items-center justify-between gap-2">
                <Link href="/cart" onClick={close} className="ulink text-sm font-semibold text-navy">
                  View full cart
                </Link>
                <span className="flex items-center gap-3 text-[0.6875rem] font-semibold text-muted">
                  <span className="flex items-center gap-1"><ShieldIcon className="h-3.5 w-3.5 text-green" /> COA included</span>
                  <span className="flex items-center gap-1"><TruckIcon className="h-3.5 w-3.5 text-accent" /> Ships from Canada</span>
                </span>
              </div>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}

// Progress toward free shipping, with a truck that drives along the bar.
export function FreeShipping({ subtotalCents }: { subtotalCents: number }) {
  const { freeShipCents } = useSite();
  const remaining = Math.max(0, freeShipCents - subtotalCents);
  const pct = Math.min(100, (subtotalCents / freeShipCents) * 100);
  const done = remaining === 0;
  return (
    <div className={`rounded-2xl p-4 transition-colors duration-500 ${done ? "bg-green/10" : "bg-surface"}`}>
      <p className="text-sm font-semibold text-navy">
        {done ? (
          <>You&rsquo;ve unlocked <span className="text-green">free shipping</span> 🎉</>
        ) : (
          <>
            Add <span className="num text-accent-deep">{formatPrice(remaining)}</span> for free shipping
          </>
        )}
      </p>
      <div className="relative mt-3 h-2 rounded-full bg-white">
        <div
          className={`relative h-full rounded-full transition-[width] duration-700 ease-out ${
            done ? "bg-green" : "bg-[linear-gradient(90deg,#f26a21,#ff9a4d,#f26a21)] bg-[length:200%_100%] animate-[hue-pan_3s_linear_infinite]"
          }`}
          style={{ width: `${Math.max(pct, 4)}%` }}
        >
          <span className={`absolute -right-3 -top-[11px] grid h-7 w-7 place-items-center rounded-full bg-white shadow-md ${done ? "text-green" : "text-accent"}`}>
            <TruckIcon className="h-4 w-4" />
          </span>
        </div>
      </div>
    </div>
  );
}

export function Stepper({ qty, dec, inc, size = "md" }: { qty: number; dec: () => void; inc: () => void; size?: "sm" | "md" }) {
  const btn = size === "sm" ? "h-8 w-8" : "h-11 w-11";
  return (
    <div className="flex items-center rounded-full border border-line bg-white p-0.5">
      <button onClick={dec} className={`${btn} grid place-items-center rounded-full text-navy transition hover:bg-surface active:scale-90`} aria-label="One fewer">
        <MinusIcon className="h-3.5 w-3.5" />
      </button>
      <span key={qty} className="num rise w-7 text-center text-sm font-bold text-navy [animation-duration:250ms]">
        {qty}
      </span>
      <button onClick={inc} className={`${btn} grid place-items-center rounded-full text-navy transition hover:bg-surface active:scale-90`} aria-label="One more">
        <PlusIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// The applied code's value on the current cart, re-checked whenever the cart changes.
export function useCouponPreview() {
  const { lines, coupon, setCoupon } = useCart();
  const [discountCents, setDiscount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const cartKey = lines.map((l) => `${l.key}x${l.qty}`).join("|");

  useEffect(() => {
    if (!coupon || lines.length === 0) {
      setDiscount(0);
      return;
    }
    let live = true;
    previewCoupon(lines, coupon.code).then((r) => {
      if (!live) return;
      if (r.ok) {
        setDiscount(r.discountCents);
        setError(null);
      } else {
        setDiscount(0);
        setError(r.error);
        setCoupon(null);
      }
    });
    return () => {
      live = false;
    };
    // re-check only when the cart's contents or the code change
  }, [cartKey, coupon?.code]);

  async function apply(code: string) {
    const c = code.trim();
    if (!c) return;
    setPending(true);
    const r = await previewCoupon(lines, c);
    setPending(false);
    if (r.ok) {
      setError(null);
      setDiscount(r.discountCents);
      setCoupon({ code: r.code, label: r.label });
    } else setError(r.error);
  }

  return { coupon, discountCents, error, pending, apply, remove: () => { setCoupon(null); setDiscount(0); setError(null); } };
}

export type CouponPreviewState = ReturnType<typeof useCouponPreview>;

export function CouponField({ promo }: { promo: CouponPreviewState }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");

  if (promo.coupon) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-green/30 bg-green/5 px-3 py-2">
        <span className="flex min-w-0 items-center gap-2 text-sm">
          <TagIcon className="h-4 w-4 shrink-0 text-green" />
          <span className="truncate font-bold text-navy">{promo.coupon.code}</span>
          <span className="text-muted">{promo.coupon.label}</span>
        </span>
        <button onClick={promo.remove} className="text-xs font-bold text-muted hover:text-red-600">
          Remove
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <div>
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-accent-deep">
          <TagIcon className="h-4 w-4" /> Have a discount code?
        </button>
        {promo.error && <p className="mt-1 text-xs font-semibold text-red-600">{promo.error}</p>}
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        promo.apply(code);
      }}
    >
      <div className="flex gap-2">
        <label className="flex-1">
          <span className="sr-only">Discount code</span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Discount code"
            autoFocus
            autoCapitalize="characters"
            className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm font-semibold uppercase tracking-wide text-ink outline-none transition placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-faint focus:border-navy"
          />
        </label>
        <button disabled={promo.pending || !code.trim()} className="btn btn-navy h-11 min-h-0 rounded-xl px-4 text-sm">
          {promo.pending ? "…" : "Apply"}
        </button>
      </div>
      {promo.error && <p className="mt-1.5 text-xs font-semibold text-red-600" role="alert">{promo.error}</p>}
    </form>
  );
}
