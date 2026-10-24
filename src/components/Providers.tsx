"use client";

import { usePathname } from "next/navigation";
import { CartProvider } from "@/lib/cart";
import AgeGate from "./AgeGate";
import CartDrawer from "./CartDrawer";
import RevealRoot from "./RevealRoot";

export default function Providers({ children }: { children: React.ReactNode }) {
  const admin = usePathname().startsWith("/admin");
  return (
    <CartProvider>
      {children}
      {!admin && <CartDrawer />}
      {!admin && <AgeGate />}
      <RevealRoot />
    </CartProvider>
  );
}
