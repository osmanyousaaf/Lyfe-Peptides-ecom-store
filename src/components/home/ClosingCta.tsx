import Link from "next/link";
import VialCutout from "@/components/VialCutout";
import { ArrowRight } from "@/components/icons";

export default function ClosingCta() {
  return (
    <section className="wrap pb-6 pt-2">
      <div className="relative grid items-center gap-8 overflow-hidden rounded-3xl bg-[#0b1a36] px-7 py-10 text-white sm:px-10 lg:grid-cols-[1fr_1.3fr] lg:px-14 lg:py-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_15%_50%,#1f4b8f_0%,transparent_60%)]" aria-hidden />
        <span className="orb right-[20%] top-[-30%] h-72 w-72 bg-accent/25" aria-hidden />

        <div className="relative mx-auto h-[280px] w-full max-w-[420px] sm:h-[320px]">
          <span className="pointer-events-none absolute bottom-[12%] left-1/2 h-6 w-[56%] -translate-x-1/2 rounded-[50%] bg-black/50 blur-lg" aria-hidden />
          <span className="pointer-events-none absolute left-1/2 top-[6%] h-[72%] w-[68%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgb(120_170_235/0.35)_0%,transparent_68%)] blur-2xl" aria-hidden />
          <VialCutout src="/products/cut/semax-10mg.png" alt="Semax 10 mg vial" className="bottom-[14%] left-[8%] h-[72%] w-[40%] -rotate-[9deg]" />
          <VialCutout src="/products/cut/lyfe-tesamorelin-10mg.png" alt="Tesamorelin 10 mg vial" className="bottom-[14%] right-[8%] h-[72%] w-[40%] rotate-[9deg]" />
        </div>

        <div className="relative">
          <h2 className="text-[clamp(1.875rem,1.3rem+2.2vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.03em]" data-reveal>
            Advance your research with confidence.
          </h2>
          <p className="mt-4 max-w-[48ch] text-white/70" data-reveal style={{ ["--d" as string]: "80ms" }}>
            Tested batches, a certificate in every box, and same-day dispatch from inside Canada.
          </p>
          <div className="mt-7 flex flex-wrap gap-3" data-reveal style={{ ["--d" as string]: "160ms" }}>
            <Link href="/shop" className="btn btn-solid shine group">
              Shop research peptides <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/contact" className="btn border-white/25 bg-white/[0.06] text-white hover:bg-white/10">
              Get in touch
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
