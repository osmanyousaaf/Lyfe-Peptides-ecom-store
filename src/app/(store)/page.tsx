import Image from "next/image";
import { isUpload } from "@/lib/img";
import Link from "next/link";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import Newsletter from "@/components/Newsletter";
import WhyLyfe from "@/components/WhyLyfe";
import Tested from "@/components/home/Tested";
import Guarantee from "@/components/home/Guarantee";
import HowItWorks from "@/components/home/HowItWorks";
import ClosingCta from "@/components/home/ClosingCta";
import Faq from "@/components/contact/Faq";
import {
  ArrowRight,
  BoxIcon,
  CheckIcon,
  ChevronRight,
  GridIcon,
  MapleIcon,
  PenIcon,
  StarIcon,
  VialIcon,
} from "@/components/icons";
import { getAllProducts, getCategories, getFeaturedProducts, getProduct, productsByCategory } from "@/lib/products";

const CATEGORY_TILES = [
  { cat: "Recovery", blurb: "Tissue, tendon and gut research", pick: "bpc-157-10-mg" },
  { cat: "Weight Loss", blurb: "Metabolic and lipolysis models", pick: "aod-9604-10-mg" },
  { cat: "Anti-Aging", blurb: "Skin, collagen and longevity", pick: "ghk-cu-100-mg" },
  { cat: "Growth Factors", blurb: "GH axis and secretagogues", pick: "cjc-1295-ipamorelin-10-mg" },
];

export default function Home() {
  const featured = getFeaturedProducts();
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
                        unoptimized={isUpload(p.images[p.images.length > 1 ? 1 : 0])}
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

      <WhyLyfe compounds={all.length} />

      <Tested />

      <Guarantee />

      {/* 28 day supply */}
      <section className="wrap section">
        <div className="relative grid items-center overflow-hidden rounded-3xl bg-surface lg:grid-cols-2">
          <span className="orb -right-10 top-10 h-72 w-72 bg-accent/15" aria-hidden />
          <div className="relative p-7 sm:p-10 lg:p-14">
            <p className="eyebrow" data-reveal>Dual chamber pen</p>
            <h2 className="head mt-4 text-navy" data-reveal style={{ ["--d" as string]: "60ms" }}>
              Only buy what you need: <span className="grad-text">28 days</span>
            </h2>
            <p className="mt-4 max-w-[50ch] text-muted" data-reveal style={{ ["--d" as string]: "120ms" }}>
              Our dual chamber pens are sized for a 28-day research cycle. Powder and bacteriostatic water stay
              separate until you activate the pen, so nothing is mixed before it is needed.
            </p>
            <ul className="mt-6 grid gap-2.5 text-[0.9375rem]">
              {["Pre-measured, factory-sealed chambers", "Mix with a twist when you are ready", "Available on 13 compounds"].map((t, i) => (
                <li key={t} className="flex items-center gap-2.5" data-reveal style={{ ["--d" as string]: `${180 + i * 80}ms` }}>
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-accent/15 text-accent"><CheckIcon className="h-3 w-3" /></span>
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3" data-reveal style={{ ["--d" as string]: "420ms" }}>
              <Link href="/shop" className="btn btn-solid shine group">
                Shop pens <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/documentation#dual-chamber" className="btn btn-line">
                How it works
              </Link>
            </div>
          </div>

          {/* no data-reveal here: its transform would isolate the pen and stop the white from blending away */}
          <div className="relative mx-auto flex aspect-square w-full max-w-[520px] items-center justify-center p-6 sm:p-10">
            <DayRing />
            <div className="float blend absolute inset-[5%]">
              <Image src={pen} alt="Lyfe dual chamber pen" fill sizes="(max-width: 1024px) 60vw, 300px" className="object-contain" />
            </div>
            <span className="float absolute left-4 top-6 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-navy shadow-[0_10px_24px_-12px_rgb(19_41_75/0.5)] sm:left-8 sm:top-10" style={{ animationDelay: "-2s" }}>
              <PenIcon className="h-4 w-4 text-accent" /> A Canadian first
            </span>
            <span className="float absolute bottom-8 right-4 rounded-2xl bg-navy px-4 py-2.5 text-white shadow-[0_14px_30px_-14px_rgb(19_41_75/0.8)] sm:bottom-12 sm:right-8" style={{ animationDelay: "-3.2s" }}>
              <span className="num block text-2xl font-extrabold leading-none"><span data-count="28">28</span></span>
              <span className="block text-[0.6875rem] font-semibold uppercase tracking-wider text-white/70">day cycle</span>
            </span>
          </div>
        </div>
      </section>

      <HowItWorks />

      {/* questions */}
      <section className="wrap section">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr]">
          <div data-reveal>
            <p className="eyebrow">Questions</p>
            <h2 className="mt-4 text-[clamp(2rem,1.4rem+2.4vw,3.25rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-navy">
              Frequently asked questions
            </h2>
            <p className="mt-4 max-w-[36ch] text-muted">
              Still have a question about testing, shipping or documentation? We answer every message within a
              business day.
            </p>
            <Link href="/contact" className="btn btn-line mt-6">
              Contact us
            </Link>
          </div>
          <div data-reveal style={{ ["--d" as string]: "100ms" }}>
            <Faq />
          </div>
        </div>
      </section>

      <ClosingCta />

      <Newsletter />
    </>
  );
}

// 28 ticks around the pen that light up one day at a time.
function DayRing() {
  return (
    <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden>
      <circle cx="100" cy="100" r="78" fill="#fff" opacity="0.7" />
      {Array.from({ length: 28 }, (_, i) => {
        const a = (i / 28) * Math.PI * 2 - Math.PI / 2;
        const x1 = 100 + Math.cos(a) * 88;
        const y1 = 100 + Math.sin(a) * 88;
        const x2 = 100 + Math.cos(a) * 93;
        const y2 = 100 + Math.sin(a) * 93;
        return (
          <line
            key={i}
            x1={x1.toFixed(2)}
            y1={y1.toFixed(2)}
            x2={x2.toFixed(2)}
            y2={y2.toFixed(2)}
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.15"
            className="animate-[day-tick_5.6s_linear_infinite]"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        );
      })}
    </svg>
  );
}
