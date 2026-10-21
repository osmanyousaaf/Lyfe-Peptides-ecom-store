export type Variant = {
  id: number;
  priceCents: number;
  attrs: Record<string, string>;
  label: string;
  /** units on hand; null means stock isn't tracked */
  stock?: number | null;
  inStock?: boolean;
  sku?: string | null;
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
  /** units on hand for simple products; null means stock isn't tracked */
  stock?: number | null;
  lowStockAt?: number;
  sku?: string | null;
  compareAtCents?: number | null;
  status?: "published" | "draft";
  /** position on the landing page, 0 when not featured */
  featured?: number;
  sort?: number;
  createdAt?: string;
  updatedAt?: string;
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
