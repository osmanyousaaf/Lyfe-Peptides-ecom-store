"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/lib/cart";

export default function SuccessPage() {
  const { clear } = useCart();
  useEffect(() => {
    clear();
    // let the server confirm the order with Stripe and record it for the dashboard
    const id = new URLSearchParams(window.location.search).get("session_id");
    if (id) {
      fetch("/api/orders/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id }),
      }).catch(() => {});
    }
  }, [clear]);

  return (
    <div className="wrap section">
      <h1 className="display mb-6 max-w-[14ch]">Order received</h1>
      <p className="mb-10 max-w-[44ch] text-muted">
        A confirmation is on its way to your inbox. Orders placed before 1 PM EST
        leave today, with the certificate of analysis for each batch inside.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/shop" className="btn btn-solid">Keep browsing</Link>
        <Link href="/" className="btn btn-line">Home</Link>
      </div>
    </div>
  );
}
