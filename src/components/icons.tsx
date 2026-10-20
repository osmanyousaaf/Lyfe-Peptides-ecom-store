type P = { className?: string };
const s = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const ShieldIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden {...s}>
    <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);
export const FlaskIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden {...s}>
    <path d="M9 3h6M10 3v6l-5.5 9.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3" />
    <path d="M7.5 15h9" />
  </svg>
);
export const TruckIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden {...s}>
    <path d="M3 6h11v10H3zM14 9h4l3 3v4h-7" />
    <circle cx="7" cy="17.5" r="1.8" />
    <circle cx="17.5" cy="17.5" r="1.8" />
  </svg>
);
export const BoltIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden {...s}>
    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
  </svg>
);
export const MapleIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2l1.4 3.4 2.6-1.3-.6 3.6 3.2-.7-1.6 2.8 3 1.2-2.6 1.6 1.7 2.4-3.3-.2.5 3.3-2.8-1.8-.9 3.7h-1.2l-.9-3.7-2.8 1.8.5-3.3-3.3.2 1.7-2.4-2.6-1.6 3-1.2-1.6-2.8 3.2.7-.6-3.6 2.6 1.3L12 2z" />
    <rect x="11.4" y="18" width="1.2" height="4" rx="0.6" />
  </svg>
);
export const CartIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden {...s}>
    <path d="M3 4h2l2.3 11a1 1 0 0 0 1 .8h9.4a1 1 0 0 0 1-.8L20.5 8H6" />
    <circle cx="9.5" cy="20" r="1.3" fill="currentColor" />
    <circle cx="17" cy="20" r="1.3" fill="currentColor" />
  </svg>
);
export const SearchIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden {...s}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M20 20l-4.2-4.2" />
  </svg>
);
export const ChevronDown = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden {...s}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);
export const ChevronRight = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden {...s}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);
export const ArrowRight = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden {...s}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const MenuIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden {...s}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);
export const CloseIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden {...s}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
export const GridIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden {...s}>
    <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
  </svg>
);
export const VialIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden {...s}>
    <path d="M9 3h6M10 3v3h4V3M9.5 6h5v13a2.5 2.5 0 0 1-5 0z" />
    <path d="M9.5 12h5" />
  </svg>
);
export const PenIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden {...s}>
    <path d="M15 4l5 5-9.5 9.5-5 1 1-5L15 4z" />
    <path d="M13 6l5 5" />
  </svg>
);
export const BoxIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden {...s}>
    <path d="M12 3l8 4v10l-8 4-8-4V7l8-4z" />
    <path d="M4 7l8 4 8-4M12 11v10" />
  </svg>
);
export const StarIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden {...s}>
    <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9L12 3.5z" />
  </svg>
);
export const LockIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden {...s}>
    <rect x="5" y="10.5" width="14" height="10" rx="2" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </svg>
);
export const CheckIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden {...s} strokeWidth={2.4}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
export const MailIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden {...s}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3.5 6.5l8.5 6.5 8.5-6.5" />
  </svg>
);
export const ClockIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden {...s}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);
