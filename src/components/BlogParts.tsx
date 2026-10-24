import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { formatDate, postHref, type Block, type Post } from "@/lib/blog";
import { ArrowRight, CheckIcon } from "./icons";

// Cover art: documents sit as a tilted page, product cut-outs stand on a soft white ground.
export function PostCover({ post, priority = false, className = "" }: { post: Post; priority?: boolean; className?: string }) {
  const { src, w, h, fit } = post.cover;
  return (
    <div className={`relative overflow-hidden bg-[linear-gradient(150deg,#ffffff_0%,#f1f4f8_55%,#e7ecf2_100%)] ${className}`}>
      <span className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-accent/15 blur-[50px]" aria-hidden />
      {fit === "doc" ? (
        <div className="absolute inset-x-[16%] -bottom-[18%] top-[14%] -rotate-[4deg] overflow-hidden rounded-lg bg-white shadow-[0_24px_40px_-20px_rgb(19_41_75/0.45)] ring-1 ring-black/5">
          <Image src={src} alt="" width={w} height={h} priority={priority} sizes="(max-width: 768px) 90vw, 480px" className="h-auto w-full" />
        </div>
      ) : (
        <div className="absolute inset-x-0 bottom-[10%] top-[12%]">
          <Image src={src} alt="" fill priority={priority} sizes="(max-width: 768px) 90vw, 480px" className="object-contain drop-shadow-[0_18px_18px_rgb(19_41_75/0.2)]" />
        </div>
      )}
    </div>
  );
}

export function PostMeta({ post, light = false }: { post: Post; light?: boolean }) {
  return (
    <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold ${light ? "text-white/70" : "text-muted"}`}>
      <span className="rounded-full bg-accent/10 px-2.5 py-1 text-accent-deep">{post.category}</span>
      <time dateTime={post.date}>{formatDate(post.date)}</time>
      <span aria-hidden>·</span>
      <span>{post.minutes} min read</span>
    </p>
  );
}

export function PostCard({ post }: { post: Post }) {
  return (
    <Link href={postHref(post)} className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-30px_rgb(19_41_75/0.45)]">
      <PostCover post={post} className="aspect-[16/10]" />
      <div className="flex flex-1 flex-col p-6">
        <PostMeta post={post} />
        <h3 className="mt-3 text-lg font-extrabold leading-snug text-navy group-hover:text-accent-deep">{post.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{post.excerpt}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-bold text-navy">
          Read article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

// **bold** inside paragraph text
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith("**") ? (
          <strong key={i} className="font-bold text-navy">{part.slice(2, -2)}</strong>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  );
}

const TONES = {
  info: { box: "border-navy/15 bg-[#eef3f9]", label: "text-navy" },
  tip: { box: "border-accent/25 bg-accent/[0.06]", label: "text-accent-deep" },
  note: { box: "border-[#e2b93b]/40 bg-[#fdf7e6]", label: "text-[#7a5b00]" },
};

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-6 text-[1.0625rem] leading-[1.8] text-[#33445e]">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "p":
            return <p key={i}><Rich text={b.text} /></p>;
          case "h2":
            return <h2 key={i} className="!mt-12 text-[1.6rem] font-extrabold leading-tight tracking-tight text-navy">{b.text}</h2>;
          case "h3":
            return <h3 key={i} className="!mt-8 text-xl font-bold text-navy">{b.text}</h3>;
          case "figure":
            return (
              <figure key={i} className="!my-9">
                <div className={b.frame === "doc" ? "overflow-hidden rounded-xl bg-white p-2 shadow-[0_24px_50px_-30px_rgb(19_41_75/0.5)] ring-1 ring-black/5" : "rounded-2xl bg-[linear-gradient(150deg,#ffffff,#eef1f5)] p-6"}>
                  <Image src={b.src} alt={b.alt} width={b.w} height={b.h} quality={90} sizes="(max-width: 768px) 92vw, 720px" className={`h-auto ${b.frame === "doc" ? "w-full" : "mx-auto max-h-[420px] w-auto"}`} />
                </div>
                {b.caption && <figcaption className="mt-3 text-center text-sm text-muted">{b.caption}</figcaption>}
              </figure>
            );
          case "callout":
            return (
              <aside key={i} className={`rounded-2xl border p-5 sm:p-6 ${TONES[b.tone].box}`}>
                <p className={`text-sm font-extrabold uppercase tracking-wider ${TONES[b.tone].label}`}>{b.title}</p>
                <p className="mt-1.5 text-base leading-relaxed text-[#33445e]">{b.text}</p>
              </aside>
            );
          case "takeaways":
            return (
              <aside key={i} className="rounded-2xl border border-line bg-white p-6 shadow-[0_18px_40px_-34px_rgb(19_41_75/0.5)]">
                <p className="text-sm font-extrabold uppercase tracking-wider text-navy">Key takeaways</p>
                <ul className="mt-3 grid gap-2.5">
                  {b.items.map((t) => (
                    <li key={t} className="flex gap-3 text-base leading-relaxed">
                      <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-accent" /> <Rich text={t} />
                    </li>
                  ))}
                </ul>
              </aside>
            );
          case "stats":
            return (
              <div key={i} className="grid gap-3 sm:grid-cols-3">
                {b.items.map((s) => (
                  <div key={s.label} className="rounded-2xl border border-line bg-white p-5 text-center">
                    <p className="num text-3xl font-extrabold tracking-tight text-accent">{s.n}</p>
                    <p className="mt-1.5 text-sm leading-snug text-muted">{s.label}</p>
                  </div>
                ))}
              </div>
            );
          case "table":
            return (
              <div key={i} className="overflow-x-auto rounded-2xl border border-line bg-white">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="bg-navy text-white">
                      {b.head.map((h) => (
                        <th key={h} scope="col" className="px-4 py-3 font-bold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {b.rows.map((r, ri) => (
                      <tr key={ri} className="even:bg-surface/60">
                        {r.map((c, ci) =>
                          ci === 0 ? (
                            <th key={ci} scope="row" className="px-4 py-3 font-semibold text-navy">{c}</th>
                          ) : (
                            <td key={ci} className="px-4 py-3 text-[#33445e]">{c}</td>
                          )
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "list": {
            const Tag = b.ordered ? "ol" : "ul";
            return (
              <Tag key={i} className="grid gap-3">
                {b.items.map((t, ti) => (
                  <li key={t} className="flex gap-3">
                    {b.ordered ? (
                      <span className="num mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-navy text-sm font-bold text-white">{ti + 1}</span>
                    ) : (
                      <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    )}
                    <span><Rich text={t} /></span>
                  </li>
                ))}
              </Tag>
            );
          }
          case "checklist":
            return (
              <ol key={i} className="grid gap-3">
                {b.items.map((c, ci) => (
                  <li key={c.title} className="flex gap-4 rounded-2xl border border-line bg-white p-5">
                    <span className="num grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent text-sm font-extrabold text-white">{ci + 1}</span>
                    <span>
                      <span className="block font-bold text-navy">{c.title}</span>
                      <span className="block text-base leading-relaxed text-muted">{c.text}</span>
                    </span>
                  </li>
                ))}
              </ol>
            );
          case "cta":
            return (
              <div key={i} className="!mt-12 flex flex-col items-start gap-4 rounded-2xl bg-navy p-7 text-white sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-extrabold">{b.title}</p>
                  <p className="mt-1 text-sm text-white/75">{b.text}</p>
                </div>
                <Link href={b.href} className="btn btn-solid shrink-0">
                  {b.label} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            );
        }
      })}
    </div>
  );
}
