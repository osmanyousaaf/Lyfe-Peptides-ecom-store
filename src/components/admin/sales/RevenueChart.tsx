"use client";

import { useEffect, useRef, useState } from "react";
import { formatPrice } from "@/lib/format";

export type ChartPoint = { day: string; revenueCents: number; orders: number };

// series hue: validated against the white surface (lightness band + 3:1 contrast)
const BAR = "#e05a12";
const BAR_HOVER = "#b9450d";
const GRID = "#e1e7ef";

const H = 240;
const PAD = { top: 12, right: 8, bottom: 26, left: 48 };

// $0 / $500 / $1.2K style ticks
function compact(cents: number): string {
  const d = cents / 100;
  if (d >= 1000) return `$${(d / 1000).toFixed(d >= 10000 ? 0 : 1).replace(/\.0$/, "")}K`;
  return `$${Math.round(d)}`;
}

// a clean axis top: 1, 2, 2.5 or 5 × 10^n dollars
function niceMax(cents: number): number {
  const d = Math.max(cents / 100, 100);
  const pow = 10 ** Math.floor(Math.log10(d));
  const step = [1, 2, 2.5, 5, 10].find((m) => m * pow >= d)! * pow;
  return step * 100;
}

const dayLabel = (iso: string, long = false) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-CA", { month: "short", day: "numeric", ...(long ? { weekday: "short" } : {}) });

// column with a 4px rounded data-end, square at the baseline
function column(x: number, y: number, w: number, h: number): string {
  const r = Math.min(4, w / 2, h);
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}

export default function RevenueChart({ data }: { data: ChartPoint[] }) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(720);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const total = data.reduce((n, d) => n + d.revenueCents, 0);
  const max = niceMax(Math.max(...data.map((d) => d.revenueCents), 0));
  const plotW = width - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const slot = plotW / data.length;
  const barW = Math.max(2, Math.min(24, slot - 2));
  const y = (c: number) => PAD.top + plotH - (c / max) * plotH;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((k) => k * max);
  // a handful of date labels, always including the first and last day
  const every = Math.max(1, Math.ceil(data.length / Math.max(2, Math.floor(plotW / 70))));
  const peak = data.reduce((best, d, i) => (d.revenueCents > data[best].revenueCents ? i : best), 0);
  const h = hover != null ? data[hover] : null;

  return (
    <div>
      <div ref={box} className="relative" onPointerLeave={() => setHover(null)}>
        <svg width={width} height={H} role="img" aria-label={`Revenue per day, ${formatPrice(total)} in total`} className="block">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth={1} />
              <text x={PAD.left - 8} y={y(t)} dy="0.35em" textAnchor="end" className="num fill-[var(--faint)] text-[11px]">
                {compact(t)}
              </text>
            </g>
          ))}
          {data.map((d, i) => {
            const x = PAD.left + i * slot + (slot - barW) / 2;
            const hgt = (d.revenueCents / max) * plotH;
            return (
              <g key={d.day}>
                {hgt > 0 && <path d={column(x, y(d.revenueCents), barW, hgt)} fill={hover === i ? BAR_HOVER : BAR} />}
                {/* the whole slot is the hit target, not just the painted bar */}
                <rect
                  x={PAD.left + i * slot}
                  y={PAD.top}
                  width={slot}
                  height={plotH}
                  fill="transparent"
                  tabIndex={0}
                  role="button"
                  aria-label={`${dayLabel(d.day, true)}: ${formatPrice(d.revenueCents)} from ${d.orders} order${d.orders === 1 ? "" : "s"}`}
                  onPointerEnter={() => setHover(i)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  className="cursor-default outline-none"
                />
                {i % every === 0 || i === data.length - 1 ? (
                  <text x={PAD.left + i * slot + slot / 2} y={H - 8} textAnchor="middle" className="fill-[var(--faint)] text-[11px]">
                    {dayLabel(d.day)}
                  </text>
                ) : null}
              </g>
            );
          })}
          {/* label the best day only */}
          {total > 0 && hover == null && (
            <text
              x={PAD.left + peak * slot + slot / 2}
              y={y(data[peak].revenueCents) - 6}
              textAnchor={peak > data.length * 0.85 ? "end" : peak < data.length * 0.15 ? "start" : "middle"}
              className="num fill-[var(--ink)] text-[11px] font-bold"
            >
              {formatPrice(data[peak].revenueCents)}
            </text>
          )}
          <line x1={PAD.left} x2={width - PAD.right} y1={PAD.top + plotH} y2={PAD.top + plotH} stroke="#c9d3e0" strokeWidth={1} />
        </svg>

        {total === 0 && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center pb-6">
            <p className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-muted shadow-sm ring-1 ring-line">
              No sales in this period yet
            </p>
          </div>
        )}

        {h && hover != null && (
          <div
            className="pointer-events-none absolute z-10 min-w-[140px] -translate-x-1/2 rounded-xl bg-white px-3 py-2 shadow-[0_12px_30px_-12px_rgb(19_41_75/0.45)] ring-1 ring-line"
            style={{
              left: Math.min(Math.max(PAD.left + hover * slot + slot / 2, 80), width - 80),
              top: Math.max(0, y(h.revenueCents) - 70),
            }}
            role="status"
          >
            <p className="num text-base font-extrabold text-navy">{formatPrice(h.revenueCents)}</p>
            <p className="text-xs text-muted">
              {dayLabel(h.day, true)} · {h.orders} order{h.orders === 1 ? "" : "s"}
            </p>
          </div>
        )}
      </div>

      <details className="mt-2">
        <summary className="cursor-pointer text-xs font-semibold text-muted hover:text-navy">View as table</summary>
        <div className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-line">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-surface">
              <tr className="text-left text-xs uppercase tracking-wider text-faint">
                <th className="px-3 py-2 font-bold">Day</th>
                <th className="px-3 py-2 text-right font-bold">Orders</th>
                <th className="px-3 py-2 text-right font-bold">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.day} className="border-t border-line">
                  <td className="px-3 py-1.5">{dayLabel(d.day, true)}</td>
                  <td className="num px-3 py-1.5 text-right">{d.orders}</td>
                  <td className="num px-3 py-1.5 text-right">{formatPrice(d.revenueCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
