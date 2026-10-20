"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import {
  BoltIcon,
  CartIcon,
  ChevronDown,
  CloseIcon,
  FlaskIcon,
  MapleIcon,
  MenuIcon,
  SearchIcon,
  ShieldIcon,
  TruckIcon,
} from "./icons";

const TRUST = [
  { Icon: ShieldIcon, text: "COA on every product" },
  { Icon: FlaskIcon, text: "99%+ purity guaranteed" },
  { Icon: TruckIcon, text: "Free shipping on orders over $300" },
  { Icon: BoltIcon, text: "Same-day dispatch before 1 PM EST" },
  { Icon: MapleIcon, text: "Proudly Canadian" },
];

const NAV = [
  { href: "/about", label: "About" },
  { href: "/documentation", label: "Documentation" },
  { href: "/contact", label: "Contact" },
];

export default function Header({ categories }: { categories: { name: string; count: number }[] }) {
  const { count, open } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [q, setQ] = useState("");
  const shopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenu(false);
    setShopOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!shopOpen) return;
    const close = (e: MouseEvent) => {
      if (!shopRef.current?.contains(e.target as Node)) setShopOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setShopOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [shopOpen]);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/shop?q=${encodeURIComponent(term)}` : "/shop");
  };

  const navClass = (active: boolean) =>
    `relative py-2 text-[0.9375rem] font-semibold transition-colors ${
      active
        ? "text-navy after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded after:bg-navy"
        : "text-ink/80 hover:text-navy"
    }`;

  return (
    <header className="sticky top-0 z-50">
      {/* trust bar */}
      <div className="bg-navy text-white">
        <div className="wrap flex h-10 items-center justify-between gap-6 overflow-hidden">
          <ul className="mx-auto hidden items-center gap-5 text-[0.8125rem] font-medium lg:flex">
            {TRUST.map(({ Icon, text }, i) => (
              <li key={text} className="flex items-center gap-2 whitespace-nowrap">
                {i > 0 && <span className="mr-4 h-3.5 w-px bg-white/25" aria-hidden />}
                <Icon className="h-4 w-4 text-white/90" />
                {text}
              </li>
            ))}
          </ul>
          {/* small screens: a slow ticker */}
          <div className="relative flex-1 overflow-hidden lg:hidden" aria-label="Store highlights">
            <div className="flex w-max animate-[ticker_28s_linear_infinite] gap-8 text-[0.8125rem] font-medium">
              {[...TRUST, ...TRUST].map(({ Icon, text }, i) => (
                <span key={i} className="flex items-center gap-2 whitespace-nowrap" aria-hidden={i >= TRUST.length}>
                  <Icon className="h-4 w-4" />
                  {text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* main bar */}
      <div className="border-b border-line bg-white/95 backdrop-blur">
        <div className="wrap flex h-[76px] items-center gap-6 lg:gap-10">
          <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Lyfe Peptides, home">
            <Image src="/lyfe-logo.png" alt="" width={72} height={48} priority className="h-11 w-auto" />
            <span className="hidden leading-none sm:block">
              <span className="block text-[1.05rem] font-extrabold tracking-tight text-navy">LYFE</span>
              <span className="block text-[0.6rem] font-bold tracking-[0.3em] text-muted">PEPTIDES</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
            <Link href="/" className={navClass(pathname === "/")}>
              Home
            </Link>
            <div className="relative" ref={shopRef}>
              <button
                type="button"
                onClick={() => setShopOpen((v) => !v)}
                aria-expanded={shopOpen}
                aria-haspopup="true"
                className={`${navClass(pathname.startsWith("/shop") || pathname.startsWith("/product"))} flex items-center gap-1`}
              >
                Shop <ChevronDown className={`h-4 w-4 transition-transform ${shopOpen ? "rotate-180" : ""}`} />
              </button>
              {shopOpen && (
                <div className="card absolute left-1/2 top-full mt-3 w-64 -translate-x-1/2 p-2 shadow-xl">
                  <Link href="/shop" className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-bold text-navy hover:bg-surface">
                    All products
                  </Link>
                  {categories.map((c) => (
                    <Link
                      key={c.name}
                      href={`/shop?cat=${encodeURIComponent(c.name)}`}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-surface"
                    >
                      {c.name}
                      <span className="num text-xs text-faint">{c.count}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className={navClass(pathname.startsWith(n.href))}>
                {n.label}
              </Link>
            ))}
          </nav>

          <form onSubmit={search} className="ml-auto hidden max-w-sm flex-1 md:block" role="search">
            <label className="relative block">
              <span className="sr-only">Search peptides</span>
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-faint" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                type="search"
                placeholder="Search peptides…"
                className="h-11 w-full rounded-full border border-line bg-surface pl-11 pr-4 text-sm text-ink outline-none transition placeholder:text-faint focus:border-navy focus:bg-white"
              />
            </label>
          </form>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <button
              type="button"
              onClick={open}
              className="relative grid h-11 w-11 place-items-center rounded-full text-navy transition hover:bg-surface"
              aria-label={`Open cart, ${count} items`}
            >
              <CartIcon className="h-6 w-6" />
              <span className="num absolute right-0.5 top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[0.6875rem] font-bold text-white">
                {count}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMenu((v) => !v)}
              className="grid h-11 w-11 place-items-center rounded-full text-navy hover:bg-surface lg:hidden"
              aria-label={menu ? "Close menu" : "Open menu"}
              aria-expanded={menu}
            >
              {menu ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {menu && (
          <div className="border-t border-line bg-white lg:hidden">
            <div className="wrap flex flex-col gap-1 py-4">
              <form onSubmit={search} className="mb-3 md:hidden" role="search">
                <label className="relative block">
                  <span className="sr-only">Search peptides</span>
                  <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-faint" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    type="search"
                    placeholder="Search peptides…"
                    className="h-11 w-full rounded-full border border-line bg-surface pl-11 pr-4 text-sm outline-none focus:border-navy"
                  />
                </label>
              </form>
              <Link href="/" className="rounded-lg px-3 py-3 font-semibold hover:bg-surface">Home</Link>
              <Link href="/shop" className="rounded-lg px-3 py-3 font-semibold hover:bg-surface">Shop all products</Link>
              <div className="grid grid-cols-2 gap-1 pl-3">
                {categories.map((c) => (
                  <Link
                    key={c.name}
                    href={`/shop?cat=${encodeURIComponent(c.name)}`}
                    className="rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface hover:text-ink"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="rounded-lg px-3 py-3 font-semibold hover:bg-surface">
                  {n.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
