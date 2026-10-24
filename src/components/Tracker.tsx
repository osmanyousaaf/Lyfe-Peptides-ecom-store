"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useCart } from "@/lib/cart";

// Sends first-party analytics to /api/track: one page view per route change, and a cart snapshot
// whenever the cart changes (debounced). The visitor id is random and stays in this browser.
const VID = "lyfe-vid";

export function visitorId(): string {
  try {
    let id = localStorage.getItem(VID);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VID, id);
    }
    return id;
  } catch {
    return "anon-" + Math.random().toString(36).slice(2, 12);
  }
}

export function track(body: Record<string, unknown>) {
  const payload = JSON.stringify({ vid: visitorId(), ...body });
  try {
    if (navigator.sendBeacon?.("/api/track", new Blob([payload], { type: "application/json" }))) return;
  } catch {}
  fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true }).catch(() => {});
}

export default function Tracker() {
  const pathname = usePathname();
  const { lines } = useCart();
  const lastCart = useRef<string | null>(null);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    track({ t: "view", path: pathname, ref: document.referrer });
  }, [pathname]);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const sig = JSON.stringify(lines.map((l) => [l.key, l.qty]));
    if (lastCart.current === null) {
      lastCart.current = sig; // don't report the cart restored on page load
      return;
    }
    if (sig === lastCart.current) return;
    lastCart.current = sig;
    const t = setTimeout(
      () =>
        track({
          t: "cart",
          lines: lines.map((l) => ({ name: l.name, slug: l.slug, qty: l.qty, unitPriceCents: l.unitPriceCents, variantLabel: l.variantLabel })),
        }),
      1000
    );
    return () => clearTimeout(t);
  }, [lines, pathname]);

  return null;
}
