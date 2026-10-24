import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Newsletter from "@/components/Newsletter";
import { Blocks, PostCard, PostCover, PostMeta } from "@/components/BlogParts";
import { getPost, POSTS, sortedPosts } from "@/lib/blog";
import { ArrowRight } from "@/components/icons";

export function generateStaticParams() {
  return POSTS.filter((p) => !p.href).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { title: post.title, description: post.excerpt, type: "article", publishedTime: post.date, images: [post.cover.src] },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const more = sortedPosts().filter((p) => p.slug !== post.slug).slice(0, 3);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    image: `https://lyfepeptidescanada.com${post.cover.src}`,
    author: { "@type": "Organization", name: "Lyfe Peptides" },
    publisher: { "@type": "Organization", name: "Lyfe Peptides" },
    mainEntityOfPage: `https://lyfepeptidescanada.com/blog/${post.slug}`,
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="border-b border-line bg-[linear-gradient(100deg,#ffffff_0%,#f8f9fb_50%,#eef1f5_100%)]">
        <div className="wrap grid items-center gap-10 py-12 md:py-16 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <nav aria-label="Breadcrumb" className="text-sm text-muted">
              <Link href="/" className="hover:text-navy">Home</Link> <span aria-hidden className="mx-1.5 text-faint">/</span>
              <Link href="/blog" className="hover:text-navy">Blog</Link>
            </nav>
            <div className="mt-6">
              <PostMeta post={post} />
            </div>
            <h1 className="mt-4 max-w-[24ch] text-[clamp(2rem,1.4rem+2vw,3.2rem)] font-extrabold leading-[1.08] tracking-[-0.025em] text-navy">{post.title}</h1>
            <p className="mt-4 max-w-[60ch] text-[1.0625rem] leading-relaxed text-muted">{post.excerpt}</p>
            <p className="mt-6 text-sm font-semibold text-navy">By the Lyfe Peptides team</p>
          </div>
          <PostCover post={post} priority className="hidden aspect-[4/3] rounded-3xl border border-line lg:block" />
        </div>
      </header>

      <div className="wrap grid gap-12 py-12 lg:grid-cols-[minmax(0,720px)_1fr] lg:gap-16 lg:py-16">
        <div className="min-w-0">
          <Blocks blocks={post.blocks} />
          <p className="mt-12 rounded-2xl bg-surface p-5 text-sm leading-relaxed text-muted">
            <strong className="text-navy">For research purposes only.</strong> Not for human consumption. These products are not
            approved by Health Canada for personal use.
          </p>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-5">
            <div className="rounded-2xl border border-line bg-white p-6">
              <p className="font-extrabold text-navy">Get 10% off your first order</p>
              <p className="mt-1 text-sm text-muted">Join the newsletter for research notes and restocks.</p>
              <a href="#newsletter" className="btn btn-solid btn-sm mt-4 w-full">Sign up</a>
            </div>
            <div className="rounded-2xl border border-line bg-white p-6">
              <p className="font-extrabold text-navy">Read the certificates</p>
              <p className="mt-1 text-sm text-muted">Ten full reports from Peptide Test Canada.</p>
              <Link href="/documentation#certificates" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-accent-deep">
                Documentation <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </aside>
      </div>

      <section className="border-t border-line bg-surface">
        <div className="wrap section">
          <h2 className="head text-navy">Keep reading</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </div>
      </section>

      <div id="newsletter" className="scroll-mt-28 pt-12">
        <Newsletter />
      </div>
    </article>
  );
}
