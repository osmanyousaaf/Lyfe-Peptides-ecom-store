import Link from "next/link";
import type { AnimKey } from "@/lib/blog";
import { ArrowRight } from "@/components/icons";
import PostAnim from "./PostAnim";

export type PostSummary = {
  slug: string;
  title: string;
  excerpt: string;
  dateLabel: string;
  readMinutes: number;
  category: string;
  anim: AnimKey;
};

export default function PostCard({ post }: { post: PostSummary }) {
  return (
    <Link href={`/blog/${post.slug}`} className="card blog-card group flex h-full flex-col overflow-hidden">
      <div className="blog-card-art grid aspect-[16/10] place-items-center overflow-hidden p-5">
        <PostAnim anim={post.anim} className="h-full w-full" />
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-muted">
          <span className="rounded-full bg-accent/10 px-2.5 py-1 font-bold text-accent-deep">{post.category}</span>
          <span>{post.readMinutes} min read</span>
        </div>
        <h3 className="mt-3 text-lg font-extrabold leading-snug text-navy">{post.title}</h3>
        <p className="mt-2 line-clamp-3 text-[0.9375rem] leading-relaxed text-muted">{post.excerpt}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-bold text-navy">
          Read article <ArrowRight className="blog-card-arrow h-4 w-4 text-accent" />
        </span>
      </div>
    </Link>
  );
}
