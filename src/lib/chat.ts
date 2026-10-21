// Shared between the chat widget and /api/chat. Keep this file free of server-only imports.

export type ChatRole = "user" | "assistant";

export type ChatProduct = {
  id: number;
  slug: string;
  name: string;
  image: string;
  priceCents: number; // the "from" price for variable products
  variable: boolean;
  inStock: boolean;
};

// The route streams newline-delimited JSON, one event per line.
export type ChatEvent =
  | { type: "text"; text: string }
  | { type: "product"; product: ChatProduct }
  | { type: "suggestions"; items: string[] }
  | { type: "done"; source: "ai" | "local" }
  | { type: "error"; message: string };

export type ChatTurn = { role: ChatRole; content: string };

// The assistant names catalog items as [[product:slug]]; the widget swaps them for cards.
export const PRODUCT_TOKEN = /\[\[product:([a-z0-9-]+)\]\]/g;

export const CHAT_LIMITS = {
  maxTurns: 20,
  maxUserChars: 1000,
  maxTurnChars: 4000,
};

export const STARTER_PROMPTS = [
  "Shipping times",
  "What is a COA?",
  "How do dual chamber pens work?",
  "Find a peptide",
  "Track my order",
];
