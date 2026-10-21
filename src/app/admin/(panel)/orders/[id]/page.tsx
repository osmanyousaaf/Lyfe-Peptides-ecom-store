import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ActionForm, ConfirmButton, SubmitButton } from "@/components/admin/client";
import { Card, Field, PageHeader, formatDate, inputCls, textareaCls } from "@/components/admin/ui";
import StatusBadge from "@/components/admin/sales/StatusBadge";
import { formatPrice } from "@/lib/format";
import { isUpload } from "@/lib/img";
import { CARRIERS, STATUSES, STATUS_LABEL, getOrder, trackingUrl } from "@/lib/orders";
import { flag, placeLabel } from "@/lib/geo";
import { changeStatus, refundOrder, removeOrder, saveCustomer, saveNotes, saveTracking } from "../actions";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const o = getOrder(Number((await params).id));
  return { title: o ? `Order ${o.number}` : "Order" };
}

// the usual next step for each status, offered as a one-click button
const NEXT: Partial<Record<string, string>> = { pending: "paid", paid: "processing", processing: "shipped", shipped: "delivered" };

// where the order came from: the region recorded at checkout, else the shipping province
function origin(o: { country: string | null; region: string | null; city: string | null; address: { province?: string; city?: string; country?: string } }) {
  if (o.country) return { country: o.country, region: o.region, city: o.city };
  if (o.address.province) return { country: o.address.country || "CA", region: o.address.province, city: o.address.city ?? null };
  return { country: null, region: null, city: null };
}


export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const o = getOrder(Number((await params).id));
  if (!o) notFound();
  const next = NEXT[o.status];
  const track = trackingUrl(o.carrier, o.trackingNumber);
  const a = o.address;

  return (
    <>
      <PageHeader
        back={{ href: "/admin/orders", label: "Orders" }}
        title={`Order ${o.number}`}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <StatusBadge status={o.status} />
            <span>Placed {formatDate(o.createdAt, true)}</span>
            <span className="text-faint">·</span>
            <span>{o.source === "manual" ? "Manual order" : "Stripe Checkout"}</span>
          </span>
        }
        actions={
          <>
            <a href={`/admin/orders/${o.id}/slip`} target="_blank" className="btn btn-line btn-sm">
              Packing slip
            </a>
            <a href={`/admin/orders/${o.id}/slip?invoice=1`} target="_blank" className="btn btn-line btn-sm">
              Invoice
            </a>
            {next && (
              <ActionForm action={changeStatus}>
                <input type="hidden" name="id" value={o.id} />
                <input type="hidden" name="status" value={next} />
                <SubmitButton className="btn btn-navy btn-sm" pendingText="Updating…">
                  Mark {STATUS_LABEL[next as keyof typeof STATUS_LABEL].toLowerCase()}
                </SubmitButton>
              </ActionForm>
            )}
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="grid content-start gap-5">
          <Card title={`Items (${o.itemCount})`} pad={false}>
            <ul className="divide-y divide-line">
              {o.items.map((i) => (
                <li key={i.id} className="flex items-center gap-4 px-5 py-3.5">
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface">
                    {i.image && <Image src={i.image} alt="" fill sizes="56px" unoptimized={isUpload(i.image)} className="object-cover mix-blend-multiply" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    {i.slug ? (
                      <Link href={`/product/${i.slug}`} target="_blank" className="block truncate font-bold text-navy hover:text-accent-deep">
                        {i.name}
                      </Link>
                    ) : (
                      <span className="block truncate font-bold text-navy">{i.name}</span>
                    )}
                    <span className="text-sm text-muted">
                      {i.variantLabel ? `${i.variantLabel} · ` : ""}
                      <span className="num">{formatPrice(i.unitPriceCents)}</span> × {i.qty}
                    </span>
                  </span>
                  <span className="num font-bold text-navy">{formatPrice(i.unitPriceCents * i.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="grid gap-1.5 border-t border-line px-5 py-4 text-sm">
              <Row k="Subtotal" v={formatPrice(o.subtotalCents)} />
              {o.discountCents > 0 && <Row k={`Discount${o.couponCode ? ` (${o.couponCode})` : ""}`} v={`−${formatPrice(o.discountCents)}`} />}
              <Row k="Shipping" v={o.shippingCents ? formatPrice(o.shippingCents) : "Free"} />
              <Row k="Tax" v={formatPrice(o.taxCents)} />
              <div className="mt-1 flex justify-between border-t border-line pt-2 text-base font-extrabold text-navy">
                <dt>Total</dt>
                <dd className="num">{formatPrice(o.totalCents)}</dd>
              </div>
            </dl>
          </Card>

          <Card title="Timeline">
            <ol className="relative grid gap-4 border-l border-line pl-5">
              {o.events.map((e) => (
                <li key={e.id} className="relative">
                  <span className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-navy ring-1 ring-line" />
                  <p className="text-sm text-ink">{e.message}</p>
                  <p className="text-xs text-faint">{formatDate(e.createdAt, true)}</p>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="grid content-start gap-5">
          <Card title="Status">
            <ActionForm action={changeStatus} className="flex gap-2">
              <input type="hidden" name="id" value={o.id} />
              <select name="status" defaultValue={o.status} className={inputCls} aria-label="Order status">
                {STATUSES.filter((s) => s !== "refunded" || o.status === "refunded").map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
              <SubmitButton className="btn btn-navy h-11 min-h-0 rounded-xl" pendingText="…">
                Update
              </SubmitButton>
            </ActionForm>
            <p className="mt-2 text-xs text-muted">Cancelling returns the items to stock. Moving back to paid takes them out again.</p>
          </Card>

          <Card title="Shipping">
            {track && (
              <a href={track} target="_blank" rel="noreferrer" className="mb-4 flex items-center justify-between rounded-xl bg-surface px-3.5 py-2.5 text-sm font-semibold text-navy hover:bg-surface-2">
                <span>
                  {o.carrier} <span className="num">{o.trackingNumber}</span>
                </span>
                <span className="text-accent-deep">Track →</span>
              </a>
            )}
            <ActionForm action={saveTracking} className="grid gap-3">
              <input type="hidden" name="id" value={o.id} />
              <Field label="Carrier">
                <select name="carrier" defaultValue={o.carrier ?? "Canada Post"} className={inputCls}>
                  {[...CARRIERS, "Other"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Tracking number">
                <input name="tracking" defaultValue={o.trackingNumber ?? ""} className={inputCls} placeholder="e.g. 7023 2108 9200 1234" />
              </Field>
              {(o.status === "paid" || o.status === "processing") && (
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="markShipped" defaultChecked className="h-4 w-4 accent-[var(--navy)]" /> Mark as shipped
                </label>
              )}
              <SubmitButton className="btn btn-navy btn-sm">Save tracking</SubmitButton>
            </ActionForm>
          </Card>

          <Card title="Customer">
            <p className="font-bold text-navy">{o.name || "—"}</p>
            {o.email && (
              <p className="text-sm">
                <a href={`mailto:${o.email}?subject=${encodeURIComponent(`Your Lyfe Peptides order ${o.number}`)}`} className="text-accent-deep hover:underline">
                  {o.email}
                </a>
              </p>
            )}
            {o.phone && <p className="text-sm text-muted">{o.phone}</p>}
            <p
              className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-xs font-semibold text-navy"
              title={o.country ? "Where the order was placed from" : "From the shipping address"}
            >
              <span aria-hidden>{flag(origin(o).country)}</span> {placeLabel(origin(o))}
            </p>
            {o.email && (
              <Link href={`/admin/customers/${encodeURIComponent(o.email)}`} className="mt-1 inline-block text-xs font-semibold text-muted hover:text-navy">
                View customer →
              </Link>
            )}
            <address className="mt-3 rounded-xl bg-surface px-3.5 py-3 text-sm not-italic leading-relaxed text-ink">
              {a.name && <>{a.name}<br /></>}
              {a.line1 || "No address"}
              {a.line2 && <><br />{a.line2}</>}
              {(a.city || a.province || a.postalCode) && <><br />{[a.city, a.province].filter(Boolean).join(", ")} {a.postalCode}</>}
              {a.country && a.country !== "CA" && <><br />{a.country}</>}
            </address>
            <details className="group mt-3">
              <summary className="cursor-pointer list-none text-sm font-semibold text-navy hover:text-accent-deep">Edit details</summary>
              <ActionForm action={saveCustomer} className="mt-3 grid gap-3">
                <input type="hidden" name="id" value={o.id} />
                <Field label="Name"><input name="name" defaultValue={o.name} className={inputCls} /></Field>
                <Field label="Email"><input name="email" type="email" defaultValue={o.email} required className={inputCls} /></Field>
                <Field label="Phone"><input name="phone" defaultValue={o.phone} className={inputCls} /></Field>
                <Field label="Address"><input name="line1" defaultValue={a.line1} className={inputCls} /></Field>
                <Field label="Apt, suite"><input name="line2" defaultValue={a.line2} className={inputCls} /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="City"><input name="city" defaultValue={a.city} className={inputCls} /></Field>
                  <Field label="Province"><input name="province" defaultValue={a.province} className={inputCls} /></Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Postal code"><input name="postalCode" defaultValue={a.postalCode} className={inputCls} /></Field>
                  <Field label="Country"><input name="country" defaultValue={a.country || "CA"} maxLength={2} className={inputCls} /></Field>
                </div>
                <SubmitButton className="btn btn-navy btn-sm">Save details</SubmitButton>
              </ActionForm>
            </details>
          </Card>

          <Card title="Internal notes">
            <ActionForm action={saveNotes} className="grid gap-3">
              <input type="hidden" name="id" value={o.id} />
              <textarea name="notes" rows={4} defaultValue={o.notes} placeholder="Only staff see these." className={textareaCls} />
              <SubmitButton className="btn btn-line btn-sm">Save notes</SubmitButton>
            </ActionForm>
          </Card>

          <Card title="Payment">
            <dl className="grid gap-1.5 text-sm">
              <Row k="Paid" v={formatDate(o.paidAt, true)} />
              {o.stripePaymentIntent && <Row k="Stripe payment" v={o.stripePaymentIntent.slice(0, 18) + "…"} />}
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              {o.status !== "refunded" && o.status !== "pending" && (
                <ActionForm action={refundOrder}>
                  <input type="hidden" name="id" value={o.id} />
                  <ConfirmButton
                    confirm={
                      o.stripePaymentIntent
                        ? `Refund ${formatPrice(o.totalCents)} to the customer's card in Stripe and return the items to stock?`
                        : "Mark this order refunded and return the items to stock?"
                    }
                    className="btn btn-line btn-sm border-red-200 text-red-700 hover:border-red-400"
                  >
                    {o.stripePaymentIntent ? "Refund in Stripe" : "Mark refunded"}
                  </ConfirmButton>
                </ActionForm>
              )}
              <form action={removeOrder}>
                <input type="hidden" name="id" value={o.id} />
                <ConfirmButton confirm={`Delete order ${o.number} for good? Stock it holds goes back to inventory.`} className="btn btn-line btn-sm text-muted">
                  Delete order
                </ConfirmButton>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{k}</dt>
      <dd className="num text-right">{v}</dd>
    </div>
  );
}
