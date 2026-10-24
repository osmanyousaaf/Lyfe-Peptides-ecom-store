"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

// Admin charts: hand-built SVG/HTML, one series per chart (no dual axes), thin 2px lines,
// recessive grid, crosshair tooltip on hover, and a table view for every trend.
// Palette (validated with the dataviz checker on #fff): series-1 #2a5aa8, series-2 #f26a12.

export type Fmt = "money" | "int" | "pct";
export const SERIES = { navy: "#2a5aa8", orange: "#f26a12" };

export function format(v: number, f: Fmt, compact = false): string {
  if (f === "money") {
    const d = v / 100;
    if (compact && Math.abs(d) >= 1000) return "$" + (d / 1000).toFixed(d >= 10000 ? 0 : 1) + "k";
    return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: compact ? 0 : 2 }).format(d);
  }
  if (f === "pct") return (v * 100).toFixed(v < 0.1 ? 2 : 1) + "%";
  if (compact && v >= 10000) return (v / 1000).toFixed(1) + "k";
  return Math.round(v).toLocaleString("en-CA");
}

const day = (k: string) => new Date(k + "T12:00:00").toLocaleDateString("en-CA", { month: "short", day: "numeric" });

/* ---------------- count-up number ---------------- */
export function AnimatedNumber({ value, f }: { value: number; f: Fmt }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setShown(value);
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 900);
      setShown(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className="num">{format(shown, f)}</span>;
}

/* ---------------- KPI tile ---------------- */
export function Kpi({
  label,
  value,
  f,
  change,
  series,
  color = SERIES.navy,
  hint,
}: {
  label: string;
  value: number;
  f: Fmt;
  change?: number | null;
  series?: { x: string; y: number }[];
  color?: string;
  hint?: string;
}) {
  const up = (change ?? 0) >= 0;
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#e4e8ef] bg-white p-5 shadow-[0_10px_30px_-24px_rgb(19_41_75/0.5)]">
      <p className="text-[0.8125rem] font-semibold text-[#5b6b82]">{label}</p>
      <p className="mt-2 text-[1.75rem] font-extrabold leading-none tracking-tight text-[#12233f]">
        <AnimatedNumber value={value} f={f} />
      </p>
      <div className="mt-3 flex items-center gap-2 text-xs">
        {change === undefined ? (
          <span className="text-[#8d99ab]">{hint}</span>
        ) : change === null ? (
          <span className="text-[#8d99ab]">New this period</span>
        ) : (
          <>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold ${up ? "bg-[#e7f6ec] text-[#1f7a3d]" : "bg-[#fdecec] text-[#b42318]"}`}>
              <span aria-hidden>{up ? "▲" : "▼"}</span>
              {Math.abs(change * 100).toFixed(1)}%
            </span>
            <span className="text-[#8d99ab]">vs previous period</span>
          </>
        )}
      </div>
      {series && series.length > 1 && <Sparkline data={series} color={color} />}
    </div>
  );
}

function Sparkline({ data, color }: { data: { x: string; y: number }[]; color: string }) {
  const id = useId();
  const max = Math.max(1, ...data.map((d) => d.y));
  const pts = data.map((d, i) => [(i / (data.length - 1)) * 100, 28 - (d.y / max) * 24] as const);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="absolute right-5 top-5 h-10 w-[34%] opacity-90" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.22" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L100 30 L0 30 Z`} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.6" vectorEffect="non-scaling-stroke" pathLength={1} className="admin-draw" />
    </svg>
  );
}

/* ---------------- trend chart (one series) ---------------- */
export function TrendChart({ title, data, f, color = SERIES.navy, height = 260, total: totalOverride, totalLabel = "in this period" }: { title: string; data: { x: string; y: number }[]; f: Fmt; color?: string; height?: number; total?: number; totalLabel?: string }) {
  const id = useId();
  const [view, setView] = useState<"chart" | "table">("chart");
  const [hover, setHover] = useState<number | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const W = 720;
  const H = height;
  const pad = { l: 56, r: 12, t: 12, b: 28 };
  const max = useMemo(() => {
    const m = Math.max(...data.map((d) => d.y), 0);
    if (m === 0) return 1;
    const mag = Math.pow(10, Math.floor(Math.log10(m)));
    return Math.ceil(m / mag) * mag;
  }, [data]);
  const x = (i: number) => pad.l + (data.length < 2 ? 0 : (i / (data.length - 1)) * (W - pad.l - pad.r));
  const y = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(d.y).toFixed(1)}`).join(" ");
  const ticks = [0, 0.5, 1].map((p) => p * max);
  const xLabels = data.length > 1 ? [0, Math.floor((data.length - 1) / 2), data.length - 1] : [0];
  const total = totalOverride ?? data.reduce((s, d) => s + d.y, 0);

  const onMove = (e: React.PointerEvent) => {
    const r = box.current!.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((px - pad.l) / (W - pad.l - pad.r)) * (data.length - 1));
    setHover(Math.max(0, Math.min(data.length - 1, i)));
  };

  return (
    <figure className="rounded-2xl border border-[#e4e8ef] bg-white p-5 sm:p-6">
      <figcaption className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-bold text-[#12233f]">{title}</p>
          <p className="mt-0.5 text-sm text-[#5b6b82]">
            <span className="num font-semibold text-[#12233f]">{format(total, f)}</span> {totalLabel}
          </p>
        </div>
        <div className="flex rounded-lg bg-[#f1f4f8] p-0.5 text-xs font-semibold" role="tablist" aria-label={`${title} view`}>
          {(["chart", "table"] as const).map((v) => (
            <button key={v} type="button" role="tab" aria-selected={view === v} onClick={() => setView(v)} className={`rounded-md px-3 py-1.5 capitalize ${view === v ? "bg-white text-[#12233f] shadow-sm" : "text-[#5b6b82]"}`}>
              {v}
            </button>
          ))}
        </div>
      </figcaption>

      {view === "chart" ? (
        <div ref={box} className="relative mt-4 touch-none" onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${title}: ${format(total, f)} total over ${data.length} days`}>
            <defs>
              <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={color} stopOpacity="0.18" />
                <stop offset="1" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
            {ticks.map((v) => (
              <g key={v}>
                <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke="#e8ecf2" />
                <text x={pad.l - 10} y={y(v) + 4} textAnchor="end" fill="#8d99ab" fontSize="11">{format(v, f, true)}</text>
              </g>
            ))}
            {xLabels.map((i) => (
              <text key={i} x={x(i)} y={H - 8} textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"} fill="#8d99ab" fontSize="11">
                {day(data[i].x)}
              </text>
            ))}
            <path d={`${line} L${x(data.length - 1)} ${y(0)} L${x(0)} ${y(0)} Z`} fill={`url(#${id})`} className="admin-fade" />
            <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" pathLength={1} className="admin-draw" />
            {hover !== null && (
              <g>
                <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} stroke="#12233f" strokeOpacity="0.25" strokeDasharray="3 3" />
                <circle cx={x(hover)} cy={y(data[hover].y)} r="5" fill={color} stroke="#fff" strokeWidth="2" />
              </g>
            )}
          </svg>
          {hover !== null && (
            <div
              className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-lg bg-[#12233f] px-3 py-2 text-xs text-white shadow-lg"
              style={{ left: `${(x(hover) / W) * 100}%` }}
            >
              <p className="text-white/70">{day(data[hover].x)}</p>
              <p className="num text-sm font-bold">{format(data[hover].y, f)}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 max-h-[300px] overflow-auto rounded-lg border border-[#e4e8ef]">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-[#f7f8fa] text-xs uppercase tracking-wider text-[#5b6b82]">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2 text-right">{title}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef1f5]">
              {[...data].reverse().map((d) => (
                <tr key={d.x}>
                  <td className="px-3 py-1.5 text-[#5b6b82]">{day(d.x)}</td>
                  <td className="num px-3 py-1.5 text-right font-semibold text-[#12233f]">{format(d.y, f)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </figure>
  );
}

/* ---------------- ranked bars (labels + values always visible) ---------------- */
export function BarList({ items, f, color = SERIES.navy, limit = 8, empty = "No data yet" }: { items: { label: string; value: number; sub?: string }[]; f: Fmt; color?: string; limit?: number; empty?: string }) {
  const [hover, setHover] = useState<string | null>(null);
  const shown = items.slice(0, limit);
  const rest = items.slice(limit).reduce((s, i) => s + i.value, 0);
  const rows = rest > 0 ? [...shown, { label: "Other", value: rest }] : shown;
  const max = Math.max(1, ...rows.map((r) => r.value));
  const total = items.reduce((s, i) => s + i.value, 0);
  if (!rows.length) return <p className="py-6 text-center text-sm text-[#8d99ab]">{empty}</p>;
  return (
    <ul className="space-y-2.5">
      {rows.map((r, i) => (
        <li key={r.label} onPointerEnter={() => setHover(r.label)} onPointerLeave={() => setHover(null)} className="group">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate font-semibold text-[#12233f]">{r.label}</span>
            <span className="num shrink-0 text-[#5b6b82]">
              <span className="font-bold text-[#12233f]">{format(r.value, f)}</span>
              {total > 0 && <span className="ml-1.5 text-xs">{((r.value / total) * 100).toFixed(0)}%</span>}
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#eef1f5]">
            <div
              className="admin-grow h-full rounded-full transition-opacity"
              style={{ width: `${(r.value / max) * 100}%`, background: r.label === "Other" ? "#aab4c3" : color, opacity: hover && hover !== r.label ? 0.45 : 1, animationDelay: `${i * 60}ms` }}
            />
          </div>
          {"sub" in r && r.sub && <p className="mt-1 text-xs text-[#8d99ab]">{r.sub}</p>}
        </li>
      ))}
    </ul>
  );
}

/* ---------------- conversion funnel ---------------- */
export function Funnel({ steps }: { steps: { label: string; value: number }[] }) {
  const top = Math.max(1, steps[0]?.value ?? 1);
  return (
    <ol className="space-y-3">
      {steps.map((s, i) => {
        const prev = i ? steps[i - 1].value : 0;
        const rate = i && prev ? s.value / prev : null;
        return (
          <li key={s.label}>
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-semibold text-[#12233f]">{s.label}</span>
              <span className="num">
                <span className="font-bold text-[#12233f]">{s.value.toLocaleString("en-CA")}</span>
                {rate !== null && <span className="ml-2 text-xs text-[#5b6b82]">{(rate * 100).toFixed(0)}% of previous step</span>}
              </span>
            </div>
            <div className="mt-1.5 h-7 overflow-hidden rounded-lg bg-[#eef1f5]">
              <div
                className="admin-grow h-full rounded-lg"
                style={{ width: `${Math.max(1.5, (s.value / top) * 100)}%`, background: `color-mix(in oklab, ${SERIES.navy} ${100 - i * 14}%, white)`, animationDelay: `${i * 90}ms` }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
