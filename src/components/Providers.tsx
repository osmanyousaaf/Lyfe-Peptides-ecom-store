"use client";

import { CartProvider } from "@/lib/cart";
import AgeGate from "./AgeGate";
import CartDrawer from "./CartDrawer";
import RevealRoot from "./RevealRoot";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
      <AgeGate />
      <RevealRoot />
    </CartProvider>
  );
}
