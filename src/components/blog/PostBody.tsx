import type { Block } from "@/lib/blog";
import PostAnim from "./PostAnim";
import MiniAnim from "./mini/Mini";

// **bold** inside body text
function Rich({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return <>{parts.map((p, i) => (i % 2 ? <strong key={i}>{p}</strong> : p))}</>;
}

const TONE = {
  note: { ring: "border-navy/15 bg-surface", dot: "bg-navy", mark: "i" },
  tip: { ring: "border-green/25 bg-[#f1f9f3]", dot: "bg-green", mark: "✓" },
  warn: { ring: "border-accent/30 bg-[#fff6f0]", dot: "bg-accent", mark: "!" },
};

export default function PostBody({ blocks }: { blocks: Block[] }) {
  // key points are numbered in reading order
  let point = 0;
  return (
    <div className="prose blog-body">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "summary":
            return (
              <p key={i} className="blog-summary !max-w-none" data-reveal>
                <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-accent">In short</span>
                <Rich text={b.text} />
              </p>
            );
          case "point": {
            point += 1;
            return (
              <section key={i} className="blog-point my-4" data-reveal style={{ ["--d" as string]: `${Math.min(point, 5) * 60}ms` }}>
                <div className="min-w-0">
                  <span className="num inline-grid h-8 w-8 place-items-center rounded-full bg-accent text-sm font-extrabold text-white">{point}</span>
                  <h2 className="!mb-1.5 mt-3 text-[1.1875rem] font-extrabold leading-snug tracking-tight text-navy sm:text-[1.3125rem]">{b.title}</h2>
                  <p className="!mb-0 text-[0.96875rem] leading-relaxed">
                    <Rich text={b.text} />
                  </p>
                </div>
                <div className="blog-point-art">
                  <MiniAnim anim={b.anim} />
                </div>
              </section>
            );
          }
          case "h2":
            return (
              <h2 key={i} id={b.id} className="mb-4 mt-12 text-[1.5rem] font-extrabold leading-tight tracking-tight text-navy sm:text-[1.75rem]">
                {b.text}
              </h2>
            );
          case "p":
            return (
              <p key={i}>
                <Rich text={b.text} />
              </p>
            );
          case "ul":
            return (
              <ul key={i}>
                {b.items.map((t, j) => (
                  <li key={j}>
                    <Rich text={t} />
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i}>
                {b.items.map((t, j) => (
                  <li key={j}>
                    <Rich text={t} />
                  </li>
                ))}
              </ol>
            );
          case "callout": {
            const t = TONE[b.tone];
            return (
              <aside key={i} className={`my-8 flex gap-4 rounded-2xl border p-5 sm:p-6 ${t.ring}`} data-reveal>
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-extrabold text-white ${t.dot}`} aria-hidden>
                  {t.mark}
                </span>
                <div>
                  <p className="!mb-1 font-bold !text-navy">{b.title}</p>
                  <p className="!mb-0 text-[0.9375rem]">
                    <Rich text={b.text} />
                  </p>
                </div>
              </aside>
            );
          }
          case "figure":
            return (
              <figure key={i} className="card my-10 overflow-hidden" data-reveal>
                <div className="blog-card-art grid place-items-center px-6 py-8 sm:px-10">
                  <PostAnim anim={b.anim} className="h-full max-h-[360px] w-full max-w-[520px]" />
                </div>
                <figcaption className="border-t border-line px-5 py-3 text-sm text-muted">{b.caption}</figcaption>
              </figure>
            );
          case "table":
            return (
              <div key={i} className="my-8 overflow-x-auto rounded-xl border border-line" data-reveal>
                <table>
                  <thead>
                    <tr>
                      {b.head.map((h, j) => (
                        <th key={j} scope="col">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((r, j) => (
                      <tr key={j}>
                        {r.map((c, k) =>
                          k === 0 ? (
                            <th key={k} scope="row" className="!bg-transparent !font-semibold !text-navy">{c}</th>
                          ) : (
                            <td key={k}>{c}</td>
                          )
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
        }
      })}
    </div>
  );
}
