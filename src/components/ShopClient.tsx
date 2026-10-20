"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { GOALS } from "@/lib/products";
import ProductCard from "./ProductCard";
import { SearchIcon } from "./icons";

type Sort = "featured" | "price-asc" | "price-desc" | "name";

export default function ShopClient({ products }: { products: Product[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const cat = params.get("cat") ?? "";
  const goal = params.get("goal") ?? "";
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [sort, setSort] = useState<Sort>("featured");

  // keep the search box in step with header searches
  useEffect(() => {
    setQuery(params.get("q") ?? "");
  }, [params]);

  const categories = useMemo(() => {
    const m = new Map<string, number>();
    products.forEach((p) => p.categories.forEach((c) => m.set(c, (m.get(c) ?? 0) + 1)));
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [products]);

  const shown = useMemo(() => {
    let list = products.slice();
    if (cat) list = list.filter((p) => p.categories.includes(cat));
    if (goal) list = list.filter((p) => p.tags.includes(goal));
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    const price = (p: Product) => p.priceMin ?? p.priceCents;
    if (sort === "price-asc") list.sort((a, b) => price(a) - price(b));
    if (sort === "price-desc") list.sort((a, b) => price(b) - price(a));
    if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, cat, goal, query, sort]);

  const link = (next: { cat?: string; goal?: string }) => {
    const sp = new URLSearchParams();
    if (next.cat) sp.set("cat", next.cat);
    if (next.goal) sp.set("goal", next.goal);
    if (query.trim()) sp.set("q", query.trim());
    const s = sp.toString();
    return s ? `/shop?${s}` : "/shop";
  };

  const title =
    cat || GOALS.find((g) => g.tag === goal)?.label || (query.trim() ? `Results for “${query.trim()}”` : "All products");

  return (
    <>
      <div className="border-b border-line bg-surface">
        <div className="wrap py-8 md:py-10">
          <nav className="text-sm text-muted" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-navy">Home</Link>
            <span className="px-2">/</span>
            <span className="text-ink">Shop</span>
          </nav>
          <h1 className="head mt-2 text-navy">{title}</h1>
          <p className="mt-1 text-muted">
            <span className="num font-semibold text-ink">{shown.length}</span> products, every one with a certificate of
            analysis.
          </p>
        </div>
      </div>

      <div className="wrap grid gap-8 py-8 lg:grid-cols-[250px_1fr] lg:py-10">
        {/* filters */}
        <aside className="min-w-0 lg:sticky lg:top-36 lg:self-start">
          <div className="card p-4">
            <h2 className="px-2 pb-2 text-sm font-bold text-navy">Categories</h2>
            <div className="noscroll flex gap-2 overflow-x-auto lg:flex-col lg:gap-0.5">
              <Link
                href={link({ goal })}
                className={`flex items-center justify-between whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold ${
                  !cat ? "bg-accent/10 text-accent-deep" : "text-ink hover:bg-surface"
                }`}
              >
                All products <span className="num ml-3 text-xs text-faint">{products.length}</span>
              </Link>
              {categories.map(([c, n]) => (
                <Link
                  key={c}
                  href={link({ cat: c, goal })}
                  className={`flex items-center justify-between whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold ${
                    cat === c ? "bg-accent/10 text-accent-deep" : "text-ink hover:bg-surface"
                  }`}
                >
                  {c} <span className="num ml-3 text-xs text-faint">{n}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="card mt-4 hidden p-4 lg:block">
            <h2 className="px-2 pb-2 text-sm font-bold text-navy">Research goal</h2>
            <div className="flex flex-wrap gap-2 px-1">
              {GOALS.map((g) => (
                <Link
                  key={g.tag}
                  href={link({ cat, goal: goal === g.tag ? "" : g.tag })}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    goal === g.tag ? "border-accent bg-accent text-white" : "border-line text-ink hover:border-navy"
                  }`}
                >
                  {g.label}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="relative block sm:w-80">
              <span className="sr-only">Search products</span>
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-faint" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, e.g. BPC-157"
                className="h-11 w-full rounded-lg border border-line bg-white pl-10 pr-3 text-sm outline-none focus:border-navy"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-muted">
              Sort by
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="h-11 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink outline-none focus:border-navy"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </label>
          </div>

          {shown.length === 0 ? (
            <div className="card grid place-items-center gap-4 px-6 py-16 text-center">
              <p className="text-lg font-bold text-navy">No products match your search.</p>
              <button
                onClick={() => {
                  setQuery("");
                  router.push("/shop");
                }}
                className="btn btn-line"
              >
                Show all products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
              {shown.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
