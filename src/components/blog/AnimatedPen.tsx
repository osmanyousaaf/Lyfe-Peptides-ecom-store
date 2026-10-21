"use client";

import { useSvgId } from "./useSvgId";

// The Lyfe dual chamber pen: the dial twists, the plunger drives the diluent through the bypass
// into the powder chamber, the contents swirl together, and the dose window ticks over.
export default function AnimatedPen({ className = "" }: { className?: string }) {
  const id = useSvgId("pen");
  return (
    <svg
      viewBox="0 0 560 220"
      className={`blog-anim ${className}`}
      role="img"
      aria-label="Animated Lyfe dual chamber pen: twisting the dial moves the water chamber into the powder chamber and mixes them"
    >
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor="#f3f6fa" />
          <stop offset="1" stopColor="#cfd8e3" />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="0.5" stopColor="#e7f0fa" stopOpacity="0.55" />
          <stop offset="1" stopColor="#c6d5e6" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id={`${id}-water`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cfe7ff" />
          <stop offset="1" stopColor="#7fb6ea" />
        </linearGradient>
        <linearGradient id={`${id}-knob`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#b9c4d1" />
        </linearGradient>
        <linearGradient id={`${id}-logo`} x1="0" x2="1">
          <stop offset="0" stopColor="#1f7fc4" />
          <stop offset="0.5" stopColor="#2f9a4a" />
          <stop offset="1" stopColor="#5bb84a" />
        </linearGradient>
        <radialGradient id={`${id}-shadow`}>
          <stop offset="0" stopColor="#13294b" stopOpacity="0.22" />
          <stop offset="1" stopColor="#13294b" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${id}-cart`}>
          <rect x="46" y="78" width="184" height="44" rx="6" />
        </clipPath>
        <clipPath id={`${id}-knobclip`}>
          <rect x="498" y="76" width="34" height="48" rx="8" />
        </clipPath>
        <clipPath id={`${id}-window`}>
          <rect x="428" y="88" width="32" height="24" rx="5" />
        </clipPath>
      </defs>

      <ellipse cx="290" cy="166" rx="255" ry="10" fill={`url(#${id}-shadow)`} />

      <g className="blog-pen-float">
        {/* threaded tip */}
        <rect x="20" y="89" width="24" height="22" rx="4" fill="#d9e0e8" stroke="#aeb9c6" />
        <path d="M26 89 v22 M32 89 v22 M38 89 v22" stroke="#aeb9c6" />

        {/* cartridge */}
        <rect x="40" y="72" width="196" height="56" rx="10" fill={`url(#${id}-glass)`} stroke="#b4c3d6" strokeWidth="1.5" />
        <path d="M126 72.5 q16 -12 32 0" fill={`url(#${id}-glass)`} stroke="#b4c3d6" strokeWidth="1.5" />

        <g clipPath={`url(#${id}-cart)`}>
          <g className="blog-pen-powder">
            <rect x="52" y="96" width="74" height="24" rx="6" fill="#f7f2e7" stroke="#e6dcc8" />
            <circle cx="70" cy="108" r="1.4" fill="#e1d3b8" />
            <circle cx="96" cy="112" r="1.2" fill="#e1d3b8" />
            <circle cx="112" cy="104" r="1.4" fill="#e1d3b8" />
          </g>
          <rect className="blog-pen-mix" x="46" y="78" width="88" height="44" fill={`url(#${id}-water)`} />
          <g className="blog-pen-swirl">
            <path d="M74 100 a15 10 0 1 1 30 0" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity="0.85" />
            <path d="M104 100 a15 10 0 1 1 -30 0" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.55" />
          </g>
          <rect className="blog-pen-water" x="148" y="78" width="66" height="44" fill={`url(#${id}-water)`} />
          <g className="blog-pen-mid">
            <rect x="132" y="78" width="16" height="44" rx="3" fill="#3a4350" />
            <path d="M136 80 v40 M140 80 v40 M144 80 v40" stroke="#59636f" strokeWidth="1.4" />
          </g>
          <g className="blog-pen-plunger">
            <rect x="214" y="78" width="16" height="44" rx="3" fill="#2a313b" />
            <path d="M218 80 v40 M222 80 v40 M226 80 v40" stroke="#4b5561" strokeWidth="1.4" />
          </g>
          <rect x="46" y="80" width="184" height="6" rx="3" fill="#fff" opacity="0.65" />
        </g>

        {/* body */}
        <rect x="232" y="66" width="268" height="68" rx="16" fill={`url(#${id}-body)`} stroke="#cdd6e1" />
        <rect x="232" y="66" width="14" height="68" rx="5" fill="#e6ebf1" stroke="#cdd6e1" />
        <rect x="252" y="72" width="236" height="8" rx="4" fill="#fff" opacity="0.8" />
        <path d="M300 116 q8 -22 26 -24" fill="none" stroke="#1f7fc4" strokeWidth="5" strokeLinecap="round" />
        <circle cx="300" cy="90" r="4.5" fill="#2f9a4a" />
        <text x="316" y="113" fontSize="28" fontWeight="800" fill={`url(#${id}-logo)`} letterSpacing="2">
          LYFE
        </text>
        <text x="317" y="126" fontSize="7.5" fontWeight="700" fill="#8d99ab" letterSpacing="2.6">
          DUAL CHAMBER
        </text>

        {/* dose window */}
        <rect x="424" y="84" width="40" height="32" rx="8" fill="#1b2431" />
        <g clipPath={`url(#${id}-window)`}>
          <g className="blog-pen-dose" fontSize="13" fontWeight="800" fill="#fff" textAnchor="middle">
            <text x="444" y="105">0</text>
            <text x="444" y="129">10</text>
            <text x="444" y="153">20</text>
            <text x="444" y="177">30</text>
            <text x="444" y="201">40</text>
          </g>
        </g>
        <rect x="428" y="89" width="32" height="5" rx="2.5" fill="#fff" opacity="0.18" />

        {/* dial */}
        <rect x="496" y="74" width="38" height="52" rx="9" fill={`url(#${id}-knob)`} stroke="#aeb9c6" />
        <g clipPath={`url(#${id}-knobclip)`}>
          <g className="blog-pen-ridges" stroke="#9aa6b4" strokeWidth="1.6">
            {Array.from({ length: 16 }, (_, i) => (
              <path key={i} d={`M498 ${70 + i * 6} H532`} />
            ))}
          </g>
        </g>
        <rect x="532" y="86" width="8" height="28" rx="3" fill="#1aa6a0" />

        {/* twist hint */}
        <g className="blog-pen-hint">
          <path d="M490 60 A 28 16 0 0 1 544 60" fill="none" stroke="#f26a21" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M538 50 l7 10 -11 3" fill="none" stroke="#f26a21" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <text x="516" y="40" fontSize="11" fontWeight="800" fill="#f26a21" textAnchor="middle" letterSpacing="1.6">
            TWIST
          </text>
        </g>

        <g fontSize="9" fontWeight="700" fill="#5b6b82" textAnchor="middle" letterSpacing="1.4">
          <text x="89" y="146">POWDER</text>
          <text x="181" y="146">DILUENT</text>
        </g>
      </g>

      {/* steps */}
      <g fontSize="11" fontWeight="800" textAnchor="middle" letterSpacing="1">
        {["SEALED", "TWIST", "MIXED"].map((s, i) => (
          <g key={s} className={`blog-pen-step blog-pen-step-${i + 1}`}>
            <rect x={150 + i * 100} y="182" width="84" height="26" rx="13" />
            <text x={192 + i * 100} y="199">{`${i + 1}  ${s}`}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}
