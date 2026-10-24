"use client";

import { useEffect, useState } from "react";
import { openWelcome } from "@/lib/promo";
import { CloseIcon } from "./icons";

const KEY = "lyfe-promobar-closed";

// A slim, static offer line above the header (it doesn't scroll). Dismissible.
export default function PromoBar() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      setShow(localStorage.getItem(KEY) !== "yes");
    } catch {
      setShow(true);
    }
  }, []);
  if (!show) return null;
  return (
    <div className="relative bg-[linear-gradient(90deg,#f26a12,#ff8a3d)] text-white">
      <div className="wrap flex h-9 items-center justify-center gap-2 text-center text-[0.8125rem] font-semibold">
        <button type="button" onClick={openWelcome} className="underline-offset-2 hover:underline">
          Sign up and get 10% off your first order
        </button>
        <span className="hidden text-white/70 sm:inline" aria-hidden>·</span>
        <span className="hidden sm:inline">Free shipping on orders over $300</span>
      </div>
      <button
        type="button"
        onClick={() => {
          setShow(false);
          try {
            localStorage.setItem(KEY, "yes");
          } catch {}
        }}
        className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full hover:bg-white/15"
        aria-label="Dismiss offer"
      >
        <CloseIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
