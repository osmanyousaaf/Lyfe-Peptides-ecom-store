"use client";

import { useSvgId } from "./useSvgId";

// Cold, dark, dry: the temperature drops to -20 °C, frost forms, and a UV sleeve shields the vial from light.
const FLAKES = [
  { x: 60, d: "0s", s: 1 },
  { x: 250, d: "-2.2s", s: 0.8 },
  { x: 300, d: "-4.1s", s: 1.1 },
  { x: 95, d: "-5.3s", s: 0.7 },
  { x: 440, d: "-1.4s", s: 0.9 },
  { x: 480, d: "-3.3s", s: 0.75 },
];

function Flake({ scale }: { scale: number }) {
  return (
    <g transform={`scale(${scale})`} stroke="#ffffff" strokeWidth="2" strokeLinecap="round">
      <path d="M0 -9 V9 M-7.8 -4.5 L7.8 4.5 M-7.8 4.5 L7.8 -4.5" />
      <path d="M-2.5 -7 L0 -4.5 L2.5 -7 M-2.5 7 L0 4.5 L2.5 7" strokeWidth="1.4" />
    </g>
  );
}

export default function StorageScene({ className = "" }: { className?: string }) {
  const id = useSvgId("store");
  return (
    <svg
      viewBox="0 0 520 320"
      className={`blog-anim ${className}`}
      role="img"
      aria-label="Animated storage scene: a peptide vial cools to minus 20 degrees Celsius, frosts over and is covered by a light-blocking sleeve"
    >
      <defs>
        <radialGradient id={`${id}-bg`} cx="0.35" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#f3f8ff" />
          <stop offset="1" stopColor="#d4e3f5" />
        </radialGradient>
        <linearGradient id={`${id}-glass`} x1="0" x2="1">
          <stop offset="0" stopColor="#dbe6f3" stopOpacity="0.9" />
          <stop offset="0.4" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#c3d2e4" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id={`${id}-cap`} x1="0" x2="1">
          <stop offset="0" stopColor="#4f1440" />
          <stop offset="0.5" stopColor="#a8418a" />
          <stop offset="1" stopColor="#5e1a4c" />
        </linearGradient>
        <linearGradient id={`${id}-sleeve`} x1="0" x2="1">
          <stop offset="0" stopColor="#a8560f" stopOpacity="0.75" />
          <stop offset="0.45" stopColor="#e39a3c" stopOpacity="0.5" />
          <stop offset="1" stopColor="#a8560f" stopOpacity="0.75" />
        </linearGradient>
        <linearGradient id={`${id}-ray`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffd88a" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffd88a" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-merc`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7cc0ff" />
          <stop offset="1" stopColor="#2d7fe0" />
        </linearGradient>
        <clipPath id={`${id}-panel`}>
          <rect x="10" y="10" width="500" height="300" rx="26" />
        </clipPath>
        <clipPath id={`${id}-read`}>
          <rect x="404" y="128" width="88" height="34" rx="6" />
        </clipPath>
      </defs>

      <rect x="10" y="10" width="500" height="300" rx="26" fill={`url(#${id}-bg)`} stroke="#d2deec" />

      <g clipPath={`url(#${id}-panel)`}>
        {/* light source and rays */}
        <g className="blog-store-rays">
          <path d="M40 30 L150 130 L120 150 Z" fill={`url(#${id}-ray)`} />
          <path d="M40 30 L190 110 L170 140 Z" fill={`url(#${id}-ray)`} opacity="0.7" />
          <path d="M40 30 L110 160 L80 170 Z" fill={`url(#${id}-ray)`} opacity="0.6" />
        </g>
        <circle cx="40" cy="30" r="16" fill="#ffd88a" />
        <circle cx="40" cy="30" r="26" fill="#ffd88a" opacity="0.3" />

        {FLAKES.map((f, i) => (
          <g key={i} transform={`translate(${f.x} 0)`}>
            <g className="blog-store-flake" style={{ animationDelay: f.d }}>
              <Flake scale={f.s} />
            </g>
          </g>
        ))}

        {/* vial */}
        <g className="blog-store-vial">
          <rect x="126" y="62" width="88" height="24" rx="6" fill={`url(#${id}-cap)`} />
          <rect x="122" y="84" width="96" height="16" rx="3" fill="#c4cad1" />
          <rect x="136" y="100" width="68" height="16" rx="4" fill={`url(#${id}-glass)`} stroke="#b4c3d6" />
          <rect x="114" y="114" width="112" height="168" rx="16" fill={`url(#${id}-glass)`} stroke="#b4c3d6" strokeWidth="1.5" />
          <path d="M116 258 q14 -6 28 -2 t28 -2 t28 2 t24 -1 V270 q0 10 -12 10 H128 q-12 0 -12 -10 Z" fill="#f7f2e7" />
          <rect x="120" y="150" width="100" height="70" rx="3" fill="#fff" stroke="#e1e7ef" />
          <text x="170" y="190" fontSize="22" fontWeight="800" fill="#13294b" textAnchor="middle" letterSpacing="2">
            LYFE
          </text>
          <text x="170" y="203" fontSize="6.5" fontWeight="700" fill="#5b6b82" textAnchor="middle" letterSpacing="3">
            PEPTIDES
          </text>
          <rect x="122" y="122" width="6" height="150" rx="3" fill="#fff" opacity="0.6" />
          <g className="blog-store-frost">
            <rect x="114" y="114" width="112" height="168" rx="16" fill="#ffffff" opacity="0.55" />
            <circle cx="140" cy="132" r="6" fill="#fff" />
            <circle cx="200" cy="240" r="8" fill="#fff" opacity="0.8" />
            <circle cx="186" cy="128" r="4" fill="#fff" />
            <circle cx="132" cy="262" r="5" fill="#fff" />
          </g>
        </g>

        {/* UV-blocking sleeve */}
        <g className="blog-store-sleeve">
          <rect x="106" y="106" width="128" height="184" rx="20" fill={`url(#${id}-sleeve)`} stroke="#a8560f" strokeOpacity="0.5" />
          <rect x="114" y="112" width="10" height="170" rx="5" fill="#fff" opacity="0.35" />
          <g transform="translate(206 128)">
            <circle r="13" fill="#fff" opacity="0.92" />
            <text y="4" fontSize="10" fontWeight="800" fill="#a8560f" textAnchor="middle">
              UV
            </text>
            <path d="M-9 9 L9 -9" stroke="#a8560f" strokeWidth="2" />
          </g>
        </g>

        {/* desiccant */}
        <g className="blog-store-dry">
          <rect x="246" y="250" width="58" height="36" rx="6" fill="#fff" stroke="#c9d3e0" />
          <path d="M246 258 H304 M246 278 H304" stroke="#c9d3e0" strokeDasharray="3 3" />
          <text x="275" y="272" fontSize="9" fontWeight="800" fill="#13294b" textAnchor="middle" letterSpacing="1.5">
            DRY
          </text>
        </g>

        {/* thermometer */}
        <rect x="340" y="56" width="20" height="196" rx="10" fill="#fff" stroke="#c9d3e0" strokeWidth="1.5" />
        <circle cx="350" cy="256" r="19" fill="#fff" stroke="#c9d3e0" strokeWidth="1.5" />
        <circle cx="350" cy="256" r="13" fill={`url(#${id}-merc)`} />
        <rect className="blog-store-merc" x="345" y="66" width="10" height="190" rx="5" fill={`url(#${id}-merc)`} />
        <g fontSize="9" fontWeight="700" fill="#5b6b82">
          {[
            ["22°", 80],
            ["4°", 141],
            ["-20°", 223],
          ].map(([t, y]) => (
            <g key={t}>
              <path d={`M360 ${y} h8`} stroke="#9aa6b4" strokeWidth="1.5" />
              <text x="372" y={Number(y) + 3}>{t}</text>
            </g>
          ))}
        </g>

        {/* readout */}
        <rect x="400" y="124" width="96" height="42" rx="10" fill="#13294b" />
        <g clipPath={`url(#${id}-read)`}>
          <g className="blog-store-read" fontSize="18" fontWeight="800" fill="#fff" textAnchor="middle">
            <text x="448" y="152">22 °C</text>
            <text x="448" y="182">4 °C</text>
            <text x="448" y="212">−20 °C</text>
          </g>
        </g>
        <text x="448" y="184" fontSize="8" fontWeight="800" fill="#5b6b82" textAnchor="middle" letterSpacing="1.6">
          LONG-TERM
        </text>
      </g>
    </svg>
  );
}
