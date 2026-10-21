"use client";

import { useState } from "react";
import { ActionForm, SubmitButton } from "@/components/admin/client";
import { Card, Field, inputCls } from "@/components/admin/ui";
import type { ActionResult } from "@/lib/admin-auth";
import type { Coupon } from "@/lib/coupons";

export default function CouponForm({
  coupon,
  action,
}: {
  coupon?: Coupon;
  action: (prev: ActionResult | undefined, f: FormData) => Promise<ActionResult>;
}) {
  const [kind, setKind] = useState<"percent" | "amount">(coupon?.kind ?? "percent");
  const [code, setCode] = useState(coupon?.code ?? "");

  const suggest = () => setCode(`LYFE${Math.random().toString(36).slice(2, 7).toUpperCase()}`);

  return (
    <ActionForm action={action} redirectTo="/admin/coupons" className="max-w-2xl">
      {(errors) => (
        <Card>
          {coupon && <input type="hidden" name="id" value={coupon.id} />}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Code" error={errors.code} hint="Shoppers type this at checkout. Not case-sensitive." className="sm:col-span-2">
              <div className="flex gap-2">
                <input name="code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required className={`${inputCls} font-bold uppercase tracking-wide`} />
                <button type="button" onClick={suggest} className="btn btn-line h-11 min-h-0 shrink-0 rounded-xl">
                  Generate
                </button>
              </div>
            </Field>
            <Field label="Discount type">
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-surface p-1">
                {(["percent", "amount"] as const).map((k) => (
                  <label key={k} className={`cursor-pointer rounded-lg py-2 text-center text-sm font-semibold transition ${kind === k ? "bg-white text-navy shadow-sm" : "text-muted"}`}>
                    <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} className="sr-only" />
                    {k === "percent" ? "Percent" : "Fixed amount"}
                  </label>
                ))}
              </div>
            </Field>
            <Field label={kind === "percent" ? "Percent off" : "Amount off ($)"} error={errors.value}>
              <input
                name="value"
                type="number"
                min={kind === "percent" ? 1 : 0.01}
                max={kind === "percent" ? 100 : undefined}
                step={kind === "percent" ? 1 : 0.01}
                defaultValue={coupon ? (coupon.kind === "amount" ? coupon.value / 100 : coupon.value) : 10}
                required
                className={`${inputCls} num`}
              />
            </Field>
            <Field label="Minimum subtotal ($)" error={errors.min} hint="0 for no minimum.">
              <input name="min" type="number" min={0} step="0.01" defaultValue={coupon ? coupon.minSubtotalCents / 100 : 0} className={`${inputCls} num`} />
            </Field>
            <Field label="Usage limit" error={errors.maxUses} hint="Empty for unlimited.">
              <input name="maxUses" type="number" min={1} defaultValue={coupon?.maxUses ?? ""} className={`${inputCls} num`} />
            </Field>
            <Field label="Starts">
              <input name="startsAt" type="date" defaultValue={coupon?.startsAt ?? ""} className={inputCls} />
            </Field>
            <Field label="Ends" error={errors.expiresAt}>
              <input name="expiresAt" type="date" defaultValue={coupon?.expiresAt ?? ""} className={inputCls} />
            </Field>
            <Field label="Internal note" className="sm:col-span-2">
              <input name="note" defaultValue={coupon?.note ?? ""} placeholder="e.g. Instagram giveaway, October" className={inputCls} />
            </Field>
            <label className="flex items-center gap-2 text-sm font-semibold text-navy sm:col-span-2">
              <input type="checkbox" name="active" defaultChecked={coupon ? coupon.active : true} className="h-4 w-4 accent-[var(--navy)]" /> Active
            </label>
          </div>
          <div className="mt-5 flex gap-2 border-t border-line pt-4">
            <SubmitButton>{coupon ? "Save coupon" : "Create coupon"}</SubmitButton>
            <a href="/admin/coupons" className="btn btn-line">Cancel</a>
          </div>
        </Card>
      )}
    </ActionForm>
  );
}
