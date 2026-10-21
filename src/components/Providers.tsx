"use client";

import { CartProvider } from "@/lib/cart";
import AgeGate from "./AgeGate";
import CartDrawer from "./CartDrawer";
import ChatWidget from "./chat/ChatWidget";
import RevealRoot from "./RevealRoot";
import Tracker from "./analytics/Tracker";
import SignupPrompt from "./account/SignupPrompt";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
      <ChatWidget />
      <AgeGate />
      <SignupPrompt />
      <Tracker />
      <RevealRoot />
    </CartProvider>
  );
}
