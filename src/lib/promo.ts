"use client";

import { useCallback, useEffect, useState } from "react";
import { findDiscount, PROMO_KEY, type Discount } from "./discounts";

// The applied promo code, remembered in this browser and kept in sync across components.
const EVENT = "lyfe:promo";

function read(): Discount | null {
  try {
    return findDiscount(localStorage.getItem(PROMO_KEY));
  } catch {
    return null;
  }
}

export function setPromo(code: string | null) {
  try {
    if (code) localStorage.setItem(PROMO_KEY, code);
    else localStorage.removeItem(PROMO_KEY);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export function usePromo() {
  const [promo, setState] = useState<Discount | null>(null);
  useEffect(() => {
    const sync = () => setState(read());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const apply = useCallback((code: string) => {
    const d = findDiscount(code);
    if (d) setPromo(d.code);
    return d;
  }, []);
  const clear = useCallback(() => setPromo(null), []);
  return { promo, apply, clear };
}

// Newsletter / welcome sign-up, shared by the pop-up and the newsletter band.
export function useSignup(source: string) {
  const [status, setStatus] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [code, setCode] = useState("");
  const send = useCallback(
    async (payload: { email?: string; credential?: string }) => {
      setStatus("busy");
      try {
        const res = await fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, source }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong.");
        setCode(data.code);
        setPromo(data.code); // applied to the cart straight away
        try {
          localStorage.setItem("lyfe-subscribed", "yes");
        } catch {}
        setStatus("done");
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "Something went wrong.");
        setStatus("error");
      }
    },
    [source]
  );
  const submit = useCallback((email: string) => send({ email }), [send]);
  const submitGoogle = useCallback((credential: string) => send({ credential }), [send]);
  return { status, message, code, submit, submitGoogle };
}

export const openWelcome = () => window.dispatchEvent(new Event("lyfe:open-welcome"));
