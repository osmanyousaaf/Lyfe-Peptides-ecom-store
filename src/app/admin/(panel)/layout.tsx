import AdminShell from "@/components/admin/AdminShell";
import { Toaster } from "@/components/admin/client";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { adminListProducts } from "@/lib/products";

// Every admin page is personal and live: never cache it.
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const q = (sql: string) => (db().prepare(sql).get() as { n: number }).n;
  const lowStock = adminListProducts().filter((p) =>
    p.type === "variable"
      ? p.variants.some((v) => v.stock != null && v.stock <= (p.lowStockAt ?? 5))
      : p.stock != null && p.stock <= (p.lowStockAt ?? 5)
  ).length;
  const counts = {
    orders: q("SELECT COUNT(*) AS n FROM orders WHERE status IN ('paid', 'processing')"),
    messages: q("SELECT COUNT(*) AS n FROM messages WHERE status = 'new'"),
    lowStock,
    // visitors seen in the last two minutes
    live: q("SELECT COUNT(*) AS n FROM presence WHERE last_seen >= datetime('now', '-2 minutes')"),
  };
  return (
    <AdminShell counts={counts}>
      {children}
      <Toaster />
    </AdminShell>
  );
}
