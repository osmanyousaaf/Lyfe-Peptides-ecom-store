// Admin guard for server components, server actions and admin route handlers.
// proxy.ts keeps logged-out visitors away from /admin, but every action re-checks here.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { SESSION_COOKIE, verifyToken } from "./admin-session";

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return verifyToken(jar.get(SESSION_COOKIE)?.value);
}

// for pages and server actions: bounce to the login screen when the session is missing or expired
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}

// for route handlers: a 401 response to return, or null when signed in
export async function adminOr401(): Promise<Response | null> {
  return (await isAdmin()) ? null : Response.json({ error: "Not signed in" }, { status: 401 });
}

// rebuild every cached storefront page after an admin change
export function revalidateStore() {
  revalidatePath("/", "layout");
}

// what admin server actions return to their forms
export type ActionResult = { ok: boolean; message?: string; errors?: Record<string, string>; id?: number | string };
