"use server";

import { redirect } from "next/navigation";
import { requireAdmin, type ActionResult } from "@/lib/admin-auth";
import { findCoupon, normalizeCode } from "@/lib/coupons";
import { db } from "@/lib/db";

const str = (f: FormData, k: string, max = 200) => String(f.get(k) ?? "").trim().slice(0, max);
const day = (s: string) => (/^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null);

export async function saveCoupon(_prev: ActionResult | undefined, f: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = Number(f.get("id")) || 0;
  const errors: Record<string, string> = {};

  const code = normalizeCode(str(f, "code", 40));
  if (!/^[A-Z0-9_-]{3,40}$/.test(code)) errors.code = "Use 3–40 letters, numbers, dashes or underscores.";
  const clash = code ? findCoupon(code) : undefined;
  if (clash && clash.id !== id) errors.code = "Another coupon already uses this code.";

  const kind = str(f, "kind") === "amount" ? "amount" : "percent";
  const raw = Number(str(f, "value", 20));
  let value = 0;
  if (kind === "percent") {
    if (!Number.isInteger(raw) || raw < 1 || raw > 100) errors.value = "Enter a whole percent from 1 to 100.";
    value = raw;
  } else {
    if (!Number.isFinite(raw) || raw <= 0) errors.value = "Enter an amount above $0.";
    value = Math.round(raw * 100);
  }
  const min = Number(str(f, "min", 20) || 0);
  if (!Number.isFinite(min) || min < 0) errors.min = "Enter $0 or more.";
  const maxUsesRaw = str(f, "maxUses", 10);
  const maxUses = maxUsesRaw ? Number(maxUsesRaw) : null;
  if (maxUses != null && (!Number.isInteger(maxUses) || maxUses < 1)) errors.maxUses = "Leave empty for unlimited, or 1 or more.";
  const startsAt = day(str(f, "startsAt", 10));
  const expiresAt = day(str(f, "expiresAt", 10));
  if (startsAt && expiresAt && expiresAt < startsAt) errors.expiresAt = "Ends before it starts.";

  if (Object.keys(errors).length) return { ok: false, errors, message: "Check the highlighted fields." };

  const row = [code, kind, value, Math.round(min * 100), maxUses, startsAt, expiresAt, f.get("active") === "on" ? 1 : 0, str(f, "note", 300)];
  if (id) {
    db()
      .prepare(
        "UPDATE coupons SET code = ?, kind = ?, value = ?, min_subtotal_cents = ?, max_uses = ?, starts_at = ?, expires_at = ?, active = ?, note = ? WHERE id = ?"
      )
      .run(...row, id);
    return { ok: true, id, message: "Coupon saved." };
  }
  const res = db()
    .prepare(
      "INSERT INTO coupons (code, kind, value, min_subtotal_cents, max_uses, starts_at, expires_at, active, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .run(...row);
  return { ok: true, id: Number(res.lastInsertRowid), message: `Coupon ${code} created.` };
}

export async function toggleCoupon(f: FormData) {
  await requireAdmin();
  db().prepare("UPDATE coupons SET active = 1 - active WHERE id = ?").run(Number(f.get("id")));
  redirect("/admin/coupons");
}

export async function deleteCoupon(f: FormData) {
  await requireAdmin();
  db().prepare("DELETE FROM coupons WHERE id = ?").run(Number(f.get("id")));
  redirect("/admin/coupons");
}
