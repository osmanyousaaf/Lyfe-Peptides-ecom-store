import Image from "next/image";
import Link from "next/link";
import { COMPARISON, STEPS } from "@/lib/pen";
import { ArrowRight, CheckIcon, CloseIcon } from "./icons";

const STATS = [
  { n: "28", label: "Days of peak potency after reconstitution" },
  { n: "0%", label: "Reason to stockpile reconstituted peptides" },
  { n: "100%", label: "Potency from a freshly reconstituted vial" },
];

const MEANS = [
  ["Plan your protocol first.", "Work out how much your research needs over 28 days, and buy exactly that amount."],
  ["Fresh vials, full potency.", "A vial reconstituted on day one delivers what the label says. One sitting reconstituted for six weeks does not."],
  ["Save money.", "A 90-day supply sounds economical, until a third of it degrades before use. Buy 28 days, use 28 days, reorder fresh."],
  ["Store dry vials long-term.", "Unopened, freeze-dried peptides stay stable for 12–24 months refrigerated. Only reconstitute what you'll use within the month."],
];

/* ------------------------------------------------------------------ */
/* Only buy what you need: 28 days                                     */
/* ------------------------------------------------------------------ */
export function TwentyEightDays() {
  return (
    <section className="wrap section" aria-labelledby="days-title">
      <div className="mx-auto max-w-3xl text-center" data-reveal>
        <p className="eyebrow">Smarter buying</p>
        <h2 id="days-title" className="head mt-4 text-navy">
          Only buy what you need: <span className="font-serif text-[1.1em] font-normal italic text-accent-deep">28 days</span>
        </h2>
        <p className="mx-auto mt-4 max-w-[60ch] text-muted">
          Peptides have a limited window of effectiveness once reconstituted. Buying more than a 28-day supply means
          paying for product that will degrade before you can use it.
        </p>
      </div>

      {/* stats */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {STATS.map((s, i) => (
          <div key={s.n} className="card p-7 text-center" data-reveal style={{ ["--d" as string]: `${i * 80}ms` }}>
            <p className="num text-[3.25rem] font-extrabold leading-none tracking-tight text-accent">{s.n}</p>
            <p className="mx-auto mt-3 max-w-[22ch] text-sm font-medium text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* why + what it means */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="card p-7 sm:p-9" data-reveal>
          <h3 className="text-xl font-extrabold text-navy">Why 28 days?</h3>
          <p className="mt-3 leading-relaxed text-muted">
            Once a peptide is reconstituted with bacteriostatic water, the clock starts. Temperature changes, light and
            repeated punctures through the stopper all speed up degradation. After about 28 days potency drops
            noticeably, which means weaker results and wasted product.
          </p>
          <div className="mt-6 flex items-end gap-3 border-t border-line pt-6">
            {["/cutouts/lyfe-nad-500mg.png", "/cutouts/bpc-157-10mg.png", "/cutouts/lyfe-ghk-cu-100mg.png"].map((src, i) => (
              <Image key={src} src={src} alt="" width={330} height={700} className={`h-auto drop-shadow-[0_10px_10px_rgb(19_41_75/0.18)] ${i === 1 ? "w-16" : "w-12"}`} />
            ))}
            <p className="ml-2 text-xs leading-relaxed text-muted">
              Vials sized for real research protocols,
              <br />
              so you get what you need and nothing goes to waste.
            </p>
          </div>
        </div>

        <div className="card p-7 sm:p-9" data-reveal style={{ ["--d" as string]: "80ms" }}>
          <h3 className="text-xl font-extrabold text-navy">What this means for you</h3>
          <ol className="mt-5 grid gap-5">
            {MEANS.map(([lead, text], i) => (
              <li key={lead} className="flex gap-4">
                <span className="num grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy text-sm font-bold text-white">{i + 1}</span>
                <p className="leading-relaxed text-muted">
                  <strong className="font-bold text-navy">{lead}</strong> {text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* the pen solution */}
      <div className="relative mt-6 overflow-hidden rounded-2xl bg-navy text-white" data-reveal>
        <div className="grid items-center lg:grid-cols-[1.2fr_0.8fr]">
          <div className="p-7 sm:p-10 lg:p-12">
            <p className="eyebrow text-white">The pen solution</p>
            <h3 className="mt-4 text-[clamp(1.5rem,1.1rem+1.2vw,2.1rem)] font-extrabold leading-tight">No more 28-day limits</h3>
            <p className="mt-4 max-w-[56ch] leading-relaxed text-white/75">
              Our dual chamber cartridge pen keeps the peptide powder and diluent in separate chambers until you activate
              it. The compound stays dry and lyophilized, stable for up to 24 months refrigerated, so the degradation clock
              doesn&rsquo;t start until you&rsquo;re ready, and nothing goes to waste.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/shop" className="btn btn-solid">
                Shop pens <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/dual-chamber-pen-vs-prefilled" className="btn border-white/30 text-white hover:bg-white hover:text-navy">
                How the pen works
              </Link>
            </div>
          </div>
          <div className="relative h-[420px] lg:h-full lg:min-h-[500px]">
            <span className="absolute left-1/2 top-[45%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/25 blur-[70px]" aria-hidden />
            {/* whitish podium the pen stands on */}
            <div className="absolute bottom-10 left-1/2 w-[72%] max-w-[300px] -translate-x-1/2" aria-hidden>
              <div className="relative aspect-[5/1.25]">
                <div className="absolute inset-x-0 bottom-0 h-[78%] rounded-[50%] bg-[linear-gradient(90deg,#b9c3cf,#e8edf2_45%,#ffffff_60%,#c7d0da)] shadow-[0_26px_40px_-10px_rgba(0,0,0,0.6)]" />
                <div className="absolute inset-x-0 top-[39%] h-[22%] bg-[linear-gradient(90deg,#b9c3cf,#e8edf2_45%,#ffffff_60%,#c7d0da)]" />
                <div className="absolute inset-x-0 top-0 h-[78%] rounded-[50%] bg-[radial-gradient(ellipse_at_45%_35%,#ffffff_0%,#f4f6f9_55%,#dde3ea_100%)]" />
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-[3.6rem] top-6">
              <Image src="/cutouts/lyfe-pen-v2.png" alt="Lyfe dual chamber pen" fill sizes="(max-width: 1024px) 100vw, 520px" quality={90} className="object-contain object-bottom drop-shadow-[0_18px_20px_rgba(0,0,0,0.45)]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Dual chamber vs. prefilled                                          */
/* ------------------------------------------------------------------ */
export function DualChamber() {
  return (
    <section id="dual-chamber" className="scroll-mt-32 bg-surface">
      <div className="wrap section">
        <div className="grid items-start gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-14">
          {/* the cartridge */}
          <figure className="lg:sticky lg:top-36" data-reveal>
            <div className="relative overflow-hidden rounded-2xl bg-white">
              <Image
                src="/pen/dual-chamber-cartridge.jpg"
                alt="Dual chamber cartridge: freeze-dried peptide in the upper chamber and sterile diluent below, separated by the stopper"
                width={848}
                height={1264}
                sizes="(max-width: 1024px) 100vw, 420px"
                className="mx-auto h-auto max-h-[520px] w-auto"
              />
              <span className="absolute left-5 top-[30%] rounded-full bg-navy px-3 py-1 text-xs font-bold text-white">Peptide powder</span>
              <span className="absolute left-5 top-[53%] rounded-full bg-accent px-3 py-1 text-xs font-bold text-white">Stopper</span>
              <span className="absolute left-5 top-[71%] rounded-full bg-white px-3 py-1 text-xs font-bold text-navy shadow">Sterile diluent</span>
            </div>
            <figcaption className="mt-3 text-center text-sm text-muted">
              The two chambers: freeze-dried peptide on top, sterile diluent below, kept apart by the stopper.
            </figcaption>
          </figure>

          <div>
            <div data-reveal>
              <p className="eyebrow">A Canadian first</p>
              <h2 className="head mt-4 text-navy">Dual chamber vs. prefilled</h2>
              <p className="mt-4 max-w-[62ch] text-muted">
                Lyfe is the first in Canada to offer the dual chamber peptide cartridge. While others ship powders and
                pre-mixed vials, we engineered a cartridge that keeps your peptide and diluent separate until the moment
                you need them.
              </p>
            </div>

            {/* comparison table */}
            <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-white" data-reveal>
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Prefilled pen compared with the Lyfe dual chamber pen</caption>
                <thead>
                  <tr className="text-[0.75rem] uppercase tracking-wider">
                    <th scope="col" className="px-4 py-4 font-bold text-muted sm:px-6">Feature</th>
                    <th scope="col" className="px-4 py-4 font-bold text-muted">Prefilled pen</th>
                    <th scope="col" className="bg-navy px-4 py-4 font-bold text-white sm:px-6">Lyfe dual chamber</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {COMPARISON.map((r) => (
                    <tr key={r.feature}>
                      <th scope="row" className="px-4 py-3.5 font-semibold text-navy sm:px-6">{r.feature}</th>
                      <td className="px-4 py-3.5 text-muted">
                        <span className="flex items-start gap-2">
                          <CloseIcon className="mt-0.5 hidden h-4 w-4 shrink-0 text-faint sm:block" />
                          {r.prefilled}
                        </span>
                      </td>
                      <td className="bg-accent/[0.06] px-4 py-3.5 font-semibold text-navy sm:px-6">
                        <span className="flex items-start gap-2">
                          <CheckIcon className="mt-0.5 hidden h-4 w-4 shrink-0 text-accent sm:block" />
                          {r.dual}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* how it works */}
            <h3 className="mt-12 text-xl font-extrabold text-navy" data-reveal>
              Activation takes under 30 seconds
            </h3>
            <ol className="mt-5 grid gap-4 sm:grid-cols-2">
              {STEPS.map((s, i) => (
                <li key={s.img} className="card flex flex-col overflow-hidden" data-reveal style={{ ["--d" as string]: `${i * 70}ms` }}>
                  <div className="flex h-36 items-center justify-center border-b border-line bg-white p-3">
                    <Image src={s.img} alt="" width={s.w} height={s.h} sizes="240px" className="h-full w-auto object-contain" />
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-bold tracking-[0.15em] text-accent-deep">STEP {i + 1}</p>
                    <p className="mt-1 font-bold text-navy">{s.title}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>

            <Link href="/dual-chamber-pen-vs-prefilled" className="mt-8 inline-flex items-center gap-2 font-bold text-navy hover:text-accent-deep" data-reveal>
              Read the full comparison <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
