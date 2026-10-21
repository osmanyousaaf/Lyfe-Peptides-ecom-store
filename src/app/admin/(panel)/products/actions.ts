"use server";

import { redirect } from "next/navigation";
import { requireAdmin, revalidateStore, type ActionResult } from "@/lib/admin-auth";
import { deleteProduct, duplicateProduct, saveProduct, setProductStatus, validateProduct } from "@/lib/catalog-admin";

const idOf = (form: FormData) => {
  const id = Number(form.get("id"));
  return Number.isInteger(id) && id > 0 ? id : null;
};

// the editor posts its whole state as JSON in "payload"
export async function saveProductAction(_prev: ActionResult | undefined, form: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = idOf(form) ?? undefined;
  let raw: unknown;
  try {
    raw = JSON.parse(String(form.get("payload") ?? "{}"));
  } catch {
    return { ok: false, message: "The form couldn't be read. Reload and try again." };
  }
  const checked = validateProduct(raw, id);
  if (!checked.ok) return { ok: false, message: "Fix the highlighted fields.", errors: checked.errors };
  const saved = saveProduct(checked.input, id);
  revalidateStore();
  return { ok: true, message: id ? "Product saved" : "Product created", id: saved };
}

export async function toggleStatusAction(form: FormData) {
  await requireAdmin();
  const id = idOf(form);
  if (!id) return;
  setProductStatus(id, form.get("status") === "draft" ? "draft" : "published");
  revalidateStore();
}

export async function duplicateProductAction(form: FormData) {
  await requireAdmin();
  const id = idOf(form);
  const copy = id ? duplicateProduct(id) : null;
  if (copy) redirect(`/admin/products/${copy}`);
}

export async function deleteProductAction(form: FormData) {
  await requireAdmin();
  const id = idOf(form);
  if (id) deleteProduct(id);
  revalidateStore();
  if (form.get("from") === "editor") redirect("/admin/products");
}
