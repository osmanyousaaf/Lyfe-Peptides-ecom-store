"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import AssistantAvatar from "./AssistantAvatar";
import { ArrowRight, CloseIcon } from "./icons";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content: "Hi! I'm Lyra, Lyfe's support assistant. Ask me about products, prices, shipping, testing or our dual chamber pens.",
};
const QUICK = ["How fast do you ship?", "Do you include a COA?", "How do the dual chamber pens work?", "Help with my order"];
const STORE = "lyfe-chat";

// Render the small markdown subset the assistant uses: [text](/path) links and **bold**.
function Rich({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)\s]+\)|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) => {
        const link = p.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
        if (link) {
          const [, label, href] = link;
          return href.startsWith("/") ? (
            <Link key={i} href={href} className="font-semibold text-accent-deep underline underline-offset-2">
              {label}
            </Link>
          ) : (
            <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent-deep underline underline-offset-2">
              {label}
            </a>
          );
        }
        const bold = p.match(/^\*\*([^*]+)\*\*$/);
        if (bold) return <strong key={i} className="font-bold text-navy">{bold[1]}</strong>;
        return <Fragment key={i}>{p}</Fragment>;
      })}
    </>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A1.5 1.5 0 0 1 4 14.5z" />
      <path d="M8.5 9.5h.01M12 9.5h.01M15.5 9.5h.01" strokeWidth="2.6" />
    </svg>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // keep the conversation for this browser tab
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORE);
      if (saved) setMsgs(JSON.parse(saved));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(STORE, JSON.stringify(msgs));
    } catch {}
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    const history = [...msgs, { role: "user" as const, content: q }];
    setMsgs([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    const write = (content: string) =>
      setMsgs((m) => [...m.slice(0, -1), { role: "assistant", content }]);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // the server drops the leading greeting; the API wants the shopper to speak first
        body: JSON.stringify({ messages: history.filter((m) => m.content) }),
      });
      if (!res.ok || !res.body) {
        write(res.status === 429 ? await res.text() : "Sorry, I couldn't reach support just now. Please try again, or email info@lyfepeptidescanada.com.");
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        write(acc);
      }
    } catch {
      write("Sorry, the connection dropped. Please try again, or email info@lyfepeptidescanada.com.");
    } finally {
      setBusy(false);
    }
  };

  const fresh = msgs.length === 1;

  return (
    <>
      {/* launcher label */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        tabIndex={-1}
        aria-hidden
        className={`fixed bottom-[1.85rem] right-[5.25rem] z-[60] hidden items-center gap-2 rounded-full border border-line bg-white py-2 pl-3 pr-4 text-sm shadow-[0_12px_30px_-12px_rgb(19_41_75/0.45)] transition-all duration-300 sm:bottom-[2.1rem] sm:right-[5.75rem] sm:flex ${
          open ? "pointer-events-none translate-x-2 opacity-0" : "opacity-100"
        }`}
      >
        <span className="h-2 w-2 rounded-full bg-green" />
        <span className="font-semibold text-navy">Need help?</span>
        <span className="text-muted">Chat with us</span>
      </button>

      {/* launcher */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close support chat" : "Open support chat"}
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-[60] grid h-14 w-14 place-items-center rounded-full bg-accent text-white shadow-[0_14px_30px_-10px_rgb(242_106_18/0.75)] transition-transform duration-300 hover:scale-105 sm:bottom-6 sm:right-6"
      >
        {!open && <span className="absolute inset-0 animate-ping rounded-full bg-accent/40 [animation-duration:2.4s]" aria-hidden />}
        {open ? <CloseIcon className="relative h-6 w-6" /> : <ChatIcon className="relative h-6 w-6" />}
      </button>

      {/* panel */}
      <section
        role="dialog"
        aria-label="Lyfe support chat"
        aria-hidden={!open}
        inert={!open}
        className={`fixed inset-x-3 bottom-24 z-[60] flex max-h-[min(640px,calc(100svh-8rem))] flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-[0_30px_70px_-20px_rgb(19_41_75/0.45)] transition-all duration-300 ease-out sm:inset-x-auto sm:right-6 sm:w-[380px] ${
          open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <header className="flex items-center gap-3 bg-navy px-5 py-4 text-white">
          <AssistantAvatar size={40} />
          <div className="flex-1 leading-tight">
            <p className="font-bold">Lyra · Lyfe Support</p>
            <p className="text-xs text-white/70">Usually replies in seconds</p>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10" aria-label="Close support chat">
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>

        <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-surface px-4 py-4" aria-live="polite">
          {msgs.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="ml-auto max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-navy px-4 py-2.5 text-sm text-white">
                {m.content}
              </div>
            ) : (
              <div key={i} className="max-w-[88%] whitespace-pre-wrap rounded-2xl rounded-bl-md border border-line bg-white px-4 py-2.5 text-sm leading-relaxed text-ink">
                {m.content ? (
                  <Rich text={m.content} />
                ) : (
                  <span className="flex gap-1 py-1" aria-label="Typing">
                    {[0, 1, 2].map((d) => (
                      <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-faint" style={{ animationDelay: `${d * 0.15}s` }} />
                    ))}
                  </span>
                )}
              </div>
            )
          )}
          {fresh && (
            <div className="flex flex-wrap gap-2 pt-1">
              {QUICK.map((q) => (
                <button key={q} type="button" onClick={() => send(q)} className="rounded-full border border-accent/40 bg-white px-3 py-1.5 text-xs font-semibold text-accent-deep transition hover:bg-accent hover:text-white">
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-end gap-2 border-t border-line bg-white p-3"
        >
          <label className="sr-only" htmlFor="chat-input">Your message</label>
          <textarea
            id="chat-input"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            maxLength={1500}
            placeholder="Type your question…"
            className="max-h-28 min-h-[44px] flex-1 resize-none rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-navy focus:bg-white"
          />
          <button type="submit" disabled={busy || !input.trim()} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-white transition hover:bg-[#dd5a06] disabled:opacity-40" aria-label="Send">
            <ArrowRight className="h-5 w-5" />
          </button>
        </form>
        <p className="bg-white px-4 pb-3 text-center text-[0.625rem] text-faint">
          Automated assistant. For research use products only; no medical advice.
        </p>
      </section>
    </>
  );
}
