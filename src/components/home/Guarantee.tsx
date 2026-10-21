import Link from "next/link";
import Studio from "@/components/Studio";
import { ArrowRight, CheckIcon } from "@/components/icons";

export default function Guarantee() {
  return (
    <section className="wrap section">
      <div className="relative grid items-center gap-10 overflow-hidden rounded-3xl bg-[radial-gradient(ellipse_at_0%_50%,#eaf2fb_0%,#f4f7fb_60%)] lg:grid-cols-[1.05fr_1fr]">
        <span className="orb left-[10%] top-[-20%] h-72 w-72 bg-[#7aa2e3]/30" aria-hidden />

        {/* two staged vials, leaning in */}
        <div className="relative mx-auto h-[340px] w-full max-w-[480px] sm:h-[420px]">
          <div className="absolute bottom-4 left-[4%] w-[52%] -rotate-[10deg]" data-reveal>
            <Studio src="/products/lyfe-nad-500mg.png" alt="NAD+ 500 mg vial" caption="NAD+ · 500 mg" className="aspect-[3/4]" />
          </div>
          <div className="absolute bottom-10 right-[4%] w-[52%] rotate-[8deg]" data-reveal style={{ ["--d" as string]: "120ms" }}>
            <Studio src="/products/tb-500-bpc-157.png" alt="TB-500 and BPC-157 blend vial" caption="TB-500 + BPC-157" className="aspect-[3/4]" />
          </div>
        </div>

        <div className="relative p-7 sm:p-10 lg:p-14 lg:pl-4">
          <p className="eyebrow" data-reveal>Our purity standard</p>
          <h2 className="mt-4 text-[clamp(2rem,1.4rem+2.4vw,3.25rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-navy" data-reveal style={{ ["--d" as string]: "60ms" }}>
            99%+ purity, verified on every batch.
          </h2>
          <p className="mt-5 max-w-[50ch] text-muted" data-reveal style={{ ["--d" as string]: "120ms" }}>
            A batch that does not meet the standard is not listed. The one that reaches you ships with its own
            certificate, so you are never asked to take our word for it.
          </p>
          <ul className="mt-6 grid gap-3 text-[0.9375rem]">
            {["Purity measured by HPLC, identity confirmed by mass spectrometry", "The certificate lists the method, the result and the date", "Keep the batch number and we can send the certificate again"].map((t, i) => (
              <li key={t} className="flex items-start gap-3" data-reveal style={{ ["--d" as string]: `${180 + i * 80}ms` }}>
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent text-white">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3" data-reveal style={{ ["--d" as string]: "440ms" }}>
            <Link href="/shop" className="btn btn-solid shine group">
              Shop verified peptides <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/blog/how-to-read-a-peptide-certificate-of-analysis" className="btn btn-line">
              Reading a COA
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
