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
  const variable = product.type === "variable";
  const price = variable ? product.priceMin ?? product.priceCents : product.priceCents;

  return (
    <article className="card card-hover group flex flex-col p-4">
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
        <p className="num mt-1.5 text-[1.0625rem] font-extrabold text-navy">
          {variable && <span className="mr-1 text-xs font-semibold text-muted">From</span>}
          {formatPrice(price)}
        </p>
        <div className="mt-auto pt-4">
          {!product.inStock ? (
            <Link href={`/product/${product.slug}`} className="btn btn-line btn-sm w-full">
              View product
            </Link>
          ) : variable ? (
            <Link href={`/product/${product.slug}`} className="btn btn-line btn-sm w-full">
              Select options
            </Link>
          ) : (
            <QuickAdd product={product} />
          )}
        </div>
      </div>
    </article>
  );
}
