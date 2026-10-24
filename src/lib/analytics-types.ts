// Shapes of what the storefront records. Shared by the tracker, the store and the dashboard.

export type Geo = { country: string; region: string; city: string };

export type ViewEvent = {
  t: "view" | "checkout";
  vid: string; // anonymous visitor id (random, kept in the browser)
  path: string;
  ref: string; // referrer host, "" for direct
  device: "Desktop" | "Mobile" | "Tablet";
  at: string;
  sample?: boolean;
} & Geo;

export type CartSnapshot = {
  vid: string;
  lines: { name: string; slug: string; qty: number; unitPriceCents: number; variantLabel?: string }[];
  subtotalCents: number;
  at: string;
  sample?: boolean;
} & Geo;

export type Order = {
  id: string; // Stripe checkout session id
  number: string;
  email: string;
  name: string;
  totalCents: number;
  subtotalCents: number;
  discountCents: number;
  currency: string;
  items: { name: string; qty: number; amountCents: number }[];
  province: string;
  city: string;
  country: string;
  promo?: string;
  vid?: string;
  at: string;
  sample?: boolean;
};

export type Subscriber = { email: string; source: string; at: string; sample?: boolean };
export type ContactMessage = { name: string; email: string; phone: string; topic: string; message: string; at: string; sample?: boolean };
