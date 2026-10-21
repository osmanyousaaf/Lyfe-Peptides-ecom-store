"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ActionForm, SubmitButton } from "@/components/admin/client";
import { Card, Field, inputCls, textareaCls } from "@/components/admin/ui";
import type { ActionResult } from "@/lib/admin-auth";
import { formatPrice } from "@/lib/format";
import { isUpload } from "@/lib/img";

export type PickProduct = {
  id: number;
  name: string;
  image: string;
  priceCents: number;
  stock: number | null;
  draft: boolean;
  variants: { id: number; label: string; priceCents: number; stock: number | null }[];
};

type Line = { key: string; productId: number; variantId: number | null; qty: number };

const PROVINCES = ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"];

export default function ManualOrderForm({
  products,
  action,
}: {
  products: PickProduct[];
  action: (prev: ActionResult | undefined, f: FormData) => Promise<ActionResult>;
}) {
  const [lines, setLines] = useState<Line[]>([]);
  const [pick, setPick] = useState("");
  const [q, setQ] = useState("");
  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  // one option per product or variant, filtered by the search box
  const options = useMemo(() => {
    const term = q.trim().toLowerCase();
    return products
      .filter((p) => !term || p.name.toLowerCase().includes(term))
      .flatMap((p) =>
        p.variants.length
          ? p.variants.map((v) => ({ value: `${p.id}:${v.id}`, label: `${p.name} — ${v.label}`, price: v.priceCents, stock: v.stock, draft: p.draft }))
          : [{ value: `${p.id}:0`, label: p.name, price: p.priceCents, stock: p.stock, draft: p.draft }]
      );
  }, [products, q]);

  const unit = (l: Line) => {
    const p = byId.get(l.productId);
    if (!p) return 0;
    return l.variantId ? p.variants.find((v) => v.id === l.variantId)?.priceCents ?? 0 : p.priceCents;
  };
  const subtotal = lines.reduce((n, l) => n + unit(l) * l.qty, 0);

  const add = () => {
    if (!pick) return;
    const [pid, vid] = pick.split(":").map(Number);
    setLines((ls) => {
      const hit = ls.find((l) => l.productId === pid && (l.variantId ?? 0) === vid);
      if (hit) return ls.map((l) => (l === hit ? { ...l, qty: Math.min(50, l.qty + 1) } : l));
      return [...ls, { key: pick, productId: pid, variantId: vid || null, qty: 1 }];
    });
    setPick("");
  };

  return (
    <ActionForm action={action} redirectTo="/admin/orders/{id}" className="grid gap-5 lg:grid-cols-[1fr_360px]">
      {(errors) => (
        <>
          <input type="hidden" name="lines" value={JSON.stringify(lines.map(({ productId, variantId, qty }) => ({ productId, variantId, qty })))} />
          <div className="grid content-start gap-5">
            <Card title="Products">
              <div className="flex flex-wrap gap-2">
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter products…" className={`${inputCls} sm:w-48`} aria-label="Filter products" />
                <select value={pick} onChange={(e) => setPick(e.target.value)} className={`${inputCls} min-w-0 flex-1`} aria-label="Product to add">
                  <option value="">Choose a product…</option>
                  {options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label} · {formatPrice(o.price)}
                      {o.stock != null ? ` · ${o.stock} in stock` : ""}
                      {o.draft ? " · draft" : ""}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={add} disabled={!pick} className="btn btn-navy h-11 min-h-0 rounded-xl">
                  Add
                </button>
              </div>
              {errors.lines && <p className="mt-2 text-xs font-semibold text-red-600">{errors.lines}</p>}

              {lines.length > 0 ? (
                <ul className="mt-4 divide-y divide-line rounded-xl border border-line">
                  {lines.map((l) => {
                    const p = byId.get(l.productId)!;
                    const v = p.variants.find((x) => x.id === l.variantId);
                    return (
                      <li key={l.key} className="flex items-center gap-3 p-3">
                        <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-surface">
                          {p.image && <Image src={p.image} alt="" fill sizes="44px" unoptimized={isUpload(p.image)} className="object-cover mix-blend-multiply" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-navy">{p.name}</span>
                          <span className="text-xs text-muted">{v ? `${v.label} · ` : ""}{formatPrice(unit(l))} each</span>
                        </span>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={l.qty}
                          onChange={(e) => {
                            const qty = Math.max(1, Math.min(50, Number(e.target.value) || 1));
                            setLines((ls) => ls.map((x) => (x.key === l.key ? { ...x, qty } : x)));
                          }}
                          className={`${inputCls} num w-20 text-center`}
                          aria-label={`Quantity of ${p.name}`}
                        />
                        <span className="num w-24 text-right text-sm font-bold text-navy">{formatPrice(unit(l) * l.qty)}</span>
                        <button
                          type="button"
                          onClick={() => setLines((ls) => ls.filter((x) => x.key !== l.key))}
                          className="grid h-8 w-8 place-items-center rounded-full text-faint hover:bg-red-50 hover:text-red-600"
                          aria-label={`Remove ${p.name}`}
                        >
                          ×
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-4 rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted">No products added yet.</p>
              )}
            </Card>

            <Card title="Customer & shipping">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" error={errors.name}><input name="name" required className={inputCls} /></Field>
                <Field label="Email" error={errors.email}><input name="email" type="email" required className={inputCls} /></Field>
                <Field label="Phone"><input name="phone" className={inputCls} /></Field>
                <Field label="Address" className="sm:col-span-2"><input name="line1" className={inputCls} /></Field>
                <Field label="Apt, suite"><input name="line2" className={inputCls} /></Field>
                <Field label="City"><input name="city" className={inputCls} /></Field>
                <Field label="Province">
                  <select name="province" defaultValue="ON" className={inputCls}>
                    {PROVINCES.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="Postal code"><input name="postalCode" className={`${inputCls} uppercase`} /></Field>
                <input type="hidden" name="country" value="CA" />
              </div>
            </Card>
          </div>

          <div className="grid content-start gap-5">
            <Card title="Summary">
              <div className="grid gap-4">
                <Field label="Status" error={errors.status} hint="Paid and later statuses take the items out of stock.">
                  <select name="status" defaultValue="paid" className={inputCls}>
                    <option value="pending">Pending payment</option>
                    <option value="paid">Paid</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Shipping ($)"><input name="shipping" type="number" min={0} step="0.01" defaultValue="0" className={`${inputCls} num`} /></Field>
                  <Field label="Tax ($)"><input name="tax" type="number" min={0} step="0.01" defaultValue="0" className={`${inputCls} num`} /></Field>
                </div>
                <Field label="Discount ($)" hint="Or enter a coupon code below."><input name="discount" type="number" min={0} step="0.01" defaultValue="0" className={`${inputCls} num`} /></Field>
                <Field label="Coupon code" error={errors.coupon}><input name="coupon" className={`${inputCls} uppercase`} /></Field>
                <Field label="Internal notes"><textarea name="notes" rows={3} className={textareaCls} placeholder="e.g. Paid by e-transfer" /></Field>
                <div className="flex items-baseline justify-between border-t border-line pt-3">
                  <span className="text-sm font-semibold text-muted">Items subtotal</span>
                  <span className="num text-xl font-extrabold text-navy">{formatPrice(subtotal)}</span>
                </div>
                <SubmitButton className="btn btn-navy h-12 w-full rounded-xl" pendingText="Creating…">
                  Create order
                </SubmitButton>
              </div>
            </Card>
          </div>
        </>
      )}
    </ActionForm>
  );
}
