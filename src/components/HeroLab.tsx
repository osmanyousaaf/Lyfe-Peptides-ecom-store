import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BoltIcon, FlaskIcon, ShieldIcon, TruckIcon } from "./icons";

const FEATURES = [
  { Icon: ShieldIcon, title: "COA included", sub: "With every order" },
  { Icon: FlaskIcon, title: "99%+ purity", sub: "Third-party verified" },
  { Icon: TruckIcon, title: "Free shipping", sub: "On orders over $300" },
  { Icon: BoltIcon, title: "Same-day dispatch", sub: "Before 1 PM EST" },
];


// Transparent cut-outs (public/cutouts). scale = height relative to the tallest vial.
const VIALS = [
  { src: "/cutouts/lyfe-nad-500mg.png", alt: "NAD+ 500 mg vial", w: 329, h: 668, scale: 0.75 },
  { src: "/cutouts/bpc-157-10mg.png", alt: "BPC-157 10 mg vial", w: 320, h: 722, scale: 1 },
  { src: "/cutouts/tb-500-10mg.png", alt: "TB-500 10 mg vial", w: 346, h: 711, scale: 0.87 },
  { src: "/cutouts/lyfe-ghk-cu-100mg.png", alt: "GHK-Cu 100 mg vial", w: 345, h: 657, scale: 0.79 },
  { src: "/cutouts/lyfe-tesamorelin-10mg.png", alt: "Tesamorelin 10 mg vial", w: 331, h: 620, scale: 0.64 },
];

export default function HeroLab() {
  return (
    <section className="relative overflow-hidden bg-[#f4f8fc]">
      {/* lab scene: molecule, flask and a glossy bench; faded to white behind the copy */}
      <Image
        src="/hero/lab-bg.jpg"
        alt=""
        fill
        priority
        quality={90}
        sizes="100vw"
        className="pointer-events-none object-cover object-[70%_center] opacity-40 saturate-[0.45] blur-[1.5px]"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgb(255_255_255/0.97)_0%,rgb(255_255_255/0.9)_30%,rgb(255_255_255/0.35)_52%,rgb(255_255_255/0)_68%)] max-lg:bg-[linear-gradient(180deg,rgb(255_255_255/0.95)_0%,rgb(255_255_255/0.85)_55%,rgb(255_255_255/0.2)_100%)]"
        aria-hidden
      />

      <div className="wrap relative grid items-center gap-10 py-12 lg:grid-cols-[1.08fr_1fr] lg:gap-4 lg:pb-16 lg:pt-24">
        {/* copy */}
        <div className="relative z-10">
          <p className="eyebrow rise">Canada&rsquo;s research peptide specialists</p>
          <h1 className="rise mt-5 text-[clamp(2.2rem,1.4rem+2.6vw,3.5rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-navy" style={{ animationDelay: "60ms" }}>
            Your Canadian Source
            <br />
            for <span className="grad-text">Research Peptides</span>
          </h1>
          <p className="rise mt-6 max-w-[50ch] text-[1.0625rem] leading-relaxed text-muted" style={{ animationDelay: "120ms" }}>
            Lyfe is a Canadian manufacturer and supplier of research-grade peptides. Trusted quality, verified purity
            and fast delivery, so you can focus on your research.
          </p>
          <div className="rise mt-8 flex flex-wrap gap-4" style={{ animationDelay: "180ms" }}>
            <Link href="/shop" className="btn btn-solid h-[52px] rounded-[10px] px-7">
              Shop Products <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/about" className="btn h-[52px] rounded-[10px] border-navy/70 bg-transparent px-8 text-navy hover:bg-navy hover:text-white">
              Learn More
            </Link>
          </div>

          <ul className="rise mt-10 grid grid-cols-2 gap-x-4 gap-y-5 lg:flex lg:w-[calc(100%+3rem)] lg:gap-0" style={{ animationDelay: "240ms" }}>
            {FEATURES.map(({ Icon, title, sub }, i) => (
              <li key={title} className={`group flex items-center gap-2.5 ${i > 0 ? "lg:ml-4 lg:border-l lg:border-line lg:pl-4" : ""}`}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-white text-navy shadow-[0_6px_16px_-10px_rgb(19_41_75/0.4)] transition-colors duration-300 group-hover:border-accent group-hover:text-accent">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="leading-tight">
                  <span className="block whitespace-nowrap text-[0.78rem] font-bold text-navy">{title}</span>
                  <span className="mt-1 block whitespace-nowrap text-[0.6875rem] text-muted">{sub}</span>
                </span>
              </li>
            ))}
          </ul>

        </div>

        {/* vials standing on the glossy lab bench, with soft reflections */}
        <div className="relative h-[290px] sm:h-[440px] lg:h-[500px]">
          <span className="pointer-events-none absolute bottom-[8%] left-[8%] right-[-6%] h-[70%] rounded-full bg-white/70 blur-[60px]" aria-hidden />
          <div className="absolute bottom-[14%] left-0 right-0 z-[2] flex items-end justify-center gap-2 [perspective:1400px] sm:gap-3 lg:-right-20 lg:justify-end lg:pl-14 xl:-right-28">
            {VIALS.map((v, i) => (
              <div key={v.src} className="relative" style={{ height: `calc(var(--vh) * ${v.scale})`, ["--vh" as string]: "clamp(150px, 21vw, 320px)", transform: `rotateY(${[11, 5, 0, -5, -11][i]}deg)` }}>
                {/* contact shadow */}
                <span className="pointer-events-none absolute -bottom-1.5 left-[4%] h-3.5 w-[92%] rounded-[50%] bg-[#13294b]/40 blur-[5px]" aria-hidden />
                <Image
                  src={v.src}
                  alt={v.alt}
                  width={v.w}
                  height={v.h}
                  priority={i < 3}
                  sizes="(max-width: 1024px) 30vw, 260px"
                  quality={95}
                  className="relative h-full w-auto drop-shadow-[10px_20px_22px_rgb(19_41_75/0.28)]"
                />
                {/* mirror reflection on the bench */}
                <div className="pointer-events-none absolute left-0 top-full h-[34%] w-full overflow-hidden opacity-[0.22] blur-[1px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" aria-hidden>
                  <Image src={v.src} alt="" width={v.w} height={v.h} sizes="(max-width: 1024px) 30vw, 260px" quality={75} className="w-full -scale-y-100" style={{ height: `calc(var(--vh) * ${v.scale})` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
