import Link from "next/link";
import type { Metadata } from "next";
import { Avatar } from "@/components/account/AccountButton";
import { Badge, Card, EmptyState, PageHeader, Stat, TableWrap, formatDate, inputCls, td, th, tr } from "@/components/admin/ui";
import { listAccounts, signupCoupon, signupsSince, type Account } from "@/lib/customers";
import { formatPrice } from "@/lib/format";
import { flag, placeLabel } from "@/lib/geo";
import { listCustomers, type Customer } from "@/lib/orders";

export const metadata: Metadata = { title: "Customers" };

type Row = {
  email: string;
  name: string;
  account?: Account;
  orders?: Customer;
  joined: string;
  codeState: string | null;
};

const FILTERS = [
  { id: "all", label: "Everyone" },
  { id: "accounts", label: "Accounts" },
  { id: "guests", label: "Guest checkouts" },
] as const;

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string; type?: string }> }) {
  const { q = "", type = "all" } = await searchParams;
  const accounts = listAccounts();
  const buyers = listCustomers();

  // one row per email: account holders and anyone who has ordered
  const byEmail = new Map<string, Row>();
  for (const a of accounts) {
    const c = signupCoupon(a);
    byEmail.set(a.email.toLowerCase(), { email: a.email, name: a.name, account: a, joined: a.createdAt, codeState: c ? c.state : null });
  }
  for (const b of buyers) {
    const key = b.email.toLowerCase();
    const row = byEmail.get(key);
    if (row) {
      row.orders = b;
      row.name = row.name || b.name;
    } else byEmail.set(key, { email: b.email, name: b.name, orders: b, joined: b.firstOrder, codeState: null });
  }
  const all = [...byEmail.values()].sort((a, b) => (b.orders?.lastOrder ?? b.joined).localeCompare(a.orders?.lastOrder ?? a.joined));

  const needle = q.trim().toLowerCase();
  const shown = all.filter(
    (r) =>
      (type === "accounts" ? r.account : type === "guests" ? !r.account : true) &&
      (!needle || r.email.toLowerCase().includes(needle) || r.name.toLowerCase().includes(needle))
  );
  const counts = { all: all.length, accounts: accounts.length, guests: all.filter((r) => !r.account).length };
  const repeat = buyers.filter((c) => c.orders > 1).length;
  const spent = buyers.reduce((n, c) => n + c.spentCents, 0);
  const codesUsed = all.filter((r) => r.codeState === "used up").length;
  const link = (t: string) => {
    const sp = new URLSearchParams();
    if (t !== "all") sp.set("type", t);
    if (q) sp.set("q", q);
    const s = sp.toString();
    return s ? `/admin/customers?${s}` : "/admin/customers";
  };

  return (
    <>
      <PageHeader title="Customers" description="Account holders and everyone who has placed an order, one row per email." />
      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Customers" value={all.length} sub={`${counts.guests} guest checkout${counts.guests === 1 ? "" : "s"}`} />
        <Stat label="Sign-ups" value={accounts.length} sub={`${signupsSince(30)} in the last 30 days`} tone="accent" />
        <Stat label="Sign-up codes used" value={codesUsed} sub={accounts.length ? `${Math.round((codesUsed / accounts.length) * 100)}% of accounts ordered with theirs` : undefined} tone="green" />
        <Stat label="Average lifetime value" value={formatPrice(buyers.length ? Math.round(spent / buyers.length) : 0)} sub={`${repeat} repeat customer${repeat === 1 ? "" : "s"}`} />
      </div>
      <Card pad={false}>
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
          <nav className="flex gap-1 rounded-xl bg-surface p-1" aria-label="Filter customers">
            {FILTERS.map((f) => (
              <Link
                key={f.id}
                href={link(f.id)}
                aria-current={type === f.id ? "page" : undefined}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${type === f.id ? "bg-white text-navy shadow-sm" : "text-muted hover:text-navy"}`}
              >
                {f.label} <span className="num text-xs opacity-60">{counts[f.id]}</span>
              </Link>
            ))}
          </nav>
          <form className="flex min-w-[240px] flex-1 gap-2" role="search">
            {type !== "all" && <input type="hidden" name="type" value={type} />}
            <label className="flex-1">
              <span className="sr-only">Search customers</span>
              <input name="q" defaultValue={q} placeholder="Search by name or email" className={inputCls} />
            </label>
            <button className="btn btn-navy h-11 min-h-0 rounded-xl">Search</button>
          </form>
        </div>
        {shown.length === 0 ? (
          <EmptyState
            title={all.length ? "No customers match" : "No customers yet"}
            text={all.length ? "Try another name, email or filter." : "Customers appear here when they sign up with Google or place their first order."}
          />
        ) : (
          <TableWrap>
            <table className="w-full min-w-[880px]">
              <thead>
                <tr>
                  <th className={th}>Customer</th>
                  <th className={th}>Type</th>
                  <th className={th}>Region</th>
                  <th className={th}>Sign-up code</th>
                  <th className={`${th} text-right`}>Orders</th>
                  <th className={`${th} text-right`}>Spent</th>
                  <th className={th}>Last activity</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => {
                  const geo = r.account?.country ? r.account : r.orders ? { country: r.orders.province ? "CA" : null, region: r.orders.province, city: r.orders.city } : null;
                  return (
                    <tr key={r.email} className={`${tr} relative`}>
                      <td className={td}>
                        <span className="flex items-center gap-3">
                          <Avatar name={r.name || r.email} picture={r.account?.picture ?? ""} className="h-9 w-9 shrink-0 text-sm" />
                          <span className="min-w-0">
                            <Link href={`/admin/customers/${encodeURIComponent(r.email)}`} className="block truncate font-bold text-navy after:absolute after:inset-0 hover:text-accent-deep">
                              {r.name || r.email}
                            </Link>
                            <span className="block truncate text-xs text-muted">{r.email}</span>
                          </span>
                        </span>
                      </td>
                      <td className={td}>
                        {r.account ? <Badge tone="orange">Account</Badge> : <Badge>Guest</Badge>}
                        {r.orders?.subscribed && <span className="ml-1"><Badge tone="green">Newsletter</Badge></span>}
                      </td>
                      <td className={`${td} whitespace-nowrap text-muted`}>
                        {geo?.country ? (
                          <>
                            <span className="mr-1.5" aria-hidden>{flag(geo.country)}</span>
                            {placeLabel(geo)}
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className={td}>
                        {r.codeState == null ? (
                          <span className="text-faint">—</span>
                        ) : r.codeState === "used up" ? (
                          <Badge tone="green">Used</Badge>
                        ) : r.codeState === "active" ? (
                          <Badge tone="blue">Unused</Badge>
                        ) : (
                          <Badge>{r.codeState}</Badge>
                        )}
                      </td>
                      <td className={`${td} num text-right`}>{r.orders?.orders ?? 0}</td>
                      <td className={`${td} num text-right font-bold text-navy`}>{formatPrice(r.orders?.spentCents ?? 0)}</td>
                      <td className={`${td} whitespace-nowrap text-muted`}>
                        {r.orders ? formatDate(r.orders.lastOrder) : <>Joined {formatDate(r.joined)}</>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Card>
    </>
  );
}
