"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { deleteMessage, getMessage, setMessageStatus, type MessageStatus } from "@/lib/inbox";

const STATUSES: MessageStatus[] = ["new", "read", "archived"];

// refresh the inbox and the sidebar's unread badge
const refresh = () => revalidatePath("/admin", "layout");

export async function setMessageStatusAction(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id"));
  const status = String(form.get("status")) as MessageStatus;
  if (!Number.isInteger(id) || !STATUSES.includes(status)) return;
  setMessageStatus(id, status);
  refresh();
  const back = String(form.get("back") ?? "");
  if (back.startsWith("/admin/messages")) redirect(back);
}

// called when a new message is opened
export async function markReadAction(id: number) {
  await requireAdmin();
  if (getMessage(id)?.status === "new") {
    setMessageStatus(id, "read");
    refresh();
  }
}

export async function deleteMessageAction(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id"));
  if (Number.isInteger(id)) deleteMessage(id);
  refresh();
  const back = String(form.get("back") ?? "");
  redirect(back.startsWith("/admin/messages") ? back : "/admin/messages");
}
