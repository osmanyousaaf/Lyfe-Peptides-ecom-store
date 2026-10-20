import Image from "next/image";
import Link from "next/link";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import Newsletter from "@/components/Newsletter";
import {
  ArrowRight,
  BoxIcon,
  CheckIcon,
  ChevronRight,
  FlaskIcon,
  GridIcon,
  LockIcon,
  MapleIcon,
  PenIcon,
  ShieldIcon,
  StarIcon,
  TruckIcon,
  VialIcon,
} from "@/components/icons";
import { getAllProducts, getCategories, getProduct, productsByCategory } from "@/lib/products";
import type { Product } from "@/lib/types";

// the live site's own featured order
const FEATURED = [
  "5amino1mq-5-mg",
  "aod-9604-10-mg",
  "cjc-1295-ipamorelin-10-mg",
  "ghk-cu-100-mg",
  "hgh-10-iu",
  "nad-500-mg",
  "slupp-332-5-mg",
  "tb-500-bpc-157-10-mg-2",
];

const CATEGORY_TILES = [
  { cat: "Recovery", blurb: "Tissue, tendon and gut research", pick: "bpc-157-10-mg" },
  { cat: "Weight Loss", blurb: "Metabolic and lipolysis models", pick: "aod-9604-10-mg" },
  { cat: "Anti-Aging", blurb: "Skin, collagen and longevity", pick: "ghk-cu-100-mg" },
  { cat: "Growth Factors", blurb: "GH axis and secretagogues", pick: "cjc-1295-ipamorelin-10-mg" },
];

const WHY = [
  {
    Icon: FlaskIcon,
    title: "Third-party tested",
    text: "Every batch is verified by HPLC and mass spectrometry before it is listed, and the certificate of analysis ships with your order.",
  },
  {
    Icon: TruckIcon,
    title: "Fast Canadian shipping",
    text: "Stocked and shipped inside Canada. Orders placed before 1 PM EST leave the same day, and orders over $300 ship free.",
  },
  {
    Icon: LockIcon,
    title: "Secure, discreet packaging",
    text: "Plain outer packaging with no product names, and secure checkout for every order.",
  },
];

export default function Home() {
  const featured = FEATURED.map((s) => getProduct(s)).filter(Boolean) as Product[];
  const all = getAllProducts();
  const cats = getCategories();
  const pen = "/products/lyfe-pen-v2.png";

  const sidebar = [
    { href: "/shop", label: "All products", Icon: GridIcon, count: all.length, active: true },
    ...cats.map((c) => ({
      href: `/shop?cat=${encodeURIComponent(c)}`,
      label: c,
      Icon: c === "Accessories" ? BoxIcon : c === "Growth Factors" ? StarIcon : VialIcon,
      count: productsByCategory(c).length,
      active: false,
    })),
  ];

  return (
    <>
      <Hero />

      {/* dual chamber banner */}
      <section className="wrap pt-8 md:pt-10">
        <div className="flex flex-col gap-5 rounded-2xl border border-line bg-surface px-5 py-5 sm:flex-row sm:items-center sm:px-7">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-accent text-white">
            <MapleIcon className="h-6 w-6" />
          </span>
          <div className="flex-1">
            <p className="font-bold text-navy sm:text-[1.0625rem]">
              Lyfe is the first manufacturer of dual chamber pens in Canada.
            </p>
            <p className="mt-0.5 text-sm text-muted">
              Peptide and bacteriostatic water stay in separate chambers until you activate the pen. No separate
              reconstitution, no wasted vials.
            </p>
          </div>
          <Link href="/documentation#dual-chamber" className="btn btn-line btn-sm shrink-0">
            Learn about dual chamber <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* featured products with category sidebar */}
      <section className="wrap section">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <nav className="card sticky top-36 p-2" aria-label="Product categories">
              {sidebar.map(({ href, label, Icon, count, active }) => (
                <Link
                  key={href}
                  href={href}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                    active ? "bg-accent/10 text-accent-deep" : "text-ink hover:bg-surface"
                  }`}
                >
                  <Icon className={`h-[18px] w-[18px] ${active ? "text-accent" : "text-muted group-hover:text-navy"}`} />
                  <span className="flex-1">{label}</span>
                  <span className="num text-xs font-medium text-faint">{count}</span>
                  <ChevronRight className="h-4 w-4 text-faint" />
                </Link>
              ))}
            </nav>
          </aside>

          <div className="min-w-0">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="head title-bar text-navy">Featured products</h2>
                <p className="mt-3 text-muted">Research peptides, trusted by researchers across Canada.</p>
              </div>
              <Link href="/shop" className="inline-flex items-center gap-1.5 text-sm font-bold text-navy hover:text-accent-deep">
                View all products <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* phone and tablet: categories as a scrolling row */}
            <div className="noscroll -mx-[var(--mx)] mb-6 flex gap-2 overflow-x-auto px-[var(--mx)] lg:hidden">
              {sidebar.map(({ href, label, active }) => (
                <Link
                  key={href}
                  href={href}
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold ${
                    active ? "border-accent bg-accent text-white" : "border-line bg-white text-ink"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
              {featured.map((p, i) => (
                <div key={p.id} data-reveal style={{ ["--d" as string]: `${(i % 4) * 70}ms` }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* shop by category */}
      <section className="bg-surface">
        <div className="wrap section">
          <div className="mb-8 text-center">
            <h2 className="head text-navy">Shop by category</h2>
            <p className="mt-3 text-muted">Find compounds by the research area you work in.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {CATEGORY_TILES.map((t, i) => {
              const p = getProduct(t.pick);
              const n = productsByCategory(t.cat).length;
              return (
                <Link
                  key={t.cat}
                  href={`/shop?cat=${encodeURIComponent(t.cat)}`}
                  className="card card-hover group flex flex-col overflow-hidden"
                  data-reveal
                  style={{ ["--d" as string]: `${i * 70}ms` }}
                >
                  <div className="relative aspect-[4/3] bg-white">
                    {p && (
                      <Image
                        src={p.images[p.images.length > 1 ? 1 : 0]}
                        alt=""
                        fill
                        sizes="(max-width: 1024px) 50vw, 300px"
                        className="blend object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <h3 className="font-bold text-navy sm:text-lg">{t.cat}</h3>
                    <p className="mt-1 text-sm text-muted">{t.blurb}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-accent-deep">
                      {n} products <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* why lyfe */}
      <section className="wrap section">
        <div className="mb-10 text-center">
          <h2 className="head text-navy">Why Lyfe Peptides?</h2>
          <p className="mx-auto mt-3 max-w-[54ch] text-muted">
            A Canadian manufacturer you can verify, with the paperwork to prove every batch.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {WHY.map(({ Icon, title, text }, i) => (
            <div key={title} className="card p-7" data-reveal style={{ ["--d" as string]: `${i * 80}ms` }}>
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-accent/10 text-accent">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-bold text-navy">{title}</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* lab verified */}
      <section className="bg-navy text-white">
        <div className="wrap section grid items-center gap-10 lg:grid-cols-2">
          <div data-reveal>
            <p className="eyebrow text-white">Lab-verified purity</p>
            <h2 className="head mt-4 max-w-[18ch]">Every batch tested. Every result documented.</h2>
            <p className="mt-4 max-w-[52ch] text-white/75">
              Nothing ships on trust alone. Each lot is analysed before it is listed, and its certificate of
              analysis comes with your order.
            </p>
            <ul className="mt-7 grid gap-3">
              {[
                "HPLC testing for purity and concentration",
                "Mass spectrometry to confirm identity",
                "USP-grade, low-endotoxin, low-metal excipients",
                "Batch-specific certificate of analysis with every order",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <Link href="/documentation" className="btn btn-solid mt-8">
              See how we test <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative pb-6" data-reveal style={{ ["--d" as string]: "100ms" }}>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {["semax-10-mg", "nad-500-mg", "ss-31-10-mg"].map((s, i) => {
                const p = getProduct(s);
                return p ? (
                  <div key={s} className={`exhibit relative aspect-[3/5] rounded-xl ${i === 1 ? "-translate-y-6" : "translate-y-4"}`}>
                    <Image src={p.image} alt={p.name} fill sizes="(max-width: 1024px) 30vw, 200px" className="scale-[1.35] object-cover" />
                  </div>
                ) : null;
              })}
            </div>
            <div className="card absolute bottom-0 left-1/2 flex -translate-x-1/2 items-center gap-3 whitespace-nowrap px-4 py-3 text-ink shadow-xl">
              <ShieldIcon className="h-6 w-6 text-green" />
              <span className="text-sm font-bold text-navy">99%+ purity, third-party verified</span>
            </div>
          </div>
        </div>
      </section>

      {/* 28 day supply */}
      <section className="wrap section">
        <div className="grid items-center gap-10 overflow-hidden rounded-2xl bg-surface lg:grid-cols-2">
          <div className="p-7 sm:p-10 lg:p-14" data-reveal>
            <p className="eyebrow">Dual chamber pen</p>
            <h2 className="head mt-4 text-navy">Only buy what you need: 28 days</h2>
            <p className="mt-4 max-w-[50ch] text-muted">
              Our dual chamber pens are sized for a 28-day research cycle. Powder and bacteriostatic water stay
              separate until you activate the pen, so nothing is mixed before it is needed.
            </p>
            <ul className="mt-6 grid gap-2.5 text-[0.9375rem]">
              {["Pre-measured, factory-sealed chambers", "Mix with a twist when you are ready", "Available on 13 compounds"].map((t) => (
                <li key={t} className="flex items-center gap-2.5">
                  <CheckIcon className="h-4 w-4 text-accent" />
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="btn btn-solid">
                Shop pens <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/documentation#dual-chamber" className="btn btn-line">
                How it works
              </Link>
            </div>
          </div>
          <div className="relative h-[320px] sm:h-[420px] lg:h-full lg:min-h-[460px]">
            <Image src={pen} alt="Lyfe dual chamber pen" fill sizes="(max-width: 1024px) 100vw, 640px" className="blend scale-[1.25] object-cover" />
            <span className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-navy shadow">
              <PenIcon className="h-4 w-4 text-accent" /> A Canadian first
            </span>
          </div>
        </div>
      </section>

      <Newsletter />
    </>
  );
}
