import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { getAllProducts } from "@/lib/products";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const latest = posts[0]?.date;
  const pages: MetadataRoute.Sitemap = [
    { url: SITE.url, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/shop`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE.url}/blog`, lastModified: latest, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE.url}/documentation`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE.url}/contact`, changeFrequency: "yearly", priority: 0.5 },
  ];
  return [
    ...pages,
    ...posts.map((p) => ({
      url: `${SITE.url}/blog/${p.slug}`,
      lastModified: p.updated ?? p.date,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...getAllProducts().map((p) => ({
      url: `${SITE.url}/product/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: [`${SITE.url}${p.image}`],
    })),
  ];
}
