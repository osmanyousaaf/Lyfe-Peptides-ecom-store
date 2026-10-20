"use client";

import { useState } from "react";
import { MailIcon } from "./icons";

// No mailing-list service is connected yet, so this opens a pre-written email to the store.
export default function Newsletter() {
  const [email, setEmail] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent("Newsletter sign-up");
    const body = encodeURIComponent(`Please add ${email} to the Lyfe Peptides newsletter.`);
    window.location.href = `mailto:info@lyfepeptidescanada.com?subject=${subject}&body=${body}`;
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
              <h2 className="text-2xl font-extrabold">Stay in the loop</h2>
              <p className="mt-1 text-white/75">New compounds, restocks and research notes. No spam.</p>
            </div>
          </div>
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
            <button type="submit" className="btn btn-solid h-12">
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
