"use client";

import { useEffect, useRef, useState } from "react";
import AssistantAvatar from "./AssistantAvatar";
import { ArrowRight, CheckIcon } from "./icons";

// The contact form as a conversation with Lyra: one question at a time (name, email, optional
// phone, topic, message), a summary to confirm, then it sends to /api/contact and replies.

type Step = "name" | "email" | "phone" | "topic" | "message" | "confirm" | "sending" | "done";
type Bubble = { from: "bot" | "user"; text: string };

const TOPICS = ["General inquiry", "Product question", "Order issue", "Bulk order", "Documentation request", "Shipping & returns"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+()\-\s\d.]{7,20}$/;

export default function ContactAssistant() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [typing, setTyping] = useState(false);
  const [step, setStep] = useState<Step>("name");
  const [input, setInput] = useState("");
  const [hint, setHint] = useState("");
  const [data, setData] = useState({ name: "", email: "", phone: "", topic: "", message: "" });
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const started = useRef(false);

  const first = data.name.split(" ")[0];

  // Lyra "types" for a moment before each message
  const say = (texts: string[], then?: () => void) => {
    setTyping(true);
    texts.forEach((text, i) => {
      setTimeout(() => {
        setBubbles((b) => [...b, { from: "bot", text }]);
        if (i === texts.length - 1) {
          setTyping(false);
          then?.();
        }
      }, 650 * (i + 1));
    });
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    say(["Hi there! I'm Lyra, Lyfe's support assistant.", "I'll get your message to the right person on our team. First, what's your name?"]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [bubbles, typing, step]);

  useEffect(() => {
    if (!typing) inputRef.current?.focus({ preventScroll: true });
  }, [typing, step]);

  const user = (text: string) => setBubbles((b) => [...b, { from: "user", text }]);

  const answer = (raw: string) => {
    const v = raw.trim();
    setHint("");
    if (step === "name") {
      if (v.length < 2) return setHint("Just your first name is fine.");
      user(v);
      setData((d) => ({ ...d, name: v }));
      setInput("");
      setStep("email");
      return say([`Nice to meet you, ${v.split(" ")[0]}!`, "What's the best email to reach you?"]);
    }
    if (step === "email") {
      if (!EMAIL.test(v)) return setHint("That email doesn't look quite right. Could you check it?");
      user(v);
      setData((d) => ({ ...d, email: v.toLowerCase() }));
      setInput("");
      setStep("phone");
      return say(["Got it. Would you like to add a phone number too? It's optional, so feel free to skip."]);
    }
    if (step === "phone") {
      if (v && !PHONE.test(v)) return setHint("That number doesn't look right. You can also skip this.");
      user(v || "Skip");
      setData((d) => ({ ...d, phone: v }));
      setInput("");
      setStep("topic");
      return say([v ? "Thanks, noted." : "No problem.", "What's this about?"]);
    }
    if (step === "message") {
      if (v.length < 5) return setHint("Tell me a little more so the team can help.");
      user(v);
      setData((d) => ({ ...d, message: v }));
      setInput("");
      setStep("confirm");
      return say(["Perfect. Here's what I'll send to the team. Does it look right?"]);
    }
  };

  const pickTopic = (t: string) => {
    user(t);
    setData((d) => ({ ...d, topic: t }));
    setStep("message");
    const ask =
      t === "Order issue"
        ? "Sorry to hear that. Tell me what happened, and include your order number if you have it."
        : t === "Bulk order"
          ? "Great! Which products and quantities are you looking for?"
          : "Tell me what's on your mind, in as much detail as you like.";
    say([ask]);
  };

  const send = async () => {
    setStep("sending");
    setTyping(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out.error || "Something went wrong.");
      setTyping(false);
      setStep("done");
      say([
        `Thank you for contacting us, ${first}. Our team will review your message and get back to you shortly.`,
        `You'll hear from us at ${data.email}, usually within one business day (Monday to Friday, 9 am to 5 pm EST). Your ${data.topic.toLowerCase()} is in good hands.`,
      ]);
    } catch (e) {
      setTyping(false);
      setStep("confirm");
      say([`Hmm, I couldn't send that: ${e instanceof Error ? e.message : "please try again."}`]);
    }
  };

  const restart = () => {
    setBubbles([]);
    setData({ name: "", email: "", phone: "", topic: "", message: "" });
    setInput("");
    setStep("name");
    say(["Let's start over. What's your name?"]);
  };

  const textStep = step === "name" || step === "email" || step === "phone" || step === "message";
  const placeholder = { name: "Your name", email: "you@example.com", phone: "Phone number (optional)", message: "Type your message…" }[step as "name"];

  return (
    <div data-assistant className="flex h-[640px] flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-[0_40px_80px_-40px_rgb(19_41_75/0.45)]">
      {/* header */}
      <div className="relative flex items-center gap-4 overflow-hidden bg-[linear-gradient(120deg,#13294b,#1d3b68)] px-6 py-5 text-white">
        <span className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full bg-accent/30 blur-[50px]" aria-hidden />
        <AssistantAvatar size={48} />
        <div className="relative flex-1">
          <p className="font-bold">Lyra</p>
          <p className="flex items-center gap-1.5 text-xs text-white/70">
            <span className="h-2 w-2 rounded-full bg-green" /> Lyfe support assistant · Online
          </p>
        </div>
        {bubbles.length > 2 && step !== "sending" && (
          <button type="button" onClick={restart} className="relative rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold hover:bg-white/10">
            Start over
          </button>
        )}
      </div>

      {/* conversation */}
      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-[linear-gradient(180deg,#f7f8fa,#ffffff)] px-5 py-6" aria-live="polite">
        {bubbles.map((b, i) =>
          b.from === "bot" ? (
            <div key={i} className="rise flex items-end gap-2.5">
              {bubbles[i + 1]?.from === "bot" ? <span className="w-8 shrink-0" /> : <AssistantAvatar size={32} live={false} />}
              <p className="max-w-[80%] rounded-2xl rounded-bl-md border border-line bg-white px-4 py-2.5 text-[0.9375rem] leading-relaxed text-ink shadow-[0_6px_16px_-12px_rgb(19_41_75/0.4)]">{b.text}</p>
            </div>
          ) : (
            <p key={i} className="rise ml-auto max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-navy px-4 py-2.5 text-[0.9375rem] text-white">
              {b.text}
            </p>
          )
        )}

        {typing && (
          <div className="flex items-end gap-2.5">
            <AssistantAvatar size={32} live={false} />
            <span className="flex gap-1 rounded-2xl rounded-bl-md border border-line bg-white px-4 py-3.5" aria-label="Lyra is typing">
              {[0, 1, 2].map((d) => (
                <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent" style={{ animationDelay: `${d * 0.15}s` }} />
              ))}
            </span>
          </div>
        )}

        {/* topic chips */}
        {step === "topic" && !typing && (
          <div className="flex flex-wrap gap-2 pl-10">
            {TOPICS.map((t) => (
              <button key={t} type="button" onClick={() => pickTopic(t)} className="rounded-full border border-accent/40 bg-white px-3.5 py-2 text-sm font-semibold text-accent-deep transition hover:bg-accent hover:text-white">
                {t}
              </button>
            ))}
          </div>
        )}

        {/* summary */}
        {step === "confirm" && !typing && (
          <div className="ml-10 rounded-2xl border border-line bg-white p-4 text-sm">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
              {[
                ["Name", data.name],
                ["Email", data.email],
                ["Phone", data.phone || "Not given"],
                ["Topic", data.topic],
              ].map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-muted">{k}</dt>
                  <dd className="font-semibold text-navy">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 whitespace-pre-wrap border-t border-line pt-3 text-ink">{data.message}</p>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={send} className="btn btn-solid btn-sm">
                Send to the team <ArrowRight className="h-4 w-4" />
              </button>
              <button type="button" onClick={restart} className="btn btn-line btn-sm">Edit</button>
            </div>
          </div>
        )}

        {step === "done" && !typing && (
          <p className="ml-10 flex items-center gap-2 text-sm font-semibold text-green">
            <CheckIcon className="h-4 w-4" /> Message sent
          </p>
        )}
      </div>

      {/* input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (textStep && !typing) answer(input);
        }}
        className="border-t border-line bg-white p-4"
      >
        {hint && <p className="mb-2 text-sm text-accent-deep">{hint}</p>}
        <div className="flex items-end gap-2">
          {step === "message" ? (
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!typing) answer(input);
                }
              }}
              rows={2}
              maxLength={4000}
              disabled={typing}
              placeholder={placeholder}
              aria-label="Your message"
              className="max-h-32 min-h-[48px] flex-1 resize-none rounded-xl border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-navy focus:bg-white"
            />
          ) : (
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              type={step === "email" ? "email" : step === "phone" ? "tel" : "text"}
              autoComplete={step === "email" ? "email" : step === "phone" ? "tel" : step === "name" ? "name" : "off"}
              disabled={!textStep || typing}
              placeholder={textStep ? placeholder : step === "topic" ? "Pick a topic above" : step === "done" ? "Thanks for reaching out!" : "Check the summary above"}
              aria-label={placeholder ?? "Reply"}
              className="h-12 flex-1 rounded-xl border border-line bg-surface px-4 text-sm outline-none focus:border-navy focus:bg-white disabled:opacity-60"
            />
          )}
          {step === "phone" && !typing && (
            <button type="button" onClick={() => answer("")} className="h-12 rounded-xl border border-line px-4 text-sm font-semibold text-navy hover:border-navy">
              Skip
            </button>
          )}
          <button type="submit" disabled={!textStep || typing || (step !== "phone" && !input.trim())} className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent text-white transition hover:bg-[#dd5a06] disabled:opacity-40" aria-label="Send">
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
