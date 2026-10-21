import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PrintButton from "@/components/admin/sales/PrintButton";
import { formatDate } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin-auth";
import { formatPrice } from "@/lib/format";
import { getOrder } from "@/lib/orders";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Packing slip" };
export const dynamic = "force-dynamic";

// A printable packing slip, or an invoice with prices when ?invoice=1.
export default async function SlipPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ invoice?: string }> }) {
  await requireAdmin();
  const o = getOrder(Number((await params).id));
  if (!o) notFound();
  const invoice = (await searchParams).invoice === "1";
  const site = getSettings();
  const a = o.address;

  return (
    <div className="min-h-dvh bg-surface py-8 print:bg-white print:py-0">
      <div className="mx-auto mb-4 flex max-w-[800px] justify-end gap-2 px-4 print:hidden">
        <a href={`/admin/orders/${o.id}`} className="btn btn-line btn-sm">Back to order</a>
        <PrintButton label={invoice ? "Print invoice" : "Print slip"} />
      </div>
      <article className="mx-auto max-w-[800px] bg-white p-10 shadow-sm print:max-w-none print:p-0 print:shadow-none">
        <header className="flex items-start justify-between gap-6 border-b border-line pb-6">
          <div className="flex items-center gap-3">
            <Image src="/lyfe-logo.png" alt="" width={72} height={48} className="h-12 w-auto" />
            <div className="leading-tight">
              <p className="text-lg font-extrabold text-navy">{site.name}</p>
              <p className="text-xs text-muted">{site.email}</p>
              <p className="text-xs text-muted">{site.url.replace(/^https?:\/\//, "")}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold uppercase tracking-wide text-navy">{invoice ? "Invoice" : "Packing slip"}</p>
            <p className="num mt-1 text-sm font-bold">{o.number}</p>
            <p className="text-sm text-muted">{formatDate(o.createdAt)}</p>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-6 py-6 text-sm">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-faint">Ship to</p>
            <p className="leading-relaxed">
              <strong>{a.name || o.name}</strong>
              <br />
              {a.line1}
              {a.line2 && <><br />{a.line2}</>}
              <br />
              {[a.city, a.province].filter(Boolean).join(", ")} {a.postalCode}
              <br />
              {a.country === "CA" || !a.country ? "Canada" : a.country}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-faint">Customer</p>
            <p className="leading-relaxed">
              {o.email}
              {o.phone && <><br />{o.phone}</>}
            </p>
            {o.trackingNumber && (
              <>
                <p className="mb-1 mt-3 text-xs font-bold uppercase tracking-wider text-faint">Tracking</p>
                <p className="num">{o.carrier} {o.trackingNumber}</p>
              </>
            )}
          </div>
        </section>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-line text-left text-xs uppercase tracking-wider text-faint">
              <th className="py-2 font-bold">Item</th>
              <th className="py-2 text-right font-bold">Qty</th>
              {invoice && <th className="py-2 text-right font-bold">Price</th>}
              {invoice && <th className="py-2 text-right font-bold">Total</th>}
              {!invoice && <th className="w-16 py-2 text-right font-bold">Packed</th>}
            </tr>
          </thead>
          <tbody>
            {o.items.map((i) => (
              <tr key={i.id} className="border-b border-line">
                <td className="py-3">
                  <span className="font-semibold">{i.name}</span>
                  {i.variantLabel && <span className="block text-xs text-muted">{i.variantLabel}</span>}
                </td>
                <td className="num py-3 text-right">{i.qty}</td>
                {invoice && <td className="num py-3 text-right">{formatPrice(i.unitPriceCents)}</td>}
                {invoice && <td className="num py-3 text-right">{formatPrice(i.unitPriceCents * i.qty)}</td>}
                {!invoice && (
                  <td className="py-3 text-right">
                    <span className="inline-block h-4 w-4 border border-ink" />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {invoice && (
          <dl className="ml-auto mt-4 grid w-64 gap-1 text-sm">
            <Row k="Subtotal" v={formatPrice(o.subtotalCents)} />
            {o.discountCents > 0 && <Row k={`Discount${o.couponCode ? ` (${o.couponCode})` : ""}`} v={`−${formatPrice(o.discountCents)}`} />}
            <Row k="Shipping" v={o.shippingCents ? formatPrice(o.shippingCents) : "Free"} />
            <Row k="Tax" v={formatPrice(o.taxCents)} />
            <div className="mt-1 flex justify-between border-t border-ink pt-2 font-extrabold">
              <dt>Total (CAD)</dt>
              <dd className="num">{formatPrice(o.totalCents)}</dd>
            </div>
          </dl>
        )}

        <footer className="mt-10 border-t border-line pt-4 text-xs leading-relaxed text-muted">
          <p className="font-semibold text-ink">Thank you for your order.</p>
          <p>A batch-specific certificate of analysis is included for each compound.</p>
          <p className="mt-2">
            For research purposes only. Not for human or animal consumption. Not approved by Health Canada for personal use.
          </p>
        </footer>
      </article>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{k}</dt>
      <dd className="num">{v}</dd>
    </div>
  );
}
