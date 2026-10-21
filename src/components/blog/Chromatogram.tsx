"use client";

import { useSvgId } from "./useSvgId";

// An HPLC trace that draws itself: one dominant peak for the target peptide, a few small impurities.
const X0 = 50;
const X1 = 490;
const BASE = 250;
const MINUTES = 30;
const PEAKS = [
  { t: 4.3, h: 7, w: 0.22 },
  { t: 8.7, h: 11, w: 0.28 },
  { t: 13.4, h: 188, w: 0.3 },
  { t: 15.2, h: 8, w: 0.22 },
  { t: 21.6, h: 5, w: 0.32 },
];
const xOf = (t: number) => X0 + (t / MINUTES) * (X1 - X0);

function trace(): string {
  const pts: string[] = [];
  for (let t = 0; t <= MINUTES + 1e-9; t += 0.05) {
    const noise = Math.sin(t * 9.1) * 0.6 + Math.sin(t * 23.7) * 0.35;
    const y = BASE - 2 - noise - PEAKS.reduce((s, p) => s + p.h * Math.exp(-((t - p.t) ** 2) / (2 * p.w ** 2)), 0);
    pts.push(`${xOf(t).toFixed(1)} ${y.toFixed(1)}`);
  }
  return `M${pts.join(" L")}`;
}
const LINE = trace();
const AREA = `${LINE} L${X1} ${BASE} L${X0} ${BASE} Z`;
const MAIN = PEAKS[2];

export default function Chromatogram({ className = "", purity = "99.4%" }: { className?: string; purity?: string }) {
  const id = useSvgId("hplc");
  const mx = xOf(MAIN.t);
  const my = BASE - 2 - MAIN.h;
  return (
    <svg
      viewBox="0 0 520 300"
      className={`blog-anim ${className}`}
      role="img"
      aria-label={`Animated HPLC chromatogram with a single main peak at ${purity} purity and small impurity peaks`}
    >
      <defs>
        <linearGradient id={`${id}-area`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f26a21" stopOpacity="0.35" />
          <stop offset="1" stopColor="#f26a21" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-line`} x1="0" x2="1">
          <stop offset="0" stopColor="#13294b" />
          <stop offset="0.45" stopColor="#f26a21" />
          <stop offset="1" stopColor="#13294b" />
        </linearGradient>
      </defs>

      <rect x="0.5" y="0.5" width="519" height="299" rx="18" fill="#fff" stroke="#e1e7ef" />

      {/* grid and axes */}
      <g stroke="#e8edf4" strokeDasharray="3 5">
        {[50, 100, 150, 200].map((y) => (
          <path key={y} d={`M${X0} ${y} H${X1}`} />
        ))}
      </g>
      <path d={`M${X0} 36 V${BASE} H${X1}`} fill="none" stroke="#b9c5d4" strokeWidth="1.4" />
      <g fontSize="10" fill="#8d99ab" textAnchor="middle">
        {[0, 5, 10, 15, 20, 25, 30].map((t) => (
          <g key={t}>
            <path d={`M${xOf(t)} ${BASE} v5`} stroke="#b9c5d4" />
            <text x={xOf(t)} y={BASE + 18}>{t}</text>
          </g>
        ))}
        <text x={X1 - 10} y={BASE + 36} textAnchor="end" fontWeight="700" letterSpacing="1">
          RETENTION TIME (MIN)
        </text>
        <text x="22" y="143" transform="rotate(-90 22 143)" fontWeight="700" letterSpacing="1">
          mAU · 214 nm
        </text>
      </g>

      <path className="blog-hplc-area" d={AREA} fill={`url(#${id}-area)`} />
      <path
        className="blog-hplc-trace"
        d={LINE}
        pathLength={1}
        fill="none"
        stroke={`url(#${id}-line)`}
        strokeWidth="2.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      <g className="blog-hplc-head">
        <path d={`M${X0} 36 V${BASE}`} stroke="#f26a21" strokeWidth="1.5" strokeDasharray="2 4" />
        <circle cx={X0} cy={BASE} r="4" fill="#f26a21" />
      </g>

      {/* labels */}
      <g className="blog-hplc-labels">
        <path d={`M${mx} ${my - 4} V24`} stroke="#13294b" strokeDasharray="2 3" />
        <g className="blog-hplc-pill">
          <rect x={mx + 10} y="12" width="132" height="30" rx="15" fill="#13294b" />
          <circle cx={mx + 27} cy="27" r="5" fill="#2f9a4a" />
          <text x={mx + 38} y="31.5" fontSize="12" fontWeight="800" fill="#fff">
            Main peak {purity}
          </text>
        </g>
        <g fontSize="9" fontWeight="700" fill="#5b6b82" textAnchor="middle">
          <text x={xOf(PEAKS[0].t)} y={BASE - PEAKS[0].h - 10}>0.2%</text>
          <text x={xOf(PEAKS[1].t)} y={BASE - PEAKS[1].h - 10}>0.2%</text>
          <text x={xOf(PEAKS[3].t) + 8} y={BASE - PEAKS[3].h - 10}>0.1%</text>
          <text x={xOf(PEAKS[4].t)} y={BASE - PEAKS[4].h - 10}>0.1%</text>
        </g>
      </g>
    </svg>
  );
}
