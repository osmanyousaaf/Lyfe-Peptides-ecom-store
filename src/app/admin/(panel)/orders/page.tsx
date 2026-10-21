import Link from "next/link";
import type { Metadata } from "next";
import { Card, EmptyState, PageHeader, TableWrap, formatDate, inputCls, td, th, tr } from "@/components/admin/ui";
import StatusBadge from "@/components/admin/sales/StatusBadge";
import { formatPrice } from "@/lib/format";
import { STATUSES, STATUS_LABEL, listOrders, statusCounts } from "@/lib/orders";
import { flag, regionName, countryName } from "@/lib/geo";

export const metadata: Metadata = { title: "Orders" };

// where the order came from: the region recorded at checkout, else the shipping province
function origin(o: { country: string | null; region: string | null; city: string | null; address: { province?: string; city?: string; country?: string } }) {
  if (o.country) return { country: o.country, region: o.region, city: o.city };
  if (o.address.province) return { country: o.address.country || "CA", region: o.address.province, city: o.address.city ?? null };
  return { country: null, region: null, city: null };
}


const PER_PAGE = 25;
const TABS = ["all", ...STATUSES] as const;

type SP = { status?: string; q?: string; from?: string; to?: string; page?: string };

export default async function OrdersPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const status = sp.status && (STATUSES as readonly string[]).includes(sp.status) ? sp.status : "";
  const page = Math.max(1, Number(sp.page) || 1);
  const filter = { q: sp.q, from: sp.from, to: sp.to };
  const counts = statusCounts(filter);
  const { orders, total } = listOrders({ ...filter, status }, page, PER_PAGE);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));

  const qs = (patch: Partial<SP>) => {
    const p = new URLSearchParams();
    const merged = { status, q: sp.q, from: sp.from, to: sp.to, page: String(page), ...patch };
    for (const [k, v] of Object.entries(merged)) if (v && !(k === "page" && v === "1")) p.set(k, v);
    const s = p.toString();
    return s ? `?${s}` : "";
  };
  const exportQs = new URLSearchParams(Object.entries({ status, q: sp.q ?? "", from: sp.from ?? "", to: sp.to ?? "" }).filter(([, v]) => v)).toString();

  return (
    <>
      <PageHeader
        title="Orders"
        description={`${counts.all} order${counts.all === 1 ? "" : "s"}${counts.paid + counts.processing ? ` · ${counts.paid + counts.processing} to fulfil` : ""}`}
        actions={
          <>
            <a href={`/api/admin/orders/export${exportQs ? `?${exportQs}` : ""}`} className="btn btn-line btn-sm">
              Export CSV
            </a>
            <Link href="/admin/orders/new" className="btn btn-navy btn-sm">
              + New order
            </Link>
          </>
        }
      />

      {/* status tabs */}
      <nav className="noscroll -mx-4 mb-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0" aria-label="Order status">
        {TABS.map((t) => {
          const on = (t === "all" && !status) || t === status;
          return (
            <Link
              key={t}
              href={`/admin/orders${qs({ status: t === "all" ? "" : t, page: "1" })}`}
              aria-current={on ? "page" : undefined}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
                on ? "border-navy bg-navy text-white" : "border-line bg-white text-ink hover:border-navy/40"
              }`}
            >
              {t === "all" ? "All" : STATUS_LABEL[t]}
              <span className={`num rounded-full px-1.5 text-xs ${on ? "bg-white/20" : "bg-surface text-muted"}`}>{counts[t]}</span>
            </Link>
          );
        })}
      </nav>

      <Card pad={false}>
        <form className="flex flex-wrap items-end gap-3 border-b border-line p-4" role="search">
          {status && <input type="hidden" name="status" value={status} />}
          <label className="min-w-[200px] flex-1">
            <span className="sr-only">Search orders</span>
            <input name="q" defaultValue={sp.q} placeholder="Search order #, email or name" className={inputCls} />
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-semibold text-muted">From</span>
            <input type="date" name="from" defaultValue={sp.from} className={`${inputCls} w-40`} />
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-semibold text-muted">To</span>
            <input type="date" name="to" defaultValue={sp.to} className={`${inputCls} w-40`} />
          </label>
          <button className="btn btn-navy h-11 min-h-0 rounded-xl">Filter</button>
          {(sp.q || sp.from || sp.to) && (
            <Link href={`/admin/orders${status ? `?status=${status}` : ""}`} className="h-11 content-center text-sm font-semibold text-muted hover:text-navy">
              Clear
            </Link>
          )}
        </form>

        {orders.length === 0 ? (
          <EmptyState
            title={counts.all === 0 ? "No orders yet" : "No orders match"}
            text={
              counts.all === 0
                ? "Paid Stripe checkouts appear here automatically. You can also enter a phone or e-transfer order by hand."
                : "Try another status, search or date range."
            }
            action={counts.all === 0 ? <Link href="/admin/orders/new" className="btn btn-navy btn-sm">Create a manual order</Link> : undefined}
          />
        ) : (
          <TableWrap>
            <table className="w-full min-w-[880px]">
              <thead>
                <tr>
                  <th className={th}>Order</th>
                  <th className={th}>Date</th>
                  <th className={th}>Customer</th>
                  <th className={th}>Region</th>
                  <th className={th}>Status</th>
                  <th className={`${th} text-right`}>Items</th>
                  <th className={`${th} text-right`}>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className={`${tr} relative`}>
                    <td className={td}>
                      <Link href={`/admin/orders/${o.id}`} className="num font-bold text-navy after:absolute after:inset-0 hover:text-accent-deep">
                        {o.number}
                      </Link>
                      {o.source === "manual" && <span className="ml-2 text-[0.6875rem] font-semibold uppercase text-faint">Manual</span>}
                    </td>
                    <td className={`${td} whitespace-nowrap text-muted`}>{formatDate(o.createdAt, true)}</td>
                    <td className={td}>
                      <span className="block font-semibold text-ink">{o.name || "—"}</span>
                      <span className="block text-xs text-muted">{o.email}</span>
                    </td>
                    <td className={`${td} whitespace-nowrap text-muted`}>
                      {(() => {
                        const g = origin(o);
                        return g.country ? (
                          <>
                            <span className="mr-1.5" aria-hidden>{flag(g.country)}</span>
                            {g.region ? regionName(g.country, g.region) : countryName(g.country)}
                          </>
                        ) : (
                          <span className="text-faint">—</span>
                        );
                      })()}
                    </td>
                    <td className={td}>
                      <StatusBadge status={o.status} />
                    </td>
                    <td className={`${td} num text-right text-muted`}>{o.itemCount}</td>
                    <td className={`${td} num text-right font-bold text-navy`}>{formatPrice(o.totalCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-line px-4 py-3 text-sm">
            <span className="text-muted">
              Page {page} of {pages} · {total} orders
            </span>
            <span className="flex gap-2">
              {page > 1 && <Link href={`/admin/orders${qs({ page: String(page - 1) })}`} className="btn btn-line btn-sm">← Newer</Link>}
              {page < pages && <Link href={`/admin/orders${qs({ page: String(page + 1) })}`} className="btn btn-line btn-sm">Older →</Link>}
            </span>
          </div>
        )}
      </Card>
    </>
  );
}
