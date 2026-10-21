import Image from "next/image";
import { isUpload } from "@/lib/img";

// Stages a vial render as a studio product shot: ice-blue backdrop, bokeh, rim light, a floor
// reflection and a contact shadow. The render's white ground is multiplied away onto the backdrop,
// so the blend must sit on the outermost positioned layer (transforms start new stacking contexts).
const BOKEH = [
  { s: 14, x: 12, y: 18, d: "0s", o: 0.9 },
  { s: 8, x: 78, y: 12, d: "-1.2s", o: 0.7 },
  { s: 22, x: 84, y: 40, d: "-2.4s", o: 0.5 },
  { s: 6, x: 22, y: 58, d: "-0.6s", o: 0.8 },
  { s: 10, x: 66, y: 72, d: "-1.8s", o: 0.6 },
  { s: 16, x: 8, y: 80, d: "-3s", o: 0.45 },
];

export default function Studio({
  src,
  alt,
  caption,
  className = "",
  priority = false,
  sizes = "(max-width: 1024px) 60vw, 340px",
}: {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const up = isUpload(src);
  return (
    <div
      className={`studio relative overflow-hidden rounded-[26px] shadow-[0_40px_80px_-30px_rgb(5_18_45/0.7),inset_0_1px_0_rgb(255_255_255/0.7)] ${className}`}
    >
      {/* light rays and bokeh */}
      <span className="pointer-events-none absolute -left-1/4 top-0 h-[140%] w-[60%] -rotate-[24deg] bg-[linear-gradient(90deg,transparent,rgb(255_255_255/0.45),transparent)] opacity-70" aria-hidden />
      {BOKEH.map((b, i) => (
        <span
          key={i}
          className="float pointer-events-none absolute rounded-full bg-[radial-gradient(circle_at_35%_35%,#ffffff,rgb(255_255_255/0.2)_70%,transparent)]"
          style={{ width: b.s, height: b.s, left: `${b.x}%`, top: `${b.y}%`, opacity: b.o, animationDelay: b.d }}
          aria-hidden
        />
      ))}
      {/* rim light behind the vial */}
      <span className="pointer-events-none absolute left-1/2 top-[38%] h-[52%] w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 blur-2xl" aria-hidden />

      {/* the vial, cropped out of its render */}
      <div className="blend absolute left-1/2 top-[7%] aspect-[2/3] h-[64%] -translate-x-1/2 overflow-hidden">
        <Image src={src} alt={alt} fill priority={priority} unoptimized={up} sizes={sizes} className="scale-[1.5] object-cover" />
      </div>
      {/* its reflection on the floor */}
      <div
        className="blend pointer-events-none absolute left-1/2 top-[71%] aspect-[2/3] h-[64%] -translate-x-1/2 -scale-y-100 overflow-hidden opacity-30 [mask-image:linear-gradient(to_top,#000_0%,transparent_45%)]"
        aria-hidden
      >
        <Image src={src} alt="" fill unoptimized={up} sizes={sizes} className="scale-[1.5] object-cover" />
      </div>
      <span className="pointer-events-none absolute left-1/2 top-[70%] h-[4%] w-[44%] -translate-x-1/2 rounded-[50%] bg-navy/25 blur-md" aria-hidden />

      {caption && (
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/70 bg-white/80 px-3 py-1.5 text-[0.75rem] font-bold text-navy shadow-sm backdrop-blur">
          {caption}
        </span>
      )}
    </div>
  );
}
