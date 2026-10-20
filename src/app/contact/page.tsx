import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Write to Lyfe Peptides. Email answered Monday to Friday, 9 am to 5 pm EST.",
};

export default function ContactPage() {
  return (
    <section className="wrap pb-10 pt-14 md:pt-20">
      <div className="grid gap-14 md:grid-cols-12 md:gap-x-6">
        <div className="md:col-span-5">
          <h1 className="display mb-8">Write to us</h1>
          <p className="mb-12 max-w-[38ch] text-muted">
            A question about a compound, an order or a certificate? We are a small Canadian team
            and we answer every message within a business day.
          </p>
          <dl className="flex flex-col gap-6">
            <div>
              <dt className="mb-1 text-small text-muted">Email</dt>
              <dd>
                <a href="mailto:info@lyfepeptidescanada.com" className="ulink lead">
                  info@lyfepeptidescanada.com
                </a>
              </dd>
            </div>
            <div>
              <dt className="mb-1 text-small text-muted">Hours</dt>
              <dd>Monday to Friday, 9 am to 5 pm EST</dd>
            </div>
            <div>
              <dt className="mb-1 text-small text-muted">Shipping</dt>
              <dd>Across Canada, same day before 1 PM EST</dd>
            </div>
          </dl>
        </div>

        <form
          className="flex flex-col gap-5 bg-surface p-7 md:col-span-6 md:col-start-7 md:p-10"
          action="mailto:info@lyfepeptidescanada.com"
          method="post"
          encType="text/plain"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name" name="name" />
            <Field label="Email" name="email" type="email" />
          </div>
          <Field label="Order number, if you have one" name="order" optional />
          <label className="block">
            <span className="mb-2 block text-small font-medium">Message</span>
            <textarea
              name="message"
              rows={6}
              required
              className="w-full border border-line bg-bg px-3 py-3 text-ink outline-none focus:border-ink"
            />
          </label>
          <button type="submit" className="btn btn-solid self-start">Send message</button>
        </form>
      </div>
    </section>
  );
}

function Field({ label, name, type = "text", optional }: { label: string; name: string; type?: string; optional?: boolean }) {
  return (
    <label className="block">
      <span className="mb-2 block text-small font-medium">{label}</span>
      <input
        name={name}
        type={type}
        required={!optional}
        className="h-12 w-full border border-line bg-bg px-3 text-ink outline-none focus:border-ink"
      />
    </label>
  );
}
