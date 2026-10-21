import Link from "next/link";
import type { Metadata } from "next";
import { Badge, Card, EmptyState, PageHeader, TableWrap, formatDate, inputCls, td, th, tr } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/client";
import { adminListPosts, formatPostDate } from "@/lib/blog";
import { deletePostAction, setPostStatusAction } from "./actions";

export const metadata: Metadata = { title: "Blog" };

export default async function BlogAdmin({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; cat?: string }> }) {
  const { q = "", status = "all", cat = "" } = await searchParams;
  const all = adminListPosts();
  const categories = [...new Set(all.map((p) => p.category))].sort();
  const needle = q.trim().toLowerCase();
  const posts = all.filter(
    (p) =>
      (status === "all" || p.status === status) &&
      (!cat || p.category === cat) &&
      (!needle || `${p.title} ${p.slug} ${p.keywords.join(" ")}`.toLowerCase().includes(needle))
  );
  const counts = { all: all.length, published: all.filter((p) => p.status === "published").length, draft: all.filter((p) => p.status === "draft").length };
  const tab = (s: string) => {
    const sp = new URLSearchParams({ ...(q ? { q } : {}), ...(cat ? { cat } : {}), ...(s !== "all" ? { status: s } : {}) });
    return `/admin/blog${sp.size ? `?${sp}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Blog"
        description="Research notes shown at /blog. Drafts stay hidden until published."
        actions={
          <Link href="/admin/blog/new" className="btn btn-solid btn-sm">
            + New post
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <nav className="flex gap-1 rounded-xl border border-line bg-white p-1" aria-label="Filter by status">
          {(["all", "published", "draft"] as const).map((s) => (
            <Link
              key={s}
              href={tab(s)}
              aria-current={status === s ? "page" : undefined}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold capitalize transition ${status === s ? "bg-navy text-white" : "text-muted hover:text-navy"}`}
            >
              {s === "draft" ? "Drafts" : s} <span className="num opacity-70">{counts[s]}</span>
            </Link>
          ))}
        </nav>
        <form className="ml-auto flex flex-wrap gap-2" role="search">
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          <select name="cat" defaultValue={cat} className={`${inputCls} h-10 w-auto`} aria-label="Category">
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <input name="q" defaultValue={q} placeholder="Search posts…" className={`${inputCls} h-10 w-56`} aria-label="Search posts" />
          <button className="btn btn-line btn-sm h-10">Filter</button>
        </form>
      </div>

      <Card pad={false}>
        {posts.length === 0 ? (
          <EmptyState
            title={all.length ? "No posts match" : "No posts yet"}
            text={all.length ? "Try another search or filter." : "Write the first research note."}
            action={<Link href="/admin/blog/new" className="btn btn-navy btn-sm">New post</Link>}
          />
        ) : (
          <TableWrap>
            <table className="w-full min-w-[760px]">
              <thead>
                <tr>
                  <th className={th}>Post</th>
                  <th className={th}>Status</th>
                  <th className={th}>Category</th>
                  <th className={th}>Published</th>
                  <th className={th}>Updated</th>
                  <th className={`${th} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.slug} className={tr}>
                    <td className={`${td} max-w-[380px]`}>
                      <Link href={`/admin/blog/${p.slug}`} className="block truncate font-bold text-navy hover:text-accent-deep">
                        {p.title}
                      </Link>
                      <span className="block truncate font-mono text-xs text-faint">/blog/{p.slug}</span>
                    </td>
                    <td className={td}>
                      <Badge tone={p.status === "published" ? "green" : "gray"}>{p.status === "published" ? "Published" : "Draft"}</Badge>
                    </td>
                    <td className={`${td} text-muted`}>{p.category}</td>
                    <td className={`${td} num whitespace-nowrap text-muted`}>{formatPostDate(p.date)}</td>
                    <td className={`${td} num whitespace-nowrap text-muted`}>{p.updated ? formatDate(p.updated) : "—"}</td>
                    <td className={`${td} text-right`}>
                      <div className="flex justify-end gap-1.5">
                        <Link href={`/admin/blog/${p.slug}`} className="btn btn-line btn-sm">Edit</Link>
                        <a href={p.status === "published" ? `/blog/${p.slug}` : `/admin/preview/blog/${p.slug}`} target="_blank" rel="noreferrer" className="btn btn-line btn-sm">
                          {p.status === "published" ? "View" : "Preview"}
                        </a>
                        <form action={setPostStatusAction}>
                          <input type="hidden" name="slug" value={p.slug} />
                          <input type="hidden" name="status" value={p.status === "published" ? "draft" : "published"} />
                          <button className="btn btn-line btn-sm">{p.status === "published" ? "Unpublish" : "Publish"}</button>
                        </form>
                        <form action={deletePostAction}>
                          <input type="hidden" name="slug" value={p.slug} />
                          <ConfirmButton confirm={`Delete “${p.title}”? This can't be undone.`} className="btn btn-line btn-sm text-red-600 hover:border-red-600">
                            Delete
                          </ConfirmButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Card>
    </>
  );
}
