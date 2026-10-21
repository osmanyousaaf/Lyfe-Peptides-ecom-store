"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { BagIcon, LogoutIcon, TagIcon, UsersIcon } from "../icons";
import { shouldAutoApply, useMe } from "./useMe";
import "./account.css";

export function Avatar({ name, picture, className = "h-9 w-9 text-sm" }: { name: string; picture: string; className?: string }) {
  const [broken, setBroken] = useState(false);
  const initial = (name.trim()[0] || "?").toUpperCase();
  return picture && !broken ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={picture} alt="" referrerPolicy="no-referrer" onError={() => setBroken(true)} className={`${className} rounded-full object-cover`} />
  ) : (
    <span className={`${className} grid place-items-center rounded-full bg-navy font-extrabold text-white`}>{initial}</span>
  );
}

// Header account entry: "Sign in" for visitors, avatar + menu for customers.
export default function AccountButton() {
  const me = useMe();
  const pathname = usePathname();
  const { coupon, setCoupon } = useCart();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  // a fresh account's code lands in the cart without typing it
  useEffect(() => {
    if (me?.signedIn && me.code?.usable && !coupon && shouldAutoApply(me.code.code)) {
      setCoupon({ code: me.code.code, label: me.code.label });
    }
  }, [me, coupon, setCoupon]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  if (me === undefined) return <span className="h-11 w-11" aria-hidden />;

  if (!me.signedIn) {
    const next = pathname.startsWith("/account") ? "/account" : pathname;
    return (
      <Link
        href={`/account/signin?next=${encodeURIComponent(next)}`}
        className="group inline-flex h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-navy transition hover:bg-surface sm:border sm:border-line sm:pl-3 sm:pr-4"
        aria-label="Sign in"
      >
        <UsersIcon className="h-[22px] w-[22px] transition-transform group-hover:scale-110 sm:h-[18px] sm:w-[18px]" />
        <span className="hidden sm:inline">Sign in</span>
      </Link>
    );
  }

  return (
    <div className="relative" ref={box}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account menu for ${me.name || me.email}`}
        className="relative grid h-11 w-11 place-items-center rounded-full transition hover:bg-surface"
      >
        <span className="rounded-full p-[2px] [background:conic-gradient(from_180deg,var(--accent),#ff9a4d,var(--accent))]">
          <span className="block rounded-full bg-white p-[2px]">
            <Avatar name={me.name || me.email} picture={me.picture} className="h-8 w-8 text-sm" />
          </span>
        </span>
        {me.code?.usable && <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-accent" aria-hidden />}
      </button>
      {open && (
        <div role="menu" className="acct-menu absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-line bg-white shadow-[0_30px_60px_-24px_rgb(19_41_75/0.45)]">
          <div className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3.5">
            <Avatar name={me.name || me.email} picture={me.picture} className="h-10 w-10 text-base" />
            <div className="min-w-0 leading-tight">
              <p className="truncate font-bold text-navy">{me.name || me.firstName}</p>
              <p className="truncate text-xs text-muted">{me.email}</p>
            </div>
          </div>
          {me.code?.usable && (
            <Link href="/account#code" role="menuitem" className="mx-3 mt-3 flex items-center gap-3 rounded-xl bg-navy px-3 py-2.5 text-white transition hover:bg-navy-2">
              <TagIcon className="h-[18px] w-[18px] text-accent" />
              <span className="flex-1 leading-tight">
                <span className="block text-[0.6875rem] font-bold uppercase tracking-wider text-accent">{me.code.label} ready</span>
                <span className="num block font-mono text-sm text-white">{me.code.code}</span>
              </span>
            </Link>
          )}
          <nav className="grid p-2">
            <Link href="/account" role="menuitem" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-navy hover:bg-surface">
              <UsersIcon className="h-[18px] w-[18px] text-muted" /> My account
            </Link>
            <Link href="/account#orders" role="menuitem" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-navy hover:bg-surface">
              <BagIcon className="h-[18px] w-[18px] text-muted" /> Orders & tracking
            </Link>
            <form action="/api/auth/logout" method="post">
              <button role="menuitem" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-navy hover:bg-surface">
                <LogoutIcon className="h-[18px] w-[18px] text-muted" /> Sign out
              </button>
            </form>
          </nav>
        </div>
      )}
    </div>
  );
}
