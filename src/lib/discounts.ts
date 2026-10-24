// Discount codes, shared by the cart (to show the saving) and the checkout route (which applies
// it on Stripe). The server re-validates every code, so the browser can't invent one.
export type Discount = { code: string; percent: number; label: string };

export const WELCOME_CODE = "WELCOME10";

const CODES: Record<string, Discount> = {
  [WELCOME_CODE]: { code: WELCOME_CODE, percent: 10, label: "10% off for joining our list" },
};

export function findDiscount(code: unknown): Discount | null {
  if (typeof code !== "string") return null;
  return CODES[code.trim().toUpperCase()] ?? null;
}

export const FREE_SHIP_CENTS = 30000;
export const PROMO_KEY = "lyfe-promo";
