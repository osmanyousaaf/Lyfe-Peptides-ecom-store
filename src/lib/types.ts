export type Variant = {
  id: number;
  priceCents: number;
  attrs: Record<string, string>;
  label: string;
};

export type Attribute = {
  name: string;
  options: string[];
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  category: string;
  categories: string[];
  tags: string[];
  image: string;
  images: string[];
  inStock: boolean;
  type: "simple" | "variable";
  shortDescription: string;
  description: string;
  needsReview?: boolean;
  priceCents: number;
  priceMin?: number;
  priceMax?: number;
  variants: Variant[];
  attributes: Attribute[];
};

export type CartLine = {
  key: string;
  productId: number;
  slug: string;
  name: string;
  image: string;
  variantId?: number;
  variantLabel?: string;
  unitPriceCents: number;
  qty: number;
};
