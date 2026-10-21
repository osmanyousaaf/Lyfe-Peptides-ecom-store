"use client";

import { useId } from "react";

// SVG gradient/clip ids must be unique per instance and safe inside url(#…).
export function useSvgId(prefix: string): string {
  return `${prefix}${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
}
