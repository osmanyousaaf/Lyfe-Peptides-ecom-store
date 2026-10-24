import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { isAdmin } from "@/lib/admin-auth";
import { loadAll } from "@/lib/dashboard";
import { storageMode } from "@/lib/store";
import { Sidebar } from "@/components/admin/shell";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");

  const { contact, carts } = await loadAll();
  const weekAgo = Date.now() - 7 * 864e5;
  const counts = {
    Messages: contact.filter((m) => Date.parse(m.at) > weekAgo).length,
    Carts: new Set(carts.filter((c) => Date.parse(c.at) > Date.now() - 864e5 && c.lines.length).map((c) => c.vid)).size,
  };

  return (
    <div className="min-h-svh bg-[#f5f7fa]">
      <Suspense>
        <Sidebar counts={counts} />
      </Suspense>
      <div className="lg:pl-64">
        {storageMode() === "temporary" && (
          <p className="border-b border-[#f3c2bd] bg-[#fdecec] px-5 py-3 text-sm text-[#8a1c12] sm:px-8">
            <strong>Data isn&rsquo;t being saved permanently.</strong> Connect Upstash Redis in Vercel (Storage &rarr; Marketplace)
            so orders, sign-ups and analytics survive redeploys.
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
