import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { ArrowRight } from "@/components/icons";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Certificates of analysis from Peptide Test Canada, batch traceability, storage guidelines and how Lyfe tests every batch. For research use only.",
};

const PROVIDE = [
  ["Certificate of analysis", "LC-MS/MS identity, content and purity data for every batch."],
  ["Batch traceability", "Chain-of-custody documentation from synthesis to delivery."],
  ["Storage guidelines", "Handling and storage instructions included with every order."],
  ["Safety data sheets", "Available on request for institutional compliance."],
];

// Real certificates from Peptide Test Canada (public/coa). Thumbnails are page 1 of each PDF.
const COAS = [
  ["bpc-157", "BPC-157"],
  ["cjc-1295", "CJC-1295"],
  ["ghk-cu", "GHK-Cu"],
  ["kpv", "KPV"],
  ["retatrutide", "Retatrutide"],
  ["tesamorelin", "Tesamorelin"],
  ["tb500", "TB-500"],
  ["glow", "Glow (GHK-Cu + BPC-157 + TB-500)"],
  ["klow", "Klow (KPV + GHK-Cu + BPC-157 + TB-500)"],
  ["tb500-bpc157", "TB-500 + BPC-157"],
];

const METHODS = [
  [
    "Liquid chromatography (HPLC)",
    "Separates every component of the sample. The target peptide shows as one tall peak, and its share of the total peak area is the chromatographic purity.",
  ],
  [
    "Tandem mass spectrometry (MS/MS)",
    "Identifies the molecule by its mass and fragmentation pattern, confirming the vial holds the peptide on its label, and measures net peptide content.",
  ],
  [
    "USP-grade materials",
    "Excipients are USP-grade, low in endotoxin and low in metals, with raw materials sourced from GMP manufacturing facilities.",
  ],
];

const STORAGE = [
  ["Unopened, freeze-dried vials", "Keep refrigerated and away from light. Lyophilized peptides stay stable for 12–24 months."],
  ["After reconstitution", "Keep refrigerated and use within about 28 days. Heat, light and repeated punctures speed up degradation."],
  ["Only mix what you'll use", "Reconstitute only what your research needs within the month, and keep the rest dry."],
  ["Dual chamber pens", "Stay dry until activated, so the 28-day clock only starts when you twist the cartridge."],
];

export default function DocumentationPage() {
  return (
    <>
      <PageHero
        crumb="Documentation"
        eyebrow="Documentation"
        title="Transparency,"
        accent="on paper."
        lead="At Lyfe, transparency is at the core of everything we do. Every product ships with full documentation, including a certificate of analysis from an independent third-party laboratory."
      >
        <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-2">
          {[
            ["#certificates", "Certificates"],
            ["#testing", "How we test"],
            ["#dual-chamber", "Dual chamber pen"],
            ["#storage", "Storage"],
          ].map(([h, l]) => (
            <a key={h} href={h} className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-navy transition hover:border-navy">
              {l}
            </a>
          ))}
        </nav>
      </PageHero>

      {/* what we provide */}
      <section className="wrap section">
        <h2 className="head text-navy">What we provide</h2>
        <dl className="mt-8 grid overflow-hidden rounded-2xl border border-line bg-white sm:grid-cols-2 lg:grid-cols-4">
          {PROVIDE.map(([t, d], i) => (
            <div key={t} className={`p-6 ${i ? "border-t border-line sm:border-t-0 sm:border-l" : ""} ${i === 2 ? "sm:border-l-0 sm:border-t lg:border-l lg:border-t-0" : ""} ${i === 3 ? "sm:border-t lg:border-t-0" : ""}`}>
              <dt className="num text-xs font-bold text-accent-deep">0{i + 1}</dt>
              <dd className="mt-2">
                <span className="block font-bold text-navy">{t}</span>
                <span className="mt-1 block text-sm leading-relaxed text-muted">{d}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* certificates */}
      <section id="certificates" className="scroll-mt-32 bg-surface">
        <div className="wrap section">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="head text-navy">Certificates of analysis</h2>
              <p className="mt-3 max-w-[60ch] text-muted">
                Independent third-party lab reports from Peptide Test Canada. Open any certificate to read the full PDF.
              </p>
            </div>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
            {COAS.map(([slug, name]) => (
              <li key={slug}>
                <a href={`/coa/coa-${slug}.pdf`} target="_blank" rel="noopener noreferrer" className="group block">
                  <span className="relative block aspect-[935/1210] overflow-hidden rounded-lg bg-white shadow-[0_18px_30px_-20px_rgb(19_41_75/0.45)] ring-1 ring-black/5 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_26px_40px_-22px_rgb(19_41_75/0.55)]">
                    <Image src={`/coa/coa-${slug}.jpg`} alt={`Certificate of analysis for ${name}, first page`} fill sizes="(max-width: 640px) 45vw, 220px" className="object-cover object-top" />
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/80 to-transparent px-3 pb-2.5 pt-8 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100">
                      Open PDF &rarr;
                    </span>
                  </span>
                  <span className="mt-3 block text-sm font-bold leading-snug text-navy">{name}</span>
                  <span className="text-xs text-muted">Peptide Test Canada · PDF</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* how we test */}
      <section id="testing" className="wrap section scroll-mt-32 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <h2 className="head text-navy">How we test</h2>
          <p className="mt-4 max-w-[46ch] text-muted">
            Our independent testing partners verify the purity, identity and concentration of every batch before it is
            listed.
          </p>
        </div>
        <ol className="divide-y divide-line border-y border-line">
          {METHODS.map(([t, d], i) => (
            <li key={t} className="grid gap-2 py-6 sm:grid-cols-[3rem_1fr]">
              <span className="num font-serif text-3xl italic text-accent-deep">{i + 1}</span>
              <div>
                <h3 className="text-lg font-bold text-navy">{t}</h3>
                <p className="mt-1.5 leading-relaxed text-muted">{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* dual chamber pen */}
      <section id="dual-chamber" className="scroll-mt-32 bg-surface">
        <div className="wrap section grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative h-[420px] overflow-hidden rounded-3xl border border-line bg-[linear-gradient(160deg,#ffffff_0%,#f3f5f8_60%,#e9edf2_100%)] sm:h-[480px]">
            <span className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[70px]" aria-hidden />
            <div className="absolute inset-x-6 bottom-8 top-8">
              <Image src="/cutouts/lyfe-pen-v2.png" alt="Lyfe dual chamber pen" fill sizes="(max-width: 1024px) 90vw, 560px" quality={90} className="object-contain drop-shadow-[0_24px_24px_rgb(19_41_75/0.2)]" />
            </div>
          </div>
          <div>
            <p className="eyebrow">A Canadian first</p>
            <h2 className="head mt-4 text-navy">The dual chamber pen</h2>
            <p className="mt-4 max-w-[54ch] leading-relaxed text-muted">
              Lyfe is the first manufacturer of dual chamber pens in Canada. The peptide powder and the diluent are sealed
              in separate chambers, and nothing is mixed until you activate the pen. The powder stays stable for up to 24
              months refrigerated, and activation takes under 30 seconds.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/dual-chamber-pen-vs-prefilled" className="btn btn-solid">
                Dual chamber vs. prefilled <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/shop" className="btn btn-line">Shop products</Link>
            </div>
          </div>
        </div>
      </section>

      {/* storage */}
      <section id="storage" className="wrap section scroll-mt-32">
        <h2 className="head text-navy">Storage and handling</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {STORAGE.map(([t, d]) => (
            <div key={t} className="card p-6">
              <h3 className="font-bold text-navy">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 rounded-2xl bg-surface p-5 text-sm leading-relaxed text-muted">
          <strong className="text-navy">For research purposes only.</strong> Not for human consumption. Must be 18+ to
          purchase. These products are not approved by Health Canada for personal use.
        </p>
      </section>
    </>
  );
}
