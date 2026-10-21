"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, FlaskIcon, LockIcon, ShieldIcon, TruckIcon } from "./icons";

type P = { className?: string };

const MoleculeIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
    <circle cx="6" cy="17" r="2.2" />
    <circle cx="12" cy="11" r="2.2" />
    <circle cx="18" cy="5.5" r="2.2" />
    <circle cx="17.5" cy="17" r="2.2" />
    <path d="M7.6 15.4l2.8-2.8M13.6 9.4l2.8-2.4M13.4 12.6l2.8 2.8" />
  </svg>
);
const BoxIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 3l8 4v10l-8 4-8-4V7l8-4z" />
    <path d="M4 7l8 4 8-4M12 11v10M8 5l8 4" />
  </svg>
);
const MAPLE =
  "M12 2l1.4 3.4 2.6-1.3-.6 3.6 3.2-.7-1.6 2.8 3 1.2-2.6 1.6 1.7 2.4-3.3-.2.5 3.3-2.8-1.8-.9 3.7h-1.2l-.9-3.7-2.8 1.8.5-3.3-3.3.2 1.7-2.4-2.6-1.6 3-1.2-1.6-2.8 3.2.7-.6-3.6 2.6 1.3L12 2z";

const CARDS = [
  {
    Icon: FlaskIcon,
    title: "Third-party tested",
    text: "Every batch is verified by HPLC and mass spectrometry before it is listed.",
    href: "/documentation",
    cta: "How we test",
    art: "bubbles",
  },
  {
    Icon: ShieldIcon,
    title: "COA with every order",
    text: "A batch-specific certificate of analysis ships with each product.",
    href: "/blog/how-to-read-a-peptide-certificate-of-analysis",
    cta: "Reading a COA",
    art: "coa",
  },
  {
    Icon: TruckIcon,
    title: "Fast Canadian shipping",
    text: "Stocked in Canada. Orders before 1 PM EST leave the same day; free over $300.",
    href: "/shop",
    cta: "Shop now",
    art: "parcel",
  },
  {
    Icon: LockIcon,
    title: "Secure, discreet packaging",
    text: "Plain outer packaging with no product names, and secure checkout.",
    href: "/contact",
    cta: "Questions? Contact us",
    art: "sealed",
  },
] as const;

// Navy hexagon badge holding a line icon.
function Hex({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative grid h-[60px] w-[60px] place-items-center text-white">
      <svg viewBox="0 0 56 56" className="absolute inset-0 h-full w-full drop-shadow-[0_12px_16px_rgb(19_41_75/0.35)]" aria-hidden>
        <defs>
          <linearGradient id="why-hex" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2a4f86" />
            <stop offset="1" stopColor="#0d1e38" />
          </linearGradient>
        </defs>
        <path d="M28 3c1 0 1.9.3 2.8.8l16.4 9.5c1.8 1 2.8 2.9 2.8 4.9v19.6c0 2-1 3.9-2.8 4.9L30.8 52.2a5.6 5.6 0 0 1-5.6 0L8.8 42.7C7 41.7 6 39.8 6 37.8V18.2c0-2 1-3.9 2.8-4.9l16.4-9.5c.9-.5 1.8-.8 2.8-.8z" fill="url(#why-hex)" />
        <path d="M28 7.5l17 9.8v21.4L28 48.5 11 38.7V17.3z" fill="none" stroke="rgb(255 255 255 / 0.1)" />
      </svg>
      <span className="relative">{children}</span>
    </span>
  );
}

// An isometric shipping box with a maple leaf on the side.
function Parcel({ className }: P) {
  return (
    <svg viewBox="0 0 120 110" className={className} aria-hidden>
      <path d="M60 14 L106 34 L60 54 L14 34 Z" fill="#f7f9fc" stroke="#d8dee7" />
      <path d="M14 34 L60 54 L60 104 L14 84 Z" fill="#e8eef6" stroke="#d8dee7" />
      <path d="M106 34 L60 54 L60 104 L106 84 Z" fill="#dbe6f3" stroke="#d8dee7" />
      <path d="M37 24 L83 44 L83 58" fill="none" stroke="#c4cad1" strokeWidth="5" opacity="0.7" />
      <g transform="translate(70 62) scale(1.05) skewY(-23)">
        <path d={MAPLE} fill="#9fb0c8" />
      </g>
    </svg>
  );
}

function CardArt({ kind }: { kind: string }) {
  if (kind === "bubbles")
    return (
      <div className="pointer-events-none absolute -bottom-3 -right-3 h-28 w-36" aria-hidden>
        {[
          { s: 64, x: 52, y: 30, d: "0s" },
          { s: 34, x: 22, y: 58, d: "-1.4s" },
          { s: 20, x: 106, y: 14, d: "-2.6s" },
          { s: 14, x: 30, y: 26, d: "-0.8s" },
        ].map((b, i) => (
          <span
            key={i}
            className="float absolute rounded-full bg-[radial-gradient(circle_at_30%_28%,#ffffff_0%,rgb(227_234_244/0.6)_40%,rgb(159_179_204/0.45)_100%)] shadow-[inset_-3px_-5px_10px_rgb(19_41_75/0.12),0_10px_20px_-12px_rgb(19_41_75/0.4)]"
            style={{ width: b.s, height: b.s, left: b.x, top: b.y, animationDelay: b.d }}
          />
        ))}
      </div>
    );
  if (kind === "coa")
    return (
      <div className="pointer-events-none absolute -bottom-4 -right-3 w-36 rotate-[-10deg] rounded-lg border border-white bg-white/90 p-3 shadow-[0_18px_30px_-16px_rgb(19_41_75/0.45)] transition-transform duration-500 group-hover:rotate-[-6deg] group-hover:-translate-y-1" aria-hidden>
        <div className="flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-[#8d99ab]" fill="currentColor"><path d={MAPLE} /></svg>
          <span className="text-[0.4375rem] font-bold uppercase leading-tight tracking-[0.18em] text-[#8d99ab]">Certificate<br />of analysis</span>
        </div>
        <div className="mt-2 grid gap-1">
          {[100, 84, 92].map((w, i) => <span key={i} className="h-[3px] rounded-full bg-[#e1e7ef]" style={{ width: `${w}%` }} />)}
        </div>
      </div>
    );
  if (kind === "parcel")
    return (
      <div className="pointer-events-none absolute -bottom-2 right-1 h-28 w-40" aria-hidden>
        {[30, 48, 66].map((y, i) => (
          <span
            key={y}
            className="why-streak absolute right-[76px] h-[2px] rounded-full bg-[linear-gradient(90deg,transparent,#f26a21)]"
            style={{ top: y, width: 70 - i * 12, animationDelay: `${i * 0.35}s` }}
          />
        ))}
        <Parcel className="float absolute bottom-0 right-0 h-24 w-24" />
      </div>
    );
  return (
    <div className="pointer-events-none absolute -bottom-3 -right-2 h-24 w-28" aria-hidden>
      <Parcel className="absolute bottom-7 right-7 h-16 w-16 opacity-70" />
      <span className="absolute bottom-4 right-4 grid h-10 w-10 place-items-center rounded-full border border-accent/30 bg-white/90 text-accent shadow-[0_10px_20px_-10px_rgb(242_106_33/0.6)]">
        <ShieldIcon className="h-[18px] w-[18px]" />
      </span>
    </div>
  );
}

export default function WhyLyfe({ compounds }: { compounds: number }) {
  // the highlighted card steps through all four until the visitor points at one
  const [active, setActive] = useState(3);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setActive((a) => (a + 1) % CARDS.length), 3200);
    return () => clearInterval(id);
  }, [paused]);

  const ring = 2 * Math.PI * 34;

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_50%_0%,#ffffff_0%,#f4f7fb_50%,#e9eff7_100%)]">
      {/* soft depth: blurred glows behind the glassware and the certificate */}
      <span className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[#c3d2e4]/50 blur-3xl" aria-hidden />
      <span className="pointer-events-none absolute -right-20 top-10 h-96 w-96 rounded-full bg-[#dbe6f3]/70 blur-3xl" aria-hidden />

      {/* pipette dripping into a beaker */}
      <svg viewBox="0 -110 260 410" className="pointer-events-none absolute -left-4 top-0 hidden h-[400px] w-[254px] lg:block" aria-hidden>
        <defs>
          <linearGradient id="why-glass" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="0.35" stopColor="#dbe6f3" stopOpacity="0.35" />
            <stop offset="0.7" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="1" stopColor="#b4c3d6" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="why-pipette" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#c3d2e4" />
          </linearGradient>
        </defs>
        <g transform="rotate(-38 150 70)">
          <rect x="138" y="-80" width="24" height="150" rx="11" fill="url(#why-pipette)" stroke="#c9d3e0" />
          <rect x="143" y="-70" width="5" height="130" rx="2.5" fill="#fff" opacity="0.8" />
          <path d="M140 70 L160 70 L153 104 L147 104 Z" fill="url(#why-pipette)" stroke="#c9d3e0" />
        </g>
        <circle className="why-drop-fall" cx="172" cy="152" r="6" fill="#dbe6f3" stroke="#aeb9c6" />
        <ellipse cx="150" cy="208" rx="74" ry="14" fill="none" stroke="#c9d3e0" strokeWidth="2" />
        <path d="M76 208 V290 Q76 300 88 300 H212 Q224 300 224 290 V208" fill="url(#why-glass)" stroke="#c9d3e0" strokeWidth="2" />
        <ellipse cx="150" cy="246" rx="72" ry="11" fill="#e3eaf4" opacity="0.8" />
        <ellipse className="why-ripple" cx="150" cy="246" rx="20" ry="4" fill="none" stroke="#f26a21" strokeOpacity="0.5" />
        <path d="M90 216 V286" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
      </svg>

      {/* the certificate, circled by an orbit */}
      <div className="pointer-events-none absolute right-[2%] top-[5%] hidden lg:block" aria-hidden>
        <svg viewBox="0 0 340 300" className="absolute -left-14 -top-6 h-[300px] w-[340px]">
          <ellipse cx="170" cy="150" rx="150" ry="118" fill="none" stroke="#f26a21" strokeOpacity="0.35" />
          <circle r="5" fill="#f26a21">
            <animateMotion dur="9s" repeatCount="indefinite" path="M20 150 a150 118 0 1 0 300 0 a150 118 0 1 0 -300 0" />
          </circle>
        </svg>
        <div className="float relative w-60 rotate-[10deg] rounded-2xl border border-white bg-white/80 p-6 shadow-[0_40px_70px_-34px_rgb(19_41_75/0.5)] backdrop-blur" style={{ animationDelay: "-2s" }}>
          <span className="absolute -right-5 -top-4 inline-flex items-center gap-1.5 rounded-full border border-green/20 bg-white px-2.5 py-1 text-[0.5625rem] font-bold uppercase tracking-wider text-navy shadow-[0_8px_18px_-10px_rgb(47_154_74/0.6)]">
            <span className="grid h-4 w-4 place-items-center rounded-full bg-green text-white">
              <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="3.4"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            </span>
            Batch verified
          </span>
          <div className="flex items-start gap-3">
            <svg viewBox="0 0 24 24" className="h-7 w-7 text-navy" fill="currentColor"><path d={MAPLE} /></svg>
            <p className="text-[0.6875rem] font-semibold uppercase leading-snug tracking-[0.22em] text-navy/70">Certificate<br />of analysis</p>
          </div>
          <div className="mt-5 grid gap-2">
            {[100, 90, 96, 76, 84].map((w, i) => (
              <span key={i} className="h-1 rounded-full bg-[#dbe6f3]" style={{ width: `${w}%` }} />
            ))}
          </div>
          <div className="mt-5 flex items-end justify-between">
            <svg viewBox="0 0 80 24" className="h-6 w-20 text-[#8d99ab]" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M2 18c8-14 12 4 18-6s6 10 14 2 10-8 16 2 12-6 26-4" />
            </svg>
            <span className="grid h-12 w-12 place-items-center rounded-full border-2 border-dashed border-[#aeb9c6] text-[#aeb9c6]">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d={MAPLE} /></svg>
            </span>
          </div>
        </div>
      </div>

      {/* navy corner wave */}
      <svg viewBox="0 0 200 160" className="pointer-events-none absolute -bottom-px right-0 hidden h-40 w-52 lg:block" aria-hidden>
        <path d="M200 0 C150 40 140 120 0 160 H200 Z" fill="#13294b" />
        <g transform="translate(150 112) scale(1.3)" opacity="0.35">
          <path d={MAPLE} fill="#fff" />
        </g>
      </svg>

      <div className="wrap section relative">
        <div className="mx-auto max-w-2xl text-center" data-reveal>
          <p className="eyebrow">Why Lyfe Peptides</p>
          <h2 className="mt-5 text-[clamp(2.125rem,1.4rem+2.8vw,3.75rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-navy">
            Quality you can <span className="text-accent">verify</span>
          </h2>
          <p className="mx-auto mt-4 max-w-[40ch] text-lg text-muted">A Canadian manufacturer with the paperwork to prove every batch.</p>
        </div>

        {/* the numbers */}
        <div
          className="relative mx-auto mt-10 max-w-6xl rounded-3xl border border-white bg-white/65 shadow-[0_30px_70px_-40px_rgb(19_41_75/0.45),inset_0_1px_0_#fff] backdrop-blur-xl"
          data-reveal
        >
          <dl className="grid grid-cols-2 lg:grid-cols-4">
            <div className="col-span-2 flex items-center gap-5 border-b border-line px-6 py-6 lg:col-span-1 lg:border-b-0 lg:border-r">
              <span className="relative grid h-[96px] w-[96px] shrink-0 place-items-center">
                <svg viewBox="0 0 80 80" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
                  <defs>
                    <linearGradient id="why-ring" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#ffd2b5" />
                      <stop offset="1" stopColor="#f26a21" />
                    </linearGradient>
                  </defs>
                  <circle cx="40" cy="40" r="34" fill="#fff" stroke="#f1f4f8" strokeWidth="5" />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    fill="none"
                    stroke="url(#why-ring)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    className="draw"
                    style={{ strokeDasharray: `${ring * 0.99} ${ring}`, ["--len" as string]: ring }}
                  />
                </svg>
                <span className="absolute left-1/2 top-[3px] h-2 w-2 -translate-x-1/2 rounded-full bg-accent shadow-[0_0_0_3px_rgb(242_106_33/0.2)]" aria-hidden />
                <dd className="num relative text-[1.375rem] font-extrabold text-navy">
                  <span data-count="99">99</span>%+
                </dd>
              </span>
              <dt className="text-[0.9375rem] leading-snug text-muted">
                Purity, verified
                <br />
                by HPLC
                <span className="mt-3 block h-px w-24 bg-[linear-gradient(90deg,#f26a21,transparent)]" />
              </dt>
            </div>
            {[
              { Icon: FlaskIcon, n: compounds, label: "Research compounds" },
              { Icon: MoleculeIcon, n: 13, label: "Compounds available as pens" },
              { Icon: BoxIcon, n: 300, label: "Free shipping threshold", pre: "$" },
            ].map(({ Icon, n, label, pre }, i) => (
              <div
                key={label}
                className={`flex items-center gap-3 px-5 py-6 sm:gap-4 sm:px-6 ${i === 0 ? "border-r border-line" : ""} ${i === 1 ? "border-line lg:border-r" : ""} ${
                  i === 2 ? "col-span-2 border-t border-line lg:col-span-1 lg:border-t-0" : ""
                }`}
              >
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[radial-gradient(circle_at_30%_25%,#ffffff,#e3eaf4)] text-navy shadow-[0_10px_20px_-12px_rgb(19_41_75/0.5),inset_0_1px_0_#fff]">
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <dd className="num text-[1.875rem] font-extrabold leading-none tracking-tight text-navy sm:text-[2.125rem]">
                    {pre}
                    <span data-count={n}>{n}</span>
                  </dd>
                  <dt className="mt-1.5 text-sm leading-snug text-muted">{label}</dt>
                </div>
              </div>
            ))}
          </dl>
        </div>

        {/* curved branches from the numbers to the four promises */}
        <div className="why-branch relative mx-auto hidden h-[72px] max-w-6xl lg:block" data-reveal aria-hidden>
          <span className="absolute left-1/2 top-0 z-10 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_0_3px_rgb(242_106_33/0.2)]" />
          <span className="why-arm why-arm-l absolute right-1/2 top-0 h-8 w-6 rounded-br-[18px] border-b-[1.5px] border-r-[1.5px] border-accent/60" />
          <span className="why-arm why-arm-r absolute left-1/2 top-0 h-8 w-6 rounded-bl-[18px] border-b-[1.5px] border-l-[1.5px] border-accent/60" />
          {[12.5, 37.5, 62.5, 87.5].map((x) => {
            const left = x < 50;
            return (
              <span
                key={x}
                className={`why-limb absolute bottom-2 top-[calc(2rem-1.5px)] border-t-[1.5px] border-accent/60 ${left ? "why-limb-l rounded-tl-[18px] border-l-[1.5px]" : "why-limb-r rounded-tr-[18px] border-r-[1.5px]"}`}
                style={left ? { left: `${x}%`, right: "calc(50% + 1.5rem)" } : { left: "calc(50% + 1.5rem)", right: `${100 - x}%` }}
              >
                <span className={`why-dot absolute -bottom-1 h-2 w-2 rounded-full bg-accent ${left ? "-left-[5px]" : "-right-[5px]"}`} />
              </span>
            );
          })}
        </div>

        {/* the four promises */}
        <div className="mx-auto mt-6 grid max-w-6xl gap-4 sm:grid-cols-2 lg:mt-0 lg:grid-cols-4 lg:gap-6" onMouseLeave={() => setPaused(false)}>
          {CARDS.map(({ Icon, title, text, href, cta, art }, i) => {
            const on = active === i;
            return (
              <div key={title} data-reveal style={{ ["--d" as string]: `${i * 90}ms` }}>
                <div
                  onMouseEnter={() => {
                    setActive(i);
                    setPaused(true);
                  }}
                  className={`group relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-3xl border bg-white/75 p-6 backdrop-blur transition-all duration-500 sm:p-7 ${
                    on
                      ? "-translate-y-1 border-accent bg-[linear-gradient(180deg,#ffffff,#fff7f2)] shadow-[0_0_0_4px_rgb(242_106_33/0.07),0_30px_60px_-28px_rgb(242_106_33/0.55)]"
                      : "border-white shadow-[0_24px_50px_-34px_rgb(19_41_75/0.45)]"
                  }`}
                >
                  <CardArt kind={art} />
                  <span className="num absolute right-6 top-6 text-sm font-medium tracking-widest text-faint">{String(i + 1).padStart(2, "0")}</span>
                  <Hex>
                    <Icon className="h-6 w-6" />
                  </Hex>
                  <h3 className="relative mt-6 text-lg font-bold text-navy">{title}</h3>
                  <p className="relative mt-3 max-w-[26ch] flex-1 text-[0.9375rem] leading-relaxed text-muted">{text}</p>
                  <Link href={href} className="relative z-10 mt-6 inline-flex items-center gap-2 self-start text-sm font-semibold text-accent-deep hover:text-accent">
                    {cta}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* footer cue */}
        <div className="mx-auto mt-12 flex max-w-6xl items-center justify-between gap-6 text-[0.6875rem] font-semibold uppercase tracking-[0.25em] text-navy/70">
          <div className="flex items-center gap-6">
            <span className="relative block h-px w-24 bg-line" aria-hidden>
              <span className="absolute -top-px left-0 h-[2px] bg-accent transition-all duration-700" style={{ width: `${((active + 1) / CARDS.length) * 100}%` }} />
            </span>
            <span className="hidden sm:inline">Trust / Science / Quality</span>
          </div>
          <a href="#lab-verified" className="group relative z-10 flex items-center gap-4 lg:mr-40">
            <span className="grid h-11 w-11 place-items-center rounded-full border border-navy/30 transition group-hover:border-accent group-hover:text-accent">
              <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M12 5v14M6 13l6 6 6-6" />
              </svg>
            </span>
            Scroll to explore
          </a>
        </div>
      </div>
    </section>
  );
}
