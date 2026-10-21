import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import ClearCart from "./ClearCart";
import { formatPrice } from "@/lib/format";
import { isUpload } from "@/lib/img";
import { getOrderBySession, recordStripeSession } from "@/lib/orders";
import { ArrowRight, CheckIcon, MailIcon, ShieldIcon, TruckIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Order received", robots: { index: false } };

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  let order = session_id ? getOrderBySession(session_id) : undefined;
  if (session_id && !order) {
    try {
      await recordStripeSession(session_id);
      order = getOrderBySession(session_id);
    } catch {
      // the webhook will record it; the page still confirms
    }
  }

  return (
    <div className="wrap section">
      <ClearCart />
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-col items-center text-center">
          <span className="rise grid h-20 w-20 place-items-center rounded-full bg-green text-white shadow-[0_0_0_10px_rgb(47_154_74/0.12)]">
            <CheckIcon className="h-10 w-10" />
          </span>
          <h1 className="display rise mt-6 text-navy" style={{ animationDelay: "80ms" }}>
            Order received
          </h1>
          {order && (
            <p className="rise mt-3 rounded-full bg-surface px-4 py-1.5 text-sm font-bold text-navy" style={{ animationDelay: "140ms" }}>
              Order <span className="num">{order.number}</span>
            </p>
          )}
          <p className="rise mt-4 max-w-[46ch] text-muted" style={{ animationDelay: "200ms" }}>
            {order?.email ? (
              <>A confirmation is on its way to <strong className="text-ink">{order.email}</strong>.</>
            ) : (
              "A confirmation is on its way to your inbox."
            )}{" "}
            Orders placed before 1 PM EST leave today, with the certificate of analysis for each batch inside.
          </p>
        </div>

        {order && order.items.length > 0 && (
          <div className="rise mt-10 rounded-3xl border border-line bg-white p-5 sm:p-6" style={{ animationDelay: "260ms" }}>
            <ul className="divide-y divide-line">
              {order.items.map((i) => (
                <li key={i.id} className="flex items-center gap-4 py-3">
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface">
                    {i.image && <Image src={i.image} alt="" fill sizes="56px" unoptimized={isUpload(i.image)} className="blend object-cover" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold text-navy">{i.name}</span>
                    <span className="text-sm text-muted">
                      {i.variantLabel ? `${i.variantLabel} · ` : ""}Qty {i.qty}
                    </span>
                  </span>
                  <span className="num font-bold text-navy">{formatPrice(i.unitPriceCents * i.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-3 grid gap-1.5 border-t border-line pt-4 text-sm">
              <Row k="Subtotal" v={formatPrice(order.subtotalCents)} />
              {order.discountCents > 0 && <Row k={`Discount${order.couponCode ? ` (${order.couponCode})` : ""}`} v={`−${formatPrice(order.discountCents)}`} />}
              <Row k="Shipping" v={order.shippingCents ? formatPrice(order.shippingCents) : "Free"} />
              {order.taxCents > 0 && <Row k="Tax" v={formatPrice(order.taxCents)} />}
              <div className="mt-1 flex justify-between text-base font-extrabold text-navy">
                <dt>Total</dt>
                <dd className="num">{formatPrice(order.totalCents)}</dd>
              </div>
            </dl>
          </div>
        )}

        <ul className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            { Icon: MailIcon, t: "Confirmation email", s: "Receipt from Stripe" },
            { Icon: TruckIcon, t: "Ships from Canada", s: "Same day before 1 PM EST" },
            { Icon: ShieldIcon, t: "COA in the box", s: "Batch-specific certificate" },
          ].map(({ Icon, t, s }) => (
            <li key={t} className="flex items-center gap-3 rounded-2xl bg-surface p-4">
              <Icon className="h-5 w-5 shrink-0 text-accent" />
              <span className="leading-tight">
                <span className="block text-sm font-bold text-navy">{t}</span>
                <span className="text-xs text-muted">{s}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="btn btn-solid shine group">
            Keep browsing <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href="/contact" className="btn btn-line">
            Questions? Contact us
          </Link>
        </div>
      </div>
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
