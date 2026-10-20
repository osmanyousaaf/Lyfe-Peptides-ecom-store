import data from "@/data/products.json";
import type { Product } from "./types";

const products = data as unknown as Product[];

export type Goal = {
  tag: string;
  label: string;
  blurb: string;
};

// Research-goal taxonomy (from the store's own tags), ordered deliberately.
export const GOALS: Goal[] = [
  { tag: "Fat Loss", label: "Fat Loss", blurb: "Metabolic & lipolysis research" },
  { tag: "Muscle & Growth", label: "Muscle & Growth", blurb: "GH axis & secretagogues" },
  { tag: "Recovery", label: "Recovery", blurb: "Tissue & connective repair" },
  { tag: "Anti-Aging & Skin", label: "Anti-Aging & Skin", blurb: "Matrix & dermal research" },
  { tag: "Cognitive", label: "Cognitive", blurb: "Nootropic & neuro models" },
  { tag: "Energy & Endurance", label: "Energy", blurb: "Mitochondrial & output" },
  { tag: "Sexual Health", label: "Sexual Health", blurb: "Signalling research" },
  { tag: "Gut Health", label: "Gut Health", blurb: "GI-lining models" },
];

export function getAllProducts(): Product[] {
  return products;
}

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getCategories(): string[] {
  const set = new Set<string>();
  products.forEach((p) => p.categories.forEach((c) => set.add(c)));
  return [...set].sort();
}

export function getTags(): string[] {
  const set = new Set<string>();
  products.forEach((p) => p.tags.forEach((t) => set.add(t)));
  return [...set];
}

export function productsByTag(tag: string): Product[] {
  return products.filter((p) => p.tags.includes(tag));
}

export function productsByCategory(cat: string): Product[] {
  return products.filter((p) => p.categories.includes(cat));
}

export function featured(n = 8): Product[] {
  // in-stock, non-accessory, highest-interest first by a stable curated order
  const curated = [
    "bpc-157-10-mg",
    "tb-500-bpc-157-10-mg",
    "cjc-1295-ipamorelin-20-mg",
    "glow-70-mg",
    "ghk-cu-50-mg",
    "nad-500-mg",
    "mots-c-10-mg",
    "tesamorelin-20-mg",
  ];
  const picked = curated
    .map((s) => products.find((p) => p.slug === s))
    .filter(Boolean) as Product[];
  if (picked.length >= n) return picked.slice(0, n);
  const rest = products.filter(
    (p) => !picked.includes(p) && p.category !== "Accessories"
  );
  return [...picked, ...rest].slice(0, n);
}

export function relatedProducts(product: Product, n = 4): Product[] {
  return products
    .filter(
      (p) =>
        p.slug !== product.slug &&
        (p.category === product.category ||
          p.tags.some((t) => product.tags.includes(t)))
    )
    .slice(0, n);
}
