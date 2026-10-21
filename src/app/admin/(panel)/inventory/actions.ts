"use server";

import { requireAdmin, revalidateStore, type ActionResult } from "@/lib/admin-auth";
import { adjustStock, restock, setLowStockAt, setStock, type StockTarget } from "@/lib/catalog-admin";

function target(kind: unknown, id: unknown): StockTarget | null {
  const n = Number(id);
  if (!Number.isInteger(n) || n < 1) return null;
  return kind === "variant" ? { kind: "variant", id: n } : kind === "product" ? { kind: "product", id: n } : null;
}

// set an absolute stock level, or null to stop tracking
export async function setStockAction(kind: string, id: number, stock: number | null): Promise<ActionResult> {
  await requireAdmin();
  const t = target(kind, id);
  if (!t) return { ok: false, message: "Unknown item." };
  if (stock !== null && (!Number.isFinite(stock) || stock < 0 || stock > 1_000_000)) return { ok: false, message: "Enter 0 or more." };
  setStock(t, stock === null ? null : Math.floor(stock));
  revalidateStore();
  return { ok: true };
}

export async function adjustStockAction(kind: string, id: number, delta: number): Promise<ActionResult> {
  await requireAdmin();
  const t = target(kind, id);
  if (!t || !Number.isInteger(delta) || Math.abs(delta) > 100_000) return { ok: false, message: "Unknown item." };
  adjustStock(t, delta);
  revalidateStore();
  return { ok: true };
}

export async function setLowStockAction(productId: number, n: number): Promise<ActionResult> {
  await requireAdmin();
  if (!Number.isInteger(productId) || !Number.isInteger(n) || n < 0 || n > 100_000) return { ok: false, message: "Use a whole number." };
  setLowStockAt(productId, n);
  return { ok: true };
}

export async function restockAction(items: { kind: string; id: number }[], qty: number): Promise<ActionResult> {
  await requireAdmin();
  const targets = (Array.isArray(items) ? items : []).map((i) => target(i?.kind, i?.id)).filter((t): t is StockTarget => !!t);
  if (!targets.length) return { ok: false, message: "Select items to restock." };
  if (!Number.isInteger(qty) || qty < 1 || qty > 100_000) return { ok: false, message: "Enter how many units to add." };
  restock(targets.slice(0, 500), qty);
  revalidateStore();
  return { ok: true, message: `Added ${qty} to ${targets.length} item${targets.length === 1 ? "" : "s"}` };
}
