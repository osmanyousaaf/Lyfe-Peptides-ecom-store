// A small looping scene for the dual-chamber banner: a parcel gets sealed and
// stamped while a truck rolls a gentle route across the country, delivering it.
// Pure hand-drawn SVG + CSS (see the "ship-*" rules in globals.css) — no images,
// no video, and it freezes on a clean frame when the visitor prefers less motion.
const MAPLE = "M12 2l1.4 3.4 2.6-1.3-.6 3.6 3.2-.7-1.6 2.8 3 1.2-2.6 1.6 1.7 2.4-3.3-.2.5 3.3-2.8-1.8-.9 3.7h-1.2l-.9-3.7-2.8 1.8.5-3.3-3.3.2 1.7-2.4-2.6-1.6 3-1.2-1.6-2.8 3.2.7-.6-3.6 2.6 1.3L12 2z";

export default function DualChamberShipping({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 340 120" className={`block h-auto w-full ${className}`} role="img" aria-label="A sealed parcel, and a delivery truck on its route across Canada">
      {/* the route, gently rolling like the country it crosses */}
      <path d="M8 92 Q 170 38 332 76" fill="none" stroke="var(--line)" strokeWidth="2.5" strokeDasharray="1 8" strokeLinecap="round" />
      <circle cx="8" cy="92" r="3.5" fill="var(--line)" />
      <path transform="translate(314,46) scale(0.9)" fill="var(--accent)" d={MAPLE} />

      {/* the parcel: taped shut, labelled, then stamped */}
      <ellipse cx="46" cy="90" rx="23" ry="3.5" fill="var(--navy)" opacity="0.08" />
      <rect x="22" y="58" width="48" height="31" rx="3" fill="#fff" stroke="var(--line)" strokeWidth="1.5" />
      <line className="ship-tape" pathLength={1} x1="24" y1="70" x2="68" y2="70" stroke="var(--accent)" strokeWidth="4.5" />
      <line className="ship-tape" pathLength={1} x1="46" y1="70" x2="46" y2="89" stroke="var(--accent)" strokeWidth="4.5" style={{ animationDelay: "0.3s" }} />
      <g className="ship-label">
        <rect x="27" y="76" width="24" height="10" rx="1.5" fill="#fff" stroke="var(--line)" />
        <rect x="30" y="79" width="16" height="1.4" rx="0.7" fill="var(--faint)" />
        <rect x="30" y="82.5" width="11" height="1.4" rx="0.7" fill="var(--faint)" />
      </g>
      <g className="ship-stamp">
        <circle cx="63" cy="62" r="9" fill="var(--green)" />
        <path d="M58.5 62l2.8 2.8 5.2-5.6" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* the truck, always out on the road */}
      <g className="ship-truck">
        <circle className="ship-puff" cx="-4" cy="-4" r="2" fill="var(--line)" />
        <circle className="ship-puff" cx="-4" cy="-4" r="2" fill="var(--line)" style={{ animationDelay: "0.45s" }} />
        <circle className="ship-puff" cx="-4" cy="-4" r="2" fill="var(--line)" style={{ animationDelay: "0.9s" }} />
        <line className="ship-trail" x1="-2" y1="-16" x2="-13" y2="-16" stroke="var(--line)" strokeWidth="2.5" strokeLinecap="round" />
        <line className="ship-trail" x1="-2" y1="-10" x2="-15" y2="-10" stroke="var(--line)" strokeWidth="2.5" strokeLinecap="round" style={{ animationDelay: "0.15s" }} />
        <line className="ship-trail" x1="-2" y1="-4" x2="-12" y2="-4" stroke="var(--line)" strokeWidth="2.5" strokeLinecap="round" style={{ animationDelay: "0.3s" }} />
        <rect x="0" y="-20" width="26" height="20" rx="2.5" fill="var(--navy)" />
        <path transform="translate(6,-15) scale(0.4)" fill="#fff" opacity="0.2" d={MAPLE} />
        <path d="M26 -20h8l6 7v13h-14z" fill="var(--accent)" />
        <rect x="29" y="-16" width="6.5" height="5.5" rx="0.8" fill="#fff" opacity="0.85" />
        <circle className="ship-wheel" cx="7" cy="0" r="4.4" fill="#1b2a3f" />
        <circle cx="7" cy="0" r="1.6" fill="#48597a" />
        <circle className="ship-wheel" cx="31" cy="0" r="4.4" fill="#1b2a3f" />
        <circle cx="31" cy="0" r="1.6" fill="#48597a" />
      </g>
    </svg>
  );
}
