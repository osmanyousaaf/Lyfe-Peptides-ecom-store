"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSite } from "@/lib/site-context";
import { BagIcon, CheckIcon, CloseIcon, MailIcon, TruckIcon } from "../icons";
import GoogleButton from "./GoogleButton";
import { useMe } from "./useMe";
import "./account.css";

const KEY = "lyfe-signup-prompt";
const QUIET_DAYS = 30;
const HIDDEN_ON = ["/checkout", "/account", "/admin", "/cart"];

function recentlySeen(): boolean {
  try {
    const at = Number(localStorage.getItem(KEY));
    return Number.isFinite(at) && at > 0 && Date.now() - at < QUIET_DAYS * 86400_000;
  } catch {
    return true;
  }
}
const remember = () => {
  try {
    localStorage.setItem(KEY, String(Date.now()));
  } catch {
    /* private mode: it may show again next visit */
  }
};
const ageOk = () => {
  try {
    return localStorage.getItem("lyfe-age-verified") === "yes";
  } catch {
    return false;
  }
};

// "Sign up with Google, get N% off": once after a few seconds or on exit intent, then quiet for a month.
export default function SignupPrompt() {
  const { signupPromptEnabled, signupDiscountPercent: pct } = useSite();
  const me = useMe();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const shown = useRef(false);
  const dialog = useRef<HTMLDivElement>(null);

  const eligible = signupPromptEnabled && me?.signedIn === false && !HIDDEN_ON.some((p) => pathname.startsWith(p));

  const show = useCallback(() => {
    if (shown.current || recentlySeen() || !ageOk()) return;
    shown.current = true;
    remember();
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!eligible || recentlySeen()) return;
    const timer = setTimeout(show, 8000);
    // leaving through the top of the window on a desktop
    const exit = (e: MouseEvent) => {
      if (!e.relatedTarget && e.clientY <= 0) show();
    };
    document.addEventListener("mouseout", exit);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseout", exit);
    };
  }, [eligible, show]);

  useEffect(() => {
    if (!open) return;
    dialog.current?.querySelector<HTMLElement>("a,button")?.focus();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", esc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !eligible) return null;

  const perks = [
    { Icon: MailIcon, text: "Your personal code, sent to your Gmail" },
    { Icon: TruckIcon, text: "Order history and live tracking" },
    { Icon: BagIcon, text: "Code applied in your cart automatically" },
  ];

  return (
    <div className="fixed inset-0 z-[95] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="signup-title">
      <div className="acct-backdrop absolute inset-0 bg-navy-2/55 backdrop-blur-[3px]" onClick={() => setOpen(false)} aria-hidden />
      <div
        ref={dialog}
        className="acct-sheet relative grid w-full max-w-[820px] overflow-hidden rounded-t-[28px] bg-white shadow-[0_40px_100px_-30px_rgb(13_30_56/0.7)] sm:grid-cols-[0.95fr_1.05fr] sm:rounded-[28px]"
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-navy shadow-sm transition hover:rotate-90 sm:bg-surface"
          aria-label="Close"
        >
          <CloseIcon className="h-4 w-4" />
        </button>

        {/* the offer: orbiting rings around a big number */}
        <div className="relative flex items-center gap-5 overflow-hidden bg-navy px-6 pb-6 pt-7 text-white sm:flex-col sm:justify-center sm:px-8 sm:py-12">
          <span className="mx-auto mb-1 h-1.5 w-12 rounded-full bg-white/25 sm:hidden" aria-hidden style={{ position: "absolute", top: 10, left: 0, right: 0 }} />
          <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-60" aria-hidden />
          <span className="acct-breathe pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-accent/30 blur-3xl" aria-hidden />
          <div className="relative grid h-24 w-24 shrink-0 place-items-center sm:h-52 sm:w-52">
            <svg viewBox="0 0 200 200" className="acct-orbit absolute inset-0 h-full w-full" aria-hidden>
              <circle cx="100" cy="100" r="94" fill="none" stroke="rgb(255 255 255 / 0.18)" strokeDasharray="2 9" strokeWidth="2" />
              <circle cx="100" cy="6" r="5" fill="var(--accent)" />
            </svg>
            <svg viewBox="0 0 200 200" className="acct-orbit-rev absolute inset-[14%] h-[72%] w-[72%]" aria-hidden>
              <circle cx="100" cy="100" r="92" fill="none" stroke="var(--accent)" strokeOpacity="0.55" strokeDasharray="70 220" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <div className="relative text-center leading-none">
              <p className="num text-[2rem] font-extrabold tracking-tight sm:text-[4.25rem]">
                {pct}
                <span className="text-accent">%</span>
              </p>
              <p className="mt-1 text-[0.625rem] font-bold uppercase tracking-[0.3em] text-white/70 sm:text-xs">off</p>
            </div>
          </div>
          <div className="relative min-w-0 sm:mt-6 sm:text-center">
            <p className="text-sm font-bold sm:text-base">Your first order</p>
            <p className="text-xs text-white/65 sm:mt-1 sm:text-sm">One personal code, made for you</p>
          </div>
          <div className="pointer-events-none absolute -bottom-6 -right-4 hidden h-32 w-20 rotate-12 overflow-hidden rounded-2xl bg-white/95 shadow-xl sm:block" aria-hidden>
            <Image src="/products/lyfe-ghk-cu-100mg.png" alt="" fill sizes="80px" className="blend scale-[1.6] object-cover" />
          </div>
        </div>

        <div className="acct-pop px-6 pb-7 pt-5 sm:px-9 sm:py-10" style={{ animationDelay: "120ms" }}>
          <p className="eyebrow">Members save</p>
          <h2 id="signup-title" className="mt-3 text-[1.625rem] font-extrabold leading-[1.15] tracking-tight text-navy sm:text-[2rem]">
            Sign up and get <span className="text-accent-deep">{pct}% off</span> your first order
          </h2>
          <ul className="mt-5 grid gap-2.5">
            {perks.map(({ Icon, text }, i) => (
              <li key={text} className="acct-pop flex items-center gap-3 text-[0.9375rem] text-ink" style={{ animationDelay: `${220 + i * 90}ms` }}>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
                  <Icon className="h-4 w-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
          <GoogleButton className="mt-6 w-full" />
          <button type="button" onClick={() => setOpen(false)} className="mt-3 w-full rounded-full py-2 text-sm font-semibold text-muted transition hover:text-navy">
            No thanks, I&rsquo;ll pay full price
          </button>
          <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-faint">
            <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green" />
            One use per account. We only read your name, email and photo, and never post anything.
          </p>
        </div>
      </div>
    </div>
  );
}
