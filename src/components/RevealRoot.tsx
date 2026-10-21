"use client";

import { useEffect } from "react";

// Counts a [data-count] element up from zero to its target once it is revealed.
function countUp(el: HTMLElement) {
  const target = Number(el.dataset.count);
  if (!Number.isFinite(target) || el.dataset.counted) return;
  el.dataset.counted = "1";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.textContent = String(target);
    return;
  }
  const start = performance.now();
  const dur = 1400;
  const tick = (t: number) => {
    const k = Math.min(1, (t - start) / dur);
    el.textContent = String(Math.round(target * (1 - Math.pow(1 - k, 3))));
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function revealed(el: Element) {
  el.classList.add("in");
  if (el instanceof HTMLElement && el.dataset.count) countUp(el);
  el.querySelectorAll<HTMLElement>("[data-count]").forEach(countUp);
}

// Reveals [data-reveal] elements as they enter the viewport, including ones
// rendered after load (client navigation, streamed segments, filtered lists).
// Also drives [data-tilt] hover tilt and [data-parallax] pointer layers.
export default function RevealRoot() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll("[data-reveal]").forEach(revealed);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            revealed(e.target);
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 }
    );
    const watch = (root: ParentNode) =>
      root.querySelectorAll<HTMLElement>("[data-reveal]:not(.in)").forEach((el) => io.observe(el));

    watch(document);
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        r.addedNodes.forEach((n) => {
          if (!(n instanceof HTMLElement)) return;
          if (n.matches("[data-reveal]:not(.in)")) io.observe(n);
          watch(n);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    // pointer effects only for a real mouse, and never with reduced motion
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let tilted: HTMLElement | null = null;
    const onMove = (e: PointerEvent) => {
      const target = e.target instanceof Element ? e.target : null;
      const tilt = target?.closest<HTMLElement>("[data-tilt]") ?? null;
      if (tilted && tilted !== tilt) {
        tilted.style.removeProperty("--rx");
        tilted.style.removeProperty("--ry");
      }
      tilted = tilt;
      if (tilt) {
        const r = tilt.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        const max = Number(tilt.dataset.tilt) || 6;
        tilt.style.setProperty("--rx", `${(-y * max).toFixed(2)}deg`);
        tilt.style.setProperty("--ry", `${(x * max).toFixed(2)}deg`);
      }
      const par = target?.closest<HTMLElement>("[data-parallax]");
      if (par) {
        const r = par.getBoundingClientRect();
        par.style.setProperty("--px", (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
        par.style.setProperty("--py", (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
      }
    };
    const onLeave = () => {
      tilted?.style.removeProperty("--rx");
      tilted?.style.removeProperty("--ry");
      tilted = null;
    };
    if (fine && !calm) {
      document.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerleave", onLeave);
    }

    return () => {
      mo.disconnect();
      io.disconnect();
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return null;
}
