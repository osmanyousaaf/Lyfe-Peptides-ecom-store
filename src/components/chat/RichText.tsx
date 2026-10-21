"use client";

import Image from "next/image";
import { isUpload } from "@/lib/img";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import type { ChatProduct } from "@/lib/chat";

const LINE_TOKEN = /^\s*\[\[product:([a-z0-9-]+)\]\]\s*$/;
const ANY_TOKEN = /\[\[product:([a-z0-9-]+)\]\]/g;

// Only site paths, mail links and the store's own domain become links.
function safeHref(href: string): string | null {
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  if (href.startsWith("mailto:")) return href;
  if (/^https:\/\/(www\.)?lyfepeptidescanada\.com(\/|$)/.test(href)) return href;
  return null;
}

// **bold**, [text](href) and bare email addresses.
function inline(text: string, key: string, onNavigate: () => void): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(re)) {
    if (m.index! > last) out.push(text.slice(last, m.index));
    const k = `${key}-${i++}`;
    if (m[1]) out.push(<strong key={k} className="font-bold text-navy">{m[1]}</strong>);
    else if (m[2]) {
      const href = safeHref(m[3]);
      if (!href) out.push(m[2]);
      else if (href.startsWith("/"))
        out.push(
          <Link key={k} href={href} onClick={onNavigate}>
            {m[2]}
          </Link>
        );
      else out.push(<a key={k} href={href}>{m[2]}</a>);
    } else if (m[4]) out.push(<a key={k} href={`mailto:${m[4]}`}>{m[4]}</a>);
    last = m.index! + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

type Block =
  | { kind: "p"; lines: string[] }
  | { kind: "ul"; items: string[] }
  | { kind: "cards"; slugs: string[] };

function toBlocks(content: string): Block[] {
  const blocks: Block[] = [];
  const push = (b: Block) => {
    const prev = blocks[blocks.length - 1];
    if (prev && prev.kind === b.kind && b.kind !== "p") {
      if (prev.kind === "ul" && b.kind === "ul") prev.items.push(...b.items);
      if (prev.kind === "cards" && b.kind === "cards") prev.slugs.push(...b.slugs);
    } else blocks.push(b);
  };
  let para: string[] = [];
  const flush = () => {
    if (para.length) blocks.push({ kind: "p", lines: para });
    para = [];
  };
  for (const raw of content.split("\n")) {
    const line = raw.trimEnd();
    const tok = line.match(LINE_TOKEN);
    if (tok) {
      flush();
      push({ kind: "cards", slugs: [tok[1]] });
    } else if (/^\s*[-•*]\s+/.test(line)) {
      flush();
      push({ kind: "ul", items: [line.replace(/^\s*[-•*]\s+/, "")] });
    } else if (!line.trim()) {
      flush();
    } else {
      // a token mid-sentence: keep the words, show the card after the paragraph
      const inlineSlugs = [...line.matchAll(ANY_TOKEN)].map((m) => m[1]);
      const text = line.replace(ANY_TOKEN, "").replace(/\s{2,}/g, " ");
      if (text.trim()) para.push(text);
      if (inlineSlugs.length) {
        flush();
        push({ kind: "cards", slugs: inlineSlugs });
      }
    }
  }
  flush();
  return blocks;
}

export default function RichText({
  content,
  products,
  streaming,
  onNavigate,
}: {
  content: string;
  products: Record<string, ChatProduct>;
  streaming: boolean;
  onNavigate: () => void;
}) {
  // hide a half-streamed token until it completes
  const text = streaming ? content.replace(/\[\[[^\]]*\]?$/, "") : content;
  const blocks = toBlocks(text);

  return (
    <div className="grid gap-2.5">
      {blocks.map((b, bi) => {
        if (b.kind === "p")
          return (
            <p key={bi}>
              {b.lines.map((l, li) => (
                <span key={li}>
                  {li > 0 && <br />}
                  {inline(l, `${bi}-${li}`, onNavigate)}
                </span>
              ))}
            </p>
          );
        if (b.kind === "ul")
          return (
            <ul key={bi} className="grid gap-1.5">
              {b.items.map((it, ii) => (
                <li key={ii} className="flex gap-2">
                  <span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                  <span>{inline(it, `${bi}-${ii}`, onNavigate)}</span>
                </li>
              ))}
            </ul>
          );
        const known = [...new Set(b.slugs)].filter((s) => products[s]);
        if (!known.length) return null;
        return (
          <div key={bi} className="grid gap-2">
            {known.map((s) => (
              <ProductMini key={s} product={products[s]} onNavigate={onNavigate} />
            ))}
          </div>
        );
      })}
      {streaming && (
        <span className="chat-caret" aria-hidden />
      )}
    </div>
  );
}

function ProductMini({ product, onNavigate }: { product: ChatProduct; onNavigate: () => void }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const href = `/product/${product.slug}`;
  const quick = !product.variable && product.inStock;

  return (
    <div className="chat-card chat-msg flex items-center gap-3 rounded-2xl border border-line bg-white p-2 pr-2.5">
      <Link href={href} onClick={onNavigate} className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white">
        <Image src={product.image} alt="" fill sizes="56px" unoptimized={isUpload(product.image)} className="scale-[1.35] object-cover" />
      </Link>
      <div className="min-w-0 flex-1 leading-tight">
        <Link href={href} onClick={onNavigate} className="block truncate text-[0.8125rem] font-bold text-navy hover:text-accent-deep">
          {product.name}
        </Link>
        <span className="num mt-1 block text-[0.75rem] text-muted">
          {!product.inStock ? (
            "Sold out"
          ) : (
            <>
              {product.variable && "From "}
              <span className="font-bold text-ink">{formatPrice(product.priceCents)}</span>
            </>
          )}
        </span>
      </div>
      {quick ? (
        <button
          type="button"
          onClick={() => {
            add({
              key: `${product.id}:base`,
              productId: product.id,
              slug: product.slug,
              name: product.name,
              image: product.image,
              unitPriceCents: product.priceCents,
            });
            setAdded(true);
            setTimeout(() => setAdded(false), 1600);
          }}
          className="h-8 shrink-0 rounded-full bg-navy px-3 text-[0.75rem] font-bold text-white transition hover:bg-navy-2"
        >
          {added ? "Added ✓" : "Add"}
        </button>
      ) : (
        <Link
          href={href}
          onClick={onNavigate}
          className="grid h-8 shrink-0 place-items-center rounded-full border border-line px-3 text-[0.75rem] font-bold text-navy transition hover:border-navy"
        >
          {product.inStock ? "Options" : "View"}
        </Link>
      )}
    </div>
  );
}
