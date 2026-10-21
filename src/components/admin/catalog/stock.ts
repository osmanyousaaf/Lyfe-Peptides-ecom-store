import type { Product } from "@/lib/types";

export type StockState = "ok" | "low" | "out" | "untracked" | "off";

// one word for where a product stands: off sale, out, low, fine, or not tracked
export function stockState(p: Product): StockState {
  const low = p.lowStockAt ?? 5;
  if (!p.inStock) {
    const manualOff = p.type === "variable" ? p.variants.length > 0 && p.variants.some((v) => v.inStock) : p.stock == null || p.stock > 0;
    return manualOff ? "off" : "out";
  }
  const levels = p.type === "variable" ? p.variants.map((v) => v.stock ?? null) : [p.stock ?? null];
  const tracked = levels.filter((s): s is number => s !== null);
  if (!tracked.length) return "untracked";
  return tracked.some((s) => s <= low) ? "low" : "ok";
}

export function unitsOnHand(p: Product): number | null {
  const levels = p.type === "variable" ? p.variants.map((v) => v.stock ?? null) : [p.stock ?? null];
  const tracked = levels.filter((s): s is number => s !== null);
  return tracked.length ? tracked.reduce((a, b) => a + b, 0) : null;
}

export const STOCK_LABEL: Record<StockState, { text: string; tone: "green" | "orange" | "red" | "gray" | "violet" }> = {
  ok: { text: "In stock", tone: "green" },
  low: { text: "Low stock", tone: "orange" },
  out: { text: "Out of stock", tone: "red" },
  untracked: { text: "Not tracked", tone: "gray" },
  off: { text: "Off sale", tone: "violet" },
};
