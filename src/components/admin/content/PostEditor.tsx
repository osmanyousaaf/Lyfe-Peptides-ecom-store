"use client";

import "@/app/(store)/blog/blog.css";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import PostAnim from "@/components/blog/PostAnim";
import { savePostAction } from "@/app/admin/(panel)/blog/actions";
import { toast } from "@/components/admin/client";
import { Badge, Card, Field, inputCls, textareaCls } from "@/components/admin/ui";
import type { AnimKey, Block, Post } from "@/lib/blog";
import { isUpload } from "@/lib/img";
import BlockEditor, { ANIM_OPTIONS, RUO_BLOCK, withKey, type EditBlock } from "./BlockEditor";

export type PickProduct = { slug: string; name: string; image: string; status: string };

const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Toronto" });
const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

function words(blocks: Block[]): number {
  return blocks
    .map((b) =>
      b.type === "ul" || b.type === "ol" ? b.items.join(" ") : b.type === "table" ? [...b.head, ...b.rows.flat()].join(" ") : b.type === "callout" ? `${b.title} ${b.text}` : b.type === "figure" ? b.caption : b.text
    )
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
}

export default function PostEditor({
  post,
  categories,
  products,
  siteUrl,
}: {
  post: Post | null;
  categories: string[];
  products: PickProduct[];
  siteUrl: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [status, setStatus] = useState<"published" | "draft">(post?.status ?? "draft");
  const [date, setDate] = useState(post?.date ?? today());
  const [category, setCategory] = useState(post?.category ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [description, setDescription] = useState(post?.description ?? "");
  const [keywords, setKeywords] = useState((post?.keywords ?? []).join(", "));
  const [anim, setAnim] = useState<AnimKey>(post?.anim ?? "vial");
  const [picked, setPicked] = useState<string[]>(post?.products ?? []);
  const [blocks, setBlocks] = useState<EditBlock[]>(() =>
    (post?.body ?? [{ type: "p", text: "" } as Block, RUO_BLOCK]).map(withKey)
  );
  const [autoMinutes, setAutoMinutes] = useState(!post);
  const [minutes, setMinutes] = useState(post?.readMinutes ?? 1);
  const [dirty, setDirty] = useState(false);

  const wc = useMemo(() => words(blocks), [blocks]);
  const estimate = Math.max(1, Math.round(wc / 200));
  const readMinutes = autoMinutes ? estimate : minutes;
  const effectiveSlug = slugTouched ? slug : slugify(title);

  // anything typed marks the post dirty, so leaving warns first
  const mark = <T,>(fn: (v: T) => void) => (v: T) => {
    setDirty(true);
    fn(v);
  };
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function save(nextStatus = status) {
    const input = {
      slug: effectiveSlug,
      title,
      description,
      excerpt,
      date,
      readMinutes,
      category,
      anim,
      keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
      products: picked,
      status: nextStatus,
      body: blocks.map(({ key: _key, ...b }) => b),
    };
    start(async () => {
      const res = await savePostAction(post?.slug ?? null, input);
      setErrors(res.errors ?? {});
      if (!res.ok) {
        toast(res.message ?? "Couldn't save", "error");
        return;
      }
      setStatus(nextStatus);
      setDirty(false);
      toast(res.message ?? "Saved");
      if (res.id !== post?.slug) router.replace(`/admin/blog/${res.id}`);
      else router.refresh();
    });
  }

  const titleLen = title.length;
  const descLen = description.length;
  const pickable = products.filter((p) => !picked.includes(p.slug));
  const [productQuery, setProductQuery] = useState("");
  const matches = pickable.filter((p) => p.name.toLowerCase().includes(productQuery.toLowerCase())).slice(0, 8);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      {/* main column */}
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-6">
        <Card>
          <div className="grid gap-4">
            <Field label="Title" error={errors.title}>
              <input value={title} onChange={(e) => mark(setTitle)(e.target.value)} placeholder="How to read a certificate of analysis" className={`${inputCls} h-12 text-lg font-bold text-navy`} />
            </Field>
            <Field label="URL slug" error={errors.slug} hint={`${siteUrl.replace(/^https?:\/\//, "")}/blog/${effectiveSlug || "…"}`}>
              <div className="flex gap-2">
                <input
                  value={effectiveSlug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    mark(setSlug)(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
                  }}
                  className={`${inputCls} font-mono text-[0.8125rem]`}
                />
                {slugTouched && (
                  <button type="button" onClick={() => { setSlugTouched(false); setDirty(true); }} className="btn btn-line btn-sm shrink-0">
                    From title
                  </button>
                )}
              </div>
            </Field>
            <Field label="Excerpt" error={errors.excerpt} hint="Shown under the title and on the blog index.">
              <textarea value={excerpt} onChange={(e) => mark(setExcerpt)(e.target.value)} rows={3} className={textareaCls} />
            </Field>
          </div>
        </Card>

        <Card title="Article" actions={<span className="num text-xs font-semibold text-muted">{wc.toLocaleString()} words · ~{estimate} min</span>}>
          <BlockEditor blocks={blocks} onChange={mark(setBlocks)} error={errors.body} />
        </Card>
      </div>

      {/* sidebar */}
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-6 xl:sticky xl:top-6 xl:max-h-[calc(100dvh-3rem)] xl:overflow-y-auto xl:pb-6 noscroll">
        <Card title="Publish" actions={<Badge tone={status === "published" ? "green" : "gray"}>{status === "published" ? "Published" : "Draft"}</Badge>}>
          <div className="grid gap-4">
            <Field label="Publish date" error={errors.date}>
              <input type="date" value={date} onChange={(e) => mark(setDate)(e.target.value)} className={inputCls} />
            </Field>
            <div className="grid gap-2">
              {status === "published" ? (
                <>
                  <button type="button" disabled={pending} onClick={() => save("published")} className="btn btn-navy w-full">
                    {pending ? "Saving…" : "Save changes"}
                  </button>
                  <button type="button" disabled={pending} onClick={() => save("draft")} className="btn btn-line btn-sm w-full">
                    Unpublish (move to drafts)
                  </button>
                </>
              ) : (
                <>
                  <button type="button" disabled={pending} onClick={() => save("published")} className="btn btn-solid w-full">
                    {pending ? "Saving…" : "Publish"}
                  </button>
                  <button type="button" disabled={pending} onClick={() => save("draft")} className="btn btn-line btn-sm w-full">
                    Save draft
                  </button>
                </>
              )}
            </div>
            {post && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
                <a href={`/admin/preview/blog/${post.slug}`} target="_blank" rel="noreferrer" className="text-navy hover:text-accent-deep">
                  Preview saved version ↗
                </a>
                {post.status === "published" && (
                  <Link href={`/blog/${post.slug}`} target="_blank" className="text-navy hover:text-accent-deep">
                    View live ↗
                  </Link>
                )}
              </div>
            )}
            {dirty && <p className="text-xs font-semibold text-accent-deep">Unsaved changes</p>}
          </div>
        </Card>

        <Card title="Details">
          <div className="grid gap-4">
            <Field label="Category" error={errors.category}>
              <input list="post-categories" value={category} onChange={(e) => mark(setCategory)(e.target.value)} placeholder="Quality & Testing" className={inputCls} />
              <datalist id="post-categories">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>
            <Field label="Read time (minutes)" error={errors.readMinutes} hint={autoMinutes ? `Estimated from ${wc} words` : `Estimate: ${estimate} min`}>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={readMinutes}
                  disabled={autoMinutes}
                  onChange={(e) => mark(setMinutes)(Number(e.target.value))}
                  className={`${inputCls} w-24 disabled:bg-surface`}
                />
                <label className="flex items-center gap-2 text-sm font-semibold text-muted">
                  <input
                    type="checkbox"
                    checked={autoMinutes}
                    onChange={(e) => {
                      setDirty(true);
                      setAutoMinutes(e.target.checked);
                      if (!e.target.checked) setMinutes(estimate);
                    }}
                    className="h-4 w-4 accent-[var(--navy)]"
                  />
                  Auto
                </label>
              </div>
            </Field>
            <Field label="Hero animation">
              <select value={anim} onChange={(e) => mark(setAnim)(e.target.value as AnimKey)} className={inputCls}>
                {ANIM_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
            <div className="blog-hero-bg grid h-48 place-items-center overflow-hidden rounded-xl border border-line p-3">
              <PostAnim key={anim} anim={anim} className="h-full w-full" />
            </div>
          </div>
        </Card>

        <Card title="Products in this article" actions={<span className="text-xs text-muted">{picked.length}/8</span>}>
          <div className="grid gap-3">
            {picked.length > 0 && (
              <ul className="grid gap-2">
                {picked.map((s) => {
                  const p = products.find((x) => x.slug === s);
                  return (
                    <li key={s} className="flex items-center gap-3 rounded-xl border border-line p-2">
                      <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-surface">
                        {p?.image && <Image src={p.image} alt="" fill sizes="40px" unoptimized={isUpload(p.image)} className="blend object-cover" />}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-navy">{p?.name ?? s}</span>
                      {p?.status === "draft" && <Badge>Draft</Badge>}
                      <button type="button" onClick={() => mark(setPicked)(picked.filter((x) => x !== s))} className="grid h-8 w-8 place-items-center rounded-lg text-faint hover:bg-red-50 hover:text-red-600" aria-label={`Remove ${p?.name ?? s}`}>
                        ✕
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {picked.length < 8 && (
              <div>
                <input value={productQuery} onChange={(e) => setProductQuery(e.target.value)} placeholder="Search products to add…" className={inputCls} />
                {productQuery && (
                  <ul className="mt-2 grid max-h-56 gap-1 overflow-y-auto rounded-xl border border-line p-1">
                    {matches.length === 0 && <li className="px-3 py-2 text-sm text-muted">No matches</li>}
                    {matches.map((p) => (
                      <li key={p.slug}>
                        <button
                          type="button"
                          onClick={() => {
                            mark(setPicked)([...picked, p.slug]);
                            setProductQuery("");
                          }}
                          className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-surface"
                        >
                          {p.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <p className="text-xs text-muted">Shown as product cards under the article.</p>
          </div>
        </Card>

        <Card title="Search engines">
          <div className="grid gap-4">
            <Field label="Meta description" error={errors.description}>
              <textarea value={description} onChange={(e) => mark(setDescription)(e.target.value)} rows={4} className={textareaCls} />
              <Meter value={descLen} good={[120, 160]} max={320} />
            </Field>
            <Field label="Keywords" hint="Separate with commas.">
              <input value={keywords} onChange={(e) => mark(setKeywords)(e.target.value)} placeholder="peptide COA, HPLC purity" className={inputCls} />
            </Field>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-faint">Google preview</p>
              <div className="rounded-xl border border-line bg-white p-4 font-[arial,sans-serif]">
                <p className="truncate text-xs text-[#202124]">{siteUrl.replace(/^https?:\/\//, "")} › blog › {effectiveSlug || "…"}</p>
                <p className="mt-1 line-clamp-2 text-lg leading-snug text-[#1a0dab]">
                  {(title || "Post title").length > 60 ? `${title.slice(0, 57)}…` : title || "Post title"} | Lyfe Peptides
                </p>
                <p className="mt-1 line-clamp-2 text-sm leading-snug text-[#4d5156]">
                  {description ? (descLen > 160 ? `${description.slice(0, 157)}…` : description) : "Add a meta description so search engines show a useful summary."}
                </p>
              </div>
              <p className={`mt-2 text-xs ${titleLen > 60 ? "font-semibold text-accent-deep" : "text-muted"}`}>
                Title: {titleLen} characters {titleLen > 60 ? "(may be cut off after ~60)" : ""}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Meter({ value, good, max }: { value: number; good: [number, number]; max: number }) {
  const ok = value >= good[0] && value <= good[1];
  const tone = value === 0 ? "bg-surface-2" : ok ? "bg-green" : value > good[1] ? "bg-accent" : "bg-[#e9b949]";
  return (
    <span className="grid gap-1">
      <span className="h-1.5 overflow-hidden rounded-full bg-surface-2">
        <span className={`block h-full rounded-full transition-all ${tone}`} style={{ width: `${Math.min(100, (value / max) * 200)}%` }} />
      </span>
      <span className={`num text-xs ${ok ? "text-green" : "text-muted"}`}>
        {value} characters · aim for {good[0]}–{good[1]}
      </span>
    </span>
  );
}
