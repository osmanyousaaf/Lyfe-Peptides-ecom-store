import type { CartLine } from "./types";

// Sends only what was chosen; the server prices it from the catalog.
// Returns an error message, or redirects to Stripe.
export async function startCheckout(lines: CartLine[], coupon?: string | null): Promise<string | null> {
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
        coupon: coupon || undefined,
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

export type CouponPreview = { ok: true; code: string; label: string; discountCents: number } | { ok: false; error: string };

// Asks the server what a code is worth on this cart.
export async function previewCoupon(lines: CartLine[], code: string): Promise<CouponPreview> {
  try {
    const res = await fetch("/api/coupon/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, lines: lines.map((l) => ({ slug: l.slug, variantId: l.variantId, qty: l.qty })) }),
    });
    const data = await res.json();
    return data.ok ? data : { ok: false, error: data.error || "That code can't be used." };
  } catch {
    return { ok: false, error: "Couldn't check the code. Try again." };
  }
}
