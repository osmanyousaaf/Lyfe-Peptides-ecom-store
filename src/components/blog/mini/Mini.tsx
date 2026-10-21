// Small looping illustrations for blog key points. Plain SVG + CSS (classes blog-mini-* in blog.css),
// so they render on the server, in the admin editor preview and with animations switched off.
// Each drawing's static state is the "answer" frame; the keyframes animate toward it.
import type { CSSProperties } from "react";
import { miniLabel, type MiniAnim as Key } from "@/lib/blog-mini";

// site tokens, so the drawings follow the theme; water and cold get a neutral blue
const INK = "var(--navy)";
const PAPER = "#ffffff";
const IVORY = "var(--surface-2)";
const TEAL = "var(--accent)";
const DEEP = "var(--accent-deep)";
const WATER = "#6fa8dc";
const CAP = "#7d2d5f";

const d = (s: number): CSSProperties => ({ animationDelay: `${s}s` });

// a Lyfe-style vial: crimp cap, glass body, paper label
function Vial({ x, y, w = 40, h = 96, label, children }: { x: number; y: number; w?: number; h?: number; label?: string; children?: React.ReactNode }) {
  return (
    <g>
      <rect x={x} y={y + 28} width={w} height={h - 28} rx={8} fill="#ffffff" fillOpacity={0.8} stroke={INK} strokeOpacity={0.22} strokeWidth={1.5} />
      {children}
      <rect x={x + 6} y={y + 22} width={w - 12} height={7} fill="#d9dbd8" />
      <rect x={x + 2} y={y + 13} width={w - 4} height={10} rx={2} fill="#b8bcbc" />
      <rect x={x} y={y} width={w} height={14} rx={3} fill={CAP} />
      {label && (
        <g>
          <rect x={x + 3} y={y + 42} width={w - 6} height={26} rx={2} fill={PAPER} stroke={INK} strokeOpacity={0.15} />
          <text x={x + w / 2} y={y + 59} textAnchor="middle" fontSize={9} fontWeight={800} fill={INK}>
            {label}
          </text>
        </g>
      )}
    </g>
  );
}

function Check({ x, y, r = 9, cls = "blog-mini-pop", delay = 0 }: { x: number; y: number; r?: number; cls?: string; delay?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={cls} style={d(delay)}>
        <circle r={r} fill={TEAL} />
        <path d={`M${-r * 0.45} 0 l${r * 0.3} ${r * 0.32} l${r * 0.6} ${-r * 0.62}`} fill="none" stroke="#ffffff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  );
}

function Snow({ x, y, r = 10, cls = "" }: { x: number; y: number; r?: number; cls?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={cls} stroke={WATER} strokeWidth={2.2} strokeLinecap="round">
        {[0, 60, 120].map((a) => (
          <path key={a} d={`M0 ${-r} V${r} M-3 ${-r + 3} L0 ${-r + 6} L3 ${-r + 3} M-3 ${r - 3} L0 ${r - 6} L3 ${r - 3}`} transform={`rotate(${a})`} fill="none" />
        ))}
      </g>
    </g>
  );
}

const TRACE = "M20 126 L50 126 C56 126 58 120 61 119 C64 120 66 126 72 126 L78 126 C85 126 86 30 92 30 C98 30 99 126 106 126 L116 126 C119 126 120 121 122 120 C124 121 125 126 128 126 L146 126";

function PurityPeak() {
  return (
    <>
      <path d="M20 22 V128 H148" fill="none" stroke={INK} strokeOpacity={0.25} strokeWidth={1.5} />
      {[52, 78, 104].map((y) => (
        <line key={y} x1={20} x2={148} y1={y} y2={y} stroke={INK} strokeOpacity={0.08} strokeDasharray="3 5" />
      ))}
      <path d="M78 126 C85 126 86 30 92 30 C98 30 99 126 106 126 Z" fill={TEAL} fillOpacity={0.18} className="blog-mini-fade" style={d(1.2)} />
      <path d={TRACE} fill="none" stroke={TEAL} strokeWidth={2.6} strokeLinejoin="round" className="blog-mini-draw" style={{ ["--len" as string]: 360 }} />
      <g className="blog-mini-pop" style={d(1.5)}>
        <rect x={98} y={14} width={50} height={22} rx={11} fill={INK} />
        <text x={123} y={29} textAnchor="middle" fontSize={11} fontWeight={800} fill={PAPER}>99.4%</text>
      </g>
    </>
  );
}

function MassSpec() {
  const bars = [16, 28, 20, 96, 24, 12, 32, 10];
  return (
    <>
      <path d="M16 128 H148" stroke={INK} strokeOpacity={0.25} strokeWidth={1.5} />
      {bars.map((h, i) => {
        const x = 22 + i * 15.5;
        const target = i === 3;
        return (
          <rect key={i} x={x} y={128 - h} width={9} height={h} rx={2} fill={target ? TEAL : INK} fillOpacity={target ? 1 : 0.22} className="blog-mini-bar" style={d(i * 0.12)} />
        );
      })}
      <line x1={73} x2={73} y1={14} y2={30} stroke={DEEP} strokeDasharray="3 3" />
      <g className="blog-mini-pop" style={d(1.3)}>
        <rect x={32} y={6} width={82} height={20} rx={10} fill={INK} />
        <text x={73} y={20} textAnchor="middle" fontSize={9} fontWeight={800} fill={PAPER}>expected mass</text>
      </g>
      <Check x={98} y={36} r={8} delay={1.5} />
    </>
  );
}

function CoaCheck() {
  const rows = ["Purity ≥ 99%", "Identity (MS)", "Lot A-117"];
  return (
    <>
      <rect x={28} y={14} width={104} height={132} rx={10} fill={PAPER} stroke={INK} strokeOpacity={0.2} strokeWidth={1.5} />
      <rect x={28} y={14} width={104} height={24} rx={10} fill={INK} />
      <rect x={28} y={30} width={104} height={8} fill={INK} />
      <text x={40} y={30} fontSize={10} fontWeight={800} fill={PAPER} letterSpacing={1.5}>COA</text>
      {rows.map((t, i) => (
        <g key={t}>
          <text x={40} y={64 + i * 26} fontSize={9.5} fontWeight={700} fill={INK} fillOpacity={0.75}>{t}</text>
          <line x1={40} x2={96} y1={70 + i * 26} y2={70 + i * 26} stroke={INK} strokeOpacity={0.1} />
          <Check x={114} y={61 + i * 26} r={8} delay={0.35 + i * 0.4} />
        </g>
      ))}
      <g transform="translate(96 132) rotate(-10)">
        <g className="blog-mini-stamp" style={d(1.7)}>
          <rect x={-24} y={-11} width={48} height={20} rx={4} fill="none" stroke={DEEP} strokeWidth={2} />
          <text y={4} textAnchor="middle" fontSize={10} fontWeight={800} fill={DEEP} letterSpacing={1}>PASS</text>
        </g>
      </g>
    </>
  );
}

function LotNumber() {
  return (
    <>
      <Vial x={14} y={30} label="A-117" />
      <rect x={90} y={30} width={58} height={88} rx={8} fill={PAPER} stroke={INK} strokeOpacity={0.2} strokeWidth={1.5} />
      <rect x={98} y={42} width={36} height={4} rx={2} fill={INK} fillOpacity={0.15} />
      <rect x={98} y={52} width={26} height={4} rx={2} fill={INK} fillOpacity={0.15} />
      <text x={98} y={92} fontSize={8} fontWeight={700} fill={INK} fillOpacity={0.6}>LOT</text>
      <text x={98} y={104} fontSize={10} fontWeight={800} fill={INK}>A-117</text>
      <rect x={94} y={84} width={50} height={26} rx={5} fill="none" stroke={TEAL} strokeWidth={2} className="blog-mini-pulse" style={d(0.9)} />
      <rect x={15} y={70} width={38} height={30} rx={5} fill="none" stroke={TEAL} strokeWidth={2} className="blog-mini-pulse" />
      <line x1={56} x2={90} y1={88} y2={96} stroke={DEEP} strokeWidth={1.5} strokeDasharray="3 4" />
      <g transform="translate(56 88)">
        <circle r={4} fill={TEAL} className="blog-mini-travel" style={{ ["--tx" as string]: "34px", ["--ty" as string]: "8px" }} />
      </g>
      <Check x={74} y={56} r={10} delay={1.4} />
    </>
  );
}

function Freezer() {
  return (
    <>
      <rect x={66} y={16} width={22} height={110} rx={11} fill={PAPER} stroke={INK} strokeOpacity={0.25} strokeWidth={1.5} />
      {[34, 50, 66, 82, 98].map((y) => (
        <line key={y} x1={88} x2={95} y1={y} y2={y} stroke={INK} strokeOpacity={0.3} />
      ))}
      <rect x={72} y={96} width={10} height={26} rx={4} fill={WATER} className="blog-mini-mercury" />
      <circle cx={77} cy={128} r={15} fill={WATER} />
      <text x={12} y={60} fontSize={14} fontWeight={800} fill={INK} className="blog-mini-warm">+22°</text>
      <text x={8} y={60} fontSize={14} fontWeight={800} fill="#2f6fae" className="blog-mini-cold">−20°C</text>
      <Snow x={124} y={52} r={13} cls="blog-mini-spin" />
      <Snow x={130} y={104} r={7} cls="blog-mini-spin" />
    </>
  );
}

function LightShield() {
  return (
    <>
      <circle cx={30} cy={34} r={13} fill="#e8b84a" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
        const r = (a * Math.PI) / 180;
        const at = (len: number) => [30 + Math.sin(r) * len, 34 - Math.cos(r) * len].map((n) => n.toFixed(1));
        const [x1, y1] = at(18);
        const [x2, y2] = at(24);
        return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#e8b84a" strokeWidth={2.4} strokeLinecap="round" />;
      })}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${46 + i * 6} ${46 + i * 14})`}>
          <line x1={0} y1={0} x2={14} y2={10} stroke="#e8b84a" strokeWidth={3} strokeLinecap="round" className="blog-mini-ray" style={d(i * 0.45)} />
        </g>
      ))}
      <g>
        <rect x={98} y={34} width={22} height={16} rx={3} fill={CAP} />
        <rect x={100} y={48} width={18} height={8} fill="#b8bcbc" />
      </g>
      <rect x={82} y={54} width={56} height={84} rx={8} fill={INK} />
      <rect x={82} y={54} width={56} height={10} fill="#0d1e38" />
      <text x={110} y={102} textAnchor="middle" fontSize={11} fontWeight={800} fill={IVORY} letterSpacing={1.5}>LYFE</text>
      <circle cx={84} cy={86} r={6} fill={TEAL} fillOpacity={0.5} className="blog-mini-pulse" />
    </>
  );
}

function Moisture() {
  return (
    <>
      <path d="M44 46 A36 36 0 0 1 116 46" fill="none" stroke={DEEP} strokeWidth={2.5} strokeDasharray="5 5" className="blog-mini-pulse" />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${56 + i * 24} 10)`}>
          <path d="M0 0 C4 6 6 9 6 12 a6 6 0 0 1 -12 0 c0 -3 2 -6 6 -12z" fill={WATER} fillOpacity={0.85} className="blog-mini-drop" style={d(i * 0.55)} />
        </g>
      ))}
      <Vial x={60} y={46} label="DRY">
        <path d="M63 128 q8 -6 17 -2 t17 -1 V134 a5 5 0 0 1 -5 5 H68 a5 5 0 0 1 -5 -5z" fill={IVORY} />
      </Vial>
    </>
  );
}

function PowderCake() {
  return (
    <>
      <defs>
        <clipPath id="bm-clip-cake">
          <rect x={56} y={44} width={48} height={100} rx={9} />
        </clipPath>
      </defs>
      <Vial x={56} y={16} w={48} h={128} label="10 mg">
        <g clipPath="url(#bm-clip-cake)">
          <path d="M56 118 q8 -7 16 -3 t16 -2 t16 3 V144 H56z" fill={IVORY} />
          {[[64, 128], [74, 134], [86, 126], [94, 136], [70, 140], [90, 140]].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={1.4} fill={INK} fillOpacity={0.15} />
          ))}
          <rect x={30} y={30} width={14} height={130} fill="#ffffff" fillOpacity={0.7} className="blog-mini-sheen" />
        </g>
      </Vial>
      {[[118, 112, 0], [40, 98, 0.8], [124, 66, 1.4]].map(([x, y, t]) => (
        <g key={`${x}`} transform={`translate(${x} ${y})`}>
          <path d="M0 -7 L1.6 -1.6 L7 0 L1.6 1.6 L0 7 L-1.6 1.6 L-7 0 L-1.6 -1.6z" fill={TEAL} className="blog-mini-twinkle" style={d(t)} />
        </g>
      ))}
    </>
  );
}

function DropMix() {
  return (
    <>
      <defs>
        <clipPath id="bm-clip-mix">
          <rect x={56} y={56} width={48} height={92} rx={9} />
        </clipPath>
      </defs>
      <g transform="translate(80 8)">
        <path d="M0 0 C4 6 6 9 6 12 a6 6 0 0 1 -12 0 c0 -3 2 -6 6 -12z" fill={WATER} className="blog-mini-fall" />
      </g>
      <Vial x={56} y={28} w={48} h={120}>
        <g clipPath="url(#bm-clip-mix)">
          <rect x={56} y={92} width={48} height={56} fill={WATER} fillOpacity={0.4} className="blog-mini-fill" />
          <path d="M56 128 q8 -7 16 -3 t16 -2 t16 3 V148 H56z" fill={IVORY} className="blog-mini-dissolve" />
          <g transform="translate(80 118)">
            <path d="M-12 0 a12 6 0 1 0 24 0" fill="none" stroke={DEEP} strokeWidth={1.8} strokeLinecap="round" className="blog-mini-swirl" />
          </g>
        </g>
      </Vial>
    </>
  );
}

function PenTwist() {
  return (
    <g transform="translate(-14 -22) scale(1.18)">
      <rect x={16} y={64} width={26} height={32} rx={7} fill={INK} />
      <g className="blog-mini-ridges">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={i} x1={20 + i * 4} x2={20 + i * 4} y1={64} y2={96} stroke={IVORY} strokeOpacity={0.35} strokeWidth={1.4} />
        ))}
      </g>
      <rect x={40} y={62} width={62} height={36} rx={12} fill="#ffffff" stroke={INK} strokeOpacity={0.22} strokeWidth={1.5} />
      <text x={71} y={84} textAnchor="middle" fontSize={11} fontWeight={800} fill={TEAL} letterSpacing={1}>LYFE</text>
      <rect x={100} y={66} width={44} height={28} rx={7} fill="#ffffff" fillOpacity={0.65} stroke={INK} strokeOpacity={0.25} strokeWidth={1.5} />
      <rect x={103} y={70} width={17} height={20} rx={3} fill={WATER} fillOpacity={0.55} className="blog-mini-water" />
      <rect x={120} y={69} width={3} height={22} fill={INK} />
      <rect x={124} y={70} width={17} height={20} rx={3} fill={IVORY} />
      <rect x={124} y={70} width={17} height={20} rx={3} fill={WATER} fillOpacity={0.55} className="blog-mini-mixed" />
      <path d="M14 52 A20 20 0 0 1 44 52" fill="none" stroke={DEEP} strokeWidth={2.4} strokeLinecap="round" className="blog-mini-draw" style={{ ["--len" as string]: 40 }} />
      <path d="M40 46 l5 6 l-7 2" fill="none" stroke={DEEP} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
      <text x={30} y={118} textAnchor="middle" fontSize={9} fontWeight={800} fill={INK} fillOpacity={0.6}>TWIST</text>
      <text x={122} y={112} textAnchor="middle" fontSize={9} fontWeight={800} fill={INK} fillOpacity={0.6}>MIXED</text>
    </g>
  );
}

function DayRing() {
  return (
    <>
      {Array.from({ length: 28 }, (_, i) => {
        const a = (i / 28) * Math.PI * 2 - Math.PI / 2;
        const p = (r: number) => [80 + Math.cos(a) * r, 80 + Math.sin(a) * r].map((n) => n.toFixed(1));
        const [x1, y1] = p(58);
        const [x2, y2] = p(67);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={TEAL} strokeWidth={3} strokeLinecap="round" className="blog-mini-tick" style={d(i * 0.14)} />;
      })}
      <circle cx={80} cy={80} r={48} fill="none" stroke={INK} strokeOpacity={0.08} strokeWidth={5} />
      {/* starts at 12 o'clock; drawn as a path because rotate() attributes fight the transform-origin rule */}
      <path d="M80 32 A48 48 0 1 1 79.99 32" fill="none" stroke={DEEP} strokeWidth={5} strokeLinecap="round" className="blog-mini-arc" style={{ ["--len" as string]: 302 }} />
      <text x={80} y={90} textAnchor="middle" fontSize={32} fontWeight={800} fill={INK} letterSpacing={-1}>28</text>
      <text x={80} y={104} textAnchor="middle" fontSize={9} fontWeight={800} fill={INK} fillOpacity={0.55} letterSpacing={1.5}>DAYS</text>
    </>
  );
}

function Preserve() {
  const microbes: [number, number, number][] = [[24, 30, 0], [134, 44, 0.7], [128, 128, 1.4], [26, 120, 2.1]];
  return (
    <>
      <circle cx={80} cy={84} r={52} fill={TEAL} fillOpacity={0.07} />
      <circle cx={80} cy={84} r={52} fill="none" stroke={TEAL} strokeWidth={2.5} strokeDasharray="6 7" className="blog-mini-spin-slow" />
      {microbes.map(([x, y, t]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
          <g className="blog-mini-microbe" style={{ ...d(t), ["--tx" as string]: `${(80 - x) * 0.35}px`, ["--ty" as string]: `${(84 - y) * 0.35}px` }}>
            <circle r={7} fill="#c9667e" fillOpacity={0.75} />
            <circle cx={-2} cy={-2} r={1.4} fill={PAPER} />
            <circle cx={2.5} cy={2} r={1.1} fill={PAPER} />
          </g>
        </g>
      ))}
      <Vial x={62} y={40} w={36} h={86} label="BW" />
      <g className="blog-mini-pop" style={d(0.4)}>
        <rect x={50} y={138} width={60} height={16} rx={8} fill={INK} />
        <text x={80} y={149} textAnchor="middle" fontSize={8.5} fontWeight={800} fill={PAPER}>0.9% benzyl</text>
      </g>
    </>
  );
}

function SingleUse() {
  return (
    <>
      <g className="blog-mini-used">
        <g className="blog-mini-lid">
          <rect x={60} y={30} width={40} height={14} rx={3} fill="#9aa3a1" />
        </g>
        <rect x={62} y={43} width={36} height={10} rx={2} fill="#b8bcbc" />
        <rect x={60} y={58} width={40} height={78} rx={8} fill="#ffffff" fillOpacity={0.8} stroke={INK} strokeOpacity={0.22} strokeWidth={1.5} />
        <rect x={63} y={94} width={34} height={40} rx={6} fill={WATER} fillOpacity={0.35} />
        <rect x={63} y={70} width={34} height={20} rx={2} fill={PAPER} stroke={INK} strokeOpacity={0.15} />
        <text x={80} y={84} textAnchor="middle" fontSize={9} fontWeight={800} fill={INK}>SW</text>
      </g>
      <line x1={46} y1={148} x2={114} y2={40} stroke="#c0392b" strokeWidth={3} strokeLinecap="round" className="blog-mini-strike" style={{ ["--len" as string]: 130 }} />
      <g className="blog-mini-pop" style={d(0.6)}>
        <circle cx={118} cy={46} r={16} fill={INK} />
        <text x={118} y={51} textAnchor="middle" fontSize={13} fontWeight={800} fill={PAPER}>1×</text>
      </g>
    </>
  );
}

function Calendar() {
  return (
    <>
      <rect x={22} y={26} width={116} height={112} rx={12} fill={PAPER} stroke={INK} strokeOpacity={0.2} strokeWidth={1.5} />
      <rect x={22} y={26} width={116} height={24} rx={12} fill={INK} />
      <rect x={22} y={40} width={116} height={10} fill={INK} />
      <rect x={46} y={18} width={5} height={16} rx={2.5} fill="#9aa3a1" />
      <rect x={109} y={18} width={5} height={16} rx={2.5} fill="#9aa3a1" />
      <text x={34} y={44} fontSize={9} fontWeight={800} fill={PAPER} letterSpacing={1.5}>OPENED · DAY 1</text>
      {Array.from({ length: 28 }, (_, i) => (
        <rect key={i} x={32 + (i % 7) * 14} y={58 + Math.floor(i / 7) * 18} width={10} height={12} rx={2.5} fill={TEAL} className="blog-mini-day" style={d(i * 0.1)} />
      ))}
    </>
  );
}

function ColdPack() {
  return (
    <>
      <g className="blog-mini-road">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect key={i} x={i * 30} y={134} width={16} height={3} rx={1.5} fill={INK} fillOpacity={0.25} />
        ))}
      </g>
      <g className="blog-mini-bob">
        <path d="M34 62 L80 46 L126 62 L80 78z" fill={IVORY} stroke={INK} strokeOpacity={0.25} strokeWidth={1.2} />
        <path d="M34 62 L80 78 V124 L34 108z" fill="#ddd7c3" stroke={INK} strokeOpacity={0.25} strokeWidth={1.2} />
        <path d="M126 62 L80 78 V124 L126 108z" fill="#c9d3e0" stroke={INK} strokeOpacity={0.25} strokeWidth={1.2} />
        <path d="M57 54 L103 70 V82" fill="none" stroke={TEAL} strokeWidth={5} strokeOpacity={0.85} />
        <Snow x={104} y={96} r={9} />
        <path d="M56 86 l3 6 3 -6 2 5 4 -2 -2 7 3 1 -6 3 v4 h-2 v-4 l-6 -3 3 -1 -2 -7 4 2z" fill="#c0392b" />
      </g>
      {[[20, 40, 0], [140, 34, 0.6], [146, 96, 1.2]].map(([x, y, t]) => (
        <g key={`${x}`} transform={`translate(${x} ${y})`}>
          <circle r={2.5} fill={WATER} className="blog-mini-twinkle" style={d(t)} />
        </g>
      ))}
      <g className="blog-mini-pop" style={d(0.5)}>
        <rect x={112} y={14} width={40} height={20} rx={10} fill={INK} />
        <text x={132} y={28} textAnchor="middle" fontSize={10} fontWeight={800} fill={PAPER}>2–8°</text>
      </g>
    </>
  );
}

const DRAWINGS: Record<Key, () => React.ReactElement> = {
  "purity-peak": PurityPeak,
  "mass-spec": MassSpec,
  "coa-check": CoaCheck,
  "lot-number": LotNumber,
  freezer: Freezer,
  "light-shield": LightShield,
  moisture: Moisture,
  "powder-cake": PowderCake,
  "drop-mix": DropMix,
  "pen-twist": PenTwist,
  "day-ring": DayRing,
  preserve: Preserve,
  "single-use": SingleUse,
  calendar: Calendar,
  "cold-pack": ColdPack,
};

export default function MiniAnim({ anim, className = "" }: { anim: Key; className?: string }) {
  const Drawing = DRAWINGS[anim] ?? PurityPeak;
  return (
    <svg viewBox="0 0 160 160" className={`blog-mini ${className}`} role="img" aria-label={miniLabel(anim)}>
      <Drawing />
    </svg>
  );
}
