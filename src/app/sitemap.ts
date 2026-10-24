import type { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/products";
import { POSTS, postHref } from "@/lib/blog";

const SITE = "https://lyfepeptidescanada.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/shop", "/about", "/documentation", "/contact", "/blog"].map((p) => ({
    url: `${SITE}${p}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.8,
  }));
  const products = getAllProducts().map((p) => ({
    url: `${SITE}/product/${p.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));
  const posts = POSTS.map((p) => ({
    url: `${SITE}${postHref(p)}`,
    lastModified: new Date(p.date + "T12:00:00"),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  return [...pages, ...products, ...posts];
}
