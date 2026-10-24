import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "./icons";

// Lab-verified section built around a real certificate of analysis (Peptide Test Canada,
// BPC-157 lot 11-399-AA). Every figure here is read off that report or the published COA set.
const STATS = [
  { n: "99.5%", label: "Chromatographic purity, BPC-157 lot 11-399-AA" },
  { n: "PASS", label: "On every specification in the report" },
  { n: "LC-MS/MS", label: "Identity and content, independently tested" },
  { n: "10", label: "Certificates published, free to download" },
];

export default function LabSection() {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle,#d9e2ee_1px,transparent_1.2px)] [background-size:28px_28px]" aria-labelledby="lab-title">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#f7f8fa_0%,rgb(247_248_250/0.6)_50%,#f7f8fa_100%)]" aria-hidden />
      <div className="wrap section relative grid items-center gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        {/* the real report, as a stack of paper */}
        <a
          href="/coa/coa-bpc-157.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative mx-auto block w-full max-w-[440px]"
          aria-label="Open the BPC-157 certificate of analysis (PDF)"
          data-reveal
        >
          <span className="absolute inset-0 translate-x-5 translate-y-4 rotate-[4deg] overflow-hidden rounded-xl bg-white shadow-[0_20px_40px_-24px_rgb(19_41_75/0.4)]" aria-hidden>
            <Image src="/coa/coa-bpc-157-p2.jpg" alt="" fill sizes="440px" className="object-cover object-top opacity-60" />
          </span>
          <span className="relative block -rotate-[2.5deg] overflow-hidden rounded-xl bg-white shadow-[0_40px_70px_-30px_rgb(19_41_75/0.55)] ring-1 ring-black/5 transition-transform duration-500 group-hover:-rotate-1 group-hover:-translate-y-1">
            <Image
              src="/coa/coa-bpc-157-hd.jpg"
              alt="Certificate of analysis from Peptide Test Canada for BPC-157, lot 11-399-AA: chromatographic purity 99.5%, result PASS"
              width={1445}
              height={1870}
              sizes="(max-width: 1024px) 90vw, 440px"
              quality={90}
              className="h-auto w-full"
            />
          </span>
        </a>

        <div>
          <p className="text-[0.8125rem] font-bold uppercase tracking-[0.22em] text-accent-deep" data-reveal>
            Lab-verified purity
          </p>
          <h2 id="lab-title" className="mt-4 text-[clamp(2rem,1.3rem+2.4vw,3.4rem)] font-extrabold leading-[1.05] tracking-[-0.025em] text-navy" data-reveal>
            Every batch tested. <span className="font-serif text-[1.08em] font-normal italic tracking-normal text-accent-deep">Every result on paper.</span>
          </h2>
          <p className="mt-5 max-w-[56ch] text-[1.0625rem] leading-relaxed text-muted" data-reveal>
            Our batches are tested by Peptide Test Canada, an independent lab, using liquid chromatography tandem mass
            spectrometry for identity, peptide content and purity. Read the real report before you buy.
          </p>

          <dl className="mt-9 grid grid-cols-2 overflow-hidden rounded-2xl border border-line bg-white" data-reveal>
            {STATS.map((s, i) => (
              <div key={s.n} className={`p-5 sm:p-7 ${i % 2 ? "border-l border-line" : ""} ${i > 1 ? "border-t border-line" : ""}`}>
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className={`num block text-[clamp(1.6rem,1.2rem+1.2vw,2.4rem)] font-extrabold leading-none tracking-tight ${s.n === "PASS" ? "text-green" : "text-navy"}`}>{s.n}</span>
                  <span className="mt-2 block text-sm text-muted">{s.label}</span>
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3" data-reveal>
            <a href="/coa/coa-bpc-157.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-bold text-accent-deep hover:underline">
              Open the certificate
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </a>
            <Link href="/documentation#certificates" className="inline-flex items-center gap-2 font-bold text-navy hover:text-accent-deep">
              All certificates <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
