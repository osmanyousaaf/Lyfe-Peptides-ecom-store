import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getProduct } from "@/lib/products";

export const metadata: Metadata = {
  title: "About",
  description:
    "Lyfe Peptides is a Canadian supplier of research-grade peptides, each batch verified and shipped with its certificate of analysis.",
};

const PRINCIPLES = [
  [
    "Verified, not asserted",
    "Purity and identity are measured on every lot by independent analysis. The certificate goes in the box.",
  ],
  [
    "Canadian, and quick",
    "Stocked and dispatched inside Canada, the same day before 1 PM EST, with no border in the way.",
  ],
  [
    "Only what you need",
    "Sensible pack sizes and the dual-chamber pen mean less waste and cleaner protocols.",
  ],
];

export default function AboutPage() {
  const ghk = getProduct("ghk-cu-50-mg")!;
  return (
    <>
      <section className="wrap pb-10 pt-14 md:pt-20">
        <div className="grid gap-12 md:grid-cols-12 md:gap-x-6">
          <div className="md:col-span-6">
            <h1 className="display mb-8 max-w-[12ch]">Research you can check</h1>
            <p className="lead mb-6 max-w-[34ch] text-ink">
              Canadian researchers deserve a domestic source that is verifiable, consistent and fast.
            </p>
            <p className="max-w-[52ch] text-muted">
              Every compound we list is made from USP-grade raw materials sourced from GMP
              facilities, analysed by HPLC and mass spectrometry, and shipped with a certificate
              of analysis for its batch. We keep the catalog short on purpose, so we can stand
              behind every vial in it.
            </p>
          </div>
          <div className="md:col-span-5 md:col-start-8" data-reveal>
            <div className="exhibit relative aspect-[4/5]">
              <Image src={ghk.image} alt={ghk.name} fill priority sizes="(max-width: 768px) 100vw, 520px" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="section wrap">
        <h2 className="head mb-14">What we hold to</h2>
        <div className="grid gap-12 md:grid-cols-3 md:gap-x-6">
          {PRINCIPLES.map(([t, s], i) => (
            <div key={t} data-reveal style={{ ["--d" as string]: `${i * 80}ms` }}>
              <h3 className="lead mb-3">{t}</h3>
              <p className="max-w-[36ch] text-muted">{s}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap">
        <div className="grid gap-8 bg-field p-8 text-field-ink md:grid-cols-12 md:items-end md:gap-x-6 md:p-14">
          <h2 className="head md:col-span-7">See every compound we stock</h2>
          <div className="md:col-span-4 md:col-start-9">
            <p className="mb-6 text-field-ink/80">Thirty-seven products, each verified by batch.</p>
            <Link href="/shop" className="btn btn-solid">Browse the catalog</Link>
          </div>
        </div>
      </section>
    </>
  );
}
