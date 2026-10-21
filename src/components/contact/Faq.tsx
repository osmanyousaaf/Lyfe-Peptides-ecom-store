import { FAQ } from "./faq-data";
import { PlusIcon } from "./icons";

// One column of native disclosure widgets: each opens in place without moving its neighbours sideways,
// works without JavaScript and is keyboard accessible.
export default function Faq() {
  return (
    <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
      {FAQ.map(({ q, a }) => (
        <details key={q} className="contact-faq group">
          <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 font-bold text-navy transition-colors hover:bg-surface/60 sm:px-6 sm:py-5 [&::-webkit-details-marker]:hidden">
            <span className="flex-1">{q}</span>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface text-navy transition duration-300 group-open:rotate-45 group-open:bg-accent group-open:text-white" aria-hidden>
              <PlusIcon className="h-4 w-4" />
            </span>
          </summary>
          <div className="contact-faq-body">
            <p className="px-5 pb-5 text-[0.9375rem] leading-relaxed text-muted sm:px-6">{a}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
