import "@/app/(store)/blog/blog.css";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PostView from "@/components/blog/PostView";
import StoreChrome from "@/components/StoreChrome";
import { requireAdmin } from "@/lib/admin-auth";
import { adminGetPost } from "@/lib/blog";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Preview", robots: { index: false, follow: false } };

// Admin-only: renders a post (draft or published) exactly as the storefront would.
export default async function PreviewPost({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin();
  const post = adminGetPost((await params).slug);
  if (!post) notFound();
  return (
    <StoreChrome>
      <div className="sticky top-0 z-[60] flex flex-wrap items-center justify-center gap-3 bg-accent px-4 py-2 text-center text-sm font-bold text-white">
        Preview{post.status === "draft" ? " of a draft, not visible to customers" : ""}
        <Link href={`/admin/blog/${post.slug}`} className="rounded-full bg-white/20 px-3 py-0.5 hover:bg-white/30">
          Back to editor
        </Link>
      </div>
      <PostView post={post} />
    </StoreChrome>
  );
}
