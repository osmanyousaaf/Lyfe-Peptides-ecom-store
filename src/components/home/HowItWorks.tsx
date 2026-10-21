const STEPS = [
  {
    title: "Choose your compounds",
    text: "Browse by research goal or category, in vials or dual chamber pens, and check out securely with Stripe.",
  },
  {
    title: "We pull the batch and its certificate",
    text: "Your order is matched to a tested lot, and that lot's certificate of analysis goes in the box.",
  },
  {
    title: "Same-day dispatch",
    text: "Orders placed before 1 PM EST on a business day leave that afternoon, in plain packaging, to any address in Canada.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-surface">
      <div className="wrap section grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div data-reveal>
          <p className="eyebrow">How it works</p>
          <h2 className="mt-4 text-[clamp(2rem,1.4rem+2.4vw,3.25rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-navy">
            From order to dispatch, in three steps.
          </h2>
          <p className="mt-4 max-w-[40ch] text-muted">Stocked and shipped from inside Canada, so there is no border in the way.</p>
        </div>
        <ol className="relative grid gap-6">
          <span className="absolute bottom-8 left-6 top-8 hidden w-px bg-[linear-gradient(180deg,transparent,#13294b_15%,#13294b_85%,transparent)] sm:block" aria-hidden />
          {STEPS.map(({ title, text }, i) => (
            <li key={title} className="relative flex gap-5 rounded-2xl border border-line bg-white p-5 sm:p-6" data-reveal style={{ ["--d" as string]: `${i * 100}ms` }}>
              <span className="num grid h-12 w-12 shrink-0 place-items-center rounded-full bg-navy text-lg font-extrabold text-white shadow-[0_10px_20px_-10px_rgb(19_41_75/0.7)]">
                {i + 1}
              </span>
              <div>
                <h3 className="text-lg font-bold text-navy">{title}</h3>
                <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
