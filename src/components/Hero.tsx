import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BoltIcon, FlaskIcon, MapleIcon, ShieldIcon, TruckIcon } from "./icons";

const FEATURES = [
  { Icon: ShieldIcon, title: "COA included", sub: "With every order" },
  { Icon: FlaskIcon, title: "99%+ purity", sub: "Third-party verified" },
  { Icon: TruckIcon, title: "Free shipping", sub: "On orders over $300" },
  { Icon: BoltIcon, title: "Same-day dispatch", sub: "Orders before 1 PM EST" },
];

// the first entry repeats at the end so the roll loops without a jump
const PROVINCES = ["Ontario", "British Columbia", "Alberta", "Quebec", "Nova Scotia", "Ontario"];

// A vial render, cropped to the vial and multiplied onto the hero so its white ground disappears.
// The blend sits on the outermost layer: transformed children start their own stacking context.
function Vial({ src, alt, className, delay, depth }: { src: string; alt: string; className: string; delay: string; depth: string }) {
  return (
    <div className={`px-layer blend absolute ${className}`} style={{ ["--depth" as string]: depth }}>
      <div className="float relative aspect-[1/2] h-full overflow-hidden" style={{ animationDelay: delay }}>
        <Image src={src} alt={alt} fill priority sizes="(max-width: 1024px) 40vw, 300px" className="scale-[1.62] object-cover" />
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section data-parallax className="relative overflow-hidden bg-[linear-gradient(115deg,#f7f9fc_0%,#eef3f9_45%,#e3eaf4_100%)]">
      {/* drifting colour and a faint lab grid */}
      <div className="dot-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_70%_40%,#000_10%,transparent_70%)]" aria-hidden />
      <span className="orb right-[8%] top-[6%] h-72 w-72 bg-accent/25" aria-hidden />
      <span className="orb bottom-[-10%] right-[30%] h-80 w-80 bg-[#7aa2e3]/30 [animation-delay:-5s]" aria-hidden />
      <span className="orb left-[-6%] top-[30%] h-64 w-64 bg-[#e04e8b]/10 [animation-delay:-9s]" aria-hidden />

      <div className="wrap relative grid items-center gap-10 py-12 lg:grid-cols-[1.05fr_1fr] lg:py-16">
        <div>
          <Link href="/documentation#dual-chamber" className="rise group inline-flex items-center gap-2 rounded-full border border-navy/10 bg-white/70 py-1.5 pl-1.5 pr-4 text-[0.8125rem] font-semibold text-navy shadow-sm backdrop-blur transition hover:border-accent/40 hover:bg-white">
            <span className="rounded-full bg-navy px-2.5 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wider text-white">New</span>
            Dual chamber pens, made in Canada
            <ArrowRight className="h-3.5 w-3.5 text-accent transition-transform group-hover:translate-x-0.5" />
          </Link>
          <h1 className="display rise mt-5 max-w-[15ch] text-navy" style={{ animationDelay: "60ms" }}>
            Your Canadian Source for{" "}
            <span className="relative inline-block">
              <span className="grad-text">Research Peptides</span>
              <svg viewBox="0 0 300 14" preserveAspectRatio="none" className="absolute -bottom-2 left-0 h-3 w-full" aria-hidden>
                <path
                  d="M3 10 C 80 2, 200 2, 297 8"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="draw in"
                  style={{ ["--len" as string]: 320, ["--d" as string]: "500ms" }}
                />
              </svg>
            </span>
          </h1>
          <p className="rise mt-6 max-w-[52ch] text-[1.0625rem] leading-relaxed text-muted" style={{ animationDelay: "120ms" }}>
            Lyfe is a Canadian manufacturer and supplier of research-grade peptides. Trusted
            quality, verified purity and fast delivery, so you can focus on your research.
          </p>
          <div className="rise mt-8 flex flex-wrap gap-3" style={{ animationDelay: "180ms" }}>
            <Link href="/shop" className="btn btn-solid shine group">
              Shop now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/about" className="btn btn-line">
              Learn more
            </Link>
          </div>

          <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4 sm:gap-x-4">
            {FEATURES.map(({ Icon, title, sub }, i) => (
              <li key={title} className="rise group flex items-start gap-3" style={{ animationDelay: `${260 + i * 70}ms` }}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-navy shadow-[0_4px_14px_-6px_rgb(19_41_75/0.35)] transition duration-300 group-hover:-translate-y-0.5 group-hover:bg-navy group-hover:text-white">
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

        {/* three vials on a glowing plinth, drifting with the pointer */}
        <div className="relative h-[340px] sm:h-[420px] lg:h-[480px]">
          <div className="px-layer absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ ["--depth" as string]: "-8px" }} aria-hidden>
            <svg viewBox="0 0 400 400" className="spin-slow h-[300px] w-[300px] sm:h-[400px] sm:w-[400px]">
              <circle cx="200" cy="200" r="190" fill="none" stroke="rgb(19 41 75 / 0.12)" strokeDasharray="2 10" strokeWidth="2" />
              <circle cx="200" cy="200" r="150" fill="none" stroke="rgb(242 106 33 / 0.25)" strokeDasharray="60 340" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="200" cy="10" r="5" fill="var(--accent)" />
            </svg>
          </div>
          <span className="absolute bottom-3 left-1/2 h-10 w-[70%] -translate-x-1/2 rounded-[50%] bg-navy/15 blur-xl" aria-hidden />

          <Vial
            src="/products/tb-500-10mg.png"
            alt="TB-500 10 mg vial"
            className="bottom-6 left-[6%] h-[72%] sm:left-[12%] lg:left-[4%]"
            delay="0s"
            depth="14px"
          />
          <Vial
            src="/products/lyfe-ghk-cu-100mg.png"
            alt="GHK-Cu 100 mg vial"
            className="bottom-6 right-[6%] h-[72%] sm:right-[12%] lg:right-[18%]"
            delay="-1.6s"
            depth="18px"
          />
          <Vial
            src="/products/bpc-157-10mg.png"
            alt="BPC-157 10 mg vial"
            className="bottom-2 left-1/2 h-[90%] -translate-x-[62%] lg:-translate-x-[78%]"
            delay="-0.8s"
            depth="26px"
          />

          <p className="px-layer absolute right-0 top-2 hidden -rotate-[8deg] font-[family-name:var(--font-caveat)] text-[2.4rem] leading-[0.95] text-navy xl:block" style={{ ["--depth" as string]: "-14px" }}>
            Quality
            <br />
            you can trust
            <svg viewBox="0 0 160 18" className="mt-1 h-4 w-40" aria-hidden>
              <path d="M2 14 C 40 4, 100 2, 158 6" fill="none" stroke="var(--accent)" strokeWidth="3.5" strokeLinecap="round" className="draw in" style={{ ["--len" as string]: 170, ["--d" as string]: "900ms" }} />
            </svg>
          </p>

          {/* where today's orders are headed */}
          <div className="rise absolute bottom-3 right-0 sm:bottom-8" style={{ animationDelay: "500ms" }}>
            <div className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/75 py-2.5 pl-2.5 pr-4 shadow-[0_18px_40px_-20px_rgb(19_41_75/0.55)] backdrop-blur-md">
              <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-[linear-gradient(135deg,#e2382f,#b81f18)] text-white">
                <MapleIcon className="h-5 w-5" />
              </span>
              <span className="leading-tight">
                <span className="flex items-center gap-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-muted">
                  <span className="live-dot" aria-hidden /> Shipping today to
                </span>
                <span className="roller mt-0.5 text-[0.9375rem] font-extrabold text-navy" aria-label="Every province in Canada">
                  <span aria-hidden>
                    {PROVINCES.map((p, i) => (
                      <span key={i}>{p}</span>
                    ))}
                  </span>
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
