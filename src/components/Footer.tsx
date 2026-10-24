import Image from "next/image";
import Link from "next/link";
import { ClockIcon, MailIcon, MapleIcon } from "./icons";

const SHOP = [
  ["All products", "/shop"],
  ["Recovery", "/shop?cat=Recovery"],
  ["Weight Loss", "/shop?cat=Weight%20Loss"],
  ["Anti-Aging", "/shop?cat=Anti-Aging"],
  ["Growth Factors", "/shop?cat=Growth%20Factors"],
  ["Accessories", "/shop?cat=Accessories"],
];
const COMPANY = [
  ["About us", "/about"],
  ["Documentation", "/documentation"],
  ["Blog", "/blog"],
  ["Contact", "/contact"],
  ["Cart", "/cart"],
];

// Social profiles. TODO: replace each "#" with the real profile URL; a "#" link is hidden.
const SOCIALS: { name: string; href: string; bg: string; glyph: React.ReactNode }[] = [
  {
    name: "Instagram",
    href: "#",
    bg: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285aeb 90%)",
    glyph: (
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    ),
  },
  {
    name: "Facebook",
    href: "#",
    bg: "#1877f2",
    glyph: <path d="M15.12 5.32H17V2.14A24.3 24.3 0 0 0 14.26 2c-2.72 0-4.58 1.66-4.58 4.7v2.8H6.6v3.56h3.08V22h3.68v-8.94h3.06l.46-3.56h-3.52V7.07c0-1.03.28-1.75 1.76-1.75z" />,
  },
  {
    name: "TikTok",
    href: "#",
    bg: "#010101",
    glyph: (
      <>
        <path transform="translate(-0.9 -0.6)" fill="#25f4ee" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        <path transform="translate(0.9 0.6)" fill="#fe2c55" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        <path fill="#fff" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </>
    ),
  },
  {
    name: "X",
    href: "#",
    bg: "#000000",
    glyph: <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />,
  },
  {
    name: "YouTube",
    href: "#",
    bg: "#ff0000",
    glyph: <path d="M9 7.2v9.6l8-4.8z" />,
  },
];

function Socials() {
  const live = SOCIALS.filter((s) => s.href !== "#");
  const list = live.length ? live : SOCIALS; // until real links are in, show the icons (inert)
  return (
    <ul className="mt-6 flex flex-wrap gap-2.5" aria-label="Lyfe Peptides on social media">
      {list.map((s) => {
        const inner = (
          <span
            className="grid h-10 w-10 place-items-center rounded-full text-white ring-1 ring-white/15 transition-transform duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_10px_20px_-8px_rgba(0,0,0,0.6)]"
            style={{ background: s.bg }}
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden>
              {s.glyph}
            </svg>
          </span>
        );
        return (
          <li key={s.name}>
            {s.href === "#" ? (
              <span className="group block" title={`${s.name} (link coming soon)`} aria-label={s.name}>
                {inner}
              </span>
            ) : (
              <a href={s.href} target="_blank" rel="noopener noreferrer" className="group block" aria-label={`Lyfe Peptides on ${s.name}`}>
                {inner}
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function Footer() {
  return (
    <footer className="bg-navy-2 text-white/80">
      <div className="wrap grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5 rounded-lg bg-white px-3 py-2">
            <Image src="/lyfe-logo.png" alt="" width={60} height={40} className="h-9 w-auto" />
            <span className="leading-none">
              <span className="block text-[1rem] font-extrabold text-navy">LYFE</span>
              <span className="block text-[0.55rem] font-bold tracking-[0.3em] text-muted">PEPTIDES</span>
            </span>
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-relaxed">
            Lyfe Peptides is a Canadian manufacturer and supplier of research-grade peptides, with a certificate
            of analysis on every product.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white">
            <MapleIcon className="h-5 w-5 text-[#ff5a4f]" /> Proudly Canadian
          </p>
          <Socials />
        </div>

        <nav aria-label="Shop">
          <h3 className="mb-4 font-bold text-white">Shop</h3>
          <ul className="grid gap-2.5 text-sm">
            {SHOP.map(([l, h]) => (
              <li key={h}>
                <Link href={h} className="transition hover:text-white">{l}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Company">
          <h3 className="mb-4 font-bold text-white">Company</h3>
          <ul className="grid gap-2.5 text-sm">
            {COMPANY.map(([l, h]) => (
              <li key={h}>
                <Link href={h} className="transition hover:text-white">{l}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="mb-4 font-bold text-white">Contact us</h3>
          <ul className="grid gap-3 text-sm">
            <li className="flex items-center gap-2.5">
              <MailIcon className="h-5 w-5 shrink-0 text-accent" />
              <a href="mailto:info@lyfepeptidescanada.com" className="transition hover:text-white">
                info@lyfepeptidescanada.com
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <ClockIcon className="h-5 w-5 shrink-0 text-accent" />
              Monday to Friday, 9 am to 5 pm EST
            </li>
          </ul>
          <p className="mt-5 rounded-lg bg-white/5 p-3 text-xs leading-relaxed">
            Orders placed before 1 PM EST ship the same day. Free shipping on orders over $300.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="wrap flex flex-col gap-3 py-6 text-xs text-white/60 md:flex-row md:items-center md:justify-between">
          <p className="max-w-3xl leading-relaxed">
            <strong className="text-white/85">For research purposes only. Not for human consumption.</strong> Products are
            sold as laboratory reference materials and are not approved by Health Canada for personal use.
          </p>
          <p className="shrink-0">© 2026 Lyfe Peptides</p>
        </div>
      </div>
    </footer>
  );
}
