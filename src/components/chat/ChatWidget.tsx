"use client";

import "./chat.css";
import Image from "next/image";
import { useSite } from "@/lib/site-context";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { CHAT_LIMITS, STARTER_PROMPTS, type ChatEvent, type ChatProduct } from "@/lib/chat";
import { OPEN_CHAT_EVENT } from "@/lib/site";
import RichText from "./RichText";

type Msg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  products: Record<string, ChatProduct>;
  suggestions?: string[];
  error?: boolean;
};

const HISTORY_KEY = "lyfe-chat-v1";
const GREETED_KEY = "lyfe-chat-greeted";
const uid = () => Math.random().toString(36).slice(2, 10);

const load = (): Msg[] => {
  try {
    const raw = sessionStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as Msg[]) : [];
  } catch {
    return [];
  }
};

// The admin can switch the assistant off in Settings; then nothing renders at all.
export default function ChatWidget() {
  const { chatEnabled } = useSite();
  return chatEnabled ? <ChatWidgetPanel /> : null;
}

function ChatWidgetPanel() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [greet, setGreet] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const pathname = usePathname();

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const msgsRef = useRef<Msg[]>([]);
  msgsRef.current = msgs;

  useEffect(() => {
    setMsgs(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(HISTORY_KEY, JSON.stringify(msgs.slice(-40)));
    } catch {
      /* storage blocked: history lasts for this page only */
    }
  }, [msgs, hydrated]);

  // one gentle nudge on a first visit
  useEffect(() => {
    let seen = true;
    try {
      seen = localStorage.getItem(GREETED_KEY) === "1";
    } catch {
      /* treat as seen */
    }
    if (seen) return;
    const t = setTimeout(() => setGreet(true), 6000);
    return () => clearTimeout(t);
  }, []);

  const dismissGreet = useCallback(() => {
    setGreet(false);
    try {
      localStorage.setItem(GREETED_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  const openPanel = useCallback(() => {
    setOpen(true);
    dismissGreet();
  }, [dismissGreet]);

  const closePanel = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => launcherRef.current?.focus());
  }, []);

  // keep the newest message in view
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [msgs, open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closePanel();
    window.addEventListener("keydown", onKey);
    // the mobile sheet covers the page, so stop it scrolling underneath
    const mobile = window.matchMedia("(max-width: 639px)").matches;
    if (mobile) document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      if (mobile) document.body.style.overflow = "";
    };
  }, [open, closePanel]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const patch = (id: string, fn: (m: Msg) => Msg) => setMsgs((all) => all.map((m) => (m.id === id ? fn(m) : m)));

  const send = useCallback(async (raw: string) => {
    const text = raw.trim().slice(0, CHAT_LIMITS.maxUserChars);
    if (!text || abortRef.current) return;
    setInput("");
    const user: Msg = { id: uid(), role: "user", content: text, products: {} };
    const bot: Msg = { id: uid(), role: "assistant", content: "", products: {} };
    const history = [...msgsRef.current.filter((m) => !m.error), user]
      .slice(-CHAT_LIMITS.maxTurns)
      .map((m) => ({ role: m.role, content: m.content }));
    setMsgs((all) => [...all.map((m) => ({ ...m, suggestions: undefined })), user, bot]);
    setBusy(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "The assistant is unavailable right now.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const e = JSON.parse(line) as ChatEvent;
          if (e.type === "text") patch(bot.id, (m) => ({ ...m, content: m.content + e.text }));
          else if (e.type === "product")
            patch(bot.id, (m) => ({ ...m, products: { ...m.products, [e.product.slug]: e.product } }));
          else if (e.type === "suggestions") patch(bot.id, (m) => ({ ...m, suggestions: e.items }));
          else if (e.type === "error") throw new Error(e.message);
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        patch(bot.id, (m) => ({
          ...m,
          error: true,
          content: m.content || `${(err as Error).message || "Something went wrong."} You can also email info@lyfepeptidescanada.com.`,
        }));
      }
    } finally {
      abortRef.current = null;
      setBusy(false);
    }
  }, []);

  // let any page open the chat, optionally with a question
  useEffect(() => {
    const onOpen = (e: Event) => {
      openPanel();
      const message = (e as CustomEvent<{ message?: string } | undefined>).detail?.message;
      if (message) setTimeout(() => send(message), 150);
    };
    window.addEventListener(OPEN_CHAT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, onOpen);
  }, [openPanel, send]);

  const reset = () => {
    abortRef.current?.abort();
    setMsgs([]);
    setInput("");
    inputRef.current?.focus();
  };

  // close the mobile sheet when a link inside it navigates
  const onNavigate = () => {
    if (window.matchMedia("(max-width: 639px)").matches) setOpen(false);
  };

  const last = msgs[msgs.length - 1];
  const chips = !msgs.length ? STARTER_PROMPTS : !busy && last?.role === "assistant" ? last.suggestions ?? [] : [];

  // keep the corner clear on the checkout confirmation
  if (pathname?.startsWith("/checkout")) return null;

  return (
    <>
      {/* greeting nudge */}
      {greet && !open && (
        <div className="chat-pop fixed bottom-[5.5rem] right-4 z-[80] w-[min(300px,calc(100vw-2rem))] sm:bottom-[6rem] sm:right-6">
          <div className="relative rounded-2xl border border-line bg-white p-4 pr-10 shadow-[0_20px_44px_-20px_rgb(13_30_56/0.45)]">
            <button
              type="button"
              onClick={dismissGreet}
              className="absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-full text-faint hover:bg-surface hover:text-ink"
              aria-label="Dismiss"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            <button type="button" onClick={openPanel} className="flex items-start gap-3 text-left">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-white">
                <Image src="/lyfe-logo.png" alt="" width={40} height={27} className="h-5 w-auto" />
              </span>
              <span className="text-[0.875rem] leading-snug">
                <span className="block font-bold text-navy">Questions? We&rsquo;re here to help.</span>
                <span className="mt-1 block text-muted">Ask about a compound, certificates of analysis or shipping.</span>
              </span>
            </button>
          </div>
        </div>
      )}

      {/* launcher: a pill on wide screens, a circle on phones */}
      <button
        ref={launcherRef}
        type="button"
        onClick={() => (open ? closePanel() : openPanel())}
        aria-expanded={open}
        aria-controls="lyfe-chat"
        aria-label={open ? "Close chat" : "Chat with Lyfe Support"}
        className={`chat-launcher fixed bottom-4 right-4 z-[80] flex h-14 items-center justify-center gap-2.5 rounded-full text-white sm:bottom-6 sm:right-6 ${
          open ? "w-14 max-sm:hidden" : "w-14 sm:w-auto sm:pl-5 sm:pr-6"
        }`}
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <>
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
            </svg>
            <span className="hidden text-[0.9375rem] font-semibold sm:inline">Chat with us</span>
          </>
        )}
      </button>

      {/* panel */}
      {open && (
        <section
          id="lyfe-chat"
          role="dialog"
          aria-label="Lyfe Support chat"
          className="chat-panel fixed inset-0 z-[80] flex flex-col overflow-hidden sm:inset-auto sm:bottom-[6rem] sm:right-6 sm:h-[min(620px,calc(100dvh-8rem))] sm:w-[380px] sm:rounded-2xl"
        >
          <header className="chat-head flex items-center gap-3 px-4 py-3.5 text-white sm:px-5">
            <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white" aria-hidden>
              <Image src="/lyfe-logo.png" alt="" width={40} height={27} className="h-5 w-auto" />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-navy bg-[#4ade80]" />
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="font-semibold">Lyfe Support</p>
              <p className="mt-0.5 text-[0.75rem] text-white/65">Typically replies instantly</p>
            </div>
            {msgs.length > 0 && (
              <button
                type="button"
                onClick={reset}
                className="grid h-9 w-9 place-items-center rounded-full text-white/75 transition hover:bg-white/10 hover:text-white"
                aria-label="Start a new chat"
                title="New chat"
              >
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5" />
                  <path d="M4 4v4.5h4.5" />
                </svg>
              </button>
            )}
            <button
              type="button"
              onClick={closePanel}
              className="grid h-9 w-9 place-items-center rounded-full text-white/75 transition hover:bg-white/10 hover:text-white"
              aria-label="Close chat"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M6 9l6 6 6-6" className="sm:hidden" />
                <path d="M6 6l12 12M18 6L6 18" className="max-sm:hidden" />
              </svg>
            </button>
          </header>

          <div ref={scrollRef} className="chat-scroll flex-1 overflow-y-auto px-4 py-5 sm:px-5" aria-live="polite">
            {!msgs.length && (
              <div className="chat-msg">
                <div className="chat-bubble-bot max-w-[88%] rounded-2xl rounded-tl-md px-4 py-3 text-[0.9rem] leading-relaxed text-ink">
                  <p className="font-semibold text-navy">Welcome to Lyfe Peptides</p>
                  <p className="mt-1">
                    I can help you find a compound, explain our testing and certificates of analysis, or answer shipping
                    questions. What can I help with?
                  </p>
                </div>
              </div>
            )}

            <ul className="grid gap-3">
              {msgs.map((m, i) => {
                const streaming = busy && i === msgs.length - 1 && m.role === "assistant";
                if (m.role === "user")
                  return (
                    <li key={m.id} className="chat-msg flex justify-end">
                      <p className="chat-bubble-user max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md px-4 py-2.5 text-[0.9rem] leading-relaxed text-white">
                        {m.content}
                      </p>
                    </li>
                  );
                return (
                  <li key={m.id} className="chat-msg flex">
                    <div
                      className={`chat-bubble-bot w-full max-w-[92%] break-words rounded-2xl rounded-tl-md px-4 py-3 text-[0.9rem] leading-relaxed ${
                        m.error ? "text-accent-deep" : "text-ink"
                      }`}
                    >
                      {streaming && !m.content ? (
                        <span className="flex h-5 items-center gap-1" aria-label="Assistant is typing">
                          <span className="chat-dot" />
                          <span className="chat-dot" />
                          <span className="chat-dot" />
                        </span>
                      ) : (
                        <RichText content={m.content} products={m.products} streaming={streaming} onNavigate={onNavigate} />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            {chips.length > 0 && (
              <div className="chat-msg mt-4 flex flex-wrap gap-2" style={{ animationDelay: "120ms" }}>
                {chips.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => send(c)}
                    className="chat-chip rounded-full border border-line bg-white px-3.5 py-1.5 text-[0.8125rem] font-medium text-navy hover:border-navy hover:bg-navy hover:text-white"
                  >
                    {c}
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
            className="border-t border-line bg-white px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-4"
          >
            <div className="flex items-end gap-2 rounded-xl border border-line bg-surface p-1.5 pl-3.5 transition focus-within:border-navy focus-within:bg-white">
              <label htmlFor="lyfe-chat-input" className="sr-only">
                Message
              </label>
              <textarea
                id="lyfe-chat-input"
                ref={inputRef}
                rows={1}
                value={input}
                maxLength={CHAT_LIMITS.maxUserChars}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 112)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Type your question…"
                className="max-h-28 min-h-[40px] flex-1 resize-none bg-transparent py-2 text-[0.9375rem] text-ink outline-none placeholder:text-faint"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-navy text-white transition hover:bg-navy-2 disabled:bg-surface-2 disabled:text-faint"
                aria-label="Send message"
              >
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </button>
            </div>
            <p className="mt-2 text-center text-[0.6875rem] text-faint">
              Products are for research use only. The assistant can&rsquo;t give medical advice.
            </p>
          </form>
        </section>
      )}
    </>
  );
}
