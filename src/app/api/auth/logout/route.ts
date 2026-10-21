import { NextResponse } from "next/server";
import { clearCustomerCookie } from "@/lib/customer-session";

// POST /api/auth/logout — forms get redirected home, fetch callers get JSON
export async function POST(req: Request) {
  await clearCustomerCookie();
  if (req.headers.get("accept")?.includes("application/json")) return NextResponse.json({ ok: true });
  return NextResponse.redirect(new URL("/", req.url), 303);
}
