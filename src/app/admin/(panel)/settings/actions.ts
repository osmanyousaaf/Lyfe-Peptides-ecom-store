"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, revalidateStore, type ActionResult } from "@/lib/admin-auth";
import { EMAIL_RE } from "@/lib/rate-limit";
import { saveSettings } from "@/lib/settings";
import { SITE, type Social, type SiteSettings } from "@/lib/site";

const text = (form: FormData, k: string, max: number) => String(form.get(k) ?? "").trim().slice(0, max);

function dollarsToCents(v: string): number | null {
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(v)) return null;
  return Math.round(Number(v) * 100);
}

function httpUrl(v: string): string | null {
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString().replace(/\/$/, "") : null;
  } catch {
    return null;
  }
}

export async function saveSettingsAction(_prev: ActionResult | undefined, form: FormData): Promise<ActionResult> {
  await requireAdmin();
  const errors: Record<string, string> = {};

  const name = text(form, "name", 80);
  const url = httpUrl(text(form, "url", 200));
  const email = text(form, "email", 200).toLowerCase();
  const phone = text(form, "phone", 40);
  const hours = text(form, "hours", 120);
  const cutoff = text(form, "cutoff", 40);
  const freeShipCents = dollarsToCents(text(form, "freeShip", 12));
  const flatShipCents = dollarsToCents(text(form, "flatShip", 12));
  const announcements = form
    .getAll("announcement")
    .map((a) => String(a).trim().slice(0, 120))
    .filter(Boolean)
    .slice(0, 12);

  if (name.length < 2) errors.name = "Enter the store name.";
  if (!url) errors.url = "Enter the full site address, starting with https://";
  if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";
  if (!hours) errors.hours = "Enter your support hours.";
  if (!cutoff) errors.cutoff = "Enter the same-day dispatch cutoff.";
  if (freeShipCents === null) errors.freeShip = "Enter an amount like 300 or 299.99.";
  if (flatShipCents === null) errors.flatShip = "Enter an amount like 15 or 14.99.";
  if (!announcements.length) errors.announcements = "Keep at least one announcement.";
  const signupDiscountPercent = Number(text(form, "signupDiscountPercent", 3));
  if (!Number.isInteger(signupDiscountPercent) || signupDiscountPercent < 1 || signupDiscountPercent > 50) {
    errors.signupDiscountPercent = "Enter a whole number from 1 to 50.";
  }

  const social: Social[] = [];
  for (const s of SITE.social) {
    const raw = text(form, `social_${s.name}`, 300);
    if (!raw) {
      social.push({ name: s.name, href: "" });
      continue;
    }
    const href = httpUrl(raw);
    if (!href) errors[`social_${s.name}`] = "Enter a full link starting with https://";
    social.push({ name: s.name, href: href ?? "" });
  }

  if (Object.keys(errors).length) return { ok: false, message: "Check the highlighted fields.", errors };

  const patch: Partial<SiteSettings> = {
    name,
    url: url!,
    email,
    phone,
    hours,
    cutoff,
    freeShipCents: freeShipCents!,
    flatShipCents: flatShipCents!,
    social,
    announcements,
    chatEnabled: form.get("chatEnabled") === "on",
    signupDiscountPercent,
    signupPromptEnabled: form.get("signupPromptEnabled") === "on",
  };
  saveSettings(patch);
  revalidateStore();
  revalidatePath("/admin/settings");
  return { ok: true, message: "Settings saved. The store is updated." };
}
