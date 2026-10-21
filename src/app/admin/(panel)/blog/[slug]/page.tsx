import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/client";
import PostEditor from "@/components/admin/content/PostEditor";
import { adminGetPost } from "@/lib/blog";
import { deletePostAction } from "../actions";
import { editorData } from "../editor-data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = adminGetPost((await params).slug);
  return { title: post ? `Edit: ${post.title}` : "Post not found" };
}

export default async function EditPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = adminGetPost(slug);
  if (!post) notFound();
  return (
    <>
      <PageHeader
        title="Edit post"
        back={{ href: "/admin/blog", label: "Blog" }}
        actions={
          <form action={deletePostAction}>
            <input type="hidden" name="slug" value={post.slug} />
            <ConfirmButton confirm={`Delete “${post.title}”? This can't be undone.`} className="btn btn-line btn-sm text-red-600 hover:border-red-600">
              Delete post
            </ConfirmButton>
          </form>
        }
      />
      {/* key resets the editor's state after a save renames the slug */}
      <PostEditor key={post.slug} post={post} {...editorData()} />
    </>
  );
}
