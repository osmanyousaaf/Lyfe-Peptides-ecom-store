import Link from "next/link";
import type { Metadata } from "next";
import { ConfirmButton } from "@/components/admin/client";
import { Badge, Card, EmptyState, PageHeader, TableWrap, formatDate, td, th, tr, type Tone } from "@/components/admin/ui";
import { couponState, describeCoupon, listCoupons } from "@/lib/coupons";
import { formatPrice } from "@/lib/format";
import { deleteCoupon, toggleCoupon } from "./actions";

export const metadata: Metadata = { title: "Coupons" };

const TONE: Record<ReturnType<typeof couponState>, Tone> = {
  active: "green",
  scheduled: "blue",
  expired: "gray",
  "used up": "gray",
  disabled: "red",
};

export default function CouponsPage() {
  const coupons = listCoupons();
  return (
    <>
      <PageHeader
        title="Coupons"
        description="Discount codes shoppers can apply in the cart. Stripe charges the same discount."
        actions={<Link href="/admin/coupons/new" className="btn btn-navy btn-sm">+ New coupon</Link>}
      />
      <Card pad={false}>
        {coupons.length === 0 ? (
          <EmptyState
            title="No coupons yet"
            text="Create a code like WELCOME10 for 10% off, or a fixed amount off orders above a minimum."
            action={<Link href="/admin/coupons/new" className="btn btn-navy btn-sm">Create a coupon</Link>}
          />
        ) : (
          <TableWrap>
            <table className="w-full min-w-[760px]">
              <thead>
                <tr>
                  <th className={th}>Code</th>
                  <th className={th}>Discount</th>
                  <th className={th}>Status</th>
                  <th className={`${th} text-right`}>Used</th>
                  <th className={th}>Runs</th>
                  <th className={`${th} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => {
                  const state = couponState(c);
                  return (
                    <tr key={c.id} className={tr}>
                      <td className={td}>
                        <Link href={`/admin/coupons/${c.id}`} className="font-mono font-bold tracking-wide text-navy hover:text-accent-deep">
                          {c.code}
                        </Link>
                        {c.note && <span className="block text-xs text-muted">{c.note}</span>}
                      </td>
                      <td className={td}>
                        {describeCoupon(c)}
                        {c.minSubtotalCents > 0 && <span className="block text-xs text-muted">over {formatPrice(c.minSubtotalCents)}</span>}
                      </td>
                      <td className={td}><Badge tone={TONE[state]}>{state[0].toUpperCase() + state.slice(1)}</Badge></td>
                      <td className={`${td} num text-right`}>
                        {c.uses}
                        {c.maxUses != null && <span className="text-faint"> / {c.maxUses}</span>}
                      </td>
                      <td className={`${td} whitespace-nowrap text-muted`}>
                        {c.startsAt || c.expiresAt ? `${c.startsAt ? formatDate(c.startsAt) : "Now"} → ${c.expiresAt ? formatDate(c.expiresAt) : "no end"}` : "Always"}
                      </td>
                      <td className={`${td} text-right`}>
                        <span className="inline-flex gap-1.5">
                          <form action={toggleCoupon}>
                            <input type="hidden" name="id" value={c.id} />
                            <button className="btn btn-line btn-sm">{c.active ? "Disable" : "Enable"}</button>
                          </form>
                          <form action={deleteCoupon}>
                            <input type="hidden" name="id" value={c.id} />
                            <ConfirmButton confirm={`Delete ${c.code}? Past orders keep their discount.`} className="btn btn-line btn-sm text-red-700">
                              Delete
                            </ConfirmButton>
                          </form>
                        </span>
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
