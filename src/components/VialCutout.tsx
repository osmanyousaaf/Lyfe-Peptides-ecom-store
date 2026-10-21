import Image from "next/image";

// A background-removed vial render placed on a dark stage, with a drop shadow and a floor reflection.
// Expects a transparent PNG from /public/products/cut (made by scripts/cutouts).
export default function VialCutout({
  src,
  alt,
  className = "",
  reflect = true,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  reflect?: boolean;
  priority?: boolean;
}) {
  return (
    <div className={`absolute ${className}`}>
      <div className="relative h-full w-full [filter:drop-shadow(0_26px_22px_rgb(0_0_0/0.55))]">
        <Image src={src} alt={alt} fill priority={priority} unoptimized sizes="(max-width: 1024px) 34vw, 240px" className="object-contain object-bottom" />
      </div>
      {reflect && (
        <div className="pointer-events-none absolute left-0 top-full h-[42%] w-full -scale-y-100 opacity-20 [mask-image:linear-gradient(to_bottom,#000,transparent_80%)]" aria-hidden>
          <Image src={src} alt="" fill unoptimized sizes="240px" className="object-contain object-top" />
        </div>
      )}
    </div>
  );
}
