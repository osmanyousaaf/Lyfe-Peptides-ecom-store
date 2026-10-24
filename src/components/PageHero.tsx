import Link from "next/link";

// Shared header for inner pages: breadcrumb, eyebrow, a title with an optional serif-italic
// accent, and a lead paragraph, on the same soft white ground as the landing hero.
export default function PageHero({
  crumb,
  eyebrow,
  title,
  accent,
  lead,
  children,
}: {
  crumb: string;
  eyebrow: string;
  title: string;
  accent?: string;
  lead: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="relative overflow-hidden border-b border-line bg-[linear-gradient(100deg,#ffffff_0%,#f8f9fb_50%,#eef1f5_100%)]">
      <span className="pointer-events-none absolute -right-32 -top-32 h-[30rem] w-[30rem] rounded-full bg-accent/10 blur-[90px]" aria-hidden />
      <div className="wrap relative py-12 md:py-16">
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <Link href="/" className="hover:text-navy">Home</Link> <span aria-hidden className="mx-1.5 text-faint">/</span>
          <span className="text-navy">{crumb}</span>
        </nav>
        <p className="eyebrow mt-7">{eyebrow}</p>
        <h1 className="mt-4 max-w-[22ch] text-[clamp(2.2rem,1.5rem+2.4vw,3.6rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-navy">
          {title}
          {accent && (
            <>
              {" "}
              <span className="font-serif text-[1.08em] font-normal italic tracking-normal text-accent-deep">{accent}</span>
            </>
          )}
        </h1>
        <p className="mt-5 max-w-[62ch] text-[1.0625rem] leading-relaxed text-muted">{lead}</p>
        {children}
      </div>
    </header>
  );
}
