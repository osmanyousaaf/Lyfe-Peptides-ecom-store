import type { Metadata } from "next";
import Link from "next/link";
import BlogExplorer from "@/components/blog/BlogExplorer";
import HeroScene from "@/components/blog/HeroScene";
import PostAnim from "@/components/blog/PostAnim";
import type { PostSummary } from "@/components/blog/PostCard";
import { ArrowRight, FlaskIcon, ShieldIcon } from "@/components/icons";
import { formatPostDate, getAllPosts, getPostCategories } from "@/lib/blog";
import { getSettings } from "@/lib/settings";

const TITLE = "Research Notes: Peptide Testing, Storage and Dual Chamber Pens";
const DESCRIPTION =
  "Lab guides from Lyfe Peptides, Canada's research peptide manufacturer: how to read a COA, HPLC and mass spectrometry, storing lyophilized peptides, bacteriostatic water and dual chamber pens.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/blog" },
  openGraph: { title: `${TITLE} | Lyfe Peptides`, description: DESCRIPTION, type: "website", url: "/blog" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function BlogIndex() {
  const SITE = getSettings();
  const posts = getAllPosts();
  const summaries: PostSummary[] = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    dateLabel: formatPostDate(p.date),
    readMinutes: p.readMinutes,
    category: p.category,
    anim: p.anim,
  }));
  const lead = summaries[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Lyfe Peptides Research Notes",
    description: DESCRIPTION,
    url: `${SITE.url}/blog`,
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url, logo: `${SITE.url}/lyfe-logo.png` },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${SITE.url}/blog/${p.slug}`,
      datePublished: p.date,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      {/* hero */}
      <section className="blog-hero-bg relative overflow-hidden">
        <div className="blog-grid-bg pointer-events-none absolute inset-0" aria-hidden />
        <div className="wrap relative grid items-center gap-10 py-12 lg:grid-cols-[1.1fr_1fr] lg:py-20">
          <div>
            <p className="eyebrow rise">Lyfe research notes</p>
            <h1 className="display rise mt-5 max-w-[16ch] text-navy" style={{ animationDelay: "60ms" }}>
              The lab notebook for <span className="blog-gradient-text">Canadian peptide research</span>
            </h1>
            <p className="rise mt-5 max-w-[54ch] text-[1.0625rem] leading-relaxed text-muted" style={{ animationDelay: "120ms" }}>
              Plain-language guides on how research peptides are tested, stored and handled, written by the team
              that makes them in Canada.
            </p>
            <div className="rise mt-8 flex flex-wrap gap-3" style={{ animationDelay: "180ms" }}>
              <a href="#articles" className="btn btn-solid">
                Browse articles <ArrowRight className="h-4 w-4" />
              </a>
              <Link href="/shop" className="btn btn-line">
                Shop peptides
              </Link>
            </div>
            <ul className="rise mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-navy" style={{ animationDelay: "240ms" }}>
              <li className="flex items-center gap-2">
                <ShieldIcon className="h-5 w-5 text-accent" /> {posts.length} in-depth guides
              </li>
              <li className="flex items-center gap-2">
                <FlaskIcon className="h-5 w-5 text-accent" /> Research use only
              </li>
            </ul>
          </div>
          <div className="rise" style={{ animationDelay: "120ms" }}>
            <HeroScene />
          </div>
        </div>
      </section>

      {/* featured */}
      <section className="wrap pt-12 md:pt-16" data-reveal>
        <Link
          href={`/blog/${lead.slug}`}
          className="card blog-card group grid overflow-hidden md:grid-cols-[1.05fr_1fr]"
        >
          <div className="blog-card-art grid min-h-[280px] place-items-center p-8 md:min-h-[380px]">
            <PostAnim anim={lead.anim} className="h-full max-h-[340px] w-full" />
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-10">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-muted">
              <span className="rounded-full bg-navy px-3 py-1 font-bold text-white">Latest</span>
              <span className="rounded-full bg-accent/10 px-2.5 py-1 font-bold text-accent-deep">{lead.category}</span>
              <span>
                {lead.dateLabel} · {lead.readMinutes} min read
              </span>
            </div>
            <h2 className="head mt-4 text-navy">{lead.title}</h2>
            <p className="mt-3 max-w-[56ch] leading-relaxed text-muted">{lead.excerpt}</p>
            <span className="mt-6 inline-flex items-center gap-2 font-bold text-navy">
              Read the guide <ArrowRight className="blog-card-arrow h-4 w-4 text-accent" />
            </span>
          </div>
        </Link>
      </section>

      {/* all articles */}
      <section id="articles" className="wrap section scroll-mt-32">
        <div className="mb-6">
          <h2 className="head title-bar text-navy">All articles</h2>
          <p className="mt-3 text-muted">Testing, storage, handling and the dual chamber pen.</p>
        </div>
        <BlogExplorer posts={summaries} categories={getPostCategories()} />
      </section>

      {/* cta */}
      <section className="wrap pb-16 md:pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(120deg,#13294b,#1d3b68)] px-6 py-12 text-white sm:px-12" data-reveal>
          <div className="blog-orbit pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-dashed border-white/20" aria-hidden />
          <div className="relative grid items-center gap-6 md:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 className="head max-w-[20ch]">Every batch tested. Every certificate shipped.</h2>
              <p className="mt-3 max-w-[52ch] text-white/75">
                HPLC for purity, mass spectrometry for identity, and the batch-specific COA in the box with your order.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link href="/shop" className="btn btn-solid">
                Shop peptides <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/documentation" className="btn btn-light">
                How we test
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
