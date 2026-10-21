import { adminOr401 } from "@/lib/admin-auth";
import { listSubscribers } from "@/lib/subscribers";

// quote when needed, and stop spreadsheet apps reading a value as a formula
const cell = (raw: string) => {
  const v = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
};

// CSV of subscribers: ?filter=active|unsubscribed|all (default active)
export async function GET(req: Request) {
  const denied = await adminOr401();
  if (denied) return denied;
  const f = new URL(req.url).searchParams.get("filter");
  const filter = f === "all" || f === "unsubscribed" ? f : "active";
  const rows = listSubscribers(filter);
  const csv = [
    "email,status,source,subscribed_at,unsubscribed_at",
    ...rows.map((s) =>
      [s.email, s.unsubscribedAt ? "unsubscribed" : "active", s.source, s.createdAt, s.unsubscribedAt ?? ""].map(cell).join(",")
    ),
  ].join("\n");
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="lyfe-subscribers-${filter}-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
