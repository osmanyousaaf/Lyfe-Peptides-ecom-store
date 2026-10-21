"use client";

import { useCart } from "@/lib/cart";
import { useSite } from "@/lib/site-context";
import { TagIcon } from "../icons";
import { GoogleG } from "./GoogleButton";
import { signInHref, useMe } from "./useMe";

// In the cart drawer: visitors are invited to sign in for their code; customers can drop theirs in with one tap.
export default function CartNudge() {
  const me = useMe();
  const { signupDiscountPercent: pct } = useSite();
  const { coupon, setCoupon } = useCart();

  if (!me) return null;

  if (me.signedIn) {
    if (!me.code?.usable || coupon?.code === me.code.code) return null;
    const code = me.code;
    return (
      <div className="acct-pop flex items-center gap-3 rounded-2xl border border-accent/25 bg-accent/5 p-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-white">
          <TagIcon className="h-5 w-5" />
        </span>
        <p className="min-w-0 flex-1 text-sm leading-tight">
          <span className="block font-bold text-navy">Your {code.label} code is ready</span>
          <span className="num block truncate font-mono text-xs text-muted">{code.code}</span>
        </p>
        <button type="button" onClick={() => setCoupon({ code: code.code, label: code.label })} className="btn btn-solid btn-sm shrink-0 rounded-full">
          Apply
        </button>
      </div>
    );
  }

  return (
    <a
      href={signInHref()}
      onClick={(e) => (e.currentTarget.href = signInHref())}
      className="acct-pop acct-shimmer group flex items-center gap-3 rounded-2xl bg-navy p-3 text-white transition hover:bg-navy-2"
    >
      <span className="num grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-sm font-extrabold">{pct}%</span>
      <span className="relative z-[2] min-w-0 flex-1 text-sm leading-tight">
        <span className="block font-bold">Get {pct}% off this order</span>
        <span className="block text-xs text-white/65">Sign in with Google, the code is applied for you</span>
      </span>
      <span className="relative z-[2] grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white transition group-hover:scale-110">
        <GoogleG className="h-4 w-4" />
      </span>
    </a>
  );
}
