// What the post editor needs besides the post itself.
import { adminListPosts } from "@/lib/blog";
import { adminListProducts } from "@/lib/products";
import { getSettings } from "@/lib/settings";
import type { PickProduct } from "@/components/admin/content/PostEditor";

export function editorData() {
  const categories = [...new Set(adminListPosts().map((p) => p.category).filter(Boolean))].sort();
  const products: PickProduct[] = adminListProducts().map((p) => ({ slug: p.slug, name: p.name, image: p.image, status: p.status ?? "published" }));
  return { categories, products, siteUrl: getSettings().url };
}
