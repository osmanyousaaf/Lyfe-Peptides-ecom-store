import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BoltIcon, FlaskIcon, MapleIcon, ShieldIcon, TruckIcon } from "./icons";

const FEATURES = [
  { Icon: ShieldIcon, title: "COA included", sub: "With every order" },
  { Icon: FlaskIcon, title: "99%+ purity", sub: "Third-party verified" },
  { Icon: TruckIcon, title: "Free shipping", sub: "On orders over $300" },
  { Icon: BoltIcon, title: "Same-day dispatch", sub: "Orders before 1 PM EST" },
];

// A vial render, cropped to the vial and multiplied onto the hero so its white ground disappears.
function Vial({ src, alt, className, delay }: { src: string; alt: string; className: string; delay: string }) {
  return (
    <div className={`blend float absolute aspect-[1/2] overflow-hidden ${className}`} style={{ animationDelay: delay }}>
      <Image src={src} alt={alt} fill priority sizes="(max-width: 1024px) 40vw, 300px" className="scale-[1.62] object-cover" />
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(115deg,#f7f9fc_0%,#eef3f9_45%,#e3eaf4_100%)]">
      {/* maple leaf watermark */}
      <MapleIcon className="pointer-events-none absolute -right-10 top-6 h-[420px] w-[420px] text-[#e2382f]/[0.07] lg:right-[4%]" />

      <div className="wrap relative grid items-center gap-10 py-12 lg:grid-cols-[1.05fr_1fr] lg:py-16">
        <div>
          <p className="eyebrow rise">Canada&rsquo;s research peptide specialists</p>
          <h1 className="display rise mt-5 max-w-[15ch] text-navy" style={{ animationDelay: "60ms" }}>
            Your Canadian Source for Research Peptides
          </h1>
          <p className="rise mt-5 max-w-[52ch] text-[1.0625rem] leading-relaxed text-muted" style={{ animationDelay: "120ms" }}>
            Lyfe is a Canadian manufacturer and supplier of research-grade peptides. Trusted
            quality, verified purity and fast delivery, so you can focus on your research.
          </p>
          <div className="rise mt-8 flex flex-wrap gap-3" style={{ animationDelay: "180ms" }}>
            <Link href="/shop" className="btn btn-solid">
              Shop now <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/about" className="btn btn-line">
              Learn more
            </Link>
          </div>

          <ul className="rise mt-10 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4 sm:gap-x-4" style={{ animationDelay: "240ms" }}>
            {FEATURES.map(({ Icon, title, sub }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-navy shadow-[0_4px_14px_-6px_rgb(19_41_75/0.35)]">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="leading-tight">
                  <span className="block text-sm font-bold text-navy">{title}</span>
                  <span className="mt-0.5 block text-xs text-muted">{sub}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* three vials */}
        <div className="relative h-[340px] sm:h-[420px] lg:h-[480px]">
          <Vial
            src="/products/tb-500-10mg.png"
            alt="TB-500 10 mg vial"
            className="bottom-6 left-[6%] h-[72%] sm:left-[12%] lg:left-[4%]"
            delay="0s"
          />
          <Vial
            src="/products/lyfe-ghk-cu-100mg.png"
            alt="GHK-Cu 100 mg vial"
            className="bottom-6 right-[6%] h-[72%] sm:right-[12%] lg:right-[18%]"
            delay="-1.6s"
          />
          <Vial
            src="/products/bpc-157-10mg.png"
            alt="BPC-157 10 mg vial"
            className="bottom-2 left-1/2 h-[90%] -translate-x-[62%] lg:-translate-x-[78%]"
            delay="-0.8s"
          />

          <p className="absolute right-0 top-2 hidden -rotate-[8deg] font-[family-name:var(--font-caveat)] text-[2.4rem] leading-[0.95] text-navy xl:block">
            Quality
            <br />
            you can trust
            <svg viewBox="0 0 160 18" className="mt-1 h-4 w-40" aria-hidden>
              <path d="M2 14 C 40 4, 100 2, 158 6" fill="none" stroke="var(--accent)" strokeWidth="3.5" strokeLinecap="round" />
            </svg>
          </p>

          <div className="card absolute bottom-4 right-0 flex items-center gap-3 px-4 py-3 shadow-[0_14px_30px_-16px_rgb(19_41_75/0.45)] sm:bottom-10">
            <MapleIcon className="h-7 w-7 text-[#e2382f]" />
            <span className="leading-tight">
              <span className="block text-sm font-bold text-navy">Canadian based</span>
              <span className="block text-xs text-muted">Ships across Canada</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
