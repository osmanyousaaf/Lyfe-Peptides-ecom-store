import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Badge, Card, EmptyState, PageHeader, TableWrap, inputCls, td, th, tr } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/client";
import { STOCK_LABEL, stockState, unitsOnHand, type StockState } from "@/components/admin/catalog/stock";
import { adminListProducts } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { isUpload } from "@/lib/img";
import type { Product } from "@/lib/types";
import { deleteProductAction, duplicateProductAction, toggleStatusAction } from "./actions";

export const metadata: Metadata = { title: "Products" };

type SP = { q?: string; status?: string; cat?: string; stock?: string; sort?: string };

const price = (p: Product) =>
  p.type === "variable" && p.priceMin != null && p.priceMax != null && p.priceMin !== p.priceMax
    ? `${formatPrice(p.priceMin)} – ${formatPrice(p.priceMax)}`
    : formatPrice(p.priceMin ?? p.priceCents);

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const all = adminListProducts();
  const categories = [...new Set(all.flatMap((p) => p.categories))].sort();

  const q = (sp.q ?? "").trim().toLowerCase();
  let list = all.filter((p) => {
    if (q && !`${p.name} ${p.slug} ${p.sku ?? ""} ${p.variants.map((v) => v.sku ?? "").join(" ")}`.toLowerCase().includes(q)) return false;
    if (sp.status && p.status !== sp.status) return false;
    if (sp.cat && !p.categories.includes(sp.cat)) return false;
    if (sp.stock && stockState(p) !== sp.stock) return false;
    return true;
  });
  const by = sp.sort ?? "sort";
  if (by === "name") list = list.sort((a, b) => a.name.localeCompare(b.name));
  if (by === "price") list = list.sort((a, b) => (a.priceMin ?? a.priceCents) - (b.priceMin ?? b.priceCents));
  if (by === "updated") list = list.sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
  if (by === "stock") list = list.sort((a, b) => (unitsOnHand(a) ?? Infinity) - (unitsOnHand(b) ?? Infinity));

  const counts = {
    all: all.length,
    published: all.filter((p) => p.status === "published").length,
    draft: all.filter((p) => p.status === "draft").length,
  };
  const filtered = Boolean(q || sp.status || sp.cat || sp.stock);

  return (
    <>
      <PageHeader
        title="Products"
        description={`${counts.all} products · ${counts.published} live · ${counts.draft} draft${counts.draft === 1 ? "" : "s"}`}
        actions={
          <Link href="/admin/products/new" className="btn btn-solid btn-sm rounded-xl">
            + New product
          </Link>
        }
      />

      <Card pad={false}>
        <form className="grid gap-3 border-b border-line p-4 sm:grid-cols-2 lg:grid-cols-[1.6fr_repeat(4,1fr)_auto]" role="search">
          <input name="q" defaultValue={sp.q} placeholder="Search name, slug or SKU" className={inputCls} aria-label="Search products" />
          <select name="status" defaultValue={sp.status ?? ""} className={inputCls} aria-label="Status">
            <option value="">Any status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <select name="cat" defaultValue={sp.cat ?? ""} className={inputCls} aria-label="Category">
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select name="stock" defaultValue={sp.stock ?? ""} className={inputCls} aria-label="Stock">
            <option value="">Any stock</option>
            {(Object.keys(STOCK_LABEL) as StockState[]).map((k) => (
              <option key={k} value={k}>
                {STOCK_LABEL[k].text}
              </option>
            ))}
          </select>
          <select name="sort" defaultValue={by} className={inputCls} aria-label="Sort">
            <option value="sort">Store order</option>
            <option value="name">Name A–Z</option>
            <option value="price">Price, low first</option>
            <option value="stock">Stock, lowest first</option>
            <option value="updated">Recently edited</option>
          </select>
          <div className="flex gap-2">
            <button className="btn btn-navy h-11 min-h-0 flex-1 rounded-xl text-sm">Filter</button>
            {filtered && (
              <Link href="/admin/products" className="btn btn-line h-11 min-h-0 rounded-xl text-sm">
                Clear
              </Link>
            )}
          </div>
        </form>

        {list.length === 0 ? (
          <EmptyState
            title={filtered ? "No products match" : "No products yet"}
            text={filtered ? "Try a different search or clear the filters." : "Create your first product to start selling."}
            action={<Link href="/admin/products/new" className="btn btn-navy btn-sm rounded-xl">New product</Link>}
          />
        ) : (
          <TableWrap>
            <table className="w-full min-w-[860px]">
              <thead>
                <tr>
                  <th className={th}>Product</th>
                  <th className={th}>Status</th>
                  <th className={th}>Category</th>
                  <th className={`${th} text-right`}>Price</th>
                  <th className={th}>Stock</th>
                  <th className={`${th} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => {
                  const st = stockState(p);
                  const units = unitsOnHand(p);
                  return (
                    <tr key={p.id} className={tr}>
                      <td className={td}>
                        <Link href={`/admin/products/${p.id}`} className="group flex items-center gap-3">
                          <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-line bg-surface">
                            {p.image && (
                              <Image src={p.image} alt="" fill sizes="48px" unoptimized={isUpload(p.image)} className="object-cover mix-blend-multiply" />
                            )}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-bold text-navy group-hover:text-accent-deep">{p.name}</span>
                            <span className="block truncate text-xs text-faint">
                              /{p.slug}
                              {p.type === "variable" && ` · ${p.variants.length} variants`}
                              {p.featured ? " · ★ featured" : ""}
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td className={td}>
                        <form action={toggleStatusAction}>
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="status" value={p.status === "published" ? "draft" : "published"} />
                          <button
                            title={p.status === "published" ? "Click to unpublish" : "Click to publish"}
                            className="rounded-full transition hover:opacity-75"
                          >
                            <Badge tone={p.status === "published" ? "green" : "gray"}>
                              <span className={`h-1.5 w-1.5 rounded-full ${p.status === "published" ? "bg-green" : "bg-faint"}`} />
                              {p.status === "published" ? "Live" : "Draft"}
                            </Badge>
                          </button>
                        </form>
                      </td>
                      <td className={`${td} text-muted`}>{p.categories.join(", ") || "—"}</td>
                      <td className={`${td} num whitespace-nowrap text-right font-semibold text-navy`}>
                        {price(p)}
                        {p.compareAtCents ? <span className="ml-1.5 text-xs text-faint line-through">{formatPrice(p.compareAtCents)}</span> : null}
                      </td>
                      <td className={td}>
                        <div className="flex items-center gap-2">
                          <Badge tone={STOCK_LABEL[st].tone}>{STOCK_LABEL[st].text}</Badge>
                          {units !== null && <span className="num text-xs text-muted">{units} units</span>}
                        </div>
                      </td>
                      <td className={`${td} text-right`}>
                        <div className="flex justify-end gap-1.5">
                          <Link href={`/admin/products/${p.id}`} className="btn btn-line btn-sm rounded-lg">
                            Edit
                          </Link>
                          <a href={`/product/${p.slug}`} target="_blank" rel="noreferrer" className="btn btn-line btn-sm rounded-lg" title="View in store">
                            View
                          </a>
                          <form action={duplicateProductAction}>
                            <input type="hidden" name="id" value={p.id} />
                            <button className="btn btn-line btn-sm rounded-lg" title="Duplicate as draft">
                              Copy
                            </button>
                          </form>
                          <form action={deleteProductAction}>
                            <input type="hidden" name="id" value={p.id} />
                            <ConfirmButton
                              confirm={`Delete "${p.name}"? This can't be undone. Past orders keep their records.`}
                              className="btn btn-line btn-sm rounded-lg text-red-600 hover:border-red-600"
                            >
                              Delete
                            </ConfirmButton>
                          </form>
                        </div>
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
