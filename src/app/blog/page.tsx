import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import Newsletter from "@/components/Newsletter";
import { PostCard, PostCover, PostMeta } from "@/components/BlogParts";
import { CATEGORIES, postHref, sortedPosts } from "@/lib/blog";
import { ArrowRight } from "@/components/icons";

export const metadata: Metadata = {
  title: "Blog: Peptide Research Guides",
  description:
    "Guides on reading certificates of analysis, HPLC and mass spectrometry testing, peptide storage, lyophilization and choosing a research peptide supplier in Canada.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat } = await searchParams;
  const active = CATEGORIES.includes(cat as (typeof CATEGORIES)[number]) ? cat! : "All";
  const all = sortedPosts();
  const posts = active === "All" ? all : all.filter((p) => p.category === active);
  const [featured, ...rest] = posts;

  return (
    <>
      <PageHero
        crumb="Blog"
        eyebrow="The Lyfe journal"
        title="Research notes,"
        accent="plainly written."
        lead="Guides on testing, documentation, storage and buying research peptides in Canada. Short, visual and to the point."
      >
        <nav aria-label="Categories" className="mt-8 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={c === "All" ? "/blog" : `/blog?cat=${encodeURIComponent(c)}`}
              aria-current={c === active ? "page" : undefined}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                c === active ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-navy"
              }`}
            >
              {c}
            </Link>
          ))}
        </nav>
      </PageHero>

      <section className="wrap section">
        {featured && (
          <Link href={postHref(featured)} className="group grid overflow-hidden rounded-3xl border border-line bg-white transition hover:shadow-[0_30px_60px_-40px_rgb(19_41_75/0.5)] md:grid-cols-[1.1fr_1fr]">
            <PostCover post={featured} priority className="aspect-[16/11] md:aspect-auto md:min-h-[360px]" />
            <div className="flex flex-col justify-center p-7 sm:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-deep">Featured</p>
              <div className="mt-3">
                <PostMeta post={featured} />
              </div>
              <h2 className="mt-4 text-[clamp(1.5rem,1.1rem+1.2vw,2.2rem)] font-extrabold leading-tight text-navy group-hover:text-accent-deep">{featured.title}</h2>
              <p className="mt-3 leading-relaxed text-muted">{featured.excerpt}</p>
              <span className="mt-6 inline-flex items-center gap-2 font-bold text-navy">
                Read article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        )}

        {rest.length > 0 && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        )}
        {!featured && <p className="text-muted">No articles in this category yet.</p>}
      </section>

      <Newsletter />
    </>
  );
}
