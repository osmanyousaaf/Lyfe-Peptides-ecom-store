import AnimatedPen from "./AnimatedPen";
import AnimatedVial from "./AnimatedVial";
import Chromatogram from "./Chromatogram";

// The blog index hero: a vial reconstituting at centre, the pen and an HPLC trace orbiting it.
export default function HeroScene() {
  return (
    <div className="relative mx-auto aspect-[1/1] w-full max-w-[520px]" aria-hidden>
      <div className="blog-orbit absolute inset-[6%] rounded-full border border-dashed border-navy/15" />
      <div className="blog-orbit blog-orbit-rev absolute inset-[18%] rounded-full border border-accent/25" />
      <div className="absolute inset-[22%] rounded-full bg-[radial-gradient(circle,rgb(242_106_33/0.16),transparent_65%)]" />

      <div className="blog-float absolute left-[8%] top-[4%] w-[36%]">
        <AnimatedVial className="w-full" />
      </div>

      <div className="blog-float blog-float-2 absolute right-0 top-[16%] w-[50%]">
        <div className="rotate-[4deg] rounded-[18px] shadow-[0_24px_50px_-28px_rgb(19_41_75/0.55)]">
          <Chromatogram className="w-full" />
        </div>
      </div>

      <div className="blog-float blog-float-3 absolute bottom-[3%] right-0 w-[82%]">
        <div className="-rotate-[8deg]">
          <AnimatedPen className="w-full" />
        </div>
      </div>

      <span className="blog-chip absolute bottom-[38%] right-[6%] rounded-full bg-white px-3 py-1.5 text-xs font-bold text-navy shadow-lg">
        COA with every lot
      </span>
      <span className="blog-chip blog-chip-2 absolute right-[10%] top-[4%] rounded-full bg-navy px-3 py-1.5 text-xs font-bold text-white shadow-lg">
        Made in Canada
      </span>
    </div>
  );
}
