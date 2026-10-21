"use client";

import { useSvgId } from "./useSvgId";

const ROWS = [
  ["PRODUCT", "BPC-157 · 10 mg"],
  ["APPEARANCE", "White lyophilized cake"],
  ["PURITY (HPLC)", "99.4%"],
  ["IDENTITY (MS)", "1419.6 Da · conforms"],
  ["LOT", "LP-2610-A"],
];

// A certificate of analysis being scanned: each result checks off in turn, then the batch is stamped.
export default function CoaScan({ className = "" }: { className?: string }) {
  const id = useSvgId("coa");
  return (
    <svg
      viewBox="0 0 360 440"
      className={`blog-anim ${className}`}
      role="img"
      aria-label="Animated certificate of analysis: a scanner passes over the document and each test result is checked off"
    >
      <defs>
        <linearGradient id={`${id}-beam`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f26a21" stopOpacity="0" />
          <stop offset="1" stopColor="#f26a21" stopOpacity="0.22" />
        </linearGradient>
        <filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <clipPath id={`${id}-paper`}>
          <rect x="30" y="20" width="300" height="400" rx="16" />
        </clipPath>
      </defs>

      <rect x="40" y="34" width="290" height="396" rx="18" fill="#13294b" opacity="0.18" filter={`url(#${id}-soft)`} />

      <g className="blog-coa-float">
        <rect x="30" y="20" width="300" height="400" rx="16" fill="#fff" stroke="#e1e7ef" />
        <g clipPath={`url(#${id}-paper)`}>
          <rect x="30" y="20" width="300" height="70" fill="#13294b" />
          <text x="52" y="52" fontSize="12" fontWeight="800" fill="#fff" letterSpacing="2">
            CERTIFICATE OF ANALYSIS
          </text>
          <text x="52" y="70" fontSize="8.5" fontWeight="600" fill="#fff" opacity="0.65" letterSpacing="1.6">
            LYFE PEPTIDES · BATCH RECORD
          </text>
          <circle cx="300" cy="55" r="15" fill="#f26a21" />
          <path d="M293 55 l5 5 9 -10" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />

          {ROWS.map(([k, v], i) => {
            const y = 116 + i * 42;
            return (
              <g key={k}>
                <text x="52" y={y} fontSize="8" fontWeight="700" fill="#8d99ab" letterSpacing="1.4">
                  {k}
                </text>
                <g className="blog-coa-value" style={{ animationDelay: `${0.35 + i * 0.4}s` }}>
                  <text x="52" y={y + 16} fontSize="12.5" fontWeight="700" fill="#13294b">
                    {v}
                  </text>
                </g>
                <g className="blog-coa-check" style={{ animationDelay: `${0.45 + i * 0.4}s` }}>
                  <circle cx="302" cy={y + 6} r="11" fill="#2f9a4a" />
                  <path
                    d={`M296.5 ${y + 6} l4 4 7 -8`}
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                <path d={`M52 ${y + 26} H316`} stroke="#eef2f7" />
              </g>
            );
          })}

          {/* mini trace */}
          <path
            className="blog-coa-trace"
            pathLength={1}
            d="M52 392 L90 391 L98 386 L104 391 L150 390 L160 340 L166 318 L172 340 L182 390 L230 391 L238 385 L244 391 L300 391"
            fill="none"
            stroke="#f26a21"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <text x="52" y="408" fontSize="7.5" fontWeight="700" fill="#8d99ab" letterSpacing="1.2">
            HPLC TRACE · LOT LP-2610-A
          </text>

          {/* scanner */}
          <g className="blog-coa-scan">
            <rect x="30" y="-40" width="300" height="44" fill={`url(#${id}-beam)`} />
            <rect x="30" y="3" width="300" height="2.5" fill="#f26a21" />
          </g>
        </g>

        <g className="blog-coa-stamp">
          <g transform="rotate(-14 252 352)">
            <rect x="196" y="330" width="112" height="44" rx="10" fill="#fff" fillOpacity="0.85" stroke="#2f9a4a" strokeWidth="3" />
            <text x="252" y="358" fontSize="16" fontWeight="800" fill="#2f9a4a" textAnchor="middle" letterSpacing="2.5">
              VERIFIED
            </text>
          </g>
        </g>
      </g>
    </svg>
  );
}
