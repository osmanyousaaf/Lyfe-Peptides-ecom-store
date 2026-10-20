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
  ["Contact", "/contact"],
  ["Cart", "/cart"],
];

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
