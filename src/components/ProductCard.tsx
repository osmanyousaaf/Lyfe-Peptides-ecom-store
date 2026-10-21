import Image from "next/image";
import { isUpload } from "@/lib/img";
import Link from "next/link";
import type { Product } from "@/lib/types";
import QuickAdd from "./QuickAdd";

function badge(p: Product): { text: string; tone: string } | null {
  if (!p.inStock) return { text: "Sold out", tone: "bg-ink/80 text-white" };
  if (p.variants.some((v) => /pen/i.test(v.label))) return { text: "Pen available", tone: "bg-green/10 text-green" };
  return null;
}

// a quiet line above the name: how many options, or the category for single items
function optionHint(p: Product): string {
  if (p.type !== "variable") return p.category;
  const n = p.variants.length;
  return `${n} option${n === 1 ? "" : "s"}`;
}

export default function ProductCard({ product }: { product: Product }) {
  const b = badge(product);

  return (
    <article className="card card-hover group relative flex h-full flex-col overflow-hidden rounded-2xl p-3 sm:p-4">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-square overflow-hidden rounded-xl bg-[radial-gradient(circle_at_50%_60%,#ffffff_0%,#f4f7fb_75%)]"
        tabIndex={-1}
        aria-hidden
      >
        <Image
          src={product.image}
          alt=""
          fill
          unoptimized={isUpload(product.image)}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
          className="blend object-cover transition-transform duration-700 ease-out group-hover:-translate-y-1 group-hover:scale-[1.07]"
        />
        <span className="absolute inset-x-[22%] bottom-[6%] h-3 rounded-[50%] bg-navy/10 blur-md transition-all duration-700 group-hover:inset-x-[28%] group-hover:bg-navy/5" />
      </Link>
      {b && (
        <span className={`absolute left-5 top-5 rounded-full px-2.5 py-1 text-[0.6875rem] font-bold backdrop-blur ${b.tone} sm:left-6 sm:top-6`}>
          {b.text}
        </span>
      )}
      <div className="flex flex-1 flex-col pt-3">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-faint">{optionHint(product)}</p>
        <h3 className="mt-1 line-clamp-2 min-h-[2.6em] text-[0.9375rem] font-bold leading-[1.3] text-navy">
          <Link href={`/product/${product.slug}`} className="ulink">
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto pt-3">
          <QuickAdd product={product} />
        </div>
      </div>
    </article>
  );
}
