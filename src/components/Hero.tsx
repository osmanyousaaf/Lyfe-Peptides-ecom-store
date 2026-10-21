import Link from "next/link";
import VialCutout from "./VialCutout";
import { ArrowRight, CheckIcon, MapleIcon } from "./icons";

// the first entry repeats at the end so the roll loops without a jump
const PROVINCES = ["Ontario", "British Columbia", "Alberta", "Quebec", "Nova Scotia", "Ontario"];

const TRUST = [
  "Proudly Canadian",
  "Free shipping over $300",
  "HPLC + mass-spec tested",
  "COA on every order",
  "Same-day dispatch before 1 PM EST",
  "99%+ purity",
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0b1a36] text-white">
      {/* studio stage: cool key light, warm rim, wordmark set into the back wall */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_70%_40%,#1f4b8f_0%,#122c5c_42%,#0b1a36_76%)]" aria-hidden />
      <span className="orb left-[-8%] top-[18%] h-[420px] w-[420px] bg-[#2d6fd6]/35" aria-hidden />
      <span className="orb bottom-[-24%] right-[-6%] h-[480px] w-[480px] bg-accent/25 [animation-delay:-7s]" aria-hidden />
      <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_50%_40%,#000_0%,transparent_70%)]" aria-hidden />
      <span
        className="pointer-events-none absolute right-[-3%] top-[8%] select-none whitespace-nowrap text-[18vw] font-extrabold leading-none tracking-[-0.06em] text-white/[0.04] [-webkit-text-stroke:1px_rgb(255_255_255/0.08)]"
        aria-hidden
      >
        LYFE
      </span>

      <div className="wrap relative grid items-center gap-10 pb-10 pt-12 lg:grid-cols-[1.02fr_1fr] lg:pb-14 lg:pt-20">
        <div>
          <p className="rise inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.06] py-1.5 pl-2 pr-4 text-[0.8125rem] font-semibold text-white/85 backdrop-blur">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-[#e2382f] text-white">
              <MapleIcon className="h-3.5 w-3.5" />
            </span>
            Canada-based · Research use only
          </p>
          <h1 className="rise mt-6 text-[clamp(2.5rem,1.6rem+3.6vw,4.75rem)] font-extrabold leading-[1.02] tracking-[-0.035em]" style={{ animationDelay: "60ms" }}>
            High-Purity <span className="text-accent">Research Peptides</span>
          </h1>
          <p className="rise mt-6 max-w-[50ch] text-[1.0625rem] leading-relaxed text-white/75 sm:text-lg" style={{ animationDelay: "120ms" }}>
            A Canadian manufacturer of research-grade peptides. Every batch is tested by HPLC and mass
            spectrometry, documented in a certificate of analysis, and dispatched the same day.
          </p>
          <div className="rise mt-8 flex flex-wrap gap-3" style={{ animationDelay: "180ms" }}>
            <Link href="/shop" className="btn btn-solid shine group">
              Shop peptides <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/documentation" className="btn border-white/25 bg-white/[0.06] text-white backdrop-blur hover:border-white/50 hover:bg-white/10">
              View certifications
            </Link>
          </div>
          <ul className="rise mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70" style={{ animationDelay: "240ms" }}>
            {["COA with every order", "Free shipping over $300", "Discreet packaging"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-accent" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* three cutout vials grouped on a dark spotlit stage */}
        <div className="relative mx-auto h-[360px] w-full max-w-[560px] sm:h-[440px] lg:h-[500px]">
          {/* atmosphere: a soft blue key light and a warm floor bounce */}
          <span className="pointer-events-none absolute left-1/2 top-[2%] h-[80%] w-[72%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgb(120_170_235/0.4)_0%,transparent_68%)] blur-2xl" aria-hidden />
          {/* floor glow + contact shadow under the cluster */}
          <span className="pointer-events-none absolute bottom-[16%] left-1/2 h-8 w-[58%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgb(120_170_235/0.5)_0%,transparent_72%)] blur-xl" aria-hidden />
          <span className="pointer-events-none absolute bottom-[15%] left-1/2 h-5 w-[48%] -translate-x-1/2 rounded-[50%] bg-black/55 blur-lg" aria-hidden />

          <VialCutout src="/products/cut/tb-500-10mg.png" alt="TB-500 10 mg vial" priority className="bottom-[19%] left-[4%] z-[1] h-[50%] w-[32%] -rotate-[9deg] sm:left-[8%]" />
          <VialCutout src="/products/cut/lyfe-ghk-cu-100mg.png" alt="GHK-Cu 100 mg vial" priority className="bottom-[19%] right-[4%] z-[1] h-[50%] w-[32%] rotate-[9deg] sm:right-[8%]" />
          <VialCutout src="/products/cut/bpc-157-10mg.png" alt="BPC-157 10 mg vial" priority className="bottom-[16%] left-1/2 z-[2] h-[66%] w-[38%] -translate-x-1/2" />

          {/* label chip for the front vial */}
          <span className="absolute bottom-[7%] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/60 bg-white/90 px-3.5 py-1.5 text-[0.75rem] font-bold text-navy shadow-lg backdrop-blur">
            BPC-157 · 10 mg
          </span>

          {/* where today's orders are headed */}
          <div className="rise absolute -top-1 right-0 z-10 sm:top-2" style={{ animationDelay: "500ms" }}>
            <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.08] py-2.5 pl-2.5 pr-4 shadow-[0_18px_40px_-20px_rgb(0_0_0/0.6)] backdrop-blur-md">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[linear-gradient(135deg,#e2382f,#b81f18)] text-white">
                <MapleIcon className="h-5 w-5" />
              </span>
              <span className="leading-tight">
                <span className="flex items-center gap-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-white/60">
                  <span className="live-dot" aria-hidden /> Shipping today to
                </span>
                <span className="roller mt-0.5 text-[0.9375rem] font-extrabold text-white" aria-label="Every province in Canada">
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

      {/* Puratek-style trust strip under the hero */}
      <div className="relative border-t border-white/10 bg-[#081430]/80 backdrop-blur">
        <div className="wrap flex items-center gap-x-8 gap-y-3 overflow-x-auto py-4 text-[0.8125rem] font-semibold text-white/75 lg:justify-between">
          {TRUST.map((t) => (
            <span key={t} className="flex shrink-0 items-center gap-2 whitespace-nowrap">
              <CheckIcon className="h-4 w-4 text-accent" />
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
