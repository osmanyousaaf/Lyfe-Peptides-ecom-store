import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ADVANTAGES, COMPARISON, STEPS } from "@/lib/pen";
import { ArrowRight, CheckIcon, CloseIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Dual Chamber Cartridge Pen vs. Prefilled",
  description:
    "Why the dual chamber cartridge pen beats prefilled pens: stability until activation, 12–24 month shelf life, lower cold chain risk and visual confirmation. For research use only.",
};

const PROBLEMS = [
  {
    title: "Reduced stability",
    text: "Most peptides begin degrading the moment they're dissolved. Even refrigerated, reconstituted peptides often last just 2–4 weeks before meaningful potency loss. A prefilled pen that has sat in a warehouse or shipping container for weeks may already have lost a significant share of its active compound.",
  },
  {
    title: "Cold chain dependency",
    text: "Prefilled pens must stay refrigerated from manufacture to use. Any break in the cold chain, a warm delivery truck, a customs delay, a few hours on a loading dock, speeds up degradation, and you have no way of knowing whether it happened.",
  },
  {
    title: "No visual verification",
    text: "The solution is sealed inside an opaque or semi-opaque cartridge, so you can't check it for particles, cloudiness or discolouration, all signs of possible degradation or contamination.",
  },
];

export default function DualChamberArticle() {
  return (
    <article>
      {/* header */}
      <header className="relative overflow-hidden bg-[linear-gradient(100deg,#fcfbf9_0%,#f8f3ec_50%,#f1e7da_100%)]">
        <div className="wrap grid items-center gap-10 py-14 lg:grid-cols-[1.2fr_0.8fr] lg:py-20">
          <div>
            <nav aria-label="Breadcrumb" className="text-sm text-muted">
              <Link href="/" className="hover:text-navy">Home</Link> <span aria-hidden>/</span>{" "}
              <span className="text-navy">Dual chamber pen</span>
            </nav>
            <p className="eyebrow mt-6">Product knowledge</p>
            <h1 className="display mt-4 max-w-[18ch] text-navy">
              Dual chamber cartridge pen vs. prefilled: <span className="grad-text">why dual chamber wins</span>
            </h1>
            <p className="mt-5 max-w-[58ch] text-[1.0625rem] leading-relaxed text-muted">
              Peptide delivery has come a long way from manual reconstitution with vials and syringes. Today there are two
              pen-style options: prefilled pens and dual chamber cartridge pens. Prefilled pens were the standard for years;
              the dual chamber design is a real step forward in stability, potency and practicality.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="btn btn-solid">
                Shop the pen <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#comparison" className="btn btn-line">Jump to the comparison</a>
            </div>
          </div>
          <div className="relative mx-auto h-[360px] w-full max-w-[360px] lg:h-[460px]">
            <span className="absolute inset-[15%] rounded-full bg-accent/20 blur-[60px]" aria-hidden />
            <Image src="/cutouts/lyfe-pen-v2.png" alt="Lyfe dual chamber pen" fill priority sizes="360px" className="object-contain drop-shadow-[0_30px_30px_rgb(74_58_38/0.25)]" />
          </div>
        </div>
      </header>

      <div className="wrap section grid gap-12 lg:grid-cols-[1fr_320px] lg:gap-16">
        <div className="min-w-0 space-y-16">
          {/* what is it */}
          <section className="grid items-center gap-8 md:grid-cols-[1fr_220px]">
            <div>
              <h2 className="head text-navy">What is a dual chamber cartridge pen?</h2>
              <p className="mt-4 leading-relaxed text-muted">
                A dual chamber pen holds two separate compartments in a single cartridge: one with the lyophilized
                (freeze-dried) peptide powder, the other with the sterile diluent, typically bacteriostatic water or saline.
                A stopper keeps them apart and only breaks the seal when you activate the pen for first use.
              </p>
              <p className="mt-4 leading-relaxed text-muted">
                So the peptide stays in its most stable, dry form right up until the moment it&rsquo;s needed.
              </p>
            </div>
            <figure className="rounded-2xl border border-line bg-white p-3">
              <Image
                src="/pen/dual-chamber-cartridge.jpg"
                alt="Dual chamber cartridge: freeze-dried peptide in the upper chamber and sterile diluent below, separated by the stopper"
                width={848}
                height={1264}
                sizes="220px"
                className="mx-auto h-auto max-h-[320px] w-auto"
              />
              <figcaption className="mt-2 text-center text-xs text-muted">Powder on top, diluent below, separated by the stopper.</figcaption>
            </figure>
          </section>

          {/* the problem */}
          <section>
            <h2 className="head text-navy">The problem with prefilled pens</h2>
            <p className="mt-4 leading-relaxed text-muted">
              Prefilled pens arrive already reconstituted: the supplier pre-mixes powder and liquid, so it&rsquo;s hard to
              tell when it was mixed or how it was stored. That convenience costs you control over freshness, stability over
              time, and safety margin if it wasn&rsquo;t stored or shipped properly.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {PROBLEMS.map((p, i) => (
                <div key={p.title} className="card p-6">
                  <p className="num text-sm font-extrabold text-accent-deep">0{i + 1}</p>
                  <h3 className="mt-2 font-bold text-navy">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{p.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* why dual chamber wins */}
          <section>
            <h2 className="head text-navy">Why dual chamber wins</h2>
            <div className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {ADVANTAGES.map((a) => (
                <div key={a.title} className="flex gap-4">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent text-white">
                    <CheckIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-bold text-navy">{a.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{a.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* convenience */}
          <section className="rounded-2xl bg-navy p-7 text-white sm:p-10">
            <h2 className="text-2xl font-extrabold">The convenience factor</h2>
            <p className="mt-3 max-w-[62ch] leading-relaxed text-white/75">
              Some argue prefilled pens are more convenient because there&rsquo;s no mixing step. On a modern dual chamber pen,
              mixing takes under 30 seconds: twist to break the internal seal, gently roll the pen, and you&rsquo;re ready.
              That half-minute buys you:
            </p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {["Full potency, freshly mixed", "Months of extra shelf life", "Less risk from shipping and storage", "Visual check of product quality"].map((t) => (
                <li key={t} className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 text-sm font-semibold">
                  <CheckIcon className="h-4 w-4 shrink-0 text-accent" /> {t}
                </li>
              ))}
            </ul>
          </section>

          {/* comparison */}
          <section id="comparison" className="scroll-mt-32">
            <h2 className="head text-navy">Head-to-head comparison</h2>
            <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-white">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-[0.75rem] uppercase tracking-wider">
                    <th scope="col" className="px-4 py-4 font-bold text-muted sm:px-6">Feature</th>
                    <th scope="col" className="px-4 py-4 font-bold text-muted">Prefilled pen</th>
                    <th scope="col" className="bg-navy px-4 py-4 font-bold text-white sm:px-6">Dual chamber pen</th>
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
          </section>

          {/* activation steps */}
          <section>
            <h2 className="head text-navy">Activating the pen</h2>
            <ol className="mt-6 grid gap-4 sm:grid-cols-2">
              {STEPS.map((s, i) => (
                <li key={s.img} className="card flex flex-col overflow-hidden">
                  <div className="flex h-40 items-center justify-center border-b border-line bg-white p-3">
                    <Image src={s.img} alt="" width={s.w} height={s.h} sizes="260px" className="h-full w-auto object-contain" />
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-bold tracking-[0.15em] text-accent-deep">STEP {i + 1}</p>
                    <p className="mt-1 font-bold text-navy">{s.title}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* bottom line */}
          <section className="border-t border-line pt-10">
            <h2 className="head text-navy">The bottom line</h2>
            <p className="mt-4 leading-relaxed text-muted">
              The dual chamber cartridge pen isn&rsquo;t a marginal improvement, it&rsquo;s a better delivery system. Keeping the
              peptide in its most stable form until the moment of use solves the biggest problems with prefilled pens:
              degradation, cold chain vulnerability and unknown potency. For serious peptide research, a 30-second mixing
              step is a small price for a product that works as intended.
            </p>
            <p className="mt-4 leading-relaxed text-muted">
              At Lyfe, our pen uses dual chamber cartridge technology for maximum potency and precision.
            </p>
          </section>
        </div>

        {/* sidebar */}
        <aside className="lg:sticky lg:top-36 lg:self-start">
          <div className="card overflow-hidden">
            <div className="relative h-56 bg-[linear-gradient(160deg,#f8f3ec,#efe5d8)]">
              <Image src="/cutouts/lyfe-pen-v2.png" alt="" fill sizes="320px" className="object-contain p-6" />
            </div>
            <div className="p-6">
              <p className="font-bold text-navy">The Lyfe dual chamber pen</p>
              <p className="mt-1 text-sm text-muted">Available on 13 compounds. Sized for a 28-day research cycle.</p>
              <Link href="/shop" className="btn btn-solid mt-5 w-full">
                Shop the pen <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <p className="mt-4 rounded-xl bg-surface p-4 text-xs leading-relaxed text-muted">
            For research purposes only. Not for human consumption. These products are not approved by Health Canada for
            personal use.
          </p>
        </aside>
      </div>
    </article>
  );
}
