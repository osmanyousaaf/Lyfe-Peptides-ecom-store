import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Avatar } from "@/components/account/AccountButton";
import { Badge, Card, EmptyState, PageHeader, Stat, TableWrap, formatDate, td, th, tr } from "@/components/admin/ui";
import StatusBadge from "@/components/admin/sales/StatusBadge";
import { emailLogFor, getAccountByEmail, signupCoupon } from "@/lib/customers";
import { formatPrice } from "@/lib/format";
import { flag, placeLabel } from "@/lib/geo";
import { getCustomer, listOrders } from "@/lib/orders";

export const metadata: Metadata = { title: "Customer" };

const EMAIL_TONE = { sent: "green", failed: "red", skipped: "gray" } as const;

export default async function CustomerPage({ params }: { params: Promise<{ email: string }> }) {
  const email = decodeURIComponent((await params).email).toLowerCase();
  const c = getCustomer(email);
  const account = getAccountByEmail(email);
  if (!c && !account) notFound();
  const { orders } = c ? listOrders({ email }, 1, 200) : { orders: [] };
  const coupon = account ? signupCoupon(account) : null;
  const mails = emailLogFor(email);
  const name = account?.name || c?.name || email;
  const geo = account?.country ? account : c?.province ? { country: "CA", region: c.province, city: c.city } : null;
  const spent = c?.spentCents ?? 0;
  const count = c?.orders ?? 0;

  return (
    <>
      <PageHeader
        back={{ href: "/admin/customers", label: "Customers" }}
        title={name}
        description={
          <span className="flex flex-wrap items-center gap-2">
            {email}
            {account ? <Badge tone="orange">Account · {account.provider === "google" ? "Google" : "dev sign-in"}</Badge> : <Badge>Guest</Badge>}
            {c?.subscribed ? <Badge tone="green">Newsletter subscriber</Badge> : null}
          </span>
        }
        actions={
          <a href={`mailto:${email}`} className="btn btn-navy btn-sm">
            Email customer
          </a>
        }
      />
      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Orders" value={count} />
        <Stat label="Total spent" value={formatPrice(spent)} />
        <Stat label="Average order" value={formatPrice(count ? Math.round(spent / count) : 0)} />
        <Stat
          label={account ? "Signed up" : "Customer since"}
          value={<span className="text-xl">{formatDate(account?.createdAt ?? c?.firstOrder)}</span>}
          sub={account?.lastLoginAt ? `Last sign-in ${formatDate(account.lastLoginAt, true)}` : undefined}
        />
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid min-w-0 content-start gap-5">
          <Card title="Order history" pad={false}>
            {orders.length === 0 ? (
              <EmptyState title="No orders yet" text={coupon?.state === "active" ? "Their sign-up code hasn't been used." : undefined} />
            ) : (
              <TableWrap>
                <table className="w-full min-w-[560px]">
                  <thead>
                    <tr>
                      <th className={th}>Order</th>
                      <th className={th}>Date</th>
                      <th className={th}>Status</th>
                      <th className={th}>Code</th>
                      <th className={`${th} text-right`}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className={`${tr} relative`}>
                        <td className={td}>
                          <Link href={`/admin/orders/${o.id}`} className="num font-bold text-navy after:absolute after:inset-0">
                            {o.number}
                          </Link>
                        </td>
                        <td className={`${td} text-muted`}>{formatDate(o.createdAt, true)}</td>
                        <td className={td}>
                          <StatusBadge status={o.status} />
                        </td>
                        <td className={`${td} font-mono text-xs text-muted`}>{o.couponCode ?? "—"}</td>
                        <td className={`${td} num text-right font-bold text-navy`}>{formatPrice(o.totalCents)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            )}
          </Card>
          <Card title="Emails sent" pad={false}>
            {mails.length === 0 ? (
              <EmptyState title="No emails yet" />
            ) : (
              <ul>
                {mails.map((m) => (
                  <li key={m.id} className="flex flex-wrap items-center gap-3 border-t border-line px-5 py-3 text-sm first:border-0">
                    <Badge tone={EMAIL_TONE[m.status as keyof typeof EMAIL_TONE] ?? "gray"}>{m.status}</Badge>
                    <span className="min-w-0 flex-1 truncate font-semibold text-navy">{m.subject}</span>
                    <span className="whitespace-nowrap text-xs text-muted">{formatDate(m.createdAt, true)}</span>
                    {m.error && <span className="w-full text-xs text-faint">{m.error}</span>}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
        <div className="grid content-start gap-5">
          <Card title="Profile">
            <div className="mb-4 flex items-center gap-3">
              <Avatar name={name} picture={account?.picture ?? ""} className="h-14 w-14 text-xl" />
              <div className="min-w-0 leading-tight">
                <p className="truncate font-bold text-navy">{name}</p>
                <p className="truncate text-xs text-muted">{email}</p>
              </div>
            </div>
            <dl className="grid gap-3 text-sm">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-faint">Region</dt>
                <dd>{geo?.country ? <><span aria-hidden>{flag(geo.country)}</span> {placeLabel(geo)}</> : "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-faint">Phone</dt>
                <dd>{c?.phone || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-faint">Ships to</dt>
                <dd>{[c?.city, c?.province].filter(Boolean).join(", ") || "—"}</dd>
              </div>
            </dl>
          </Card>
          {account && (
            <Card title="Sign-up code">
              {coupon ? (
                <div>
                  <p className="font-mono text-lg font-bold tracking-wider text-navy">{coupon.code}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
                    {coupon.value}% off ·
                    {coupon.state === "used up" ? <Badge tone="green">Used</Badge> : coupon.state === "active" ? <Badge tone="blue">Unused</Badge> : <Badge>{coupon.state}</Badge>}
                  </p>
                  {coupon.expiresAt && <p className="mt-1 text-xs text-faint">Expires {formatDate(`${coupon.expiresAt}T12:00:00Z`)}</p>}
                  <Link href={`/admin/coupons/${coupon.id}`} className="mt-3 inline-block text-sm font-bold text-accent-deep hover:underline">
                    Open in coupons →
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-muted">No code issued.</p>
              )}
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
