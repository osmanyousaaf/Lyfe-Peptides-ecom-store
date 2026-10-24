import Image from "next/image";
import Link from "next/link";
import Hero from "@/components/Hero";
import HeroLab from "@/components/HeroLab";
import LabSection from "@/components/LabReport";
import WhyCards from "@/components/WhyCards";
import { DualChamber, TwentyEightDays } from "@/components/PenSections";
import ProductCard from "@/components/ProductCard";
import Newsletter from "@/components/Newsletter";
import {
  ArrowRight,
  BoxIcon,
  ChevronRight,
  GridIcon,
  MapleIcon,
  StarIcon,
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
  { cat: "Recovery", blurb: "BPC-157, TB-500 and peptides for tissue research", img: "/cutouts/bpc-157-10mg.png" },
  { cat: "Weight Loss", blurb: "AOD-9604 and peptides for metabolic research", img: "/cutouts/lyfe-aod-9604-10mg.png" },
  { cat: "Anti-Aging", blurb: "GHK-Cu and longevity research compounds", img: "/cutouts/lyfe-ghk-cu-100mg.png" },
  { cat: "Growth Factors", blurb: "CJC-1295, Ipamorelin and growth research", img: "/cutouts/lyfe-cjc-1295-ipamorelin-10mg.png" },
];

const WHY = [
  {
    title: "Third-party tested",
    text: "Every batch is independently tested by accredited Canadian laboratories. HPLC purity testing confirms you receive exactly what is on the label, and the certificate of analysis ships with your order.",
    href: "/documentation",
    cta: "See our testing",
  },
  {
    title: "Fast Canadian shipping",
    text: "Orders placed before 1 PM EST ship the same business day from our Canadian fulfillment centre, in plain, discreet packaging. Orders over $300 ship free.",
    href: "/shop",
    cta: "Start an order",
  },
  {
    title: "Secure & discreet",
    text: "Plain, unmarked packaging for complete privacy, and a neutral descriptor on your billing statement. Checkout is SSL-encrypted and we never store payment information.",
    href: "/contact",
    cta: "Ask us anything",
  },
];

// ?hero=lab shows the alternative lab-background hero, for comparing the two designs
export default async function Home({ searchParams }: { searchParams: Promise<{ hero?: string }> }) {
  const { hero } = await searchParams;
  const featured = FEATURED.map((s) => getProduct(s)).filter(Boolean) as Product[];
  const all = getAllProducts();
  const cats = getCategories();

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
      {hero === "lab" ? <HeroLab /> : <Hero />}

      {/* dual chamber banner */}
      <section className="wrap pt-8 md:pt-10">
        <div className="flex flex-col gap-5 rounded-2xl border border-line bg-white px-5 py-5 shadow-[0_10px_30px_-22px_rgb(19_41_75/0.4)] sm:flex-row sm:items-center sm:px-7">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-accent text-white">
            <MapleIcon className="h-6 w-6" />
          </span>
          <div className="flex-1">
            <p className="font-bold text-navy sm:text-[1.0625rem]">
              Lyfe is the first manufacturer of dual chamber pens in Canada.
            </p>
            <p className="mt-0.5 text-sm text-muted">
              See why dual chamber beats prefilled: no premixing, and no 28-day clock until you activate the pen.
            </p>
          </div>
          <Link href="#dual-chamber" className="btn btn-sm shrink-0 rounded-[10px] border-navy/70 bg-white text-navy hover:bg-navy hover:text-white">
            Learn about dual chamber <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* shop by category: intro on the left, four tiles on the right */}
      <section className="wrap section">
        <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_2fr] lg:gap-12">
          <div data-reveal>
            <p className="eyebrow">Shop by category</p>
            <h2 className="head mt-4 text-navy">Trusted Peptide Solutions</h2>
            <p className="mt-4 max-w-[40ch] text-muted">
              Explore our selection of research peptides, carefully sourced and quality tested for your confidence.
            </p>
            <Link href="/shop" className="btn btn-navy mt-7 rounded-[10px]">
              View All Products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {CATEGORY_TILES.map((t, i) => {
              const n = productsByCategory(t.cat).length;
              return (
                <Link
                  key={t.cat}
                  href={`/shop?cat=${encodeURIComponent(t.cat)}`}
                  className="card card-hover group flex flex-col p-5"
                  data-reveal
                  style={{ ["--d" as string]: `${i * 70}ms` }}
                >
                  <div className="relative mx-auto h-24 w-full">
                    <Image src={t.img} alt="" fill sizes="120px" className="object-contain transition-transform duration-500 group-hover:-translate-y-1" />
                  </div>
                  <div className="mt-5 flex items-start justify-between gap-2">
                    <h3 className="text-[0.9375rem] font-bold leading-snug text-navy">{t.cat}</h3>
                    <ChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-accent transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <p className="mt-1 text-xs text-muted">{t.blurb}</p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-xs font-semibold text-navy">
                    View {n} products <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* navy brand band with a curved shoulder */}
      <section className="relative overflow-hidden bg-navy text-white" aria-label="Lyfe Peptides values">
        <span className="pointer-events-none absolute -right-24 -top-24 h-48 w-80 rounded-full border border-white/10" aria-hidden />
        <span className="pointer-events-none absolute -left-32 bottom-[-9rem] h-56 w-[30rem] rounded-full border border-white/10" aria-hidden />
        <div className="wrap flex items-center justify-center gap-4 py-7 sm:gap-6">
          <span className="hidden h-px w-24 bg-white/20 md:block" aria-hidden />
          <p className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[0.75rem] font-semibold tracking-[0.25em] text-white/85">
            {["LYFE PEPTIDES", "RESEARCH", "QUALITY", "TRUST"].map((w, i) => (
              <span key={w} className="flex items-center gap-5">
                {i > 0 && <span className="text-accent" aria-hidden>&times;</span>}
                {w}
              </span>
            ))}
          </p>
          <span className="hidden h-px w-24 bg-white/20 md:block" aria-hidden />
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

      {/* why lyfe */}
      <section className="wrap section">
        <div className="mb-10 text-center">
          <h2 className="head text-navy">Why Lyfe Peptides?</h2>
          <p className="mx-auto mt-3 max-w-[54ch] text-muted">
            A Canadian manufacturer you can verify, with the paperwork to prove every batch.
          </p>
        </div>
        <WhyCards items={WHY} />
      </section>

      <LabSection />

      <TwentyEightDays />

      <DualChamber />

      <Newsletter />
    </>
  );
}
