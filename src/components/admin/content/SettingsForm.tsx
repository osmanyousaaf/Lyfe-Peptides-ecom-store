"use client";

import { useState } from "react";
import { ActionForm, SubmitButton } from "@/components/admin/client";
import { Card, Field, inputCls } from "@/components/admin/ui";
import { saveSettingsAction } from "@/app/admin/(panel)/settings/actions";
import type { SiteSettings } from "@/lib/site";

const dollars = (cents: number) => (cents / 100).toFixed(2).replace(/\.00$/, "");

export default function SettingsForm({ settings }: { settings: SiteSettings }) {
  // keys keep focus stable while items move
  const [items, setItems] = useState(() => settings.announcements.map((text, i) => ({ key: i, text })));
  const [nextKey, setNextKey] = useState(settings.announcements.length);

  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const n = items.slice();
    [n[i], n[j]] = [n[j], n[i]];
    setItems(n);
  };

  return (
    <ActionForm action={saveSettingsAction} className="grid gap-6">
      {(errors) => (
        <>
          <Card title="Store details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Store name" error={errors.name}>
                <input name="name" defaultValue={settings.name} required className={inputCls} />
              </Field>
              <Field label="Site address" error={errors.url} hint="Used in search results, the sitemap and links.">
                <input name="url" type="url" defaultValue={settings.url} required className={inputCls} />
              </Field>
              <Field label="Contact email" error={errors.email} hint="Shown in the footer, contact page and chat.">
                <input name="email" type="email" defaultValue={settings.email} required className={inputCls} />
              </Field>
              <Field label="Phone (optional)">
                <input name="phone" type="tel" defaultValue={settings.phone} className={inputCls} />
              </Field>
              <Field label="Support hours" error={errors.hours} className="sm:col-span-2">
                <input name="hours" defaultValue={settings.hours} required className={inputCls} />
              </Field>
            </div>
          </Card>

          <Card title="Shipping">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Free shipping from (CAD)" error={errors.freeShip} hint="Drives the cart's progress bar.">
                <Money name="freeShip" value={dollars(settings.freeShipCents)} />
              </Field>
              <Field label="Flat shipping below that (CAD)" error={errors.flatShip}>
                <Money name="flatShip" value={dollars(settings.flatShipCents)} />
              </Field>
              <Field label="Same-day dispatch cutoff" error={errors.cutoff} hint="Shown to customers, e.g. “1 PM EST”.">
                <input name="cutoff" defaultValue={settings.cutoff} required className={inputCls} />
              </Field>
            </div>
          </Card>

          <Card title="Announcement bar" actions={<span className="text-xs text-muted">Scrolls across the top of every page</span>}>
            <ol className="grid gap-2">
              {items.map((it, i) => (
                <li key={it.key} className="flex items-center gap-2">
                  <span className="num w-5 shrink-0 text-right text-xs font-bold text-faint">{i + 1}</span>
                  <input
                    name="announcement"
                    value={it.text}
                    maxLength={120}
                    onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))}
                    className={inputCls}
                    aria-label={`Announcement ${i + 1}`}
                  />
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-surface disabled:opacity-25" aria-label="Move up">↑</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-surface disabled:opacity-25" aria-label="Move down">↓</button>
                  <button type="button" onClick={() => setItems(items.filter((_, j) => j !== i))} disabled={items.length === 1} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-faint hover:bg-red-50 hover:text-red-600 disabled:opacity-25" aria-label="Remove">✕</button>
                </li>
              ))}
            </ol>
            {errors.announcements && <p className="mt-2 text-xs font-semibold text-red-600">{errors.announcements}</p>}
            {items.length < 12 && (
              <button
                type="button"
                onClick={() => {
                  setItems([...items, { key: nextKey, text: "" }]);
                  setNextKey(nextKey + 1);
                }}
                className="mt-3 text-sm font-bold text-accent-deep hover:underline"
              >
                + Add message
              </button>
            )}
          </Card>

          <Card title="Social profiles" actions={<span className="text-xs text-muted">Leave empty to hide an icon</span>}>
            <div className="grid gap-4 sm:grid-cols-2">
              {settings.social.map((s) => (
                <Field key={s.name} label={s.name} error={errors[`social_${s.name}`]}>
                  <input name={`social_${s.name}`} type="url" defaultValue={s.href} placeholder={`https://www.${s.name.toLowerCase()}.com/…`} className={inputCls} />
                </Field>
              ))}
            </div>
          </Card>

          <Card title="Sign-up reward" actions={<span className="text-xs text-muted">Continue with Google accounts</span>}>
            <div className="grid gap-4 sm:grid-cols-[180px_1fr] sm:items-start">
              <Field label="Discount for new accounts" error={errors.signupDiscountPercent} hint="Each new account gets a one-use personal code.">
                <span className="relative block">
                  <input
                    name="signupDiscountPercent"
                    type="number"
                    min={1}
                    max={50}
                    defaultValue={settings.signupDiscountPercent}
                    required
                    className={`${inputCls} num pr-8`}
                  />
                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">%</span>
                </span>
              </Field>
              <label className="flex cursor-pointer items-start gap-3 sm:pt-8">
                <input type="checkbox" name="signupPromptEnabled" defaultChecked={settings.signupPromptEnabled} className="mt-1 h-5 w-5 accent-[var(--navy)]" />
                <span>
                  <span className="block text-sm font-semibold text-navy">Invite visitors to sign up</span>
                  <span className="block text-xs text-muted">
                    Shows the &ldquo;{settings.signupDiscountPercent}% off&rdquo; invitation once per visitor (after a few seconds, or when they go to leave) and a
                    note in the cart. Codes already issued keep their value.
                  </span>
                </span>
              </label>
            </div>
          </Card>

          <Card title="Chat assistant">
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" name="chatEnabled" defaultChecked={settings.chatEnabled} className="mt-1 h-5 w-5 accent-[var(--navy)]" />
              <span>
                <span className="block text-sm font-semibold text-navy">Show the chat assistant on the store</span>
                <span className="block text-xs text-muted">When off, the chat button disappears from every page.</span>
              </span>
            </label>
          </Card>

          <div className="sticky bottom-4 z-10 flex justify-end">
            <SubmitButton className="btn btn-solid shadow-[0_18px_40px_-18px_rgb(13_30_56/0.7)]">Save settings</SubmitButton>
          </div>
        </>
      )}
    </ActionForm>
  );
}

function Money({ name, value }: { name: string; value: string }) {
  return (
    <span className="relative block">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
      <input name={name} defaultValue={value} inputMode="decimal" required className={`${inputCls} num pl-7`} />
    </span>
  );
}
