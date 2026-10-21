import Link from "next/link";
import { ArrowRight, BoxIcon, DocIcon, FlaskIcon, ShieldIcon, SparkIcon, VialIcon } from "@/components/icons";

// Only what the store actually claims: HPLC, mass spec, USP-grade low-endotoxin low-metal
// excipients, GMP-sourced raw materials, and a COA with every batch.
const CHECKS = [
  { Icon: FlaskIcon, title: "Purity", text: "HPLC separates every component of the sample and measures the peptide's share of the total." },
  { Icon: SparkIcon, title: "Identity", text: "Mass spectrometry weighs the molecule and confirms it matches the compound on the label." },
  { Icon: ShieldIcon, title: "Endotoxin", text: "Every excipient is low-endotoxin, USP-grade material." },
  { Icon: VialIcon, title: "Heavy metals", text: "Low-metal excipients keep contaminants out of the vial." },
  { Icon: BoxIcon, title: "Raw materials", text: "Starting materials come from GMP manufacturing facilities." },
  { Icon: DocIcon, title: "Documentation", text: "Method, result and date go into a certificate of analysis that ships with the batch." },
];

export default function Tested() {
  return (
    <section id="lab-verified" className="relative scroll-mt-32 overflow-hidden bg-[#0b1a36] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_20%_0%,#1b3f7a_0%,transparent_60%)]" aria-hidden />
      <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_80%_80%,#000,transparent_70%)]" aria-hidden />
      <span className="orb right-[-6%] top-[10%] h-96 w-96 bg-accent/20" aria-hidden />

      <div className="wrap section relative">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          <div data-reveal>
            <p className="eyebrow text-white">Our testing standard</p>
            <h2 className="mt-4 text-[clamp(2rem,1.4rem+2.4vw,3.25rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
              Six checks before a batch is listed.
            </h2>
          </div>
          <div className="lg:pb-2" data-reveal style={{ ["--d" as string]: "100ms" }}>
            <p className="max-w-[54ch] text-white/70">
              Nothing ships on trust alone. Each lot is analysed before it goes on sale, and the results travel
              with it, so you can check the batch in your hands against the certificate in the box.
            </p>
            <Link href="/documentation" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-accent hover:text-white">
              Read the full testing documentation <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CHECKS.map(({ Icon, title, text }, i) => (
            <li
              key={title}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition duration-300 hover:-translate-y-1 hover:border-accent/40 hover:bg-white/[0.07]"
              data-reveal
              style={{ ["--d" as string]: `${i * 70}ms` }}
            >
              <span className="num absolute right-5 top-5 text-xs font-bold tracking-widest text-white/30">0{i + 1}</span>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent/15 text-accent transition group-hover:bg-accent group-hover:text-white">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-white/65">{text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-5 sm:flex-row sm:items-center sm:justify-between" data-reveal>
          <p className="text-sm text-white/70">
            <span className="font-bold text-white">Documented batch testing.</span> A batch-specific certificate of analysis ships with every order.
          </p>
          <Link href="/blog/how-to-read-a-peptide-certificate-of-analysis" className="btn btn-solid btn-sm shrink-0">
            How to read a COA
          </Link>
        </div>
      </div>
    </section>
  );
}
