import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Reconstitution from "@/components/Reconstitution";
import { CheckIcon, FlaskIcon, PenIcon, ShieldIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "How Lyfe Peptides verifies purity and identity, how the dual chamber pen works, and a reconstitution calculator.",
};

const METHODS = [
  {
    Icon: FlaskIcon,
    title: "HPLC purity testing",
    text: "High-performance liquid chromatography separates every component of the sample. The peptide shows as one tall peak, and its share of the total is the purity.",
  },
  {
    Icon: ShieldIcon,
    title: "Mass spectrometry",
    text: "The molecule is weighed by its mass-to-charge ratio. A match with the expected mass confirms the vial holds the peptide on its label.",
  },
  {
    Icon: CheckIcon,
    title: "USP-grade materials",
    text: "Excipients are USP-grade, low in endotoxin and low in metals, made from raw materials sourced from GMP facilities.",
  },
];

const STEPS = [
  "Let the vial reach room temperature.",
  "Add bacteriostatic water slowly down the inside wall of the vial, never straight onto the powder.",
  "Swirl gently until the solution is clear. Do not shake.",
  "Store refrigerated and use within the window documented for the compound.",
];

export default function DocumentationPage() {
  return (
    <>
      <div className="border-b border-line bg-surface">
        <div className="wrap py-10 md:py-14">
          <p className="eyebrow">Documentation</p>
          <h1 className="display mt-4 max-w-[20ch] text-navy">How we test, and how to use what you buy</h1>
          <p className="mt-4 max-w-[60ch] text-muted">
            Every lot is analysed before it is listed, and its certificate of analysis ships with your order.
          </p>
        </div>
      </div>

      <section className="wrap section">
        <h2 className="head title-bar text-navy">Our testing</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {METHODS.map(({ Icon, title, text }) => (
            <div key={title} className="card p-6" data-reveal>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent/10 text-accent">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-navy">{title}</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="dual-chamber" className="scroll-mt-36 bg-surface">
        <div className="wrap section grid items-center gap-10 lg:grid-cols-2">
          <div className="relative h-[320px] overflow-hidden rounded-2xl bg-white sm:h-[420px]">
            <Image
              src="/products/lyfe-pen-v2.png"
              alt="Lyfe dual chamber pen"
              fill
              sizes="(max-width: 1024px) 100vw, 620px"
              className="blend scale-[1.3] object-cover"
            />
          </div>
          <div>
            <p className="eyebrow">A Canadian first</p>
            <h2 className="head mt-4 text-navy">The dual chamber pen</h2>
            <p className="mt-4 max-w-[54ch] text-muted">
              Lyfe is the first manufacturer of dual chamber pens in Canada. The peptide powder and the
              bacteriostatic water are sealed in separate chambers. Nothing is mixed until you activate the pen, so
              there is no separate reconstitution and no partly used vial left over.
            </p>
            <ul className="mt-6 grid gap-3">
              {[
                "Two factory-sealed chambers: powder and bacteriostatic water",
                "Activate with a twist when you are ready to start",
                "Sized for a 28-day research cycle, so you only buy what you need",
                "Offered as a package option on 13 compounds",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent text-white">
                    <PenIcon className="h-3.5 w-3.5" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <Link href="/shop" className="btn btn-solid mt-8">
              Shop products with a pen option
            </Link>
          </div>
        </div>
      </section>

      <section className="wrap section">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="head title-bar text-navy">Reconstituting a vial</h2>
            <p className="mt-4 max-w-[46ch] text-muted">Four steps for lyophilized powder supplied in a vial.</p>
          </div>
          <ol className="grid gap-3">
            {STEPS.map((s, i) => (
              <li key={s} className="card flex items-start gap-4 p-5">
                <span className="num grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy text-sm font-bold text-white">
                  {i + 1}
                </span>
                <span className="pt-1">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="bg-surface">
        <Reconstitution />
      </div>

      <p className="wrap py-10 text-sm text-muted">
        <strong className="text-ink">For research use only.</strong> This page is general handling information for
        laboratory reference materials. Products are not for human or animal consumption and are not approved by
        Health Canada for personal use.
      </p>
    </>
  );
}
