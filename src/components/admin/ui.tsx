// Building blocks for admin pages. Server-safe: no hooks here (interactive pieces live in ./client.tsx).
import Link from "next/link";

export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 lg:mb-8">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-navy">
            ← {back.label}
          </Link>
        )}
        <h1 className="text-2xl font-extrabold tracking-tight text-navy sm:text-[1.75rem]">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, actions, children, className = "", pad = true }: { title?: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode; className?: string; pad?: boolean }) {
  return (
    <section className={`rounded-2xl border border-line bg-white shadow-[0_1px_2px_rgb(19_41_75/0.04)] ${className}`}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          {title && <h2 className="text-[0.9375rem] font-bold text-navy">{title}</h2>}
          {actions}
        </header>
      )}
      <div className={pad ? "p-5" : ""}>{children}</div>
    </section>
  );
}

const TONES = {
  gray: "bg-surface-2 text-muted",
  navy: "bg-navy/10 text-navy",
  green: "bg-green/10 text-green",
  orange: "bg-accent/10 text-accent-deep",
  red: "bg-red-50 text-red-700",
  blue: "bg-blue-50 text-blue-700",
  violet: "bg-violet-50 text-violet-700",
} as const;
export type Tone = keyof typeof TONES;

export function Badge({ tone = "gray", children }: { tone?: Tone; children: React.ReactNode }) {
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold ${TONES[tone]}`}>{children}</span>;
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="grid place-items-center px-6 py-14 text-center">
      <p className="font-bold text-navy">{title}</p>
      {text && <p className="mt-1 max-w-[42ch] text-sm text-muted">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// table styling shared by every list page: wrap a <table> in <TableWrap>
export function TableWrap({ children }: { children: React.ReactNode }) {
  return <div className="-mx-px overflow-x-auto">{children}</div>;
}
export const th = "whitespace-nowrap px-4 py-3 text-left text-[0.6875rem] font-bold uppercase tracking-wider text-faint";
export const td = "px-4 py-3 align-middle text-sm";
export const tr = "border-t border-line transition-colors hover:bg-surface/60";

// form controls
export const inputCls =
  "h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink outline-none transition placeholder:text-faint focus:border-navy focus:ring-4 focus:ring-navy/5";
export const textareaCls =
  "w-full rounded-xl border border-line bg-white px-3.5 py-3 text-sm text-ink outline-none transition placeholder:text-faint focus:border-navy focus:ring-4 focus:ring-navy/5";

export function Field({ label, hint, error, children, className = "" }: { label: string; hint?: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`grid content-start gap-1.5 ${className}`}>
      <span className="text-sm font-semibold text-navy">{label}</span>
      {children}
      {error ? <span className="text-xs font-semibold text-red-600">{error}</span> : hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function Stat({ label, value, sub, tone = "navy" }: { label: string; value: React.ReactNode; sub?: React.ReactNode; tone?: "navy" | "accent" | "green" }) {
  const color = tone === "accent" ? "text-accent-deep" : tone === "green" ? "text-green" : "text-navy";
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-faint">{label}</p>
      <p className={`num mt-2 text-[1.75rem] font-extrabold leading-none tracking-tight ${color}`}>{value}</p>
      {sub && <p className="mt-2 text-xs text-muted">{sub}</p>}
    </div>
  );
}

export function formatDate(iso: string | null | undefined, withTime = false): string {
  if (!iso) return "—";
  // SQLite datetime('now') is UTC without a zone marker
  const d = new Date(iso.includes("T") || iso.endsWith("Z") ? iso : `${iso.replace(" ", "T")}Z`);
  return d.toLocaleString("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  });
}
