"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin, revalidateStore, type ActionResult } from "@/lib/admin-auth";
import { deletePost, savePost, setPostStatus, type PostInput } from "@/lib/blog-write";
import { adminListProducts } from "@/lib/products";

export async function savePostAction(original: string | null, input: PostInput): Promise<ActionResult> {
  await requireAdmin();
  const valid = new Set(adminListProducts().map((p) => p.slug));
  const res = savePost(original, input, valid);
  if (!res.ok) return { ok: false, message: "Check the highlighted fields.", errors: res.errors };
  revalidateStore();
  revalidatePath("/admin/blog");
  return { ok: true, message: original ? "Post saved" : "Post created", id: res.slug };
}

export async function deletePostAction(form: FormData) {
  await requireAdmin();
  const slug = String(form.get("slug") ?? "");
  if (slug) deletePost(slug);
  revalidateStore();
  redirect("/admin/blog");
}

export async function setPostStatusAction(form: FormData) {
  await requireAdmin();
  const slug = String(form.get("slug") ?? "");
  const status = form.get("status") === "draft" ? "draft" : "published";
  if (slug) setPostStatus(slug, status);
  revalidateStore();
  revalidatePath("/admin/blog");
}
