type P = { className?: string };
const s = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const MailIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden {...s}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3.5 6.5l8.5 6.5 8.5-6.5" />
  </svg>
);
export const CheckIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden {...s} strokeWidth={2.4}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
export const ArrowRight = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden {...s}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const PlusIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden {...s}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const ClockIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden {...s}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);
export const InstagramIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden {...s}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);
export const FacebookIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M13.5 21v-7.5H16l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8v3h2.5V21h3z" />
  </svg>
);
export const TikTokIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M16.6 3c.3 2.1 1.6 3.6 3.6 3.8v2.9a6.9 6.9 0 0 1-3.6-1.1v6.2A5.8 5.8 0 1 1 10.8 9v3a2.9 2.9 0 1 0 2 2.8V3h3.8z" />
  </svg>
);
export const YouTubeIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.6 2.6 0 0 0 2.4 7.2 27 27 0 0 0 2 12a27 27 0 0 0 .4 4.8 2.6 2.6 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8A27 27 0 0 0 22 12a27 27 0 0 0-.4-4.8zM10 15V9l5.2 3L10 15z" />
  </svg>
);

export const SOCIAL_ICONS = {
  Instagram: InstagramIcon,
  Facebook: FacebookIcon,
  TikTok: TikTokIcon,
  YouTube: YouTubeIcon,
} as const;
