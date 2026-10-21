"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import AccountButton from "./account/AccountButton";
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
  SparkIcon,
  TruckIcon,
} from "./icons";

// announcement icons, cycled through in order
const BAR_ICONS = [ShieldIcon, FlaskIcon, TruckIcon, BoltIcon, MapleIcon];

const NAV = [
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/documentation", label: "Documentation" },
  { href: "/contact", label: "Contact" },
];

export default function Header({
  categories,
  announcements,
}: {
  categories: { name: string; count: number }[];
  announcements: string[];
}) {
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
      <AnnouncementBar messages={announcements} />

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
            <AccountButton />
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

// Seconds left before the 1 PM Toronto cutoff today, or null when today's dispatch has closed.
function secondsToCutoff(now: Date): number | null {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Toronto",
      weekday: "short",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value])
  );
  if (parts.weekday === "Sat" || parts.weekday === "Sun") return null;
  const left = 13 * 3600 - (Number(parts.hour) * 3600 + Number(parts.minute) * 60 + Number(parts.second));
  return left > 0 ? left : null;
}

const pad = (n: number) => String(n).padStart(2, "0");

function Countdown() {
  const [left, setLeft] = useState<number | null | undefined>(undefined);

  useEffect(() => {
    const tick = () => setLeft(secondsToCutoff(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (left === undefined) return <span>Same-day dispatch before 1 PM EST</span>;
  if (left === null) return <span>Order now and it ships next business morning</span>;
  return (
    <span>
      Order within{" "}
      <span className="num rounded-md bg-white/10 px-1.5 py-0.5 font-bold text-white">
        {pad(Math.floor(left / 3600))}h {pad(Math.floor((left % 3600) / 60))}m {pad(left % 60)}s
      </span>{" "}
      for same-day dispatch
    </span>
  );
}

function AnnouncementBar({ messages }: { messages: string[] }) {
  const trust = messages.map((text, i) => ({ Icon: BAR_ICONS[i % BAR_ICONS.length], text }));
  const items = [...trust, ...trust];
  return (
    <div className="relative overflow-hidden bg-navy-2 text-white">
      <span
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,transparent_20%,rgb(242_106_33/0.18)_45%,rgb(224_78_139/0.14)_55%,transparent_80%)] bg-[length:200%_100%] animate-[hue-pan_9s_linear_infinite]"
        aria-hidden
      />
      <div className="wrap relative flex h-10 items-center gap-5 text-[0.8125rem] font-medium">
        <p className="hidden shrink-0 items-center gap-2.5 text-white/85 md:flex">
          <span className="live-dot" aria-hidden />
          <Countdown />
        </p>
        <span className="hidden h-4 w-px shrink-0 bg-white/20 md:block" aria-hidden />
        <div
          className="group relative flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]"
          aria-label="Store highlights"
        >
          <div className="flex w-max animate-[ticker_32s_linear_infinite] items-center group-hover:[animation-play-state:paused]">
            {items.map(({ Icon, text }, i) => (
              <span key={i} className="flex items-center whitespace-nowrap" aria-hidden={i >= trust.length}>
                <Icon className="mr-2 h-4 w-4 text-accent" />
                <span className="text-white/90">{text}</span>
                <SparkIcon className="mx-6 h-2.5 w-2.5 text-white/30" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
