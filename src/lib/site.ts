// Store-wide contact details, shipping rules and social profiles.
// These are the defaults; the admin's Settings page overrides them (see lib/settings.ts),
// and client components read the live values through useSite().
export type Social = { name: "Instagram" | "Facebook" | "TikTok" | "YouTube"; href: string };

export type SiteSettings = {
  name: string;
  url: string;
  email: string;
  phone: string;
  hours: string;
  cutoff: string;
  freeShipCents: number;
  /** flat shipping charged below the free-shipping threshold */
  flatShipCents: number;
  social: Social[];
  /** messages scrolling in the top announcement bar */
  announcements: string[];
  chatEnabled: boolean;
  /** percent off the personal code new accounts get */
  signupDiscountPercent: number;
  /** show the "sign up for 10% off" invitation to visitors */
  signupPromptEnabled: boolean;
};

export const SITE: SiteSettings = {
  name: "Lyfe Peptides",
  url: "https://lyfepeptidescanada.com",
  email: "info@lyfepeptidescanada.com",
  phone: "",
  hours: "Monday to Friday, 9 am to 5 pm EST",
  cutoff: "1 PM EST",
  freeShipCents: 30000,
  flatShipCents: 1500,
  social: [
    { name: "Instagram", href: "https://www.instagram.com/lyfepeptidescanada" },
    { name: "Facebook", href: "https://www.facebook.com/lyfepeptidescanada" },
    { name: "TikTok", href: "https://www.tiktok.com/@lyfepeptidescanada" },
    { name: "YouTube", href: "https://www.youtube.com/@lyfepeptidescanada" },
  ],
  announcements: [
    "COA on every product",
    "99%+ purity guaranteed",
    "Free shipping on orders over $300",
    "Same-day dispatch before 1 PM EST",
    "Proudly Canadian",
  ],
  chatEnabled: true,
  signupDiscountPercent: 10,
  signupPromptEnabled: true,
};

// kept for existing imports; prefer useSite().social on the client and getSettings().social on the server
export const SOCIAL = SITE.social;

// Fire this to open the chat widget from anywhere: window.dispatchEvent(new CustomEvent(OPEN_CHAT_EVENT, { detail: { message } }))
export const OPEN_CHAT_EVENT = "lyfe:open-chat";
