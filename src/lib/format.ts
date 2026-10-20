export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function priceLabel(p: {
  type: string;
  priceCents: number;
  priceMin?: number;
  priceMax?: number;
}): string {
  if (p.type === "variable" && p.priceMin != null && p.priceMax != null) {
    if (p.priceMin === p.priceMax) return formatPrice(p.priceMin);
    return `${formatPrice(p.priceMin)} – ${formatPrice(p.priceMax)}`;
  }
  return formatPrice(p.priceCents);
}
