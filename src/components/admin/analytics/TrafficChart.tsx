"use client";

import { useEffect, useRef, useState } from "react";
import type { TrafficPoint } from "@/lib/analytics";

// one series at a time (visitors or page views), so a single axis and no legend box
const LINE = "var(--accent)"; // orange series, 3:1 against the white card
const GRID = "var(--line)";
const AXIS = "#c9d3e0";
const H = 260;
const PAD = { top: 16, right: 12, bottom: 28, left: 40 };

function niceMax(v: number): number {
  const d = Math.max(v, 4);
  const pow = 10 ** Math.floor(Math.log10(d));
  return [1, 2, 2.5, 5, 10].find((m) => m * pow >= d)! * pow;
}

export default function TrafficChart({ data, hourly }: { data: TrafficPoint[]; hourly: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(760);
  const [metric, setMetric] = useState<"visitors" | "views">("visitors");
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const values = data.map((d) => d[metric]);
  const total = values.reduce((a, b) => a + b, 0);
  const max = niceMax(Math.max(...values, 0));
  const plotW = width - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const step = data.length > 1 ? plotW / (data.length - 1) : plotW;
  const x = (i: number) => PAD.left + i * step;
  const y = (v: number) => PAD.top + plotH - (v / max) * plotH;
  const line = values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const area = `${line}L${x(values.length - 1).toFixed(1)},${PAD.top + plotH}L${PAD.left},${PAD.top + plotH}Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((k) => Math.round(k * max));
  const every = Math.max(1, Math.ceil(data.length / Math.max(2, Math.floor(plotW / 64))));
  const peak = values.reduce((best, v, i) => (v > values[best] ? i : best), 0);
  const noun = metric === "visitors" ? "visitor" : "page view";

  // nearest point to the pointer: the whole plot is the hit target
  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const i = Math.round((e.clientX - r.left) / step);
    setHover(Math.min(data.length - 1, Math.max(0, i)));
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl bg-surface p-1 ring-1 ring-line" role="group" aria-label="Metric">
          {(["visitors", "views"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMetric(m)}
              aria-pressed={metric === m}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition ${metric === m ? "bg-navy text-white" : "text-muted hover:text-navy"}`}
            >
              {m === "visitors" ? "Visitors" : "Page views"}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted">
          <span className="num font-bold text-navy">{total.toLocaleString("en-CA")}</span> {noun}
          {total === 1 ? "" : "s"} {hourly ? "in the last 24 hours" : "in this period"}
          {metric === "visitors" && !hourly && <span className="text-faint"> (daily uniques, summed)</span>}
        </p>
      </div>

      <div ref={box} className="relative" onPointerLeave={() => setHover(null)}>
        <svg width={width} height={H} role="img" aria-label={`${noun}s over time, ${total} in total`} className="block">
          <defs>
            <linearGradient id="traffic-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={LINE} stopOpacity="0.22" />
              <stop offset="1" stopColor={LINE} stopOpacity="0" />
            </linearGradient>
          </defs>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth={1} />
              <text x={PAD.left - 8} y={y(t)} dy="0.35em" textAnchor="end" className="num fill-[var(--faint)] text-[11px]">
                {t}
              </text>
            </g>
          ))}
          {total > 0 && (
            <>
              <path d={area} fill="url(#traffic-fill)" className="late" />
              <path d={line} fill="none" stroke={LINE} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            </>
          )}
          <line x1={PAD.left} x2={width - PAD.right} y1={PAD.top + plotH} y2={PAD.top + plotH} stroke={AXIS} />
          {data.map((d, i) =>
            i % every === 0 || i === data.length - 1 ? (
              <text key={d.key} x={x(i)} y={H - 8} textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"} className="fill-[var(--faint)] text-[11px]">
                {d.label}
              </text>
            ) : null
          )}
          {/* one direct label: the busiest point */}
          {total > 0 && hover == null && values[peak] > 0 && (
            <g>
              <circle cx={x(peak)} cy={y(values[peak])} r={4.5} fill={LINE} stroke="#fff" strokeWidth={2} />
              <text
                x={x(peak)}
                y={y(values[peak]) - 10}
                textAnchor={peak > data.length * 0.85 ? "end" : peak < data.length * 0.15 ? "start" : "middle"}
                className="num fill-[var(--ink)] text-[11px] font-bold"
              >
                {values[peak]} at {data[peak].label}
              </text>
            </g>
          )}
          {hover != null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + plotH} stroke="var(--navy)" strokeOpacity={0.25} strokeWidth={1} />
              <circle cx={x(hover)} cy={y(values[hover])} r={5} fill={LINE} stroke="#fff" strokeWidth={2} />
            </g>
          )}
          <rect
            x={PAD.left - step / 2}
            y={PAD.top}
            width={plotW + step}
            height={plotH}
            fill="transparent"
            onPointerMove={onMove}
            onPointerDown={onMove}
            className="cursor-crosshair"
          />
        </svg>

        {total === 0 && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center pb-6">
            <p className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-muted shadow-sm ring-1 ring-line">
              No visits recorded in this period yet
            </p>
          </div>
        )}

        {hover != null && (
          <div
            className="pointer-events-none absolute z-10 min-w-[150px] -translate-x-1/2 rounded-xl bg-white px-3 py-2 shadow-[0_12px_30px_-12px_rgb(19_41_75/0.45)] ring-1 ring-line"
            style={{ left: Math.min(Math.max(x(hover), 84), width - 84), top: Math.max(0, y(values[hover]) - 78) }}
            role="status"
          >
            <p className="text-xs font-semibold text-muted">{data[hover].label}</p>
            <p className="num text-sm text-navy">
              <span className="font-extrabold">{data[hover].visitors}</span> visitors ·{" "}
              <span className="font-extrabold">{data[hover].views}</span> views
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
                <th className="px-3 py-2 font-bold">{hourly ? "Hour" : "Day"}</th>
                <th className="px-3 py-2 text-right font-bold">Visitors</th>
                <th className="px-3 py-2 text-right font-bold">Page views</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.key} className="border-t border-line">
                  <td className="px-3 py-1.5">{d.label}</td>
                  <td className="num px-3 py-1.5 text-right">{d.visitors}</td>
                  <td className="num px-3 py-1.5 text-right">{d.views}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
