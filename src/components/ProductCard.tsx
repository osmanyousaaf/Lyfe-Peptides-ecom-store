import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import QuickAdd from "./QuickAdd";

function badge(p: Product): { text: string; tone: string } | null {
  if (!p.inStock) return { text: "Sold out", tone: "bg-ink/80" };
  if (p.variants.some((v) => /pen/i.test(v.label))) return { text: "Pen available", tone: "bg-green" };
  return null;
}

export default function ProductCard({ product }: { product: Product }) {
  const b = badge(product);

  return (
    <article className="card card-hover group relative flex h-full flex-col overflow-hidden p-4">
      <Link href={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden rounded-lg">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
          className="blend object-cover transition-transform duration-500 group-hover:scale-[1.06]"
        />
        {b && (
          <span className={`absolute right-0 top-0 rounded-full px-2.5 py-1 text-[0.6875rem] font-bold text-white ${b.tone}`}>
            {b.text}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col pt-3">
        <h3 className="text-[0.9375rem] font-semibold leading-snug">
          <Link href={`/product/${product.slug}`} className="ulink">
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto pt-4">
          {!product.inStock ? (
            <div className="flex items-end justify-between gap-2">
              <p className="num text-[1.0625rem] font-extrabold text-faint line-through">{formatPrice(product.priceCents)}</p>
              <Link href={`/product/${product.slug}`} className="btn btn-line btn-sm">
                View
              </Link>
            </div>
          ) : (
            <QuickAdd product={product} />
          )}
        </div>
      </div>
    </article>
  );
}
