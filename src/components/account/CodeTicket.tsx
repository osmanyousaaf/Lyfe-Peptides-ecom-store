"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import { CheckIcon } from "../icons";
import "./account.css";

// The personal discount code as a tear-off ticket, with copy and add-to-cart.
export default function CodeTicket({
  code,
  percent,
  expires,
  state,
  animate = false,
}: {
  code: string;
  percent: number;
  expires: string | null;
  state: string;
  animate?: boolean;
}) {
  const { coupon, setCoupon } = useCart();
  const [copied, setCopied] = useState(false);
  const usable = state === "active";
  const inCart = coupon?.code === code;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked: the code is on screen to type */
    }
  };

  return (
    <div className={`@container ${animate ? "acct-ticket-in" : ""}`}>
      <div className={`acct-ticket relative grid overflow-hidden rounded-3xl @md:grid-cols-[170px_1fr] ${usable ? "bg-navy text-white" : "bg-surface-2 text-muted"}`}>
        <div className={`relative grid place-items-center px-6 py-5 @md:py-8 ${usable ? "bg-accent text-white" : "bg-line text-muted"}`}>
          <div className="text-center leading-none">
            <p className="num text-[3.25rem] font-extrabold tracking-tight">{percent}%</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.3em]">off</p>
          </div>
          <span className="absolute inset-y-4 right-0 hidden border-r-2 border-dashed border-white/40 @md:block" aria-hidden />
        </div>
        <div className={`relative px-6 py-6 @md:px-8 ${usable ? "acct-shimmer" : ""}`}>
          <p className={`text-[0.6875rem] font-bold uppercase tracking-[0.25em] ${usable ? "text-accent" : "text-faint"}`}>Your personal code</p>
          <p className="num relative z-[2] mt-2 whitespace-nowrap font-mono text-[1.5rem] font-bold tracking-[0.08em] @sm:text-[1.75rem]">{code}</p>
          <p className={`relative z-[2] mt-1 text-xs ${usable ? "text-white/65" : "text-faint"}`}>
            {usable ? `One use, only while signed in${expires ? ` · valid until ${expires}` : ""}` : state === "used up" ? "Already used on an order" : `This code is ${state}`}
          </p>
          {usable && (
            <div className="relative z-[2] mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={copy} className="btn btn-sm rounded-full bg-white/10 text-white hover:bg-white/20">
                {copied ? (
                  <>
                    <CheckIcon className="h-4 w-4" /> Copied
                  </>
                ) : (
                  "Copy code"
                )}
              </button>
              <button
                type="button"
                disabled={inCart}
                onClick={() => setCoupon({ code, label: `${percent}% off` })}
                className="btn btn-solid btn-sm rounded-full disabled:opacity-100"
              >
                {inCart ? (
                  <>
                    <CheckIcon className="h-4 w-4" /> In your cart
                  </>
                ) : (
                  "Add to cart"
                )}
              </button>
            </div>
          )}
          {!usable && (
            <span className="acct-stamp absolute right-5 top-5 rounded-lg border-2 border-current px-2 py-0.5 text-xs font-extrabold uppercase tracking-widest text-faint">
              {state === "used up" ? "Used" : state}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
