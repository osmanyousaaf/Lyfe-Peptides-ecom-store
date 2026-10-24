"use client";

import { useState } from "react";
import { useSignup } from "@/lib/promo";
import { MailIcon } from "./icons";

// Newsletter sign-up: saved through /api/subscribe, and the welcome code is shown and applied.
export default function Newsletter() {
  const [email, setEmail] = useState("");
  const { status, message, code, submit: signup } = useSignup("newsletter");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    signup(email);
  };

  return (
    <section className="wrap pb-16 md:pb-24">
      <div className="relative overflow-hidden rounded-2xl bg-[linear-gradient(120deg,#13294b,#1d3b68)] px-6 py-10 text-white sm:px-10 md:py-12">
        <div className="relative grid items-center gap-6 md:grid-cols-[1fr_1.1fr]">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/10">
              <MailIcon className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-2xl font-extrabold">Stay in the loop, get 10% off</h2>
              <p className="mt-1 text-white/75">New compounds, restocks and research notes, plus 10% off your first order. No spam.</p>
            </div>
          </div>
          {status === "done" ? (
            <p className="rounded-xl bg-white/10 px-5 py-4 text-sm" role="status">
              You&rsquo;re subscribed. Your code <strong className="num tracking-wider text-accent">{code}</strong> is applied to
              your cart.
            </p>
          ) : (
          <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
            <label className="flex-1">
              <span className="sr-only">Email address</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="h-12 w-full rounded-lg border border-white/20 bg-white px-4 text-ink outline-none focus:border-accent"
              />
            </label>
            <button type="submit" disabled={status === "busy"} className="btn btn-solid h-12">
              {status === "busy" ? "Subscribing…" : "Subscribe"}
            </button>
            {status === "error" && <p className="text-sm text-white/80 sm:basis-full">{message}</p>}
          </form>
          )}
        </div>
      </div>
    </section>
  );
}
