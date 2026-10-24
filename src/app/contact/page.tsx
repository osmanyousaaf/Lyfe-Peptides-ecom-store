import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import ContactAssistant from "@/components/ContactAssistant";
import { ArrowRight, ClockIcon, MailIcon, MapleIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Questions about a product, documentation or a bulk order? Email info@lyfepeptidescanada.com, Monday to Friday, 9 am to 5 pm EST.",
};

const INFO = [
  { Icon: MailIcon, label: "Email", value: "info@lyfepeptidescanada.com", href: "mailto:info@lyfepeptidescanada.com" },
  { Icon: ClockIcon, label: "Hours", value: "Monday to Friday, 9 am to 5 pm EST" },
  { Icon: MapleIcon, label: "Location", value: "Canada, shipping nationwide" },
];

const FAQ = [
  ["When will my order ship?", "Orders placed before 1 PM EST ship the same business day, in plain, discreet packaging. Orders over $300 ship free."],
  ["Can I get the certificate for my batch?", "Every order includes its certificate of analysis. Published certificates are also on the Documentation page."],
  ["Do you take bulk orders?", "Yes. Choose “Bulk order” in the form with the products and quantities you need, and we'll come back with pricing."],
  ["Can you advise on use?", "Our products are sold for research purposes only, so we can't advise on personal use. We're happy to help with specs, storage and documentation."],
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        crumb="Contact"
        eyebrow="Contact us"
        title="We'd love to"
        accent="hear from you."
        lead="Have a question about our products, need documentation, or want to place a bulk order? Tell Lyra, our assistant, and a real person on our Canadian team will reply within one business day."
      />

      <section className="wrap section grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <div>
          <ul className="grid gap-3">
            {INFO.map(({ Icon, label, value, href }) => (
              <li key={label} className="card flex items-center gap-4 p-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-xs font-bold uppercase tracking-wider text-muted">{label}</span>
                  {href ? (
                    <a href={href} className="font-semibold text-navy hover:text-accent-deep">{value}</a>
                  ) : (
                    <span className="font-semibold text-navy">{value}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <h2 className="text-lg font-extrabold text-navy">Quick answers</h2>
            <div className="mt-3 divide-y divide-line rounded-2xl border border-line bg-white">
              {FAQ.map(([q, a]) => (
                <details key={q} className="group px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-navy">
                    {q}
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface text-muted transition group-open:rotate-45" aria-hidden>
                      +
                    </span>
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{a}</p>
                </details>
              ))}
            </div>
            <Link href="/documentation" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-navy hover:text-accent-deep">
              Browse documentation and certificates <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <ContactAssistant />
      </section>
    </>
  );
}
