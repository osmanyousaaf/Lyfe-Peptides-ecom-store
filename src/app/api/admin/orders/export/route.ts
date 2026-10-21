import { adminOr401 } from "@/lib/admin-auth";
import { allOrdersForExport } from "@/lib/orders";

const cell = (v: unknown) => {
  const s = String(v ?? "");
  // quote everything; neutralise spreadsheet formulas
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};
const money = (c: number) => (c / 100).toFixed(2);

export async function GET(req: Request) {
  const denied = await adminOr401();
  if (denied) return denied;
  const u = new URL(req.url).searchParams;
  const orders = allOrdersForExport({
    status: u.get("status") ?? undefined,
    q: u.get("q") ?? undefined,
    from: u.get("from") ?? undefined,
    to: u.get("to") ?? undefined,
  });
  const head = [
    "Order", "Date (UTC)", "Status", "Source", "Customer", "Email", "Phone", "Address", "City", "Province", "Postal code",
    "Items", "Subtotal", "Discount", "Coupon", "Shipping", "Tax", "Total", "Carrier", "Tracking",
  ];
  const rows = orders.map((o) => [
    o.number, o.createdAt, o.status, o.source, o.name, o.email, o.phone,
    [o.address.line1, o.address.line2].filter(Boolean).join(", "), o.address.city, o.address.province, o.address.postalCode,
    o.items.map((i) => `${i.qty}× ${i.name}${i.variantLabel ? ` (${i.variantLabel})` : ""}`).join("; "),
    money(o.subtotalCents), money(o.discountCents), o.couponCode ?? "", money(o.shippingCents), money(o.taxCents),
    money(o.totalCents), o.carrier ?? "", o.trackingNumber ?? "",
  ]);
  const csv = [head, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
  const date = new Date().toISOString().slice(0, 10);
  return new Response(`﻿${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="lyfe-orders-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
