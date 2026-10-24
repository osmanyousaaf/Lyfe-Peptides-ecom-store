import type { CartLine } from "./types";
import { track, visitorId } from "@/components/Tracker";

// Sends only what was chosen; the server prices it from the catalog.
// Returns an error message, or redirects to Stripe.
export async function startCheckout(lines: CartLine[], code?: string | null): Promise<string | null> {
  track({ t: "checkout", path: "/checkout" });
  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lines: lines.map((l) => ({
          slug: l.slug,
          variantId: l.variantId,
          qty: l.qty,
        })),
        code: code ?? undefined,
        vid: visitorId(),
      }),
    });
    const data = await res.json();
    if (!res.ok) return data.error || "Checkout is unavailable right now.";
    window.location.href = data.url;
    return null;
  } catch {
    return "Checkout could not be reached. Check your connection and try again.";
  }
}
