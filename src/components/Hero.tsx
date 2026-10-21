import Link from "next/link";
import Studio from "./Studio";
import { ArrowRight, CheckIcon, MapleIcon } from "./icons";

// the first entry repeats at the end so the roll loops without a jump
const PROVINCES = ["Ontario", "British Columbia", "Alberta", "Quebec", "Nova Scotia", "Ontario"];

const STATS = [
  { v: "≥ 99%", l: "Verified purity, by HPLC" },
  { v: "100%", l: "Batch-specific COAs" },
  { v: "1 PM", l: "Same-day dispatch cut-off, EST" },
  { v: "13", l: "Compounds in dual chamber pens" },
];

export default function Hero() {
  return (
    <section data-parallax className="relative overflow-hidden bg-[#0b1a36] text-white">
      {/* studio backdrop: a cool pool of light, a warm rim, and the wordmark set into the wall */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_72%_42%,#1f4b8f_0%,#122c5c_40%,#0b1a36_75%)]" aria-hidden />
      <span className="orb left-[-8%] top-[20%] h-[420px] w-[420px] bg-[#2d6fd6]/35" aria-hidden />
      <span className="orb bottom-[-20%] right-[-4%] h-[460px] w-[460px] bg-accent/25 [animation-delay:-7s]" aria-hidden />
      <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_50%_40%,#000_0%,transparent_70%)]" aria-hidden />
      <span
        className="px-layer pointer-events-none absolute left-1/2 top-[2%] select-none whitespace-nowrap text-[26vw] font-extrabold leading-none tracking-[-0.06em] text-white/[0.035] [-webkit-text-stroke:1px_rgb(255_255_255/0.08)] lg:left-auto lg:right-[-2%] lg:top-[6%] lg:text-[17vw]"
        style={{ ["--depth" as string]: "-10px" }}
        aria-hidden
      >
        LYFE
      </span>

      <div className="wrap relative grid items-center gap-12 pb-14 pt-12 lg:grid-cols-[1.05fr_1fr] lg:pb-20 lg:pt-20">
        <div>
          <p className="rise inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.06] py-1.5 pl-2 pr-4 text-[0.8125rem] font-semibold text-white/85 backdrop-blur">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-[#e2382f] text-white">
              <MapleIcon className="h-3.5 w-3.5" />
            </span>
            Canada-based · Research use only
          </p>
          <h1 className="rise mt-6 text-[clamp(2.5rem,1.6rem+3.6vw,4.75rem)] font-extrabold leading-[1.02] tracking-[-0.035em]" style={{ animationDelay: "60ms" }}>
            High-purity research peptides, made in Canada.
          </h1>
          <p className="rise mt-6 max-w-[50ch] text-[1.0625rem] leading-relaxed text-white/75 sm:text-lg" style={{ animationDelay: "120ms" }}>
            Every batch is tested by HPLC and mass spectrometry, documented in a certificate of analysis, and
            dispatched the same day from inside Canada.
          </p>
          <div className="rise mt-8 flex flex-wrap gap-3" style={{ animationDelay: "180ms" }}>
            <Link href="/shop" className="btn btn-solid shine group">
              Shop peptides <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/documentation" className="btn border-white/25 bg-white/[0.06] text-white backdrop-blur hover:border-white/50 hover:bg-white/10">
              How we test
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

        {/* three staged vials, drifting with the pointer */}
        <div className="relative mx-auto h-[380px] w-full max-w-[560px] sm:h-[460px] lg:h-[520px]">
          <div className="px-layer absolute bottom-8 left-[-5%] w-[42%] -rotate-[10deg] sm:left-[-2%]" style={{ ["--depth" as string]: "12px" }}>
            <Studio src="/products/tb-500-10mg.png" alt="TB-500 10 mg vial" caption="TB-500" className="aspect-[3/4]" priority />
          </div>
          <div className="px-layer absolute bottom-8 right-[-5%] w-[42%] rotate-[10deg] sm:right-[-2%]" style={{ ["--depth" as string]: "16px" }}>
            <Studio src="/products/lyfe-ghk-cu-100mg.png" alt="GHK-Cu 100 mg vial" caption="GHK-Cu" className="aspect-[3/4]" priority />
          </div>
          <div className="px-layer absolute bottom-0 left-1/2 w-[46%] -translate-x-1/2" style={{ ["--depth" as string]: "26px" }}>
            <Studio src="/products/bpc-157-10mg.png" alt="BPC-157 10 mg vial" caption="BPC-157 · 10 mg" className="aspect-[3/4]" priority />
          </div>

          {/* where today's orders are headed */}
          <div className="rise absolute -top-2 right-0 sm:top-2" style={{ animationDelay: "500ms" }}>
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

      {/* the numbers that matter, set into the floor */}
      <div className="relative border-t border-white/10 bg-[#081430]/70 backdrop-blur">
        <dl className="wrap grid grid-cols-2 divide-white/10 lg:grid-cols-4 lg:divide-x">
          {STATS.map(({ v, l }, i) => (
            <div key={l} className="px-2 py-6 lg:px-8 lg:py-7" data-reveal style={{ ["--d" as string]: `${i * 80}ms` }}>
              <dd className="num text-[1.75rem] font-extrabold leading-none tracking-tight sm:text-[2.25rem]">{v}</dd>
              <dt className="mt-2 text-sm text-white/60">{l}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
