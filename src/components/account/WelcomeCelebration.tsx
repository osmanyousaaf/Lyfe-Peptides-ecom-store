"use client";

import { useEffect, useMemo } from "react";
import { useCart } from "@/lib/cart";
import { shouldAutoApply } from "./useMe";
import "./account.css";

const COLORS = ["#f26a21", "#ff9a4d", "#13294b", "#2f9a4a", "#ffd88a", "#c9d3e0"];

// Confetti over the welcome page, and the new code dropped into the cart.
export default function WelcomeCelebration({ code, label }: { code: string | null; label: string }) {
  const { setCoupon } = useCart();

  useEffect(() => {
    if (code && shouldAutoApply(code)) setCoupon({ code, label });
  }, [code, label, setCoupon]);

  const pieces = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        left: `${(i * 37) % 100}%`,
        color: COLORS[i % COLORS.length],
        dx: `${((i * 53) % 160) - 80}px`,
        rot: `${360 + ((i * 97) % 540)}deg`,
        dur: `${2.6 + ((i * 13) % 20) / 10}s`,
        delay: `${((i * 7) % 12) / 10}s`,
        round: i % 3 === 0,
      })),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="acct-confetti"
          style={{
            left: p.left,
            background: p.color,
            borderRadius: p.round ? "999px" : undefined,
            ["--dx" as string]: p.dx,
            ["--rot" as string]: p.rot,
            ["--dur" as string]: p.dur,
            ["--delay" as string]: p.delay,
          }}
        />
      ))}
    </div>
  );
}
