"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, type ActionResult } from "@/lib/admin-auth";
import { EMAIL_RE } from "@/lib/rate-limit";
import { deleteSubscriber, setUnsubscribed, subscribe } from "@/lib/subscribers";

export async function addSubscriberAction(_prev: ActionResult | undefined, form: FormData): Promise<ActionResult> {
  await requireAdmin();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 200) return { ok: false, message: "That email address doesn't look right.", errors: { email: "Enter a valid email." } };
  const { already } = subscribe(email, "admin");
  revalidatePath("/admin/subscribers");
  return { ok: true, message: already ? `${email} was already subscribed` : `Added ${email}` };
}

export async function toggleSubscriberAction(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id"));
  if (Number.isInteger(id)) setUnsubscribed(id, form.get("unsubscribe") === "1");
  revalidatePath("/admin/subscribers");
}

export async function deleteSubscriberAction(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id"));
  if (Number.isInteger(id)) deleteSubscriber(id);
  revalidatePath("/admin/subscribers");
}
