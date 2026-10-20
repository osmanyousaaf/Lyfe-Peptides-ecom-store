import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import AddToCart from "@/components/AddToCart";
import ProductCard from "@/components/ProductCard";
import ProductGallery from "@/components/ProductGallery";
import { getAllProducts, getProduct, relatedProducts } from "@/lib/products";

export function generateStaticParams() {
  return getAllProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return { title: "Not found" };
  return {
    title: p.name,
    description: p.shortDescription.replace(/<[^>]+>/g, "") || p.name,
    openGraph: { images: [p.image] },
  };
}

const SPECS = [
  ["Form", "Lyophilized powder"],
  ["Purity", "99% or higher, by HPLC"],
  ["Identity", "Confirmed by mass spectrometry"],
  ["Certificate", "Batch-specific, ships with the order"],
  ["Made in", "Canada"],
];

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const related = relatedProducts(product, 4);
  const accessory = product.category === "Accessories";

  return (
    <div className="wrap pt-10 md:pt-14">
      <nav className="mb-8 text-small text-muted" aria-label="Breadcrumb">
        <Link href="/" className="ulink">Home</Link>
        <span className="px-2">/</span>
        <Link href="/shop" className="ulink">Shop</Link>
        <span className="px-2">/</span>
        <Link href={`/shop?cat=${encodeURIComponent(product.category)}`} className="ulink">
          {product.category}
        </Link>
      </nav>

      {/* phone order: what it is, the picture, how to buy. Wide: picture left, the rest right. */}
      <div className="grid gap-10 md:grid-cols-12 md:gap-x-6 md:gap-y-0">
        <div className="rise md:col-span-5 md:col-start-8 md:row-start-1">
          <h1 className="head mb-3 text-navy">{product.name}</h1>
          <p className="mb-6 text-muted">
            {accessory ? "Laboratory accessory" : "Research compound"}
            {product.tags.length > 0 && <>, studied for {product.tags.join(", ").toLowerCase()}</>}.
          </p>
          {product.shortDescription && (
            <div className="prose" dangerouslySetInnerHTML={{ __html: product.shortDescription }} />
          )}
        </div>

        <div className="md:col-span-6 md:col-start-1 md:row-span-2 md:row-start-1">
          <div className="md:sticky md:top-24">
            <div className="card overflow-hidden p-3"><ProductGallery images={product.images} name={product.name} /></div>
          </div>
        </div>

        <div className="md:col-span-5 md:col-start-8 md:row-start-2 md:pt-10">
          <div className="card rise p-5 sm:p-6" style={{ animationDelay: "90ms" }}>
            <AddToCart product={product} />
          </div>

          <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-2 text-small text-muted" data-reveal>
            <li>Free shipping over $300</li>
            <li>Same-day dispatch before 1 PM EST</li>
            <li>Ships from Canada</li>
            <li>Plain, discreet packaging</li>
          </ul>

          <section className="mt-20">
            <h2 className="lead mb-6" data-reveal>About this compound</h2>
            {product.description ? (
              <div className="prose" data-reveal style={{ ["--d" as string]: "80ms" }} dangerouslySetInnerHTML={{ __html: product.description }} />
            ) : (
              <p className="text-muted">The research notes for this product are being written.</p>
            )}
          </section>

          {!accessory && (
            <section className="mt-16">
              <h2 className="lead mb-6" data-reveal>Specification</h2>
              <table className="w-full text-small" data-reveal style={{ ["--d" as string]: "80ms" }}>
                <tbody>
                  {SPECS.map(([k, v], i) => (
                    <tr key={k} className={i % 2 ? "" : "bg-surface"}>
                      <th scope="row" className="py-3 pl-4 pr-4 text-left font-normal text-muted">{k}</th>
                      <td className="py-3 pr-4 text-right">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          <p className="mt-12 bg-surface p-5 text-small text-muted" data-reveal>
            <span className="text-ink">For research use only.</span> Not for human or animal
            consumption. Not approved by Health Canada for personal use.
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section">
          <h2 className="head mb-12" data-reveal>Studied alongside</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4 md:gap-x-6">
            {related.map((p, i) => (
              <div key={p.id} data-reveal style={{ ["--d" as string]: `${i * 70}ms` }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
