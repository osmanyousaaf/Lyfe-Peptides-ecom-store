// The full article page: header, body with table of contents, products, related posts.
// Shared by the storefront post route and the admin draft preview.
import Link from "next/link";
import PostAnim from "@/components/blog/PostAnim";
import PostBody from "@/components/blog/PostBody";
import PostCard from "@/components/blog/PostCard";
import ReadingProgress from "@/components/blog/ReadingProgress";
import ProductCard from "@/components/ProductCard";
import { ArrowRight, ClockIcon } from "@/components/icons";
import { formatPostDate, relatedPosts, type Post } from "@/lib/blog";
import { getProduct } from "@/lib/products";
import { getSettings } from "@/lib/settings";
import type { Product } from "@/lib/types";

export default function PostView({ post }: { post: Post }) {
  const SITE = getSettings();
  const products = post.products.map((s) => getProduct(s)).filter(Boolean) as Product[];
  const related = relatedPosts(post, 3).map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    dateLabel: formatPostDate(p.date),
    readMinutes: p.readMinutes,
    category: p.category,
    anim: p.anim,
  }));
  const url = `${SITE.url}/blog/${post.slug}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.updated ?? post.date,
      articleSection: post.category,
      keywords: post.keywords.join(", "),
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      url,
      ...(products[0] ? { image: [`${SITE.url}${products[0].image}`] } : {}),
      author: { "@type": "Organization", name: `${SITE.name} Research Team`, url: SITE.url },
      publisher: {
        "@type": "Organization",
        name: SITE.name,
        url: SITE.url,
        logo: { "@type": "ImageObject", url: `${SITE.url}/lyfe-logo.png` },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE.url}/blog` },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <ReadingProgress target="article-body" />

      {/* header */}
      <header className="blog-hero-bg relative overflow-hidden border-b border-line">
        <div className="blog-grid-bg pointer-events-none absolute inset-0" aria-hidden />
        <div className="wrap relative grid items-center gap-10 py-10 lg:grid-cols-[1.25fr_1fr] lg:py-16">
          <div>
            <nav className="rise mb-6 text-sm text-muted" aria-label="Breadcrumb">
              <Link href="/" className="ulink">Home</Link>
              <span className="px-2">/</span>
              <Link href="/blog" className="ulink">Blog</Link>
              <span className="px-2">/</span>
              <span className="text-ink">{post.category}</span>
            </nav>
            <span className="rise inline-flex rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent-deep">
              {post.category}
            </span>
            <h1
              className="rise mt-4 max-w-[24ch] text-[clamp(1.9rem,1.25rem+2.3vw,3.1rem)] font-extrabold leading-[1.1] tracking-[-0.02em] text-navy"
              style={{ animationDelay: "60ms" }}
            >
              {post.title}
            </h1>
            <p className="rise mt-5 max-w-[58ch] text-[1.0625rem] leading-relaxed text-muted" style={{ animationDelay: "120ms" }}>
              {post.excerpt}
            </p>
            <div className="rise mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted" style={{ animationDelay: "180ms" }}>
              <span className="flex items-center gap-2 font-semibold text-navy">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-navy text-[0.6875rem] font-extrabold text-white">LP</span>
                Lyfe Research Team
              </span>
              <time dateTime={post.date}>{formatPostDate(post.date)}</time>
              <span className="flex items-center gap-1.5">
                <ClockIcon className="h-4 w-4" /> {post.readMinutes} min read
              </span>
            </div>
          </div>
          <div className="rise" style={{ animationDelay: "120ms" }}>
            <div className="card grid place-items-center overflow-hidden bg-white/70 p-6 shadow-[0_30px_60px_-36px_rgb(19_41_75/0.5)] backdrop-blur sm:p-10">
              <PostAnim anim={post.anim} className="h-full max-h-[380px] w-full" />
            </div>
          </div>
        </div>
      </header>

      {/* article: short, one centred column */}
      <div className="wrap py-12 lg:py-16">
        <article id="article-body" className="mx-auto min-w-0 max-w-[72ch]">
          <PostBody blocks={post.body} />
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface px-5 py-4" data-reveal>
            <p className="text-sm font-semibold text-navy">Every lot ships with its certificate of analysis.</p>
            <Link href="/shop" className="btn btn-solid btn-sm">
              Shop peptides <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </article>
      </div>

      {/* products */}
      {products.length > 0 && (
        <section className="bg-surface">
          <div className="wrap section">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="head title-bar text-navy">Mentioned in this article</h2>
                <p className="mt-3 text-muted">Every lot ships with its certificate of analysis.</p>
              </div>
              <Link href="/shop" className="inline-flex items-center gap-1.5 text-sm font-bold text-navy hover:text-accent-deep">
                View all products <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {products.map((p, i) => (
                <div key={p.id} data-reveal style={{ ["--d" as string]: `${i * 70}ms` }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* related */}
      <section className="wrap section">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="head title-bar text-navy">Keep reading</h2>
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-bold text-navy hover:text-accent-deep">
            All articles <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((p, i) => (
            <div key={p.slug} data-reveal style={{ ["--d" as string]: `${i * 80}ms` }}>
              <PostCard post={p} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
