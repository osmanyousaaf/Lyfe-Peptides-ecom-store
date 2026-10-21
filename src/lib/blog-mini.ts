// The small looping animations that illustrate a blog key point. Safe to import on the client.
export const MINI_ANIMS = [
  { key: "purity-peak", label: "Purity peak (HPLC)" },
  { key: "mass-spec", label: "Mass spec bars" },
  { key: "coa-check", label: "COA checklist" },
  { key: "lot-number", label: "Lot number match" },
  { key: "freezer", label: "Freezer temperature" },
  { key: "light-shield", label: "Light shield" },
  { key: "moisture", label: "Moisture kept out" },
  { key: "powder-cake", label: "Powder cake" },
  { key: "drop-mix", label: "Diluent mixing" },
  { key: "pen-twist", label: "Pen twist" },
  { key: "day-ring", label: "28-day ring" },
  { key: "preserve", label: "Preservative shield" },
  { key: "single-use", label: "Single use" },
  { key: "calendar", label: "Date the vial" },
  { key: "cold-pack", label: "Cold-packed shipping" },
] as const;

export type MiniAnim = (typeof MINI_ANIMS)[number]["key"];

export const MINI_KEYS = MINI_ANIMS.map((m) => m.key) as MiniAnim[];

export const miniLabel = (k: MiniAnim) => MINI_ANIMS.find((m) => m.key === k)?.label ?? k;
