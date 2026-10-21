import Image from "next/image";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { ClockIcon, FacebookIcon, InstagramIcon, MailIcon, MapleIcon, TikTokIcon, YouTubeIcon } from "./icons";

const SOCIAL_ICON = { Instagram: InstagramIcon, Facebook: FacebookIcon, TikTok: TikTokIcon, YouTube: YouTubeIcon };
const SOCIAL_HOVER = {
  Instagram: "hover:bg-[linear-gradient(45deg,#f9a03f,#e1306c,#833ab4)]",
  Facebook: "hover:bg-[#1877f2]",
  TikTok: "hover:bg-black hover:shadow-[-3px_-3px_0_#25f4ee,3px_3px_0_#fe2c55]",
  YouTube: "hover:bg-[#ff0000]",
};

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

export default function Footer() {
  const site = getSettings();
  return (
    <footer className="relative overflow-hidden bg-navy-2 text-white/80">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--accent),transparent)]" aria-hidden />
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
          <ul className="mt-6 flex gap-2.5" aria-label="Follow Lyfe Peptides">
            {site.social.filter((s) => s.href).map(({ name, href }) => {
              const Icon = SOCIAL_ICON[name];
              return (
                <li key={name}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Lyfe Peptides on ${name}`}
                    className={`grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition duration-300 hover:-translate-y-1 hover:scale-105 ${SOCIAL_HOVER[name]}`}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                </li>
              );
            })}
          </ul>
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
              <a href={`mailto:${site.email}`} className="transition hover:text-white">
                {site.email}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <ClockIcon className="h-5 w-5 shrink-0 text-accent" />
              {site.hours}
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
