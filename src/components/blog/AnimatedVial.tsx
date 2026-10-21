"use client";

import { useSvgId } from "./useSvgId";

// A Lyfe vial being reconstituted: diluent rises, the lyophilized cake dissolves, the vial swirls.
export default function AnimatedVial({ className = "", label = "10 mg" }: { className?: string; label?: string }) {
  const id = useSvgId("vial");
  return (
    <svg
      viewBox="0 0 200 320"
      className={`blog-anim ${className}`}
      role="img"
      aria-label="Animated Lyfe research vial: diluent fills the vial and the lyophilized powder dissolves"
    >
      <defs>
        <linearGradient id={`${id}-glass`} x1="0" x2="1">
          <stop offset="0" stopColor="#dbe6f3" stopOpacity="0.75" />
          <stop offset="0.35" stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="0.7" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="1" stopColor="#c3d2e4" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id={`${id}-cap`} x1="0" x2="1">
          <stop offset="0" stopColor="#4f1440" />
          <stop offset="0.42" stopColor="#9a3478" />
          <stop offset="0.55" stopColor="#b54f92" />
          <stop offset="1" stopColor="#5e1a4c" />
        </linearGradient>
        <linearGradient id={`${id}-metal`} x1="0" x2="1">
          <stop offset="0" stopColor="#8d96a1" />
          <stop offset="0.38" stopColor="#f1f4f7" />
          <stop offset="0.62" stopColor="#c4cad1" />
          <stop offset="1" stopColor="#7f8893" />
        </linearGradient>
        <linearGradient id={`${id}-liquid`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d7ecff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#8fc0ee" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id={`${id}-sweep`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${id}-shadow`}>
          <stop offset="0" stopColor="#13294b" stopOpacity="0.28" />
          <stop offset="1" stopColor="#13294b" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${id}-body`}>
          <rect x="40" y="92" width="120" height="198" rx="16" />
        </clipPath>
      </defs>

      <ellipse className="blog-vial-shadow" cx="100" cy="300" rx="70" ry="9" fill={`url(#${id}-shadow)`} />

      <g className="blog-vial-bob">
        <g className="blog-vial-swirl">
          <rect x="40" y="92" width="120" height="198" rx="16" fill={`url(#${id}-glass)`} stroke="#b4c3d6" strokeWidth="1.5" />

          <g clipPath={`url(#${id}-body)`}>
            <g className="blog-vial-powder">
              <path
                d="M40 264 q12 -7 26 -3 t28 -2 t28 2 t38 -2 V292 H40 Z"
                fill="#f7f2e7"
                stroke="#e6dcc8"
                strokeWidth="1"
              />
              <circle cx="62" cy="276" r="1.4" fill="#e3d6bd" />
              <circle cx="92" cy="281" r="1.2" fill="#e3d6bd" />
              <circle cx="122" cy="274" r="1.5" fill="#e3d6bd" />
              <circle cx="141" cy="283" r="1.1" fill="#e3d6bd" />
            </g>

            <g className="blog-vial-liquid">
              <rect x="36" y="134" width="128" height="170" fill={`url(#${id}-liquid)`} />
              <path
                className="blog-vial-wave"
                d="M0 134 q10 -6 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 V146 H0 Z"
                fill="#e8f4ff"
                opacity="0.9"
              />
              <circle className="blog-vial-bubble" cx="70" cy="286" r="3" fill="#fff" opacity="0.8" />
              <circle className="blog-vial-bubble blog-d2" cx="104" cy="290" r="2" fill="#fff" opacity="0.8" />
              <circle className="blog-vial-bubble blog-d3" cx="132" cy="284" r="2.6" fill="#fff" opacity="0.8" />
              <circle className="blog-vial-bubble blog-d4" cx="88" cy="292" r="1.6" fill="#fff" opacity="0.8" />
            </g>

            <g className="blog-vial-sweep">
              <rect x="-40" y="80" width="36" height="230" fill={`url(#${id}-sweep)`} transform="skewX(-14)" />
            </g>
          </g>

          {/* glass highlights */}
          <rect x="49" y="100" width="7" height="180" rx="3.5" fill="#fff" opacity="0.55" />
          <rect x="146" y="104" width="3" height="170" rx="1.5" fill="#fff" opacity="0.35" />

          {/* label, after the real Lyfe vials */}
          <rect x="46" y="142" width="108" height="88" rx="3" fill="#fff" stroke="#e1e7ef" />
          <text x="53" y="158" fontSize="9" fontWeight="700" fill="#13294b">{label}</text>
          <rect x="94" y="150" width="54" height="11" fill="#111827" />
          <text x="121" y="158.5" fontSize="6.4" fontWeight="700" fill="#fff" textAnchor="middle" letterSpacing="0.6">
            MULTI-DOSE
          </text>
          <text x="100" y="190" fontSize="27" fontWeight="800" fill="#13294b" textAnchor="middle" letterSpacing="2.5">
            LYFE
          </text>
          <text x="100" y="201" fontSize="6.6" fontWeight="700" fill="#5b6b82" textAnchor="middle" letterSpacing="3.2">
            PEPTIDES
          </text>
          <rect x="53" y="209" width="80" height="2.4" rx="1.2" fill="#c9d3e0" />
          <rect x="53" y="215" width="64" height="2.4" rx="1.2" fill="#c9d3e0" />
          <rect x="53" y="221" width="72" height="2.4" rx="1.2" fill="#c9d3e0" />

          {/* neck, crimp, cap */}
          <rect x="66" y="74" width="68" height="22" rx="5" fill={`url(#${id}-glass)`} stroke="#b4c3d6" strokeWidth="1.5" />
          <rect x="58" y="54" width="84" height="24" rx="4" fill={`url(#${id}-metal)`} />
          <path d="M60 62 H140 M60 70 H140" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="1" />
          <rect x="61" y="26" width="78" height="30" rx="7" fill={`url(#${id}-cap)`} />
          <rect x="68" y="30" width="62" height="5" rx="2.5" fill="#fff" opacity="0.28" />
        </g>
      </g>

      <g fill="#f26a21">
        <path className="blog-spark" d="M24 120 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" />
        <path className="blog-spark blog-d2" d="M176 70 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z" fill="#13294b" />
        <path className="blog-spark blog-d3" d="M180 210 l2.5 7 7 2.5 -7 2.5 -2.5 7 -2.5 -7 -7 -2.5 7 -2.5z" />
      </g>
    </svg>
  );
}
