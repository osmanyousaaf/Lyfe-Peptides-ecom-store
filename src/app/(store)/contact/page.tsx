import type { Metadata } from "next";
import "./contact.css";
import ContactForm from "@/components/contact/ContactForm";
import Faq from "@/components/contact/Faq";
import { FAQ } from "@/components/contact/faq-data";
import { ClockIcon, MailIcon, SOCIAL_ICONS } from "@/components/contact/icons";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Contact",
  description: "Write to Lyfe Peptides. Every message answered within one business day, Monday to Friday, 9 am to 5 pm EST.",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export default function ContactPage() {
  const site = getSettings();
  const social = site.social.filter((s) => s.href);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <section className="bg-surface">
        <div className="wrap pb-14 pt-12 md:pb-20 md:pt-16">
          <div className="rise max-w-2xl">
            <p className="eyebrow">Contact</p>
            <h1 className="display mt-4 text-navy">
              Talk to a <span className="grad-text">real person</span>
            </h1>
            <p className="mt-4 max-w-[52ch] text-[1.0625rem] text-muted">
              A question about a compound, an order or a certificate? Send a note and our Canadian team will get back to you.
            </p>
          </div>

          <div className="mt-10 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="rise rounded-3xl border border-line bg-white shadow-[0_30px_60px_-40px_rgb(19_41_75/0.45)]" style={{ animationDelay: "80ms" }}>
              <ContactForm email={site.email} />
            </div>

            <aside className="rise grid gap-4" style={{ animationDelay: "160ms" }} aria-label="Contact details">
              <div className="rounded-3xl bg-navy p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">Email</p>
                <a href={`mailto:${site.email}`} className="mt-2 flex items-center gap-2.5 break-all font-bold transition hover:text-accent">
                  <MailIcon className="h-5 w-5 shrink-0 text-accent" />
                  {site.email}
                </a>
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-white/60">Hours</p>
                <p className="mt-2 flex items-start gap-2.5 text-white/90">
                  <ClockIcon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  {site.hours}
                </p>
                <p className="mt-6 rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/80">
                  We reply within <strong className="text-white">one business day</strong>. Orders placed before {site.cutoff} ship the same day.
                </p>
              </div>

              {social.length > 0 && (
                <div className="rounded-3xl border border-line bg-white p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-faint">Follow us</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {social.map(({ name, href }) => {
                      const Icon = SOCIAL_ICONS[name];
                      return (
                        <li key={name}>
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${site.name} on ${name}`}
                            className="grid h-11 w-11 place-items-center rounded-full border border-line text-navy transition hover:-translate-y-0.5 hover:border-navy hover:bg-navy hover:text-white"
                          >
                            <Icon className="h-5 w-5" />
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      <section className="wrap section">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center" data-reveal>
            <h2 className="head text-navy">Quick answers</h2>
            <p className="mt-3 text-muted">The questions we get most often.</p>
          </div>
          <Faq />
        </div>
      </section>
    </>
  );
}
