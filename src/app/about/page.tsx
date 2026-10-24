import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { getAllProducts } from "@/lib/products";
import { ArrowRight, BoxIcon, CheckIcon, FlaskIcon, ShieldIcon, TruckIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "About",
  description:
    "Lyfe is a Canadian supplier of research-grade peptides, committed to purity, transparency and scientific integrity. Every product is third-party tested and ships with a certificate of analysis.",
};

const WHY = [
  { Icon: FlaskIcon, title: "99%+ purity", text: "Every batch verified by independent laboratories." },
  { Icon: ShieldIcon, title: "Certificate of analysis", text: "Included with every order, and published for our core compounds." },
  { Icon: TruckIcon, title: "Fast Canadian shipping", text: "Same-day dispatch on orders placed before 1 PM EST." },
  { Icon: BoxIcon, title: "Secure packaging", text: "Plain, discreet packaging on every order, and a neutral billing descriptor." },
];

const CHAIN = [
  ["Sourced", "Raw materials from GMP manufacturing facilities."],
  ["Formulated", "USP-grade excipients, low in endotoxin and low in metals."],
  ["Tested", "Independent LC-MS/MS analysis of identity, content and purity."],
  ["Documented", "A batch-specific certificate of analysis goes in the box."],
  ["Shipped", "Same day from Canada, in plain packaging."],
];

const VIALS = [
  { src: "/cutouts/lyfe-nad-500mg.png", w: 329, h: 668, cls: "h-[62%]" },
  { src: "/cutouts/bpc-157-10mg.png", w: 320, h: 722, cls: "h-[82%]" },
  { src: "/cutouts/lyfe-ghk-cu-100mg.png", w: 345, h: 657, cls: "h-[66%]" },
];

export default function AboutPage() {
  const count = getAllProducts().length;
  return (
    <>
      <PageHero
        crumb="About"
        eyebrow="About Lyfe"
        title="Research you can"
        accent="verify."
        lead="Lyfe is a Canadian supplier of research-grade peptides, committed to purity, transparency and scientific integrity. Every product we offer is third-party tested and ships with a certificate of analysis."
      />

      {/* story + picture */}
      <section className="wrap section grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="eyebrow">Our mission</p>
          <h2 className="head mt-4 max-w-[20ch] text-navy">Reliable compounds for researchers across Canada</h2>
          <p className="mt-5 max-w-[58ch] leading-relaxed text-muted">
            Our mission is to give researchers across Canada reliable, high-purity compounds backed by rigorous quality
            standards. We believe peptide research should be accessible without compromising on quality.
          </p>
          <p className="mt-4 max-w-[58ch] leading-relaxed text-muted">
            We keep the catalogue focused on purpose, so we can stand behind every vial in it, and we were the first in
            Canada to offer the dual chamber peptide cartridge, which keeps powder and diluent apart until the moment
            they&rsquo;re needed.
          </p>
          <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-line pt-8">
            {[
              ["99%+", "Purity standard"],
              [String(count), "Products in the catalogue"],
              ["1 PM", "Same-day dispatch cut-off (EST)"],
            ].map(([n, l]) => (
              <div key={l}>
                <dt className="sr-only">{l}</dt>
                <dd>
                  <span className="num block text-3xl font-extrabold tracking-tight text-navy">{n}</span>
                  <span className="mt-1 block text-sm text-muted">{l}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* vials on a white block, on the same light ground as the page */}
        <div className="relative h-[380px] overflow-hidden rounded-3xl border border-line bg-[linear-gradient(160deg,#ffffff_0%,#f3f5f8_60%,#e9edf2_100%)] sm:h-[440px]" aria-hidden>
          <span className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-accent/10 blur-[70px]" />
          <div className="absolute inset-x-[8%] bottom-[12%] h-12 rounded-t-xl border-t border-white bg-[linear-gradient(180deg,#e7ecf1,#fbfcfd_50%,#eef1f5)]" />
          <div className="absolute inset-x-[8%] bottom-[4%] h-[8%] rounded-b-xl bg-[linear-gradient(180deg,#eef1f5,#d9e0e8)] shadow-[0_24px_40px_-20px_rgb(19_41_75/0.35)]" />
          <div className="absolute inset-x-0 bottom-[calc(12%+1.4rem)] top-[12%] flex items-end justify-center gap-4">
            {VIALS.map((v) => (
              <Image key={v.src} src={v.src} alt="" width={v.w} height={v.h} sizes="200px" quality={90} className={`${v.cls} w-auto drop-shadow-[0_14px_14px_rgb(19_41_75/0.18)]`} />
            ))}
          </div>
        </div>
      </section>

      {/* why choose us */}
      <section className="bg-surface">
        <div className="wrap section">
          <div className="max-w-2xl">
            <p className="eyebrow">Why choose us</p>
            <h2 className="head mt-4 text-navy">The standard we hold every order to</h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map(({ Icon, title, text }) => (
              <div key={title} className="card card-hover p-6" data-reveal>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-navy text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-bold text-navy">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* quality chain */}
      <section className="wrap section">
        <div className="max-w-2xl">
          <p className="eyebrow">How a vial reaches you</p>
          <h2 className="head mt-4 text-navy">From raw material to your door</h2>
        </div>
        <ol className="relative mt-10 grid gap-6 md:grid-cols-5 md:gap-4">
          <span className="absolute left-5 top-5 hidden h-px w-[calc(100%-2.5rem)] bg-line md:block" aria-hidden />
          {CHAIN.map(([t, d], i) => (
            <li key={t} className="relative flex gap-4 md:block" data-reveal style={{ ["--d" as string]: `${i * 70}ms` }}>
              <span className="num relative grid h-10 w-10 shrink-0 place-items-center rounded-full border-4 border-bg bg-accent text-sm font-bold text-white">
                {i + 1}
              </span>
              <div className="md:mt-4">
                <h3 className="font-bold text-navy">{t}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* closing band */}
      <section className="wrap pb-16">
        <div className="grid items-center gap-8 overflow-hidden rounded-3xl bg-navy p-8 text-white md:grid-cols-[1.3fr_1fr] md:p-12">
          <div>
            <p className="eyebrow text-white">Based in Canada. Shipping nationwide.</p>
            <h2 className="mt-4 text-[clamp(1.6rem,1.2rem+1.2vw,2.3rem)] font-extrabold leading-tight">
              See the catalogue, and the paperwork behind it.
            </h2>
            <ul className="mt-5 grid gap-2 text-sm text-white/80">
              {["Certificates of analysis on the Documentation page", "Dual chamber pen on 13 compounds"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-accent" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link href="/shop" className="btn btn-solid">
              Browse products <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/documentation" className="btn border-white/30 text-white hover:bg-white hover:text-navy">
              Documentation
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
