"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSignup } from "@/lib/promo";
import { CheckIcon, CloseIcon } from "./icons";
import GoogleSignIn from "./GoogleSignIn";

const SEEN = "lyfe-welcome-seen";

// "Sign up, get 10% off": shows once, a few seconds after a visitor has passed the age check,
// and again whenever something asks for it (the promo bar). Never on checkout pages.
export default function WelcomePopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const { status, message, code, submit, submitGoogle } = useSignup("welcome-popup");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener("lyfe:open-welcome", show);
    let t: ReturnType<typeof setTimeout> | undefined;
    try {
      const fresh = !localStorage.getItem(SEEN) && !localStorage.getItem("lyfe-subscribed");
      const verified = localStorage.getItem("lyfe-age-verified") === "yes";
      if (fresh && verified && !pathname.startsWith("/checkout")) t = setTimeout(show, 7000);
    } catch {}
    return () => {
      window.removeEventListener("lyfe:open-welcome", show);
      if (t) clearTimeout(t);
    };
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    try {
      localStorage.setItem(SEEN, "yes");
    } catch {}
    inputRef.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[95] grid place-items-center bg-navy/50 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        onClick={(e) => e.stopPropagation()}
        className="rise relative grid w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-[0_40px_90px_-30px_rgba(0,0,0,0.6)] md:grid-cols-[0.9fr_1.1fr]"
      >
        <button type="button" onClick={() => setOpen(false)} className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/80 text-navy hover:bg-surface" aria-label="Close">
          <CloseIcon className="h-5 w-5" />
        </button>

        {/* picture */}
        <div className="relative hidden bg-[linear-gradient(160deg,#ffffff_0%,#f1f4f8_60%,#e6ebf1_100%)] md:block" aria-hidden>
          <span className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/15 blur-[60px]" />
          <div className="absolute inset-x-[10%] bottom-[14%] h-8 rounded-t-lg border-t border-white bg-[linear-gradient(180deg,#e7ecf1,#fbfcfd_50%,#eef1f5)]" />
          <div className="absolute inset-x-[10%] bottom-[8%] h-[6%] rounded-b-lg bg-[linear-gradient(180deg,#eef1f5,#d9e0e8)] shadow-[0_20px_30px_-16px_rgb(19_41_75/0.35)]" />
          <div className="absolute inset-x-3 bottom-[calc(14%+1rem)] top-[30%] flex items-end justify-center gap-2">
            <Image src="/cutouts/lyfe-nad-500mg.png" alt="" width={329} height={668} className="h-[60%] w-auto" />
            <Image src="/cutouts/bpc-157-10mg.png" alt="" width={320} height={722} className="h-[82%] w-auto" />
            <Image src="/cutouts/lyfe-ghk-cu-100mg.png" alt="" width={345} height={657} className="h-[64%] w-auto" />
          </div>
          <span className="absolute left-5 top-5 rounded-full bg-accent px-3 py-1 text-xs font-extrabold text-white">10% OFF</span>
        </div>

        {/* copy + form */}
        <div className="p-7 sm:p-10">
          {status === "done" ? (
            <>
              <span className="grid h-12 w-12 place-items-center rounded-full bg-green/10 text-green">
                <CheckIcon className="h-6 w-6" />
              </span>
              <h2 id="welcome-title" className="mt-5 text-2xl font-extrabold text-navy">You&rsquo;re in. Here&rsquo;s your code.</h2>
              <p className="mt-2 text-muted">It&rsquo;s already applied to your cart. Use it on your first order.</p>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(code).then(() => setCopied(true), () => {});
                }}
                className="mt-6 flex w-full items-center justify-between rounded-xl border-2 border-dashed border-accent bg-accent/5 px-5 py-4"
              >
                <span className="num text-xl font-extrabold tracking-[0.15em] text-accent-deep">{code}</span>
                <span className="text-sm font-bold text-navy">{copied ? "Copied" : "Copy"}</span>
              </button>
              <button type="button" onClick={() => setOpen(false)} className="btn btn-solid mt-5 w-full">
                Start shopping
              </button>
            </>
          ) : (
            <>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-deep">Welcome to Lyfe</p>
              <h2 id="welcome-title" className="mt-3 text-[1.9rem] font-extrabold leading-tight text-navy">
                Sign up and get <span className="font-serif text-[1.15em] font-normal italic text-accent-deep">10% off</span> your first order
              </h2>
              <p className="mt-3 text-muted">New compounds, restocks and research notes, plus member-only offers. No spam.</p>
              <div className="mt-6">
                <GoogleSignIn onCredential={submitGoogle} disabled={status === "busy"} />
              </div>
              <p className="my-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-faint">
                <span className="h-px flex-1 bg-line" /> or use your email <span className="h-px flex-1 bg-line" />
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submit(email);
                }}
              >
                <label className="block">
                  <span className="sr-only">Email address</span>
                  <input
                    ref={inputRef}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    autoComplete="email"
                    className="h-12 w-full rounded-xl border border-line bg-white px-4 text-ink outline-none transition focus:border-navy focus:ring-4 focus:ring-navy/5"
                  />
                </label>
                {status === "error" && <p className="mt-2 text-sm text-accent-deep">{message}</p>}
                <button type="submit" disabled={status === "busy"} className="btn btn-solid mt-3 w-full">
                  {status === "busy" ? "Signing you up…" : "Get my 10% off"}
                </button>
              </form>
              <button type="button" onClick={() => setOpen(false)} className="mt-4 w-full text-center text-sm text-muted hover:text-navy">
                No thanks
              </button>
              <p className="mt-5 text-center text-[0.6875rem] text-faint">We only email about Lyfe. Unsubscribe anytime.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
