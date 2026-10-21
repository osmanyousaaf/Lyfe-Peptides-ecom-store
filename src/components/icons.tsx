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
export const PlusIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden {...s} strokeWidth={2.2}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const MinusIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden {...s} strokeWidth={2.2}>
    <path d="M5 12h14" />
  </svg>
);
export const TrashIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden {...s}>
    <path d="M4 7h16M9 7V4.5h6V7M6.5 7l.8 12a2 2 0 0 0 2 1.9h5.4a2 2 0 0 0 2-1.9l.8-12" />
  </svg>
);
export const BagIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden {...s}>
    <path d="M5 8h14l-1 12.5H6L5 8z" />
    <path d="M9 10V6.5a3 3 0 0 1 6 0V10" />
  </svg>
);
export const SparkIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2l1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2z" />
  </svg>
);
export const InstagramIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden {...s}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
  </svg>
);
export const FacebookIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.9v3h2.6V21h3z" />
  </svg>
);
export const TikTokIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M16.6 3c.3 2.2 1.6 3.6 3.9 3.8v3a7 7 0 0 1-3.8-1.2v6.1c0 3.3-2.4 5.8-5.7 5.8a5.6 5.6 0 0 1-5.7-5.6c0-3.4 2.9-6 6.4-5.5v3.1a2.5 2.5 0 0 0-3.2 2.4c0 1.4 1.1 2.5 2.5 2.5 1.5 0 2.6-1.1 2.6-2.9V3h3z" />
  </svg>
);
export const YouTubeIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15.1V8.9l5.2 3.1-5.2 3.1z" />
  </svg>
);
export const UsersIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden {...s}>
    <circle cx="9" cy="8.5" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 5.2a3.5 3.5 0 0 1 0 6.6M18 14.5a6.5 6.5 0 0 1 3.5 5.5" />
  </svg>
);
export const TagIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden {...s}>
    <path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3a1.5 1.5 0 0 1 0 2.1l-6.6 6.6a1.5 1.5 0 0 1-2.1 0l-8.3-8.3z" />
    <circle cx="8" cy="8" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);
export const GearIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden {...s}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" />
  </svg>
);
export const DocIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden {...s}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </svg>
);
export const ChartIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden {...s}>
    <path d="M4 20V4M4 20h16" />
    <path d="M8 16l4-5 3 3 5-6" />
  </svg>
);
export const LogoutIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden {...s}>
    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h10" />
  </svg>
);
export const ExternalIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden {...s}>
    <path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
  </svg>
);
export const InboxIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden {...s}>
    <path d="M4 13l2.5-8h11L20 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6z" />
    <path d="M4 13h4.5l1 2h5l1-2H20" />
  </svg>
);
