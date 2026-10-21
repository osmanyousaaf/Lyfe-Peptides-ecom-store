"use client";

import { useState } from "react";
import { ArrowRight, CheckIcon } from "./icons";

// must match TOPICS in lib/inbox.ts (the API rejects anything else)
const TOPICS = [
  { id: "order", label: "An order" },
  { id: "product", label: "A product" },
  { id: "coa", label: "A COA" },
  { id: "wholesale", label: "Wholesale" },
  { id: "other", label: "Something else" },
] as const;
type Topic = (typeof TOPICS)[number]["id"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX = 1500;

type Errors = Partial<Record<"name" | "email" | "message" | "form", string>>;

export default function ContactForm({ email: storeEmail }: { email: string }) {
  const [topic, setTopic] = useState<Topic>("product");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  const needsOrder = topic === "order" || topic === "coa";

  const validate = (): Errors => {
    const e: Errors = {};
    if (name.trim().length < 2) e.name = "Tell us your name.";
    if (!EMAIL_RE.test(email.trim())) e.email = "That email address doesn't look right.";
    if (message.trim().length < 10) e.message = "A few more words, please (10 characters or more).";
    return e;
  };

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      document.getElementById(`contact-${Object.keys(e)[0]}`)?.focus();
      return;
    }
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, name, email, order: needsOrder ? order : "", message, company }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; errors?: Errors };
      if (!res.ok) {
        setErrors({ ...(data.errors ?? {}), form: data.error ?? "That didn't send. Please try again." });
        setState("idle");
        return;
      }
      setState("sent");
    } catch {
      setErrors({ form: "We couldn't reach the server." });
      setState("idle");
    }
  }

  const reset = () => {
    setName("");
    setEmail("");
    setOrder("");
    setMessage("");
    setErrors({});
    setState("idle");
  };

  if (state === "sent") {
    return (
      <div className="contact-sent grid place-items-center px-6 py-14 text-center" role="status" aria-live="polite">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-accent text-white">
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12.5l4.5 4.5L19 7.5" className="contact-check" />
          </svg>
        </span>
        <h2 className="mt-5 text-2xl font-extrabold text-navy">Message sent</h2>
        <p className="mt-2 max-w-[36ch] text-muted">Thanks, {name.split(" ")[0] || "there"}. We reply within one business day to {email}.</p>
        <button type="button" onClick={reset} className="btn btn-line btn-sm mt-6">
          Send another message
        </button>
      </div>
    );
  }

  const field = (bad?: string) =>
    `h-12 w-full rounded-xl border bg-white px-4 text-ink outline-none transition placeholder:text-faint focus:ring-4 focus:ring-accent/15 ${
      bad ? "border-red-400 focus:border-red-500" : "border-line focus:border-navy"
    }`;

  return (
    <form onSubmit={submit} noValidate className="grid gap-5 p-6 sm:p-8">
      <fieldset>
        <legend className="mb-2.5 text-sm font-semibold text-navy">What&rsquo;s it about?</legend>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={topic === t.id}
              onClick={() => setTopic(t.id)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                topic === t.id ? "border-navy bg-navy text-white" : "border-line bg-white text-ink hover:border-navy/40"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-sm font-semibold text-navy">Name</span>
          <input id="contact-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? "contact-name-err" : undefined} className={field(errors.name)} />
          {errors.name && <span id="contact-name-err" className="text-xs font-semibold text-red-600">{errors.name}</span>}
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-semibold text-navy">Email</span>
          <input id="contact-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? "contact-email-err" : undefined} className={field(errors.email)} />
          {errors.email && <span id="contact-email-err" className="text-xs font-semibold text-red-600">{errors.email}</span>}
        </label>
      </div>

      {needsOrder && (
        <label className="rise grid gap-1.5 [animation-duration:300ms]">
          <span className="text-sm font-semibold text-navy">
            Order number <span className="font-normal text-faint">(optional)</span>
          </span>
          <input value={order} onChange={(e) => setOrder(e.target.value)} maxLength={60} placeholder="LP-1042" className={field()} />
        </label>
      )}

      <label className="grid gap-1.5">
        <span className="flex items-baseline justify-between text-sm font-semibold text-navy">
          Message
          <span className={`num text-xs font-medium ${message.length > MAX ? "text-red-600" : "text-faint"}`}>
            {message.length}/{MAX}
          </span>
        </span>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, MAX))}
          rows={5}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "contact-message-err" : undefined}
          className={`${field(errors.message)} h-auto min-h-[140px] resize-y py-3`}
        />
        {errors.message && <span id="contact-message-err" className="text-xs font-semibold text-red-600">{errors.message}</span>}
      </label>

      {/* people never see this; bots fill it in */}
      <label className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden>
        Company
        <input tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} />
      </label>

      {errors.form && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {errors.form}{" "}
          <a href={`mailto:${storeEmail}`} className="font-semibold underline">
            Email us instead
          </a>
          .
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={state === "sending"} className="btn btn-solid shine group h-12 rounded-full px-7">
          {state === "sending" ? "Sending…" : (
            <>
              Send message <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <CheckIcon className="h-4 w-4 text-green" /> Replies within one business day
        </span>
      </div>
    </form>
  );
}
