import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BoltIcon, FlaskIcon, ShieldIcon, TruckIcon } from "./icons";

const FEATURES = [
  { Icon: ShieldIcon, title: "COA included", sub: "With every order" },
  { Icon: FlaskIcon, title: "99%+ purity", sub: "Third-party verified" },
  { Icon: TruckIcon, title: "Free shipping", sub: "On orders over $300" },
  { Icon: BoltIcon, title: "Same-day dispatch", sub: "Before 1 PM EST" },
];


// Transparent cut-outs (public/cutouts). scale = height relative to the tallest vial.
const VIALS = [
  { src: "/cutouts/lyfe-nad-500mg.png", alt: "NAD+ 500 mg vial", w: 329, h: 668, scale: 0.75 },
  { src: "/cutouts/bpc-157-10mg.png", alt: "BPC-157 10 mg vial", w: 320, h: 722, scale: 1 },
  { src: "/cutouts/tb-500-10mg.png", alt: "TB-500 10 mg vial", w: 346, h: 711, scale: 0.87 },
  { src: "/cutouts/lyfe-ghk-cu-100mg.png", alt: "GHK-Cu 100 mg vial", w: 345, h: 657, scale: 0.79 },
  { src: "/cutouts/lyfe-tesamorelin-10mg.png", alt: "Tesamorelin 10 mg vial", w: 331, h: 620, scale: 0.64 },
];

// An olive-style branch drawn in SVG (transparent, sharp at any size). The viewBox holds every
// leaf, and the stem starts exactly at its top-right corner, so the branch enters from the
// hero's top-right edge instead of being cut off mid-air.
const LEAF = "M0 0 C 34 -20, 110 -22, 170 0 C 110 20, 34 18, 0 0 Z";
const BRANCH: { x: number; y: number; r: number; s: number; c: string }[] = [
  { x: 318, y: 22, r: 170, s: 0.7, c: "#5b8a3c" },
  { x: 300, y: 48, r: 105, s: 0.75, c: "#3f6e2a" },
  { x: 276, y: 86, r: 190, s: 0.85, c: "#6a9a45" },
  { x: 250, y: 120, r: 98, s: 0.85, c: "#467631" },
  { x: 218, y: 156, r: 182, s: 0.9, c: "#5b8a3c" },
  { x: 184, y: 190, r: 108, s: 0.85, c: "#3a6526" },
  { x: 148, y: 222, r: 172, s: 0.8, c: "#6a9a45" },
  { x: 112, y: 252, r: 118, s: 0.75, c: "#467631" },
  { x: 76, y: 282, r: 150, s: 0.8, c: "#5b8a3c" },
];
function Branch({ className = "", shadow = false }: { className?: string; shadow?: boolean }) {
  return (
    <svg viewBox="-60 -6 405 390" className={className} aria-hidden>
      {!shadow && (
        <defs>
          <linearGradient id="branch-sheen" x1="0" y1="-1" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.28" />
            <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="1" stopColor="#0b1f05" stopOpacity="0.22" />
          </linearGradient>
        </defs>
      )}
      <path d="M345 -6 C 290 80, 200 170, 70 290" fill="none" stroke={shadow ? "#3b2f22" : "#6b5a3e"} strokeWidth="3.2" strokeLinecap="round" />
      {BRANCH.map((l, i) => (
        <g key={i} transform={`translate(${l.x} ${l.y}) rotate(${l.r}) scale(${l.s})`}>
          <path d={LEAF} fill={shadow ? "#3b2f22" : l.c} />
          {!shadow && <path d={LEAF} fill="url(#branch-sheen)" />}
          {!shadow && <path d="M6 0 C 60 -1.5, 115 -1.5, 166 0" fill="none" stroke="#e8f2dc" strokeWidth="1.1" opacity="0.35" />}
        </g>
      ))}
    </svg>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(100deg,#ffffff_0%,#f8f9fb_50%,#eef1f5_100%)]">
      {/* warm light from the top right, and the branch's soft shadow on the wall */}
      <Branch shadow className="leaf-sway pointer-events-none absolute right-[5%] top-[9%] hidden h-[60%] w-auto opacity-[0.11] blur-[9px] lg:block" />
      <Branch className="leaf-sway pointer-events-none absolute right-0 top-0 z-0 h-[46%] w-auto opacity-95 blur-[1.6px] drop-shadow-[0_14px_18px_rgb(30_45_20/0.2)] sm:h-[56%]" />

      <div className="wrap relative grid items-center gap-10 py-12 lg:grid-cols-[1.08fr_1fr] lg:gap-4 lg:pb-16 lg:pt-24">
        {/* copy */}
        <div className="relative z-10">
          <p className="eyebrow rise">Canada&rsquo;s research peptide specialists</p>
          <h1 className="rise mt-5 text-[clamp(2.2rem,1.4rem+2.6vw,3.5rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-navy" style={{ animationDelay: "60ms" }}>
            Your Canadian Source
            <br />
            for <span className="grad-text">Research Peptides</span>
          </h1>
          <p className="rise mt-6 max-w-[50ch] text-[1.0625rem] leading-relaxed text-muted" style={{ animationDelay: "120ms" }}>
            Lyfe is a Canadian manufacturer and supplier of research-grade peptides. Trusted quality, verified purity
            and fast delivery, so you can focus on your research.
          </p>
          <div className="rise mt-8 flex flex-wrap gap-4" style={{ animationDelay: "180ms" }}>
            <Link href="/shop" className="btn btn-solid h-[52px] rounded-[10px] px-7">
              Shop Products <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/about" className="btn h-[52px] rounded-[10px] border-navy/70 bg-transparent px-8 text-navy hover:bg-navy hover:text-white">
              Learn More
            </Link>
          </div>

          <ul className="rise mt-10 grid grid-cols-2 gap-x-4 gap-y-5 lg:flex lg:w-[calc(100%+3rem)] lg:gap-0" style={{ animationDelay: "240ms" }}>
            {FEATURES.map(({ Icon, title, sub }, i) => (
              <li key={title} className={`group flex items-center gap-2.5 ${i > 0 ? "lg:ml-4 lg:border-l lg:border-line lg:pl-4" : ""}`}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-white text-navy shadow-[0_6px_16px_-10px_rgb(19_41_75/0.4)] transition-colors duration-300 group-hover:border-accent group-hover:text-accent">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="leading-tight">
                  <span className="block whitespace-nowrap text-[0.78rem] font-bold text-navy">{title}</span>
                  <span className="mt-1 block whitespace-nowrap text-[0.6875rem] text-muted">{sub}</span>
                </span>
              </li>
            ))}
          </ul>

        </div>

        {/* vials standing on a solid block that runs off the right edge */}
        <div className="relative h-[330px] sm:h-[420px] lg:h-[470px]">
          {/* the block */}
          <div className="absolute bottom-[4%] left-[2%] right-[calc(-1*var(--mx)-50vw)] z-[1]" aria-hidden>
            <div className="relative h-12 overflow-hidden rounded-tl-[18px] border-b border-[#dfe5ec] border-t border-t-white bg-[linear-gradient(180deg,#e9edf2_0%,#fbfcfd_45%,#f1f4f7_100%)] [clip-path:polygon(2.5%_0,100%_0,100%_100%,0_100%)] sm:h-16"><span className="absolute inset-y-0 left-[12%] w-[30%] skew-x-[-30deg] bg-white/70 blur-md" /></div>
            <div className="relative h-20 overflow-hidden rounded-bl-[18px] border-t border-white bg-[linear-gradient(180deg,#f4f6f9_0%,#dfe5ec_100%)] shadow-[0_34px_50px_-24px_rgb(19_41_75/0.35)] sm:h-28"><span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/80 to-transparent" /><span className="absolute inset-y-0 left-[20%] w-[18%] skew-x-[-30deg] bg-white/40 blur-lg" /></div>
          </div>

          <div className="absolute bottom-[calc(4%+5rem+1.1rem)] left-[5%] right-0 z-[2] flex items-end justify-center gap-2 sm:bottom-[calc(4%+7rem+1.4rem)] sm:gap-3 lg:justify-start">
            {VIALS.map((v, i) => (
              <div key={v.src} className="relative" style={{ height: `calc(var(--vh) * ${v.scale})`, ["--vh" as string]: "clamp(140px, 19.5vw, 285px)" }}>
                {/* contact shadow so each vial sits on the block */}
                <span className="pointer-events-none absolute -bottom-1.5 left-[6%] h-3 w-[88%] rounded-[50%] bg-[#13294b]/30 blur-[5px]" aria-hidden />
                <Image
                  src={v.src}
                  alt={v.alt}
                  width={v.w}
                  height={v.h}
                  priority={i < 3}
                  sizes="(max-width: 1024px) 30vw, 260px"
                  quality={95}
                  className="relative h-full w-auto drop-shadow-[8px_6px_10px_rgb(19_41_75/0.14)]"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
