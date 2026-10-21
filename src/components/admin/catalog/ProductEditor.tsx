"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActionForm, SubmitButton, toast } from "@/components/admin/client";
import { Card, Field, inputCls, textareaCls } from "@/components/admin/ui";
import { GOALS } from "@/lib/goals";
import { isUpload } from "@/lib/img";
import { formatPrice } from "@/lib/format";
import type { ActionResult } from "@/lib/admin-auth";
import type { Product } from "@/lib/types";

type Attr = { name: string; options: string[] };
type VRow = { key: string; id: number | null; attrs: Record<string, string>; price: string; sku: string; tracked: boolean; stock: string };

type State = {
  name: string;
  slug: string;
  slugTouched: boolean;
  status: "published" | "draft";
  inStock: boolean;
  categories: string[];
  tags: string[];
  shortDescription: string;
  description: string;
  images: string[];
  type: "simple" | "variable";
  price: string;
  compareAt: string;
  sku: string;
  tracked: boolean;
  stock: string;
  lowStockAt: string;
  featured: boolean;
  featuredPos: string;
  attributes: Attr[];
  variants: VRow[];
};

const dollars = (c: number | null | undefined) => (c == null ? "" : (c / 100).toFixed(2));
const cents = (s: string) => (s.trim() === "" ? null : Math.round(parseFloat(s) * 100));
const comboKey = (attrs: Record<string, string>) => JSON.stringify(Object.entries(attrs).sort());
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/\+/g, " plus ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

function initial(p?: Product): State {
  return {
    name: p?.name ?? "",
    slug: p?.slug ?? "",
    slugTouched: Boolean(p),
    status: p?.status ?? "draft",
    inStock: p ? !(p.inStock === false && (p.type === "variable" ? p.variants.some((v) => v.inStock) : p.stock == null || p.stock > 0)) : true,
    categories: p?.categories ?? [],
    tags: p?.tags ?? [],
    shortDescription: p?.shortDescription ?? "",
    description: p?.description ?? "",
    images: p?.images?.length ? p.images : p?.image ? [p.image] : [],
    type: p?.type ?? "simple",
    price: p && p.type === "simple" ? dollars(p.priceCents) : "",
    compareAt: dollars(p?.compareAtCents),
    sku: p?.sku ?? "",
    tracked: p?.stock != null,
    stock: p?.stock != null ? String(p.stock) : "",
    lowStockAt: String(p?.lowStockAt ?? 5),
    featured: Boolean(p?.featured),
    featuredPos: p?.featured ? String(p.featured) : "1",
    attributes: p?.attributes?.length ? p.attributes.map((a) => ({ name: a.name, options: [...a.options] })) : [{ name: "Package", options: [] }],
    variants: (p?.variants ?? []).map((v) => ({
      key: `v${v.id}`,
      id: v.id,
      attrs: v.attrs,
      price: dollars(v.priceCents),
      sku: v.sku ?? "",
      tracked: v.stock != null,
      stock: v.stock != null ? String(v.stock) : "",
    })),
  };
}

function payload(s: State) {
  return {
    name: s.name,
    slug: s.slug,
    status: s.status,
    inStock: s.inStock,
    categories: s.categories,
    tags: s.tags,
    shortDescription: s.shortDescription,
    description: s.description,
    images: s.images,
    type: s.type,
    priceCents: cents(s.price),
    compareAtCents: cents(s.compareAt),
    sku: s.sku,
    stock: s.tracked ? Math.max(0, parseInt(s.stock || "0", 10) || 0) : null,
    lowStockAt: parseInt(s.lowStockAt || "0", 10),
    featured: s.featured ? Math.max(1, parseInt(s.featuredPos || "1", 10) || 1) : 0,
    attributes: s.attributes,
    variants: s.variants.map((v) => ({
      id: v.id,
      attrs: v.attrs,
      priceCents: cents(v.price),
      sku: v.sku,
      stock: v.tracked ? Math.max(0, parseInt(v.stock || "0", 10) || 0) : null,
    })),
  };
}

export default function ProductEditor({
  product,
  action,
  categorySuggestions,
}: {
  product?: Product;
  action: (prev: ActionResult | undefined, form: FormData) => Promise<ActionResult>;
  categorySuggestions: string[];
}) {
  const [s, setS] = useState<State>(() => initial(product));
  const [baseline, setBaseline] = useState(() => JSON.stringify(payload(initial(product))));
  const dirty = JSON.stringify(payload(s)) !== baseline;
  const set = <K extends keyof State>(k: K, v: State[K]) => setS((x) => ({ ...x, [k]: v }));

  // after a save the page refreshes with the stored product: adopt it, including ids for new variants
  useEffect(() => {
    if (!product) return;
    const fresh = initial(product);
    setS(fresh);
    setBaseline(JSON.stringify(payload(fresh)));
  }, [product]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  return (
    <ActionForm action={action} redirectTo={product ? undefined : "/admin/products/{id}"}>
      {(errors) => (
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <input type="hidden" name="id" value={product?.id ?? ""} />
          <input type="hidden" name="payload" value={JSON.stringify(payload(s))} />

          <div className="grid min-w-0 gap-5">
            <Card title="Basics">
              <div className="grid gap-4">
                <Field label="Name" error={errors.name}>
                  <input
                    className={inputCls}
                    value={s.name}
                    placeholder="e.g. BPC-157 10 mg"
                    onChange={(e) => {
                      const name = e.target.value;
                      setS((x) => ({ ...x, name, slug: x.slugTouched ? x.slug : slugify(name) }));
                    }}
                  />
                </Field>
                <Field label="URL" error={errors.slug} hint="Lowercase letters, numbers and dashes.">
                  <div className="flex items-center overflow-hidden rounded-xl border border-line bg-surface focus-within:border-navy">
                    <span className="whitespace-nowrap pl-3.5 text-sm text-faint">/product/</span>
                    <input
                      className="h-11 w-full min-w-0 bg-transparent pr-3.5 text-sm outline-none"
                      value={s.slug}
                      onChange={(e) => setS((x) => ({ ...x, slug: slugify(e.target.value) || e.target.value.toLowerCase(), slugTouched: true }))}
                    />
                  </div>
                </Field>
              </div>
            </Card>

            <Images images={s.images} onChange={(v) => set("images", v)} error={errors.images} />

            <Card title="Description">
              <div className="grid gap-4">
                <Html label="Short description" hint="Shown beside the price. HTML allowed." rows={3} value={s.shortDescription} onChange={(v) => set("shortDescription", v)} />
                <Html label="Full description" hint="The “About this compound” section. HTML allowed." rows={10} value={s.description} onChange={(v) => set("description", v)} />
              </div>
            </Card>

            <Card title="Pricing and options">
              <div className="mb-5 inline-flex rounded-xl bg-surface p-1" role="radiogroup" aria-label="Product type">
                {(["simple", "variable"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={s.type === t}
                    onClick={() => set("type", t)}
                    className={`rounded-lg px-4 py-2 text-sm font-bold transition ${s.type === t ? "bg-white text-navy shadow-sm" : "text-muted hover:text-navy"}`}
                  >
                    {t === "simple" ? "Single item" : "With options"}
                  </button>
                ))}
              </div>

              {s.type === "simple" ? (
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Price (CAD)" error={errors.priceCents}>
                    <Money value={s.price} onChange={(v) => set("price", v)} />
                  </Field>
                  <Field label="Compare-at price" error={errors.compareAtCents} hint="Optional. Shown struck through.">
                    <Money value={s.compareAt} onChange={(v) => set("compareAt", v)} />
                  </Field>
                  <Field label="SKU">
                    <input className={inputCls} value={s.sku} onChange={(e) => set("sku", e.target.value)} />
                  </Field>
                  <div className="sm:col-span-3">
                    <StockControl
                      tracked={s.tracked}
                      stock={s.stock}
                      onTracked={(v) => set("tracked", v)}
                      onStock={(v) => set("stock", v)}
                      error={errors.stock}
                    />
                  </div>
                </div>
              ) : (
                <Variants s={s} setS={setS} errors={errors} />
              )}

              <div className="mt-5 max-w-[220px]">
                <Field label="Low-stock alert at" error={errors.lowStockAt} hint="Flag in inventory at or below this.">
                  <input className={inputCls} type="number" min={0} value={s.lowStockAt} onChange={(e) => set("lowStockAt", e.target.value)} />
                </Field>
              </div>
            </Card>
          </div>

          {/* sidebar */}
          <div className="grid gap-5 lg:sticky lg:top-6">
            <Card title="Publish">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 rounded-xl bg-surface p-1">
                  {(["published", "draft"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      aria-pressed={s.status === st}
                      onClick={() => set("status", st)}
                      className={`rounded-lg py-2 text-sm font-bold transition ${s.status === st ? "bg-white text-navy shadow-sm" : "text-muted hover:text-navy"}`}
                    >
                      {st === "published" ? "Live" : "Draft"}
                    </button>
                  ))}
                </div>
                <Toggle checked={s.inStock} onChange={(v) => set("inStock", v)} label="Available for sale" hint="Turn off to show it as sold out." />
                <div className="flex items-center justify-between gap-2 border-t border-line pt-4">
                  <span className={`text-xs font-semibold ${dirty ? "text-accent-deep" : "text-faint"}`}>{dirty ? "Unsaved changes" : "All changes saved"}</span>
                  <SubmitButton className="btn btn-solid btn-sm rounded-xl px-5" pendingText="Saving…">
                    {product ? "Save" : "Create product"}
                  </SubmitButton>
                </div>
              </div>
            </Card>

            <Card title="Organize">
              <div className="grid gap-4">
                <Chips label="Categories" values={s.categories} onChange={(v) => set("categories", v)} suggestions={categorySuggestions} placeholder="Add a category" />
                <Chips label="Research goals" values={s.tags} onChange={(v) => set("tags", v)} suggestions={GOALS.map((g) => g.tag)} placeholder="Add a goal" />
              </div>
            </Card>

            <Card title="Landing page">
              <div className="grid gap-3">
                <Toggle checked={s.featured} onChange={(v) => set("featured", v)} label="Feature on the home page" />
                {s.featured && (
                  <Field label="Position" error={errors.featured} hint="1 shows first.">
                    <input className={inputCls} type="number" min={1} value={s.featuredPos} onChange={(e) => set("featuredPos", e.target.value)} />
                  </Field>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </ActionForm>
  );
}

// ---- pieces ----

function Money({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center overflow-hidden rounded-xl border border-line bg-white focus-within:border-navy">
      <span className="pl-3.5 text-sm text-faint">$</span>
      <input
        inputMode="decimal"
        className="num h-11 w-full min-w-0 bg-transparent px-2 text-sm outline-none"
        value={value}
        placeholder="0.00"
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ""))}
        onBlur={() => value && !isNaN(parseFloat(value)) && onChange(parseFloat(value).toFixed(2))}
      />
    </div>
  );
}

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex items-start gap-3 text-left">
      <span className={`mt-0.5 flex h-6 w-10 shrink-0 items-center rounded-full p-0.5 transition ${checked ? "bg-green" : "bg-surface-2"}`}>
        <span className={`h-5 w-5 rounded-full bg-white shadow transition ${checked ? "translate-x-4" : ""}`} />
      </span>
      <span>
        <span className="block text-sm font-semibold text-navy">{label}</span>
        {hint && <span className="block text-xs text-muted">{hint}</span>}
      </span>
    </button>
  );
}

function StockControl({
  tracked,
  stock,
  onTracked,
  onStock,
  error,
  compact,
}: {
  tracked: boolean;
  stock: string;
  onTracked: (v: boolean) => void;
  onStock: (v: string) => void;
  error?: string;
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${compact ? "" : "rounded-xl bg-surface p-3"}`}>
      <label className="flex items-center gap-2 text-sm font-semibold text-navy">
        <input type="checkbox" checked={tracked} onChange={(e) => onTracked(e.target.checked)} className="h-4 w-4 accent-[var(--navy)]" />
        {compact ? "Track" : "Track stock"}
      </label>
      {tracked && (
        <input
          type="number"
          min={0}
          aria-label="Units on hand"
          className={`num h-9 rounded-lg border border-line bg-white px-2.5 text-sm outline-none focus:border-navy ${compact ? "w-20" : "w-28"}`}
          value={stock}
          placeholder="0"
          onChange={(e) => onStock(e.target.value)}
        />
      )}
      {!compact && <span className="text-xs text-muted">{tracked ? "units on hand" : "Unlimited: never sells out on its own."}</span>}
      {error && <span className="w-full text-xs font-semibold text-red-600">{error}</span>}
    </div>
  );
}

function Html({ label, hint, value, onChange, rows }: { label: string; hint: string; value: string; onChange: (v: string) => void; rows: number }) {
  const [preview, setPreview] = useState(false);
  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-navy">{label}</span>
        <div className="flex rounded-lg bg-surface p-0.5 text-xs font-bold">
          {["Edit", "Preview"].map((t, i) => (
            <button key={t} type="button" onClick={() => setPreview(i === 1)} className={`rounded-md px-2.5 py-1 ${preview === (i === 1) ? "bg-white text-navy shadow-sm" : "text-muted"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>
      {preview ? (
        <div className="prose min-h-24 rounded-xl border border-line bg-white px-4 py-3 text-sm" dangerouslySetInnerHTML={{ __html: value || "<p><em>Nothing yet.</em></p>" }} />
      ) : (
        <textarea className={`${textareaCls} font-mono text-[0.8125rem]`} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
      <span className="text-xs text-muted">{hint}</span>
    </div>
  );
}

function Chips({
  label,
  values,
  onChange,
  suggestions,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  suggestions: string[];
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");
  const add = (v: string) => {
    const t = v.trim();
    if (t && !values.includes(t)) onChange([...values, t]);
    setDraft("");
  };
  const rest = suggestions.filter((x) => !values.includes(x));
  return (
    <div className="grid gap-2">
      <span className="text-sm font-semibold text-navy">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 rounded-full bg-navy px-2.5 py-1 text-xs font-semibold text-white">
            {v}
            <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} className="text-white/60 hover:text-white" aria-label={`Remove ${v}`}>
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        className={inputCls}
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add(draft);
          }
        }}
        onBlur={() => draft && add(draft)}
      />
      {rest.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {rest.slice(0, 12).map((x) => (
            <button key={x} type="button" onClick={() => add(x)} className="rounded-full border border-dashed border-line px-2.5 py-1 text-xs font-semibold text-muted transition hover:border-navy hover:text-navy">
              + {x}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Images({ images, onChange, error }: { images: string[]; onChange: (v: string[]) => void; error?: string }) {
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const drag = useRef<number | null>(null);
  const file = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | File[]) {
    const list = [...files].filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    setBusy(true);
    const fd = new FormData();
    list.forEach((f) => fd.append("file", f));
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange([...images, ...(data.urls as string[])]);
      toast(`${data.urls.length} image${data.urls.length === 1 ? "" : "s"} added`);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Upload failed", "error");
    } finally {
      setBusy(false);
    }
  }

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length || from === to) return;
    const next = [...images];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    onChange(next);
  };

  return (
    <Card title="Images" actions={<span className="text-xs text-muted">First image is the main one. Drag to reorder.</span>}>
      <div
        className={`grid grid-cols-3 gap-3 rounded-xl sm:grid-cols-4 lg:grid-cols-5 ${over ? "ring-2 ring-accent ring-offset-4" : ""}`}
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes("Files")) {
            e.preventDefault();
            setOver(true);
          }
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          setOver(false);
          if (e.dataTransfer.files.length) {
            e.preventDefault();
            upload(e.dataTransfer.files);
          }
        }}
      >
        {images.map((src, i) => (
          <div
            key={src}
            draggable
            onDragStart={() => (drag.current = i)}
            onDragOver={(e) => drag.current !== null && e.preventDefault()}
            onDrop={(e) => {
              if (drag.current === null) return;
              e.preventDefault();
              e.stopPropagation();
              move(drag.current, i);
              drag.current = null;
            }}
            className={`group relative aspect-square cursor-grab overflow-hidden rounded-xl border bg-surface active:cursor-grabbing ${i === 0 ? "border-accent ring-2 ring-accent/20" : "border-line"}`}
          >
            <Image src={src} alt="" fill sizes="160px" unoptimized={isUpload(src)} className="object-cover mix-blend-multiply" />
            {i === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-accent px-2 py-0.5 text-[0.625rem] font-bold text-white">Main</span>}
            <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between gap-1 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
              <span className="flex gap-1">
                <IconBtn label="Move left" onClick={() => move(i, i - 1)} disabled={i === 0}>←</IconBtn>
                <IconBtn label="Move right" onClick={() => move(i, i + 1)} disabled={i === images.length - 1}>→</IconBtn>
              </span>
              <span className="flex gap-1">
                {i !== 0 && <IconBtn label="Make main image" onClick={() => move(i, 0)}>★</IconBtn>}
                <IconBtn label="Remove image" onClick={() => onChange(images.filter((_, j) => j !== i))} danger>×</IconBtn>
              </span>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => file.current?.click()}
          disabled={busy}
          className="grid aspect-square place-items-center rounded-xl border-2 border-dashed border-line text-center text-xs font-semibold text-muted transition hover:border-navy hover:text-navy"
        >
          <span>
            <span className="block text-2xl leading-none">{busy ? "…" : "+"}</span>
            {busy ? "Uploading" : "Upload or drop"}
          </span>
        </button>
      </div>
      <input ref={file} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" multiple hidden onChange={(e) => e.target.files && upload(e.target.files)} />
      {error && <p className="mt-3 text-xs font-semibold text-red-600">{error}</p>}
    </Card>
  );
}

function IconBtn({ children, label, onClick, disabled, danger }: { children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`grid h-7 w-7 place-items-center rounded-lg bg-white/95 text-xs font-bold shadow disabled:opacity-30 ${danger ? "text-red-600" : "text-navy"}`}
    >
      {children}
    </button>
  );
}

function cartesian(attrs: Attr[]): Record<string, string>[] {
  return attrs
    .filter((a) => a.name.trim() && a.options.length)
    .reduce<Record<string, string>[]>((acc, a) => acc.flatMap((c) => a.options.map((o) => ({ ...c, [a.name.trim()]: o }))), [{}]);
}

function Variants({ s, setS, errors }: { s: State; setS: React.Dispatch<React.SetStateAction<State>>; errors: Record<string, string> }) {
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkStock, setBulkStock] = useState("");
  const combos = useMemo(() => cartesian(s.attributes), [s.attributes]);
  const existing = new Set(s.variants.map((v) => comboKey(v.attrs)));
  const missing = combos.filter((c) => !existing.has(comboKey(c))).length;
  const stale = s.variants.filter((v) => !combos.some((c) => comboKey(c) === comboKey(v.attrs))).length;

  const setAttrs = (attributes: Attr[]) => setS((x) => ({ ...x, attributes }));
  const setVariants = (fn: (v: VRow[]) => VRow[]) => setS((x) => ({ ...x, variants: fn(x.variants) }));

  // build every combination, keeping ids, prices and stock of combinations that already exist
  const generate = () => {
    const byKey = new Map(s.variants.map((v) => [comboKey(v.attrs), v]));
    const fallback = bulkPrice || s.variants[0]?.price || "";
    setVariants(() =>
      combos.map((c, i) => byKey.get(comboKey(c)) ?? { key: `n${Date.now()}-${i}`, id: null, attrs: c, price: fallback, sku: "", tracked: false, stock: "" })
    );
    toast(`${combos.length} variant${combos.length === 1 ? "" : "s"} ready`);
  };

  return (
    <div className="grid gap-5">
      <div className="grid gap-3">
        {s.attributes.map((a, i) => (
          <div key={i} className="grid gap-2 rounded-xl border border-line p-3 sm:grid-cols-[180px_1fr_auto] sm:items-start">
            <input
              className={inputCls}
              value={a.name}
              placeholder="Option name, e.g. Strength"
              aria-label="Option name"
              onChange={(e) => setAttrs(s.attributes.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
            />
            <OptionValues values={a.options} onChange={(options) => setAttrs(s.attributes.map((x, j) => (j === i ? { ...x, options } : x)))} />
            <button
              type="button"
              onClick={() => setAttrs(s.attributes.filter((_, j) => j !== i))}
              className="btn btn-line btn-sm h-11 rounded-xl text-red-600"
              disabled={s.attributes.length === 1}
            >
              Remove
            </button>
          </div>
        ))}
        {errors.attributes && <p className="text-xs font-semibold text-red-600">{errors.attributes}</p>}
        <div className="flex flex-wrap items-center gap-2">
          {s.attributes.length < 3 && (
            <button type="button" onClick={() => setAttrs([...s.attributes, { name: "", options: [] }])} className="btn btn-line btn-sm rounded-xl">
              + Add option
            </button>
          )}
          <button type="button" onClick={generate} disabled={!combos.length} className="btn btn-navy btn-sm rounded-xl">
            Generate variants{missing || stale ? ` (${combos.length})` : ""}
          </button>
          {(missing > 0 || stale > 0) && (
            <span className="text-xs font-semibold text-accent-deep">
              {missing > 0 && `${missing} new combination${missing === 1 ? "" : "s"}`}
              {missing > 0 && stale > 0 && " · "}
              {stale > 0 && `${stale} outdated will be removed`}
            </span>
          )}
        </div>
      </div>

      {s.variants.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-line">
          <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface px-3 py-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-faint">Set all</span>
            <div className="w-28"><Money value={bulkPrice} onChange={setBulkPrice} /></div>
            <button type="button" className="btn btn-line btn-sm rounded-lg" disabled={!bulkPrice} onClick={() => setVariants((vs) => vs.map((v) => ({ ...v, price: parseFloat(bulkPrice).toFixed(2) })))}>
              Price
            </button>
            <input type="number" min={0} placeholder="Qty" value={bulkStock} onChange={(e) => setBulkStock(e.target.value)} className="num h-9 w-20 rounded-lg border border-line bg-white px-2.5 text-sm outline-none focus:border-navy" />
            <button type="button" className="btn btn-line btn-sm rounded-lg" disabled={bulkStock === ""} onClick={() => setVariants((vs) => vs.map((v) => ({ ...v, tracked: true, stock: bulkStock })))}>
              Stock
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-sm">
              <thead>
                <tr className="text-left text-[0.6875rem] font-bold uppercase tracking-wider text-faint">
                  <th className="px-3 py-2.5">Variant</th>
                  <th className="px-3 py-2.5">Price</th>
                  <th className="px-3 py-2.5">SKU</th>
                  <th className="px-3 py-2.5">Stock</th>
                  <th className="px-3 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {s.variants.map((v) => {
                  const upd = (patch: Partial<VRow>) => setVariants((vs) => vs.map((x) => (x.key === v.key ? { ...x, ...patch } : x)));
                  const outdated = !combos.some((c) => comboKey(c) === comboKey(v.attrs));
                  return (
                    <tr key={v.key} className={`border-t border-line ${outdated ? "bg-red-50/60" : ""}`}>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(v.attrs).map(([k, val]) => (
                            <span key={k} className="rounded-full bg-surface px-2 py-0.5 text-xs font-semibold text-navy" title={k}>
                              {val}
                            </span>
                          ))}
                          {!v.id && <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-bold text-accent-deep">new</span>}
                        </div>
                      </td>
                      <td className="w-32 px-3 py-2"><Money value={v.price} onChange={(price) => upd({ price })} /></td>
                      <td className="w-36 px-3 py-2">
                        <input className="h-11 w-full rounded-xl border border-line px-3 text-sm outline-none focus:border-navy" value={v.sku} onChange={(e) => upd({ sku: e.target.value })} aria-label="SKU" />
                      </td>
                      <td className="px-3 py-2">
                        <StockControl compact tracked={v.tracked} stock={v.stock} onTracked={(tracked) => upd({ tracked })} onStock={(stock) => upd({ stock })} />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button type="button" onClick={() => setVariants((vs) => vs.filter((x) => x.key !== v.key))} className="grid h-8 w-8 place-items-center rounded-lg text-faint hover:bg-red-50 hover:text-red-600" aria-label="Remove variant">
                          ×
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="border-t border-line px-3 py-2 text-xs text-muted">
            {s.variants.length} variant{s.variants.length === 1 ? "" : "s"}
            {s.variants.some((v) => v.price) &&
              ` · ${formatPrice(Math.min(...s.variants.map((v) => cents(v.price) ?? Infinity).filter(Number.isFinite)) || 0)} and up`}
          </p>
        </div>
      )}
      {errors.variants && <p className="text-xs font-semibold text-red-600">{errors.variants}</p>}
    </div>
  );
}

function OptionValues({ values, onChange }: { values: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const parts = draft.split(",").map((x) => x.trim()).filter(Boolean);
    if (parts.length) onChange([...new Set([...values, ...parts])]);
    setDraft("");
  };
  return (
    <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-xl border border-line bg-white px-2 py-1.5 focus-within:border-navy">
      {values.map((v) => (
        <span key={v} className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-xs font-semibold text-navy">
          {v}
          <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} className="text-faint hover:text-red-600" aria-label={`Remove ${v}`}>
            ×
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          } else if (e.key === "Backspace" && !draft && values.length) onChange(values.slice(0, -1));
        }}
        onBlur={add}
        placeholder={values.length ? "Add value" : "Values, e.g. 5mg, 10mg"}
        aria-label="Option values"
        className="h-8 min-w-[120px] flex-1 bg-transparent px-1 text-sm outline-none"
      />
    </div>
  );
}
