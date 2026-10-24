import Link from "next/link";

type Item = { title: string; text: string; href: string; cta: string };

// Why-Lyfe cards: a large outlined number in the corner, title, copy, and a drawn arrow
// that stretches forward on hover.
export default function WhyCards({ items }: { items: Item[] }) {
  return (
    <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-3">
      {items.map((item, i) => (
        <Link
          key={item.title}
          href={item.href}
          data-reveal
          style={{ ["--d" as string]: `${i * 80}ms` }}
          className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_24px_48px_-28px_rgb(242_106_18/0.55)]"
        >
          <span
            className="pointer-events-none absolute -right-1 -top-4 select-none text-[5.5rem] font-extrabold leading-none text-transparent [-webkit-text-stroke:1.5px_rgb(242_106_18/0.2)] transition-[-webkit-text-stroke-color] duration-500 group-hover:[-webkit-text-stroke:1.5px_rgb(242_106_18/0.45)]"
            aria-hidden
          >
            0{i + 1}
          </span>

          <h3 className="relative mt-10 text-lg font-extrabold leading-tight text-navy">{item.title}</h3>
          <p className="relative mt-2.5 text-[0.9375rem] leading-relaxed text-muted">{item.text}</p>

          <span className="mt-auto flex items-center gap-3 pt-6 text-sm font-bold text-navy">
            {item.cta}
            <svg viewBox="0 0 120 20" className="h-5 w-20 overflow-visible text-accent transition-transform duration-300 group-hover:translate-x-2" aria-hidden>
              <path d="M2 13 C 30 4, 70 4, 108 10" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M98 3 L 109 10 L 99 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>

          {/* orange line that sweeps along the bottom on hover */}
          <span className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-[linear-gradient(90deg,#f26a12,#ff9a4d)] transition-transform duration-500 group-hover:scale-x-100" aria-hidden />
        </Link>
      ))}
    </div>
  );
}
