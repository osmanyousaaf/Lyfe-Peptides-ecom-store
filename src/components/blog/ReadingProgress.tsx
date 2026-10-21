"use client";

import { useEffect, useRef } from "react";

// A thin bar across the top of the window that fills as the article is read.
export default function ReadingProgress({ target }: { target: string }) {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = document.getElementById(target);
      if (!el || !bar.current) return;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight * 0.6;
      const p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 1;
      bar.current.style.setProperty("--p", p.toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [target]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]" aria-hidden>
      <div ref={bar} className="blog-progress h-full bg-[linear-gradient(90deg,var(--accent),#ffb27a)]" />
    </div>
  );
}
