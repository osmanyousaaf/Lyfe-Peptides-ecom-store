import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import PostEditor from "@/components/admin/content/PostEditor";
import { editorData } from "../editor-data";

export const metadata: Metadata = { title: "New post" };

export default function NewPost() {
  return (
    <>
      <PageHeader title="New post" back={{ href: "/admin/blog", label: "Blog" }} />
      <PostEditor post={null} {...editorData()} />
    </>
  );
}
