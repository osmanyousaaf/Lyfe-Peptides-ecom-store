"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart";

// empties the cart (and any applied code) once the order is through
export default function ClearCart() {
  const { clear } = useCart();
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
