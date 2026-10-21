"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowRight, CheckIcon, FlaskIcon, MailIcon, SparkIcon, TruckIcon } from "./icons";

const PERKS = [
  { Icon: SparkIcon, text: "New compounds first" },
  { Icon: TruckIcon, text: "Restock alerts" },
  { Icon: FlaskIcon, text: "Research notes" },
];

// Sign-ups are stored in the store's subscriber list (Admin → Subscribers).
export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [trap, setTrap] = useState("");
  const [sent, setSent] = useState<null | "new" | "already">(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website: trap }),
      });
      const out = (await res.json().catch(() => ({}))) as { error?: string; already?: boolean };
      if (!res.ok) setError(out.error || "That didn't work. Try again in a moment.");
      else setSent(out.already ? "already" : "new");
    } catch {
      setError("You seem to be offline. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="wrap pb-16 md:pb-24">
      <div data-reveal className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(125deg,#0d1e38_0%,#13294b_45%,#24467a_100%)] px-6 py-12 text-white sm:px-12 md:py-16">
        <div className="dot-grid-light pointer-events-none absolute inset-0 [mask-image:linear-gradient(90deg,transparent,#000_60%)]" aria-hidden />
        <span className="orb -left-16 -top-20 h-72 w-72 bg-accent/40" aria-hidden />
        <span className="orb -bottom-24 right-[20%] h-80 w-80 bg-[#e04e8b]/25 [animation-delay:-7s]" aria-hidden />

        {/* vials drifting on the right */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[38%] lg:block" aria-hidden>
          {[
            { src: "/products/lyfe-nad-500mg.png", cls: "right-[50%] top-[30%] h-[50%] -rotate-[10deg]", d: "0s" },
            { src: "/products/lyfe-ghk-cu-100mg.png", cls: "right-[14%] top-[16%] h-[64%] rotate-[6deg]", d: "-2s" },
          ].map((v) => (
            <div key={v.src} className={`absolute aspect-[1/2] ${v.cls}`}>
              <div className="float relative h-full w-full overflow-hidden rounded-2xl bg-white/95 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.6)]" style={{ animationDelay: v.d }}>
                <Image src={v.src} alt="" fill sizes="200px" className="blend scale-[1.6] object-cover" />
              </div>
            </div>
          ))}
        </div>

        <div className="relative max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white/90 backdrop-blur">
            <MailIcon className="h-4 w-4 text-accent" /> The Lyfe lab letter
          </span>
          <h2 className="mt-5 text-[clamp(1.875rem,1.3rem+2vw,2.75rem)] font-extrabold leading-[1.08] tracking-tight">
            Be first in line when <span className="grad-text">new compounds</span> land.
          </h2>
          <p className="mt-3 max-w-[46ch] text-white/70">One short email when something new arrives or comes back in stock. No spam, unsubscribe any time.</p>

          {sent ? (
            <div className="rise mt-8 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-green">
                <CheckIcon className="h-5 w-5" />
              </span>
              <p className="text-sm">
                <span className="block font-bold">You&rsquo;re on the list</span>
                <span className="text-white/70">
                  {sent === "already"
                    ? "That address was already subscribed. We'll keep you posted."
                    : "We'll email you when something new lands or comes back in stock."}
                </span>
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-8">
              <input
                type="text"
                name="website"
                value={trap}
                onChange={(e) => setTrap(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
              />
              <label className="group relative flex items-center rounded-full bg-white p-1.5 shadow-[0_20px_40px_-20px_rgb(0_0_0/0.6)] ring-4 ring-white/0 transition focus-within:ring-accent/30">
                <span className="sr-only">Email address</span>
                <MailIcon className="ml-4 h-5 w-5 shrink-0 text-faint" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@lab.ca"
                  className="h-12 min-w-0 flex-1 bg-transparent px-3 text-ink outline-none placeholder:text-faint"
                />
                <button type="submit" disabled={busy} className="btn btn-solid shine group/b h-12 shrink-0 rounded-full px-5 sm:px-6">
                  <span className="hidden sm:inline">{busy ? "Joining…" : "Subscribe"}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/b:translate-x-1" />
                </button>
              </label>
              {error && (
                <p role="alert" className="mt-3 text-sm font-semibold text-[#ffb38a]">
                  {error}
                </p>
              )}
            </form>
          )}

          <ul className="mt-6 flex flex-wrap gap-2">
            {PERKS.map(({ Icon, text }) => (
              <li key={text} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/80">
                <Icon className="h-3.5 w-3.5 text-accent" /> {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
